import clsx from "clsx";
import {
  FiBookmark,
  FiCheck,
  FiClock,
  FiHelpCircle,
  FiPlay,
  FiShare2,
  FiStar,
} from "react-icons/fi";
import { quizCategoryLabels, quizDifficultyLabels, type QuizDifficulty } from "shared";
import Button from "../ui/Button";
import ImageFallback from "../ui/ImageFallback";
import IndexBadge from "../ui/IndexBadge";
import StatTile from "../ui/StatTile";
import TagPill from "../ui/TagPill";
import HostQuizButton from "./HostQuizButton";
import type { DiscoverQuizDetail } from "../../entities/quiz";

const DIFFICULTY_BADGE_CLASS: Record<QuizDifficulty, string> = {
  easy: "bg-secondary/90",
  medium: "bg-warning/90",
  hard: "bg-danger/90",
};

interface QuizDetailsContentProps {
  quiz: DiscoverQuizDetail;
  isSaving: boolean;
  onToggleSave: () => void;
  copied: boolean;
  onShare: () => void;
}

function QuizDetailsContent({
  quiz,
  isSaving,
  onToggleSave,
  copied,
  onShare,
}: QuizDetailsContentProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
      <div className="flex flex-col gap-4">
        <ImageFallback
          src={quiz.coverImage}
          fallbackText={quiz.title}
          className="h-56"
          textClassName="text-5xl font-bold"
        />

        <div className="grid grid-cols-2 gap-4">
          <StatTile
            layout="compact"
            icon={<FiHelpCircle className="h-5 w-5" />}
            value={quiz.questionCount}
            label={quiz.questionCount === 1 ? "Question" : "Questions"}
          />
          <StatTile
            layout="compact"
            icon={<FiPlay className="h-5 w-5" />}
            value={quiz.playCount}
            label={quiz.playCount === 1 ? "Play" : "Plays"}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {quiz.category && (
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
              {quizCategoryLabels[quiz.category]}
            </span>
          )}
          {quiz.difficulty && (
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold text-white",
                DIFFICULTY_BADGE_CLASS[quiz.difficulty],
              )}
            >
              {quizDifficultyLabels[quiz.difficulty]}
            </span>
          )}
        </div>

        <h1 className="heading text-3xl">{quiz.title}</h1>

        <div className="flex items-center gap-2 text-sm text-muted">
          <ImageFallback
            src={quiz.ownerImage}
            fallbackText={quiz.ownerName ?? "?"}
            shape="circle"
            className="h-6 w-6"
            textClassName="text-xs font-bold"
            referrerPolicy="no-referrer"
          />
          <span>Created by {quiz.ownerName ?? "Unknown host"}</span>
        </div>

        {quiz.description && (
          <p className="text-foreground/90">{quiz.description}</p>
        )}

        {quiz.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quiz.tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <HostQuizButton quizId={quiz.id} label="Host quiz" />

          <Button
            type="button"
            variant="secondary"
            onClick={onToggleSave}
            disabled={isSaving}
            className={clsx(
              "flex items-center gap-2",
              quiz.isSaved && "border-primary/40 bg-primary/15 text-primary",
            )}
          >
            <FiBookmark className="h-4 w-4" />
            {quiz.isSaved ? "Saved" : "Save quiz"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onShare}
            className="flex items-center gap-2"
          >
            {copied ? (
              <FiCheck className="h-4 w-4" />
            ) : (
              <FiShare2 className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Share quiz"}
          </Button>
        </div>

        <hr className="border-border" />

        <div className="flex flex-col gap-3">
          <h2 className="section-title">Questions</h2>

          <ol className="flex flex-col gap-2">
            {quiz.questions.map((question, index) => (
              <li
                key={question.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <IndexBadge size="md">{index + 1}</IndexBadge>
                  <span className="truncate text-foreground">
                    {question.prompt}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <FiClock className="h-3.5 w-3.5" />
                    {question.timeLimitSeconds}s
                  </span>
                  <span className="flex items-center gap-1">
                    <FiStar className="h-3.5 w-3.5" />
                    {question.points} pts
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default QuizDetailsContent;
