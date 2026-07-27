import clsx from "clsx";

interface AvatarProps {
  initials: string;
  bgClass: string;
  size?: "sm" | "lg";
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-10.75 w-10.75 text-lg",
  lg: "h-20 w-20 text-2xl",
};

function Avatar({ initials, bgClass, size = "sm" }: AvatarProps) {
  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white select-none",
        SIZE_CLASSES[size],
        bgClass,
      )}
    >
      {initials}
    </div>
  );
}

export default Avatar;
