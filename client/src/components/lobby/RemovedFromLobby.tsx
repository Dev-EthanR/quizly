import { Link } from "react-router-dom";
import { FiUserX } from "react-icons/fi";
import Button from "../ui/Button";
import FullScreenStatus from "../ui/FullScreenStatus";

interface RemovedFromLobbyProps {
  hostName?: string;
}

function RemovedFromLobby({ hostName }: RemovedFromLobbyProps) {
  return (
    <FullScreenStatus
      icon={<FiUserX size={28} />}
      title="You've been removed"
      message={
        hostName
          ? `The host, ${hostName}, removed you from this lobby.`
          : "The host removed you from this lobby."
      }
    >
      <Link to="/" className="mt-2">
        <Button type="button">Back to Home</Button>
      </Link>
    </FullScreenStatus>
  );
}

export default RemovedFromLobby;
