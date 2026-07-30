import { useState, type MouseEvent } from "react";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { useModal } from "../../hooks/useModal";
import { useChat } from "../../context/useChat";
import LobbyChat from "./LobbyChat";

interface ChatPanelProps {
  roomCode: string;
  disabled?: boolean;
  disabledReason?: string;
}

function ChatPanel({ roomCode, disabled, disabledReason }: ChatPanelProps) {
  const { messages } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [seenCount, setSeenCount] = useState(messages.length);

  const closeChat = () => {
    setSeenCount(messages.length);
    setIsOpen(false);
  };
  useModal(closeChat);

  const unreadCount = isOpen ? 0 : Math.max(0, messages.length - seenCount);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeChat();
  };

  return (
    <>
      <div className="hidden h-[520px] lg:sticky lg:top-10 lg:block">
        <LobbyChat roomCode={roomCode} disabled={disabled} disabledReason={disabledReason} />
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={unreadCount > 0 ? `Open chat, ${unreadCount} unread messages` : "Open chat"}
        className="fixed right-6 bottom-6 z-20 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-primary/90 lg:hidden"
      >
        <FiMessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="presentation"
          onClick={handleOverlayClick}
          className="fixed inset-0 z-30 flex items-end bg-black/60 lg:hidden"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chat"
            className="relative flex h-[75vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-surface"
          >
            <button
              type="button"
              aria-label="Close chat"
              onClick={closeChat}
              className="absolute top-3 right-3 z-10 cursor-pointer rounded-lg p-1.5 text-muted hover:text-foreground"
            >
              <FiX className="h-5 w-5" />
            </button>
            <LobbyChat roomCode={roomCode} disabled={disabled} disabledReason={disabledReason} />
          </div>
        </div>
      )}
    </>
  );
}

export default ChatPanel;
