import type { QuizDetail, QuizQuestionDraft } from "../entities/quiz";
import type {
  QuizBuilderAction,
  QuizBuilderState,
} from "../context/quiz-builder-context";

export const ANSWER_BOUNDS = { min: 2, max: 4 };

function createId(): string {
  return crypto.randomUUID();
}

function createAnswer(text = ""): QuizQuestionDraft["answers"][number] {
  return { id: createId(), text };
}

export function createEmptyQuestion(): QuizQuestionDraft {
  return {
    id: createId(),
    prompt: "",
    answers: [createAnswer(), createAnswer(), createAnswer(), createAnswer()],
    correctAnswerIds: [],
    timeLimitSeconds: 20,
    points: 1000,
  };
}

export function createEmptyDraft(): QuizBuilderState {
  return {
    title: "",
    questions: [],
  };
}

export function hydrateBuilderState(quiz: QuizDetail): QuizBuilderState {
  return {
    title: quiz.title,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      answers: question.answers.map((answer) => ({
        id: answer.id,
        text: answer.text,
      })),
      correctAnswerIds: question.answers
        .filter((answer) => answer.isCorrect)
        .map((answer) => answer.id),
      timeLimitSeconds: question.timeLimitSeconds,
      points: question.points,
    })),
  };
}

function updateQuestion(
  state: QuizBuilderState,
  questionId: string,
  update: (question: QuizQuestionDraft) => QuizQuestionDraft,
): QuizBuilderState {
  return {
    ...state,
    questions: state.questions.map((question) =>
      question.id === questionId ? update(question) : question,
    ),
  };
}

export function quizBuilderReducer(
  state: QuizBuilderState,
  action: QuizBuilderAction,
): QuizBuilderState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.title };
    case "ADD_QUESTION":
      return { ...state, questions: [...state.questions, action.question] };
    case "REMOVE_QUESTION":
      return {
        ...state,
        questions: state.questions.filter((q) => q.id !== action.questionId),
      };
    case "REPLACE_QUESTION":
      return updateQuestion(state, action.question.id, () => action.question);
    case "SET_QUESTION_PROMPT":
      return updateQuestion(state, action.questionId, (question) => ({
        ...question,
        prompt: action.prompt,
      }));
    case "SET_QUESTION_TIME_LIMIT":
      return updateQuestion(state, action.questionId, (question) => ({
        ...question,
        timeLimitSeconds: action.timeLimitSeconds,
      }));
    case "SET_QUESTION_POINTS":
      return updateQuestion(state, action.questionId, (question) => ({
        ...question,
        points: action.points,
      }));
    case "ADD_ANSWER":
      return updateQuestion(state, action.questionId, (question) => {
        if (question.answers.length >= ANSWER_BOUNDS.max) {
          return question;
        }
        return { ...question, answers: [...question.answers, createAnswer()] };
      });
    case "REMOVE_ANSWER":
      return updateQuestion(state, action.questionId, (question) => {
        if (question.answers.length <= ANSWER_BOUNDS.min) {
          return question;
        }
        const answers = question.answers.filter(
          (answer) => answer.id !== action.answerId,
        );
        const correctAnswerIds = question.correctAnswerIds.filter(
          (id) => id !== action.answerId,
        );
        return { ...question, answers, correctAnswerIds };
      });
    case "SET_ANSWER_TEXT":
      return updateQuestion(state, action.questionId, (question) => ({
        ...question,
        answers: question.answers.map((answer) =>
          answer.id === action.answerId
            ? { ...answer, text: action.text }
            : answer,
        ),
      }));
    case "TOGGLE_CORRECT_ANSWER":
      return updateQuestion(state, action.questionId, (question) => {
        const correctAnswerIds = question.correctAnswerIds.includes(
          action.answerId,
        )
          ? question.correctAnswerIds.filter((id) => id !== action.answerId)
          : [...question.correctAnswerIds, action.answerId];
        return { ...question, correctAnswerIds };
      });
    case "APPLY_GENERATED_QUESTIONS":
      return { ...state, questions: action.questions };
    case "APPLY_GENERATED_ANSWERS":
      return updateQuestion(state, action.questionId, (question) => ({
        ...question,
        answers: action.answers,
        correctAnswerIds: action.correctAnswerIds,
      }));
    default:
      return state;
  }
}
