import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import clsx from "clsx";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import VisibilitySelect from "./publish/VisibilitySelect";
import type { QuizVisibility } from "../../lib/quizzes";

interface QuizBuilderActionBarProps {
  isPublished: boolean;
  isSaving: boolean;
  quizId?: string;
  visibility: QuizVisibility;
  onVisibilityChange: (value: QuizVisibility) => void;
  onSave: () => void;
  onOpenPublishModal: () => void;
}

function QuizBuilderActionBar({
  isPublished,
  isSaving,
  quizId,
  visibility,
  onVisibilityChange,
  onSave,
  onOpenPublishModal,
}: QuizBuilderActionBarProps) {
  const [pendingVisibility, setPendingVisibility] = useState<QuizVisibility | null>(
    null,
  );

  return (
    <>
      <div
        className={clsx(
          "sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-border bg-background py-4",
          isPublished ? "justify-between" : "justify-end",
        )}
      >
        {isPublished && (
          <VisibilitySelect
            value={visibility}
            onChange={(value) => {
              if (value !== visibility) setPendingVisibility(value);
            }}
            compact
          />
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={onSave}
          >
            {isSaving ? "Saving..." : isPublished ? "Save changes" : "Save draft"}
          </Button>
          {isPublished ? (
            <Link to={`/host/${quizId}`}>
              <Button type="button" className="flex items-center gap-2">
                <FiPlay className="h-4 w-4" />
                Host
              </Button>
            </Link>
          ) : (
            <Button type="button" disabled={isSaving} onClick={onOpenPublishModal}>
              {isSaving ? "Publishing..." : "Publish"}
            </Button>
          )}
        </div>
      </div>

      {pendingVisibility && (
        <ConfirmDialog
          title="Change quiz visibility?"
          message={
            pendingVisibility === "private"
              ? "This quiz will no longer appear on the Discovery page, and only you will be able to host it."
              : "This quiz will become visible to everyone on the Discovery page and can be hosted by anyone."
          }
          confirmLabel={pendingVisibility === "private" ? "Make private" : "Make public"}
          onConfirm={() => {
            onVisibilityChange(pendingVisibility);
            setPendingVisibility(null);
          }}
          onCancel={() => setPendingVisibility(null)}
        />
      )}
    </>
  );
}

export default QuizBuilderActionBar;
