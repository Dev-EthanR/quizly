import clsx from "clsx";

interface AvatarProps {
  initials: string;
  bgClass: string;
}

function Avatar({ initials, bgClass }: AvatarProps) {
  return (
    <div
      className={clsx(
        "flex h-10.75 w-10.75 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white select-none",
        bgClass,
      )}
    >
      {initials}
    </div>
  );
}

export default Avatar;
