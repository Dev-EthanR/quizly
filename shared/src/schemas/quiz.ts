import { z } from "zod";

export const quizStatusSchema = z.enum(["draft", "published"]);

export type QuizStatus = z.infer<typeof quizStatusSchema>;

export const listQuizzesQuerySchema = z.object({
  status: quizStatusSchema.optional(),
});

export type ListQuizzesQuery = z.infer<typeof listQuizzesQuerySchema>;
