import { useEffect, type RefObject } from "react";

interface UseModalOptions {
  enabled?: boolean;
  outsideClickRef?: RefObject<HTMLElement | null>;
}

export function useModal(onClose: () => void, options?: UseModalOptions) {
  const { enabled = true, outsideClickRef } = options ?? {};

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    function handlePointerDown(event: MouseEvent) {
      if (!outsideClickRef?.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    if (outsideClickRef) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (outsideClickRef) {
        document.removeEventListener("mousedown", handlePointerDown);
      }
    };
  }, [onClose, enabled, outsideClickRef]);
}
