import api from "./api";
import type {
  QuizCategory,
  QuizDifficulty,
  QuizStatus,
  QuizVisibility,
} from "shared";

export type { QuizStatus, QuizCategory, QuizDifficulty, QuizVisibility };
export type QuizStatusFilter = "all" | QuizStatus;

export interface Quiz {
  id: string;
  title: string;
  coverImage: string | null;
  status: QuizStatus;
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  tags: string[];
  questionCount: number;
  playCount: number;
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

export interface QuizCategoryOption {
  id: QuizCategory;
  name: string;
}

export interface PublishQuizMetadata {
  category: QuizCategory;
  difficulty: QuizDifficulty;
  tags: string[];
  visibility: QuizVisibility;
  coverImage?: string;
  description?: string;
}

export interface SaveDraftPayload extends QuizDraft {
  status: "draft";
}

export interface PublishQuizPayload extends QuizDraft, PublishQuizMetadata {
  status: "published";
}

export type SaveQuizPayload = SaveDraftPayload | PublishQuizPayload;

export interface SaveQuizResponse {
  id: string;
}

export interface QuizDetailAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizDetailQuestion {
  id: string;
  prompt: string;
  timeLimitSeconds: number;
  points: number;
  answers: QuizDetailAnswer[];
}

export interface QuizDetail {
  id: string;
  title: string;
  description: string | null;
  status: QuizStatus;
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  tags: string[];
  visibility: QuizVisibility | null;
  coverImage: string | null;
  questionCount: number;
  playCount: number;
  updatedAt: string;
  questions: QuizDetailQuestion[];
}

export interface DiscoverQuiz {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  tags: string[];
  questionCount: number;
  playCount: number;
  ownerName: string | null;
  ownerImage: string | null;
}

export interface DiscoverQuizzesParams {
  search?: string;
  category?: QuizCategory;
  difficulty?: QuizDifficulty;
  page: number;
}

export interface DiscoverQuizzesResult {
  quizzes: DiscoverQuiz[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface DiscoverQuizPreviewQuestion {
  id: string;
  prompt: string;
  timeLimitSeconds: number;
  points: number;
}

export interface DiscoverQuizDetail extends DiscoverQuiz {
  isSaved: boolean;
  questions: DiscoverQuizPreviewQuestion[];
}

interface UpdateQuizDraftParams {
  id: string;
  payload: SaveQuizPayload;
}

interface PublishQuizParams {
  id: string;
  payload: SaveQuizPayload;
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

export async function fetchQuizById(id: string): Promise<QuizDetail> {
  const { data } = await api.get<QuizDetail>(`/api/quizzes/${id}`);
  return data;
}

export async function updateQuizDraft({
  id,
  payload,
}: UpdateQuizDraftParams): Promise<SaveQuizResponse> {
  const { data } = await api.patch<SaveQuizResponse>(
    `/api/quizzes/${id}`,
    payload,
  );
  return data;
}

export async function publishQuiz({
  id,
  payload,
}: PublishQuizParams): Promise<SaveQuizResponse> {
  const { data } = await api.post<SaveQuizResponse>(
    `/api/quizzes/${id}/publish`,
    payload,
  );
  return data;
}

export async function fetchDiscoverQuizzes(
  params: DiscoverQuizzesParams,
): Promise<DiscoverQuizzesResult> {
  const { data } = await api.get<DiscoverQuizzesResult>(
    "/api/quizzes/discover",
    { params },
  );
  return data;
}

export async function fetchDiscoverQuizById(
  id: string,
): Promise<DiscoverQuizDetail> {
  const { data } = await api.get<DiscoverQuizDetail>(
    `/api/quizzes/discover/${id}`,
  );
  return data;
}

export async function fetchSavedQuizzes(): Promise<DiscoverQuiz[]> {
  const { data } = await api.get<DiscoverQuiz[]>("/api/quizzes/saved");
  return data;
}

export async function saveQuiz(id: string): Promise<void> {
  await api.post(`/api/quizzes/${id}/save`);
}

export async function unsaveQuiz(id: string): Promise<void> {
  await api.delete(`/api/quizzes/${id}/save`);
}

export async function fetchQuizCategories(): Promise<QuizCategoryOption[]> {
  const { data } = await api.get<QuizCategoryOption[]>(
    "/api/quizzes/categories",
  );
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
