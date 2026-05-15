import {
  optionsTable,
  pollsTable,
  questionsTable,
  response_answersTable,
  responsesTable,
} from "../../db/schema.js";
import { count, eq } from "drizzle-orm";
import { db } from "../../index.js";
import { CreatePollDto } from "./dto/create-poll.dto.js";
import ApiError from "../../common/utils/api-error.js";

export const createPoll = async (data: CreatePollDto, creator_id: string) => {
  return await db.transaction(async (trx) => {
    const insertedPolls = await trx
      .insert(pollsTable)
      .values({
        title: data.title,
        isAnonymous: data.isAnonymous,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        creator_id,
      })
      .returning();

    const poll = insertedPolls[0];
    if (!poll) {
      throw new Error("Failed to create poll");
    }

    const insertedQuestions = await trx
      .insert(questionsTable)
      .values(
        data.questions.map((q, index) => ({
          poll_id: poll.id,
          question_text: q.question_text,
          isMandatory: q.isMandatory,
          order: q.order ?? index,
        }))
      )
      .returning();

    const optionValues = data.questions.flatMap((q, index) => {
      const question = insertedQuestions[index];
      if (!question) {
        throw new Error("Failed to create poll questions");
      }

      return q.options.map((opt) => ({
        question_id: question.id,
        option_text: opt.option_text,
        order: opt.order,
      }));
    });

    await trx.insert(optionsTable).values(optionValues);

    return poll;
  });
};

export const getPolls = async (creator_id: string) => {
  const polls = await db
    .select({
      id: pollsTable.id,
      title: pollsTable.title,
      status: pollsTable.status,
      isAnonymous: pollsTable.isAnonymous,
      expiresAt: pollsTable.expiresAt,
      createdAt: pollsTable.createdAt,
    })
    .from(pollsTable)
    .where(eq(pollsTable.creator_id, creator_id));
  return polls;
};

export const getPollById = async (poll_id: string, user_id: string) => {
  console.log(user_id, " from service");
  // 1. fetch poll
  const poll = await db.query.pollsTable.findFirst({
    where: eq(pollsTable.id, poll_id),
    with: { questions: { with: { options: true } } },
  });

  // 2. not found
  if (!poll) throw ApiError.notFound("Poll not found");

  // 3. creator → return everything
  if (user_id === poll.creator_id) return poll;

  // 4. non-creator checks
  if (poll.status === "CLOSED") throw ApiError.forbidden("Poll is closed");

  // 5. PUBLISHED or ACTIVE → return poll with questions and options
  return poll;
};

export const closePoll = async (poll_id: string, user_id: string) => {
  // 1. fetch poll
  const poll = await db.query.pollsTable.findFirst({
    where: eq(pollsTable.id, poll_id),
  });
  if (!poll) {
    throw ApiError.notFound("Poll not found");
  }
  // 2. check if user is the creator
  if (user_id !== poll.creator_id) {
    throw ApiError.forbidden("You are not the owner of this poll");
  }

  // check status
  if (poll.status !== "ACTIVE") {
    throw ApiError.unprocessableEntity("Only active polls can be closed");
  }

  // 3. update poll status
  const updatedPoll = await db
    .update(pollsTable)
    .set({ status: "CLOSED" })
    .where(eq(pollsTable.id, poll_id))
    .returning();
  return updatedPoll[0];
};

export const deletePoll = async (poll_id: string, user_id: string) => {
  const poll = await db.query.pollsTable.findFirst({
    where: eq(pollsTable.id, poll_id),
  });
  if (!poll) {
    throw ApiError.notFound("Poll not found");
  }
  if (poll.creator_id !== user_id) {
    throw ApiError.notFound("Poll not found");
  }

  await db.delete(pollsTable).where(eq(pollsTable.id, poll_id));
};

export const publishPoll = async (poll_id: string, user_id: string) => {
  // 1. fetch poll
  const poll = await db.query.pollsTable.findFirst({
    where: eq(pollsTable.id, poll_id),
  });
  if (!poll) {
    throw ApiError.notFound("Poll not found");
  }
  // 2. check if user is the creator
  if (user_id !== poll.creator_id) {
    throw ApiError.notFound("Poll not found");
  }

  // check status
  if (poll.status !== "CLOSED") {
    throw ApiError.unprocessableEntity("Only closed polls can be published");
  }

  // 3. update poll status
  const updatedPoll = await db
    .update(pollsTable)
    .set({ status: "PUBLISHED" })
    .where(eq(pollsTable.id, poll_id))
    .returning();
  return updatedPoll[0];
};

export const getAnalytics = async (poll_id: string, user_id: string) => {
  // 1. fetch poll + verify creator
  const poll = await db.query.pollsTable.findFirst({
    where: eq(pollsTable.id, poll_id),
    with: { questions: { with: { options: true } } },
  });
  if (!poll) throw ApiError.notFound("Poll not found");
  if (poll.creator_id !== user_id) throw ApiError.notFound("Poll not found");

  // 2. total submissions for this poll
  const result = await db
    .select({ count: count() })
    .from(responsesTable)
    .where(eq(responsesTable.poll_id, poll_id));
  const totalResponses = result[0]?.count ?? 0;

  // 3. how many times each option was selected
  const optionCounts = await db
    .select({
      option_id: optionsTable.id,
      option_text: optionsTable.option_text,
      question_id: optionsTable.question_id,
      count: count(),
    })
    .from(response_answersTable)
    .innerJoin(
      optionsTable,
      eq(response_answersTable.option_id, optionsTable.id)
    )
    .innerJoin(questionsTable, eq(optionsTable.question_id, questionsTable.id))
    .where(eq(questionsTable.poll_id, poll_id))
    .groupBy(
      optionsTable.id,
      optionsTable.option_text,
      optionsTable.question_id
    );

  // 4. assemble nested response shape
  const questions = poll.questions.map((q) => {
    const questionOptions = q.options.map((opt) => {
      const found = optionCounts.find((c) => c.option_id === opt.id);
      const optCount = found ? Number(found.count) : 0;
      return {
        optionId: opt.id,
        option_text: opt.option_text,
        count: optCount,
        percentage: 0,
      };
    });

    const totalAnswers = questionOptions.reduce((sum, o) => sum + o.count, 0);

    const optionsWithPercentage = questionOptions.map((o) => ({
      ...o,
      percentage: totalAnswers > 0 ? (o.count / totalAnswers) * 100 : 0,
    }));

    return {
      questionId: q.id,
      question_text: q.question_text,
      totalAnswers,
      options: optionsWithPercentage,
    };
  });

  return {
    pollId: poll_id,
    totalResponses: Number(totalResponses),
    questions,
  };
};
