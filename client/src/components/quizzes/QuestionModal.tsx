import { useState } from "react";
import type { QuizQuestionDraft } from "../../entities/quiz";
import { getQuestionErrors, isQuestionValid } from "../../lib/questionValidation";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import IndexBadge from "../ui/IndexBadge";
import QuestionEditor from "./QuestionEditor";

interface QuestionModalProps {
  question: QuizQuestionDraft;
  index: number;
  isNew: boolean;
  answerGenerationAttempts: number;
  onAnswersGenerated: () => void;
  onDelete: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

function QuestionModal({
  question,
  index,
  isNew,
  answerGenerationAttempts,
  onAnswersGenerated,
  onDelete,
  onDiscard,
  onClose,
}: QuestionModalProps) {
  const [hasAttemptedDone, setHasAttemptedDone] = useState(false);
  const modalLabel = isNew ? "Create question" : "Edit question";
  const errors = hasAttemptedDone ? getQuestionErrors(question) : null;

  const handleDismiss = () => {
    if (isNew) {
      onDelete();
      return;
    }
    onDiscard();
  };

  const handleDone = () => {
    if (!isQuestionValid(question)) {
      setHasAttemptedDone(true);
      return;
    }
    onClose();
  };

  return (
    <Modal
      title={
        <span className="flex items-center gap-3">
          <IndexBadge shape="pill">Question {index + 1}</IndexBadge>
          <span className="text-base font-semibold text-foreground">
            {modalLabel}
          </span>
        </span>
      }
      ariaLabel={`${modalLabel}: Question ${index + 1}`}
      onClose={handleDismiss}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleDismiss}>
            Cancel
          </Button>
          <Button type="button" onClick={handleDone}>
            Done
          </Button>
        </>
      }
    >
      <QuestionEditor
        question={question}
        errors={errors}
        answerGenerationAttempts={answerGenerationAttempts}
        onAnswersGenerated={onAnswersGenerated}
      />
    </Modal>
  );
}

export default QuestionModal;
