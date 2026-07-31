import { FiUsers } from "react-icons/fi";
import AnswerButton from "./AnswerButton";
import type { AnswerProgressPayload, PublicAnswer } from "../../entities/socket";

const ANSWER_OPTION_LABELS = ["A", "B", "C", "D"];

interface QuestionPhaseViewProps {
  answerProgress: AnswerProgressPayload | null;
  answers: PublicAnswer[];
  isHost: boolean;
  selectedAnswerId: string | null;
  onSubmitAnswer: (answerId: string) => void;
}

function QuestionPhaseView({
  answerProgress,
  answers,
  isHost,
  selectedAnswerId,
  onSubmitAnswer,
}: QuestionPhaseViewProps) {
  return (
    <>
      <div className="flex items-center justify-center gap-2 text-sm text-muted">
        <FiUsers className="h-4 w-4" />
        <span>
          {answerProgress
            ? `${answerProgress.answered}/${answerProgress.total}`
            : "0"}{" "}
          answered
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {answers.map((answer, index) => (
          <AnswerButton
            key={answer.id}
            text={answer.text}
            optionLabel={ANSWER_OPTION_LABELS[index % ANSWER_OPTION_LABELS.length]!}
            disabled={isHost || !!selectedAnswerId}
            isSelected={selectedAnswerId === answer.id}
            onClick={() => onSubmitAnswer(answer.id)}
          />
        ))}
      </div>
    </>
  );
}

export default QuestionPhaseView;
