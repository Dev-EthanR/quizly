import type { HTMLAttributeReferrerPolicy } from "react";
import clsx from "clsx";

interface ImageFallbackProps {
  src: string | null | undefined;
  alt?: string;
  fallbackText: string;
  shape?: "rect" | "circle" | "none";
  className?: string;
  textClassName?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
}

function ImageFallback({
  src,
  alt = "",
  fallbackText,
  shape = "rect",
  className,
  textClassName = "text-xl font-bold",
  referrerPolicy,
}: ImageFallbackProps) {
  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center overflow-hidden bg-chat",
        shape === "circle" && "rounded-full",
        shape === "rect" && "rounded-lg",
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy={referrerPolicy}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={clsx("text-muted", textClassName)}>
          {fallbackText.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default ImageFallback;
