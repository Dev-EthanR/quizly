import clsx from "clsx";

interface AnswerButtonProps {
  text: string;
  colorClass: string;
  disabled: boolean;
  isSelected: boolean;
  isRevealed: boolean;
  isCorrect: boolean;
  onClick: () => void;
}

function AnswerButton({
  text,
  colorClass,
  disabled,
  isSelected,
  isRevealed,
  isCorrect,
  onClick,
}: AnswerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "cursor-pointer rounded-xl px-6 py-8 text-left text-lg font-semibold text-white transition-opacity disabled:cursor-not-allowed",
        colorClass,
        isRevealed && !isCorrect && "opacity-40",
        isSelected && !isRevealed && "ring-4 ring-foreground",
        isRevealed && isCorrect && "ring-4 ring-foreground",
      )}
    >
      {text}
    </button>
  );
}

export default AnswerButton;
