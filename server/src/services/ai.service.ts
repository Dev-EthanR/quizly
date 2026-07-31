import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ANSWER_COUNT_BOUNDS } from "shared";
import { createStructuredCompletion } from "../lib/openai.js";

const DEFAULT_TIME_LIMIT_SECONDS = 20;
const DEFAULT_POINTS = 1000;

interface GenerateQuizParams {
  title: string;
  questionCount: number;
  allowTrueFalse: boolean;
  allowMultipleAnswers: boolean;
  excludeQuestionPrompts: string[];
}

interface GenerateAnswersParams {
  quizTitle: string;
  prompt: string;
  answerCount: number;
}

const aiQuestionSchema = z.object({
  prompt: z.string().trim().min(1),
  answers: z.array(z.string().trim().min(1)),
  correctAnswerIndices: z.array(z.number().int()).min(1),
});

const aiQuizResponseSchema = z.object({
  questions: z.array(aiQuestionSchema),
});

const aiAnswersResponseSchema = z.object({
  answers: z.array(z.string().trim().min(1)),
  correctAnswerIndex: z.number().int(),
});

const quizGenerationJsonSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          answers: { type: "array", items: { type: "string" } },
          correctAnswerIndices: { type: "array", items: { type: "integer" } },
        },
        required: ["prompt", "answers", "correctAnswerIndices"],
        additionalProperties: false,
      },
    },
  },
  required: ["questions"],
  additionalProperties: false,
} as const;

const answerGenerationJsonSchema = {
  type: "object",
  properties: {
    answers: { type: "array", items: { type: "string" } },
    correctAnswerIndex: { type: "integer" },
  },
  required: ["answers", "correctAnswerIndex"],
  additionalProperties: false,
} as const;

function toAnswerDrafts(answers: string[], correctAnswerIndices: number[]) {
  const answerDrafts = answers.map((text) => ({ id: randomUUID(), text }));
  const correctIds = [
    ...new Set(
      correctAnswerIndices
        .map((index) => answerDrafts[index]?.id)
        .filter((id) => id !== undefined),
    ),
  ];
  const fallback = answerDrafts[0];

  return {
    answers: answerDrafts,
    correctAnswerIds: correctIds.length > 0 ? correctIds : fallback ? [fallback.id] : [],
  };
}

export const aiService = {
  async generateQuiz({
    title,
    questionCount,
    allowTrueFalse,
    allowMultipleAnswers,
    excludeQuestionPrompts,
  }: GenerateQuizParams) {
    const questionTypeInstructions = [
      allowTrueFalse
        ? "Some questions may be True/False questions with exactly 2 answer options, " +
          '"True" and "False" — otherwise use multiple choice with exactly 4 answer options.'
        : "Every question must be multiple choice with exactly 4 answer options.",
      allowMultipleAnswers
        ? "Some questions may have more than one correct answer — list every correct " +
          "answer's index in correctAnswerIndices."
        : "Every question must have exactly one correct answer.",
    ].join(" ");

    const avoidDuplicatesInstructions =
      excludeQuestionPrompts.length > 0
        ? " This quiz already has these questions — do not repeat them or write close " +
          "rephrasings of them: " +
          excludeQuestionPrompts.map((prompt) => `"${prompt}"`).join("; ") +
          "."
        : "";

    const raw = await createStructuredCompletion({
      schemaName: "quiz_generation",
      schema: quizGenerationJsonSchema,
      systemPrompt:
        "You are a trivia quiz writer for a live multiplayer quiz game called Quizzly. " +
        `Write engaging, factually accurate, unambiguous trivia questions. ${questionTypeInstructions}`,
      userPrompt:
        `Generate exactly ${questionCount} trivia questions for a quiz titled "${title}".` +
        avoidDuplicatesInstructions,
    });

    const parsed = aiQuizResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error("AI returned an invalid quiz response");
    }

    const questions = parsed.data.questions
      .slice(0, questionCount)
      .map((question) => {
        const { answers, correctAnswerIds } = toAnswerDrafts(
          question.answers.slice(0, ANSWER_COUNT_BOUNDS.max),
          allowMultipleAnswers
            ? question.correctAnswerIndices
            : question.correctAnswerIndices.slice(0, 1),
        );

        return {
          id: randomUUID(),
          prompt: question.prompt,
          answers,
          correctAnswerIds,
          timeLimitSeconds: DEFAULT_TIME_LIMIT_SECONDS,
          points: DEFAULT_POINTS,
        };
      })
      .filter(
        (question) =>
          question.answers.length >= ANSWER_COUNT_BOUNDS.min &&
          question.correctAnswerIds.length > 0,
      );

    if (questions.length === 0) {
      throw new Error("AI returned no usable questions");
    }

    return { questions };
  },

  async generateAnswers({ quizTitle, prompt, answerCount }: GenerateAnswersParams) {
    const raw = await createStructuredCompletion({
      schemaName: "answer_generation",
      schema: answerGenerationJsonSchema,
      systemPrompt:
        "You are a trivia quiz writer for a live multiplayer quiz game called Quizzly. " +
        "Write plausible, unambiguous multiple-choice answer options for a single trivia " +
        "question. Exactly one answer must be correct.",
      userPrompt:
        `The quiz is titled "${quizTitle}". Generate exactly ${answerCount} answer options ` +
        `for this question: "${prompt}".`,
    });

    const parsed = aiAnswersResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error("AI returned an invalid answers response");
    }

    const { answers, correctAnswerIds } = toAnswerDrafts(
      parsed.data.answers.slice(0, answerCount),
      [parsed.data.correctAnswerIndex],
    );

    if (answers.length < ANSWER_COUNT_BOUNDS.min || correctAnswerIds.length === 0) {
      throw new Error("AI returned an invalid answers response");
    }

    return { answers, correctAnswerIds };
  },
};
