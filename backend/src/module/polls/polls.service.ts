import { optionsTable, pollsTable, questionsTable } from "../../db/schema.js";
import { db } from "../../index.js";
import { CreatePollDto } from "./dto/create-poll.dto.js";

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
