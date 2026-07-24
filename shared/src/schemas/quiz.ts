import { z } from "zod";

export const quizStatusSchema = z.enum(["draft", "published"]);

export type QuizStatus = z.infer<typeof quizStatusSchema>;

export const listQuizzesQuerySchema = z.object({
  status: quizStatusSchema.optional(),
});

export type ListQuizzesQuery = z.infer<typeof listQuizzesQuerySchema>;

export const quizAnswerSchema = z.object({
  id: z.string(),
  text: z.string().trim().min(1, "Answer text is required").max(120),
});

export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>;

const quizAnswerDraftSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const quizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string().trim().min(1, "Question is required").max(300),
  answers: z.array(quizAnswerSchema).min(2).max(4),
  correctAnswerIds: z
    .array(z.string())
    .min(1, "Select at least one correct answer"),
  timeLimitSeconds: z.number().int().min(5).max(120),
  points: z.number().int().min(0).max(2000),
});

export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;

const quizQuestionDraftSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  answers: z.array(quizAnswerDraftSchema),
  correctAnswerIds: z.array(z.string()),
  timeLimitSeconds: z.number().int(),
  points: z.number().int(),
});

export const saveQuizDraftSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(80),
  questions: z.array(quizQuestionDraftSchema),
});

export type SaveQuizDraftInput = z.infer<typeof saveQuizDraftSchema>;

export const publishQuizContentSchema = saveQuizDraftSchema.extend({
  questions: z
    .array(quizQuestionSchema)
    .min(1, "Add at least one question to publish"),
});

export type PublishQuizContentInput = z.infer<typeof publishQuizContentSchema>;

export const quizDifficultySchema = z.enum(["easy", "medium", "hard"]);

export type QuizDifficulty = z.infer<typeof quizDifficultySchema>;

export const quizVisibilitySchema = z.enum(["public", "private"]);

export type QuizVisibility = z.infer<typeof quizVisibilitySchema>;

export const publishQuizMetadataSchema = z.object({
  category: z.string().trim().min(1, "Category is required"),
  difficulty: quizDifficultySchema,
  tags: z.array(z.string().trim().min(1).max(24)).max(10).default([]),
  visibility: quizVisibilitySchema,
  coverImage: z.string().trim().optional(),
});

export type PublishQuizMetadataInput = z.infer<typeof publishQuizMetadataSchema>;

export const publishQuizSchema = publishQuizContentSchema.extend(
  publishQuizMetadataSchema.shape,
);

export type PublishQuizInput = z.infer<typeof publishQuizSchema>;

export const generateQuizSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(80),
});

export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;

export const generateAnswersSchema = z.object({
  quizTitle: z.string().trim().min(1),
  prompt: z.string().trim().min(1, "Question is required"),
});

export type GenerateAnswersInput = z.infer<typeof generateAnswersSchema>;
