import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "../ui/Button";

function HostDisconnected() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger">
        <FiAlertTriangle size={28} />
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Host has left</h1>
        <p className="text-muted">
          The host disconnected, so this game has ended.
        </p>
      </div>

      <Link to="/" className="mt-2">
        <Button type="button">Back to Home</Button>
      </Link>
    </div>
  );
}

export default HostDisconnected;
