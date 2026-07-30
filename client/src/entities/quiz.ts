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
