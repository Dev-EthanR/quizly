import clsx from "clsx";

interface AnswerButtonProps {
  text: string;
  optionLabel: string;
  disabled: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function AnswerButton({
  text,
  optionLabel,
  disabled,
  isSelected,
  onClick,
}: AnswerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex cursor-pointer items-center gap-4 rounded-xl border-2 px-6 py-6 text-left text-lg font-semibold text-foreground transition-all disabled:cursor-not-allowed",
        isSelected
          ? "border-primary bg-primary/15 ring-2 ring-primary"
          : "border-border bg-surface hover:border-primary/50",
        disabled && !isSelected && "opacity-60",
      )}
    >
      <span
        className={clsx(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          isSelected ? "bg-primary text-white" : "bg-primary/15 text-primary",
        )}
      >
        {optionLabel}
      </span>
      <span>{text}</span>
    </button>
  );
}

export default AnswerButton;
