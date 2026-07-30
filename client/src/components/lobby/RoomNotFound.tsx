import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "../ui/Button";
import FullScreenStatus from "../ui/FullScreenStatus";

interface RoomNotFoundProps {
  roomCode?: string;
  title?: string;
  message?: ReactNode;
}

function RoomNotFound({ roomCode, title, message }: RoomNotFoundProps) {
  return (
    <FullScreenStatus
      icon={<FiAlertTriangle size={28} />}
      title={title ?? "Room not found"}
      message={
        message ??
        (roomCode ? (
          <>
            We couldn't find a room with the code{" "}
            <span className="font-semibold text-foreground">{roomCode}</span>.
          </>
        ) : (
          "That room code doesn't exist."
        ))
      }
      secondaryMessage={
        !message && "It may have ended, expired, or the code was mistyped."
      }
    >
      <Link to="/" className="mt-2">
        <Button type="button">Back to Home</Button>
      </Link>
    </FullScreenStatus>
  );
}

export default RoomNotFound;
