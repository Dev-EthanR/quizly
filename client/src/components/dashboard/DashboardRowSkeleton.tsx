import Skeleton from "../ui/Skeleton";

function DashboardRowSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <Skeleton className="h-16 w-24 shrink-0 rounded-lg" />

      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-5 w-1/3 rounded" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

export default DashboardRowSkeleton;
