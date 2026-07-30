import Skeleton from "../ui/Skeleton";

function DiscoveryQuizCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <Skeleton className="h-36" />

      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-2/3 rounded" />

        <div className="flex gap-3">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>

        <Skeleton className="h-4 w-1/2 rounded" />

        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default DiscoveryQuizCardSkeleton;
