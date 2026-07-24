import { Link } from "react-router-dom";
import { FiUserX } from "react-icons/fi";
import Button from "../ui/Button";

interface RemovedFromLobbyProps {
  hostName?: string;
}

function RemovedFromLobby({ hostName }: RemovedFromLobbyProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger">
        <FiUserX size={28} />
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">
          You've been removed
        </h1>
        <p className="text-muted">
          {hostName
            ? `The host, ${hostName}, removed you from this lobby.`
            : "The host removed you from this lobby."}
        </p>
      </div>

      <Link to="/" className="mt-2">
        <Button type="button">Back to Home</Button>
      </Link>
    </div>
  );
}

export default RemovedFromLobby;
