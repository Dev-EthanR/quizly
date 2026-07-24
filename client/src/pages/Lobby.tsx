import { useLocation, useParams } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import RoomNotFound from "../components/lobby/RoomNotFound";
import { AVATAR_COLORS } from "../lib/avatarColors";
import { getInitials } from "../lib/initials";
import { ROOM_CODE_REGEX } from "../lib/schemas/joinRoom";

interface LobbyLocation {
  state?: {
    name?: string;
    color?: string;
  };
}

function Lobby() {
  const { roomCode } = useParams();
  const { state } = useLocation() as LobbyLocation;
  const selectedColor =
    AVATAR_COLORS.find((color) => color.id === state?.color) ??
    AVATAR_COLORS[0];

  const isValidRoomCode =
    !!roomCode && ROOM_CODE_REGEX.test(roomCode.toUpperCase());

  if (!isValidRoomCode) {
    return <RoomNotFound roomCode={roomCode} />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4">
      <p className="text-foreground">
        Joining room <span className="font-bold text-primary">{roomCode}</span>
      </p>
      {state?.name && (
        <div className="mt-2 flex flex-col items-center gap-2">
          <Avatar
            initials={getInitials(state.name)}
            bgClass={selectedColor.bgClass}
          />
          <p className="text-muted">as {state.name}</p>
        </div>
      )}
    </div>
  );
}

export default Lobby;
