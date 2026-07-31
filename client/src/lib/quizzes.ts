import api from "./api";
import type {
  DiscoverQuiz,
  DiscoverQuizDetail,
  Quiz,
  QuizAnswerDraft,
  QuizCategory,
  QuizCategoryOption,
  QuizDetail,
  QuizDifficulty,
  QuizQuestionDraft,
  QuizStatusFilter,
  SaveQuizPayload,
} from "../entities/quiz";

export interface SaveQuizResponse {
  id: string;
}

interface FetchMyQuizzesParams {
  status: QuizStatusFilter;
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
  questionCount: number;
  allowTrueFalse: boolean;
  allowMultipleAnswers: boolean;
}

export interface GeneratedAnswers {
  answers: QuizAnswerDraft[];
  correctAnswerIds: string[];
}

interface GenerateAnswersParams {
  quizTitle: string;
  prompt: string;
  answerCount: number;
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

export async function deleteQuiz(id: string): Promise<void> {
  await api.delete(`/api/quizzes/${id}`);
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
  questionCount,
  allowTrueFalse,
  allowMultipleAnswers,
}: GenerateQuizFromTitleParams): Promise<GeneratedQuiz> {
  const { data } = await api.post<GeneratedQuiz>("/api/quizzes/generate", {
    title,
    questionCount,
    allowTrueFalse,
    allowMultipleAnswers,
  });
  return data;
}

export async function generateAnswersForQuestion({
  quizTitle,
  prompt,
  answerCount,
}: GenerateAnswersParams): Promise<GeneratedAnswers> {
  const { data } = await api.post<GeneratedAnswers>(
    "/api/quizzes/generate-answers",
    { quizTitle, prompt, answerCount },
  );
  return data;
}
