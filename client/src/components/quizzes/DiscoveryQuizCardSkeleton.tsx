function DiscoveryQuizCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="h-36 animate-pulse bg-chat" />

      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-chat" />

        <div className="flex gap-3">
          <div className="h-4 w-20 animate-pulse rounded bg-chat" />
          <div className="h-4 w-16 animate-pulse rounded bg-chat" />
        </div>

        <div className="h-4 w-1/2 animate-pulse rounded bg-chat" />

        <div className="h-11 w-full animate-pulse rounded-lg bg-chat" />
      </div>
    </div>
  );
}

export default DiscoveryQuizCardSkeleton;
