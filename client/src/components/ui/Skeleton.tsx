import clsx from "clsx";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return <div className={clsx("animate-pulse bg-chat", className)} />;
}

export default Skeleton;
