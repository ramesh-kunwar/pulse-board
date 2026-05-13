import * as z from "zod";

export const createPollSchema = z.object({
  title: z.string().min(1, "title is required").max(255),
  isAnonymous: z.boolean().default(false),
  expiresAt: z.iso.datetime().optional(),
  questions: z
    .array(
      z.object({
        question_text: z.string().min(1, "question is required").max(255),
        isMandatory: z.boolean().default(false),
        order: z.number().int().min(0),
        options: z
          .array(
            z.object({
              option_text: z.string().min(1, "option is required").max(255),
              order: z.number().int().min(0),
            })
          )
          .min(2, "at least 2 options are required"),
      })
    )
    .min(1, "at least 1 question is required"),
});

export type CreatePollDto = z.infer<typeof createPollSchema>;
