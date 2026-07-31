import type { ReactNode } from "react";
import clsx from "clsx";
import ChatPanel from "./ChatPanel";
import type { LobbyPlayer } from "../../entities/socket";

interface RoomChatLayoutProps {
  roomCode: string;
  chatDisabled: boolean;
  players: LobbyPlayer[];
  currentPlayerId: string | undefined;
  children: ReactNode;
}

function RoomChatLayout({
  roomCode,
  chatDisabled,
  players,
  currentPlayerId,
  children,
}: RoomChatLayoutProps) {
  const isMuted =
    players.find((p) => p.id === currentPlayerId)?.muted ?? false;

  return (
    <div
      className={clsx(
        "mx-auto grid w-full max-w-5xl gap-6",
        !chatDisabled && "lg:grid-cols-[1fr_320px]",
      )}
    >
      {children}

      {!chatDisabled && (
        <ChatPanel
          roomCode={roomCode}
          disabled={isMuted}
          disabledReason={isMuted ? "You have been muted by the host." : undefined}
        />
      )}
    </div>
  );
}

export default RoomChatLayout;
