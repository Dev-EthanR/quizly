import { useLocation, useParams } from "react-router-dom";

interface LobbyLocation {
  state?: {
    name?: string;
  };
}

function Lobby() {
  const { roomCode } = useParams();
  const { state } = useLocation() as LobbyLocation;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4">
      <p className="text-foreground">
        Joining room <span className="font-bold text-primary">{roomCode}</span>
      </p>
      {state?.name && <p className="text-muted">as {state.name}</p>}
    </div>
  );
}

export default Lobby;
