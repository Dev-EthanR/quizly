import Skeleton from "../ui/Skeleton";

function QuizCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-24 shrink-0 rounded-lg" />

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-5 w-1/3 rounded" />
            <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
          </div>

          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>
      </div>

      <Skeleton className="h-11 w-full shrink-0 rounded-lg sm:w-20" />
    </div>
  );
}

export default QuizCardSkeleton;
