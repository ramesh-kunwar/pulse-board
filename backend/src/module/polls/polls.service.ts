import { optionsTable, pollsTable, questionsTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
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
