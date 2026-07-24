import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "../ui/Button";

interface RoomNotFoundProps {
  roomCode?: string;
}

function RoomNotFound({ roomCode }: RoomNotFoundProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger">
        <FiAlertTriangle size={28} />
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">
          Room not found
        </h1>
        <p className="text-muted">
          {roomCode ? (
            <>
              We couldn't find a room with the code{" "}
              <span className="font-semibold text-foreground">
                {roomCode}
              </span>
              .
            </>
          ) : (
            "That room code doesn't exist."
          )}
        </p>
        <p className="text-muted">
          It may have ended, expired, or the code was mistyped.
        </p>
      </div>

      <Link to="/" className="mt-2">
        <Button type="button">Back to Home</Button>
      </Link>
    </div>
  );
}

export default RoomNotFound;
