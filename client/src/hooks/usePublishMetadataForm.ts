import { useState } from "react";
import type { QuizCategory, QuizDifficulty, QuizVisibility } from "../lib/quizzes";
import { useTagInput, type UseTagInputResult } from "./useTagInput";
import {
  useCoverImageDropzone,
  type UseCoverImageDropzoneResult,
} from "./useCoverImageDropzone";

export interface PublishMetadataFormInitial {
  category?: QuizCategory;
  difficulty?: QuizDifficulty;
  tags?: string[];
  visibility?: QuizVisibility;
  coverImage?: string;
  description?: string;
}

interface UsePublishMetadataFormOptions {
  maxTags: number;
  initial?: PublishMetadataFormInitial;
}

export interface UsePublishMetadataFormResult {
  category: QuizCategory | "";
  setCategory: (value: QuizCategory | "") => void;
  difficulty: QuizDifficulty | null;
  setDifficulty: (value: QuizDifficulty) => void;
  visibility: QuizVisibility;
  setVisibility: (value: QuizVisibility) => void;
  description: string;
  setDescription: (value: string) => void;
  tagState: UseTagInputResult;
  coverImageState: UseCoverImageDropzoneResult;
}

export function usePublishMetadataForm({
  maxTags,
  initial,
}: UsePublishMetadataFormOptions): UsePublishMetadataFormResult {
  const [category, setCategory] = useState<QuizCategory | "">(
    initial?.category ?? "",
  );
  const [difficulty, setDifficulty] = useState<QuizDifficulty | null>(
    initial?.difficulty ?? null,
  );
  const [visibility, setVisibility] = useState<QuizVisibility>(
    initial?.visibility ?? "public",
  );
  const [description, setDescription] = useState(initial?.description ?? "");

  const tagState = useTagInput({ maxTags, initialTags: initial?.tags });
  const coverImageState = useCoverImageDropzone({
    initialCoverImage: initial?.coverImage,
  });

  return {
    category,
    setCategory,
    difficulty,
    setDifficulty,
    visibility,
    setVisibility,
    description,
    setDescription,
    tagState,
    coverImageState,
  };
}
