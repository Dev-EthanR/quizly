import { FiRefreshCw } from "react-icons/fi";

interface ReconnectingOverlayProps {
  message?: string;
}

function ReconnectingOverlay({
  message = "Reconnecting...",
}: ReconnectingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 px-4 text-center backdrop-blur-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-warning/40 bg-warning/10 text-warning">
        <FiRefreshCw size={28} className="animate-spin" />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-foreground">{message}</h2>
        <p className="text-muted">Trying to restore your connection...</p>
      </div>

      <div className="flex gap-2">
        <span className="h-2.5 w-2.5 animate-dot-fade rounded-full bg-warning [animation-delay:0ms]" />
        <span className="h-2.5 w-2.5 animate-dot-fade rounded-full bg-warning [animation-delay:200ms]" />
        <span className="h-2.5 w-2.5 animate-dot-fade rounded-full bg-warning [animation-delay:400ms]" />
      </div>
    </div>
  );
}

export default ReconnectingOverlay;
