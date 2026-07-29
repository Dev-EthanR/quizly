import { useEffect, useRef, useState, type FormEvent } from "react";
import clsx from "clsx";
import { FiSend } from "react-icons/fi";
import { CHAT_MESSAGE_MAX_LENGTH } from "shared";
import { useSocket } from "../../context/useSocket";
import { useChat } from "../../context/useChat";
import { loadSession } from "../../lib/session";

interface LobbyChatProps {
  roomCode: string;
}

function LobbyChat({ roomCode }: LobbyChatProps) {
  const { status } = useSocket();
  const { messages, sendMessage, enterRoom } = useChat();
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const ownToken = loadSession(roomCode)?.token;

  useEffect(() => {
    enterRoom(roomCode);
  }, [roomCode, enterRoom]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const handleSendMessage = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || status !== "connected") {
      return;
    }

    sendMessage(roomCode, trimmed);
    setDraft("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-semibold text-foreground">Lobby chat</h2>
      </div>

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-3"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted">No messages yet. Say hi!</p>
        ) : (
          messages.map((message, index) => {
            const isSelf = message.senderId === ownToken;
            const label = isSelf ? "You" : message.isHost ? "Host" : message.senderName;
            const isGroupedWithPrevious =
              messages[index - 1]?.senderId === message.senderId;

            return (
              <div
                key={message.id}
                className={clsx(
                  "flex flex-col",
                  isSelf ? "items-end" : "items-start",
                )}
              >
                {!isGroupedWithPrevious && (
                  <span className="px-1 text-xs text-muted">{label}</span>
                )}
                <span
                  className={clsx(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm break-words text-foreground",
                    isSelf ? "bg-primary/80" : "bg-chat",
                  )}
                >
                  {message.message}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          placeholder="Type a message..."
          aria-label="Chat message"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!draft.trim() || status !== "connected"}
          aria-label="Send message"
          className="cursor-pointer rounded-lg bg-primary p-2 text-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiSend className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export default LobbyChat;
