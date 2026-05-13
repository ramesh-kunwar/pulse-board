import * as z from "zod";

export const submitResponseSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().check(z.uuid()),
        optionId: z.string().check(z.uuid()),
      })
    )
    .min(1, "At least one answer is required"),
});

export type SubmitResponseDto = z.infer<typeof submitResponseSchema>;
