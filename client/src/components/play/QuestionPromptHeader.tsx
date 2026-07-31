interface QuestionPromptHeaderProps {
  categoryLabel: string;
  points: number;
  prompt: string;
}

function QuestionPromptHeader({
  categoryLabel,
  points,
  prompt,
}: QuestionPromptHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-sm font-semibold text-primary">
        {categoryLabel} &middot; {points} pts
      </span>
      <h1 className="heading text-2xl sm:text-3xl">
        {prompt}
      </h1>
    </div>
  );
}

export default QuestionPromptHeader;
