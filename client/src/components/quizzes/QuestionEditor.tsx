import type { QuizQuestionDraft } from "../../entities/quiz";
import type { QuestionValidationErrors } from "../../lib/questionValidation";
import { useQuizBuilder } from "../../context/useQuizBuilder";
import { ANSWER_BOUNDS } from "../../lib/quizBuilderReducer";
import Input from "../ui/Input";
import SegmentedControl from "../ui/SegmentedControl";
import AnswerRow from "./AnswerRow";

interface QuestionEditorProps {
  question: QuizQuestionDraft;
  errors: QuestionValidationErrors | null;
}

const TIME_LIMIT_OPTIONS = [10, 20, 30].map((seconds) => ({
  value: seconds,
  label: `${seconds}s`,
}));

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
        <span className="field-label">Answer options</span>
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
          <SegmentedControl
            options={TIME_LIMIT_OPTIONS}
            value={question.timeLimitSeconds}
            size="sm"
            onChange={(timeLimitSeconds) =>
              dispatch({
                type: "SET_QUESTION_TIME_LIMIT",
                questionId: question.id,
                timeLimitSeconds,
              })
            }
          />
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
