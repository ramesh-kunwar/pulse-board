import { and, eq } from "drizzle-orm";
import {
  pollsTable,
  PollStatus,
  questionsTable,
  response_answersTable,
  responsesTable,
} from "../../db/schema.js";
import { db } from "../../index.js";
import ApiError from "../../common/utils/api-error.js";
import { io } from "../../socket.js";

export const submitResponse = async (
  pollId: string,
  userId: string | null,
  answers: {
    questionId: string;
    optionId: string;
  }[]
) => {
  // 1. Check poll exists → 404

  const [poll] = await db
    .select()
    .from(pollsTable)
    .where(eq(pollsTable.id, pollId))
    .limit(1);

  if (!poll) {
    throw new ApiError(404, "Poll not found");
  }
  // 2. Check poll status is ACTIVE → 403
  if (poll.status === PollStatus.CLOSED) {
    throw new ApiError(403, "Poll is closed");
  }
  // 3. Check poll not expired → 410
  const now = new Date();
  if (poll.expiresAt && poll.expiresAt < now) {
    throw new ApiError(410, "Poll has expired");
  }

  // 4. Check if poll requires auth (isAnonymous: false) and no userId → 401
  if (!poll.isAnonymous && !userId) {
    throw new ApiError(
      401,
      "Authentication required to submit response for this poll"
    );
  }

  // 5. Check duplicate response for authenticated user → 409
  if (userId) {
    const [existingResponse] = await db
      .select()
      .from(responsesTable)
      .where(
        and(
          eq(responsesTable.poll_id, pollId),
          eq(responsesTable.submittedBy, userId)
        )
      )
      .limit(1);

    if (existingResponse) {
      throw new ApiError(
        409,
        "You have already submitted a response for this poll"
      );
    }
  }
  // 6. Check all mandatory questions answered → 422
  const questions = await db.query.questionsTable.findMany({
    where: eq(questionsTable.poll_id, pollId),
    with: { options: true },
  });
  const mandatoryQuestions = questions.filter((q) => q.isMandatory);
  const answeredQuestionIds = answers.map((a) => a.questionId);
  const unansweredMandatory = mandatoryQuestions.filter(
    (q) => !answeredQuestionIds.includes(q.id)
  );
  if (unansweredMandatory.length > 0) {
    throw new ApiError(
      422,
      `Missing answers for mandatory questions: ${unansweredMandatory
        .map((q) => q.question_text)
        .join(", ")}`
    );
  }

  // 7. Check all optionIds valid for their questions → 422
  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) {
      throw new ApiError(422, `Invalid question ID: ${answer.questionId}`);
    }
    const optionIds = question.options.map((o) => o.id);
    if (!optionIds.includes(answer.optionId)) {
      throw new ApiError(
        422,
        `Invalid option selected for question: ${question.question_text}`
      );
    }
  }
  // 8. Insert response + answers in transaction
  await db.transaction(async (trx) => {
    const response = await trx
      .insert(responsesTable)
      .values({
        poll_id: pollId,
        submittedBy: userId,
      })
      .returning();

    const responseId = response[0]?.id as string;

    const responseAnswersValues = answers.map((a) => ({
      response_id: responseId,
      question_id: a.questionId,
      option_id: a.optionId,
    }));

    await trx.insert(response_answersTable).values(responseAnswersValues);
  });

  // emit to poll room after successful insert
  io.to(`poll:${pollId}`).emit("response:submitted", { pollId });
};
