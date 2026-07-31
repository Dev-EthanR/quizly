import clsx from "clsx";
import { GENERATE_QUIZ_QUESTION_COUNT_BOUNDS } from "shared";
import Button from "../ui/Button";
import IndexBadge from "../ui/IndexBadge";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import type { UseGenerateQuizResult } from "../../hooks/useGenerateQuiz";

interface GenerateQuizModalProps {
  title: string;
  generation: UseGenerateQuizResult;
  onAdd: () => void;
  onClose: () => void;
}

function GenerateQuizModal({ title, generation, onAdd, onClose }: GenerateQuizModalProps) {
  const {
    questionCount,
    setQuestionCount,
    allowTrueFalse,
    setAllowTrueFalse,
    allowMultipleAnswers,
    setAllowMultipleAnswers,
    suggestions,
    includedIds,
    toggleIncluded,
    isGenerating,
    errorMessage,
    canGenerate,
    canRegenerate,
    generate,
  } = generation;

  const includedCount = suggestions?.filter((question) => includedIds.has(question.id)).length ?? 0;

  return (
    <Modal
      title="Generate quiz with AI"
      ariaLabel="Generate quiz with AI"
      onClose={onClose}
      footer={
        suggestions ? (
          <>
            <Button type="button" variant="secondary" onClick={onClose}>
              Discard
            </Button>
            {canRegenerate && (
              <Button
                type="button"
                variant="secondary"
                disabled={isGenerating}
                onClick={generate}
              >
                {isGenerating ? "Regenerating..." : "Regenerate"}
              </Button>
            )}
            <Button type="button" disabled={includedCount === 0} onClick={onAdd}>
              Add {includedCount} question{includedCount === 1 ? "" : "s"}
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canGenerate || isGenerating}
              onClick={generate}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4">
        {!suggestions && (
          <>
            <p className="text-sm text-muted">
              AI will write trivia questions based on your quiz title:{" "}
              <span className="font-semibold text-foreground">
                {title.trim() || "Untitled quiz"}
              </span>
            </p>
            <Input
              type="number"
              label="Number of questions"
              min={GENERATE_QUIZ_QUESTION_COUNT_BOUNDS.min}
              max={GENERATE_QUIZ_QUESTION_COUNT_BOUNDS.max}
              value={questionCount}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              className="w-32"
            />

            <div className="flex flex-col gap-2">
              <span className="field-label">Options</span>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={allowTrueFalse}
                  onChange={(event) => setAllowTrueFalse(event.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
                Allow True/False questions
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={allowMultipleAnswers}
                  onChange={(event) => setAllowMultipleAnswers(event.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
                Allow multiple correct answers
              </label>
            </div>
          </>
        )}

        {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}

        {isGenerating && !suggestions && (
          <p className="text-sm text-muted">Writing questions...</p>
        )}

        {suggestions && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              Review the generated questions and uncheck any you don't want to add.
            </p>
            {suggestions.map((question, index) => (
              <label
                key={question.id}
                className="card flex cursor-pointer items-start gap-3 p-4"
              >
                <input
                  type="checkbox"
                  checked={includedIds.has(question.id)}
                  onChange={() => toggleIncluded(question.id)}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <IndexBadge>{index + 1}</IndexBadge>
                    <span className="font-medium text-foreground">{question.prompt}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {question.answers.map((answer) => (
                      <span
                        key={answer.id}
                        className={clsx(
                          "rounded-lg border px-3 py-1.5 text-sm",
                          question.correctAnswerIds.includes(answer.id)
                            ? "border-secondary text-secondary"
                            : "border-border text-muted",
                        )}
                      >
                        {answer.text}
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default GenerateQuizModal;
