import * as z from "zod";

export const pollSchema = z.object({
  title: z.string().min(1, "title is required").max(255),
  isAnonymous: z.boolean().default(false),
  questions: z
    .array(
      z.object({
        question_text: z.string().min(1, "question is required").max(255),
        options: z
          .array(z.string().min(1, "option is required").max(255))
          .min(2, "at least 2 options are required"),
      })
    )
    .min(1, "at least 1 question is required"),
  order: z.number().default(0),
  expiresAt: z.date().optional(),
});

export type PollDto = z.infer<typeof pollSchema>;
