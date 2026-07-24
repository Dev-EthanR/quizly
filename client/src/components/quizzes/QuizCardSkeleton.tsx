function QuizCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="h-16 w-24 shrink-0 animate-pulse rounded-lg bg-chat" />

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-5 w-1/3 animate-pulse rounded bg-chat" />
          <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-chat" />
        </div>

        <div className="flex items-center gap-4">
          <div className="h-4 w-20 animate-pulse rounded bg-chat" />
          <div className="h-4 w-24 animate-pulse rounded bg-chat" />
        </div>
      </div>
    </div>
  );
}

export default QuizCardSkeleton;
