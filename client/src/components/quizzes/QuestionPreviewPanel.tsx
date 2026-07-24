import clsx from "clsx";
import type { QuizQuestionDraft } from "../../lib/quizzes";

interface QuestionPreviewPanelProps {
  question: QuizQuestionDraft | null;
  index: number;
}

function QuestionPreviewPanel({ question, index }: QuestionPreviewPanelProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">Player preview</h2>

      <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        {question ? (
          <>
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                Question {index + 1}
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                <span>{question.timeLimitSeconds}s</span>
                <span>·</span>
                <span>{question.points} pts</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-6">
              <p className="text-center text-xl font-semibold text-foreground">
                {question.prompt.trim() || "Untitled question"}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {question.answers.map((answer, answerIndex) => {
                  const isCorrect = question.correctAnswerIds.includes(answer.id);
                  return (
                    <div
                      key={answer.id}
                      className={clsx(
                        "flex items-center gap-2 rounded-lg border px-3 py-4 text-sm font-medium text-foreground transition-colors",
                        isCorrect
                          ? "border-secondary bg-secondary/15"
                          : "border-border bg-background",
                      )}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-xs font-bold text-primary">
                        {String.fromCharCode(65 + answerIndex)}
                      </span>
                      <span className="flex-1 break-words">
                        {answer.text.trim() || `Answer ${answerIndex + 1}`}
                      </span>
                      {isCorrect && (
                        <span className="shrink-0 text-xs font-semibold text-secondary">
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {question.correctAnswerIds.length === 0 && (
              <p className="text-xs text-danger">No correct answer selected yet.</p>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <span className="text-sm font-medium text-muted">No question selected</span>
            <span className="text-xs text-muted">Add a question to preview it here.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionPreviewPanel;
