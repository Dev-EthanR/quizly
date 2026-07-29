import { z } from "zod";

export const hostGameSchema = z.object({
  quizId: z.string().min(1, "Quiz is required"),
});

export type HostGameInput = z.infer<typeof hostGameSchema>;
