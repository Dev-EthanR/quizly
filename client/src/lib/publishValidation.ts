import {
  publishQuizMetadataSchema,
  type QuizCategory,
  type QuizDifficulty,
  type QuizVisibility,
} from "shared";

export interface PublishMetadataDraft {
  category: QuizCategory | "";
  difficulty: QuizDifficulty | null;
  tags: string[];
  visibility: QuizVisibility;
  coverImage?: string;
}

export interface PublishMetadataErrors {
  category?: string;
  difficulty?: string;
  tags?: string;
}

export function getPublishMetadataErrors(
  draft: PublishMetadataDraft,
): PublishMetadataErrors | null {
  const result = publishQuizMetadataSchema.safeParse(draft);
  if (result.success) return null;

  const errors: PublishMetadataErrors = {};
  for (const issue of result.error.issues) {
    const [field] = issue.path;
    if (field === "category") {
      errors.category = issue.message;
    } else if (field === "difficulty") {
      errors.difficulty = "Select a difficulty";
    } else if (field === "tags") {
      errors.tags = issue.message;
    }
  }
  return errors;
}

export function isPublishMetadataValid(draft: PublishMetadataDraft): boolean {
  return publishQuizMetadataSchema.safeParse(draft).success;
}
