import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "../ui/Button";
import FullScreenStatus from "../ui/FullScreenStatus";

function HostDisconnected() {
  return (
    <FullScreenStatus
      icon={<FiAlertTriangle size={28} />}
      title="Host has left"
      message="The host disconnected, so this game has ended."
    >
      <Link to="/" className="mt-2">
        <Button type="button">Back to Home</Button>
      </Link>
    </FullScreenStatus>
  );
}

export default HostDisconnected;
