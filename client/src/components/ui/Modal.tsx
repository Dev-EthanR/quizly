import { type MouseEvent, type ReactNode } from "react";
import clsx from "clsx";
import { useModal } from "../../hooks/useModal";

interface ModalProps {
  title: ReactNode;
  ariaLabel: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClassName?: string;
}

function Modal({
  title,
  ariaLabel,
  onClose,
  children,
  footer,
  maxWidthClassName = "max-w-5xl",
}: ModalProps) {
  useModal(onClose);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      role="presentation"
      onClick={handleOverlayClick}
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={clsx(
          "card flex max-h-[90vh] w-full flex-col overflow-hidden",
          maxWidthClassName,
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cursor-pointer rounded-lg px-2 py-1 text-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
