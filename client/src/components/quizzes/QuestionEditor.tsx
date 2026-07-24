import clsx from "clsx";
import type { QuizQuestionDraft } from "../../lib/quizzes";
import type { QuestionValidationErrors } from "../../lib/questionValidation";
import { useQuizBuilder } from "../../context/useQuizBuilder";
import { ANSWER_BOUNDS } from "../../lib/quizBuilderReducer";
import Input from "../ui/Input";
import AnswerRow from "./AnswerRow";

interface QuestionEditorProps {
  question: QuizQuestionDraft;
  errors: QuestionValidationErrors | null;
}

const TIME_LIMIT_OPTIONS = [10, 20, 30];

function QuestionEditor({ question, errors }: QuestionEditorProps) {
  const { dispatch } = useQuizBuilder();

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Question"
        value={question.prompt}
        placeholder="Type your question..."
        error={errors?.prompt}
        onChange={(event) =>
          dispatch({
            type: "SET_QUESTION_PROMPT",
            questionId: question.id,
            prompt: event.target.value,
          })
        }
      />

      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-muted">Answer options</span>
        <span className="text-xs text-muted">
          Tap the circle to mark the correct answer(s).
        </span>
      </div>

      {errors?.correctAnswerIds && (
        <p className="text-sm text-danger">{errors.correctAnswerIds}</p>
      )}

      <div className="flex flex-col gap-2">
        {question.answers.map((answer, answerIndex) => (
          <AnswerRow
            key={answer.id}
            questionId={question.id}
            answer={answer}
            index={answerIndex}
            isCorrect={question.correctAnswerIds.includes(answer.id)}
            canRemove={question.answers.length > ANSWER_BOUNDS.min}
            error={errors?.answerErrors[answer.id]}
          />
        ))}

        {question.answers.length < ANSWER_BOUNDS.max && (
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "ADD_ANSWER", questionId: question.id })
            }
            className="cursor-pointer self-start text-sm font-semibold text-primary hover:underline"
          >
            + Add answer
          </button>
        )}
      </div>

      <div className="flex w-full gap-4">
        <div className="flex flex-1 flex-col gap-1 text-sm">
          <span className="font-medium text-muted">Time limit</span>
          <div className="flex gap-2">
            {TIME_LIMIT_OPTIONS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() =>
                  dispatch({
                    type: "SET_QUESTION_TIME_LIMIT",
                    questionId: question.id,
                    timeLimitSeconds: seconds,
                  })
                }
                className={clsx(
                  "flex-1 cursor-pointer rounded-lg border px-4 py-2 text-sm font-bold transition-colors",
                  question.timeLimitSeconds === seconds
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border text-muted hover:bg-background",
                )}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <Input
            type="number"
            label="Points"
            min={0}
            step={1}
            value={question.points}
            onChange={(event) =>
              dispatch({
                type: "SET_QUESTION_POINTS",
                questionId: question.id,
                points: Number(event.target.value),
              })
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default QuestionEditor;
