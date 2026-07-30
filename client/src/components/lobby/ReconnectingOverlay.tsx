import { FiRefreshCw } from "react-icons/fi";
import FullScreenStatus from "../ui/FullScreenStatus";

interface ReconnectingOverlayProps {
  message?: string;
}

function ReconnectingOverlay({
  message = "Reconnecting...",
}: ReconnectingOverlayProps) {
  return (
    <FullScreenStatus
      variant="overlay"
      tone="warning"
      icon={<FiRefreshCw size={28} className="animate-spin" />}
      title={message}
      titleClassName="text-xl font-bold text-foreground"
      message="Trying to restore your connection..."
    >
      <div className="flex gap-2">
        <span className="h-2.5 w-2.5 animate-dot-fade rounded-full bg-warning [animation-delay:0ms]" />
        <span className="h-2.5 w-2.5 animate-dot-fade rounded-full bg-warning [animation-delay:200ms]" />
        <span className="h-2.5 w-2.5 animate-dot-fade rounded-full bg-warning [animation-delay:400ms]" />
      </div>
    </FullScreenStatus>
  );
}

export default ReconnectingOverlay;
