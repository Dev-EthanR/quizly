import Avatar from "../ui/Avatar";
import PlayerRoster from "./PlayerRoster";
import { AVATAR_COLORS } from "../../lib/avatarColors";
import { getInitials } from "../../lib/initials";
import type { LobbyPlayer } from "../../context/socket-context";

interface ParticipantLobbyPanelProps {
  roomCode: string;
  name: string;
  color?: string | undefined;
  players: LobbyPlayer[];
  currentPlayerId?: string | undefined;
}

function ParticipantLobbyPanel({
  roomCode,
  name,
  color,
  players,
  currentPlayerId,
}: ParticipantLobbyPanelProps) {
  const selectedColor =
    AVATAR_COLORS.find((c) => c.id === color) ?? AVATAR_COLORS[0];

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <Avatar
          initials={getInitials(name)}
          bgClass={selectedColor.bgClass}
          size="lg"
        />
        <p className="text-foreground">
          You're in as <span className="font-semibold">{name}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2">
        <span className="text-sm text-muted">Room code</span>
        <span className="font-bold tracking-[0.2em] text-primary">
          {roomCode}
        </span>
      </div>

      <PlayerRoster players={players} currentPlayerId={currentPlayerId} />

      <p className="text-muted">Waiting for the host to start the game...</p>
    </div>
  );
}

export default ParticipantLobbyPanel;
