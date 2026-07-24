import axios from "axios";
import type { QuizStatus } from "shared";

export type { QuizStatus };
export type QuizStatusFilter = "all" | QuizStatus;

export interface Quiz {
  id: string;
  title: string;
  coverImage: string | null;
  status: QuizStatus;
  category: string | null;
  questionCount: number;
  updatedAt: string;
}

interface FetchMyQuizzesParams {
  status: QuizStatusFilter;
}

export interface QuizAnswerDraft {
  id: string;
  text: string;
}

export interface QuizQuestionDraft {
  id: string;
  prompt: string;
  answers: QuizAnswerDraft[];
  correctAnswerIds: string[];
  timeLimitSeconds: number;
  points: number;
}

export interface QuizDraft {
  title: string;
  questions: QuizQuestionDraft[];
}

export interface SaveQuizPayload extends QuizDraft {
  status: QuizStatus;
}

export interface SaveQuizResponse {
  id: string;
}

export interface GeneratedQuiz {
  questions: QuizQuestionDraft[];
}

interface GenerateQuizFromTitleParams {
  title: string;
}

export interface GeneratedAnswers {
  answers: QuizAnswerDraft[];
  correctAnswerIds: string[];
}

interface GenerateAnswersParams {
  quizTitle: string;
  prompt: string;
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function fetchMyQuizzes({
  status,
}: FetchMyQuizzesParams): Promise<Quiz[]> {
  const { data } = await api.get<Quiz[]>("/api/quizzes", {
    params: status === "all" ? undefined : { status },
  });
  return data;
}

export async function createQuiz(
  payload: SaveQuizPayload,
): Promise<SaveQuizResponse> {
  const { data } = await api.post<SaveQuizResponse>("/api/quizzes", payload);
  return data;
}

export async function generateQuizFromTitle({
  title,
}: GenerateQuizFromTitleParams): Promise<GeneratedQuiz> {
  const { data } = await api.post<GeneratedQuiz>("/api/quizzes/generate", {
    title,
  });
  return data;
}

export async function generateAnswersForQuestion({
  quizTitle,
  prompt,
}: GenerateAnswersParams): Promise<GeneratedAnswers> {
  const { data } = await api.post<GeneratedAnswers>(
    "/api/quizzes/generate-answers",
    { quizTitle, prompt },
  );
  return data;
}
