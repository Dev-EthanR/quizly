import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import { useAuth } from "../context/useAuth";
import { useSocket } from "../context/useSocket";
import { createSessionToken, saveSession } from "../lib/session";
import { DEFAULT_HOST_SETTINGS, type HostSettings } from "../lib/hostSettings";
import type { RoomCreatedPayload } from "../context/socket-context";

interface HostLocation {
  state?: {
    settings?: HostSettings;
  };
}

function Host() {
  const { quizId } = useParams();
  const { state } = useLocation() as HostLocation;
  const { socket, status } = useSocket();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const hasHostedRef = useRef(false);
  const tokenRef = useRef<string>(createSessionToken());
  const settingsRef = useRef<HostSettings>(state?.settings ?? DEFAULT_HOST_SETTINGS);

  useEffect(() => {
    if (!quizId) {
      return;
    }

    function handleRoomCreated(payload: RoomCreatedPayload) {
      saveSession({
        roomCode: payload.roomCode,
        token: tokenRef.current,
        isHost: true,
      });
      setRoomCode(payload.roomCode);
    }

    socket.on("room_created", handleRoomCreated);

    if (status === "connected" && !hasHostedRef.current) {
      socket.emit("host_game", {
        quizId,
        token: tokenRef.current,
        userId: user?.id,
        randomizeQuestionOrder: settingsRef.current.randomizeQuestionOrder,
        allowLateJoins: settingsRef.current.allowLateJoins,
        showCorrectAnswers: settingsRef.current.showCorrectAnswers,
        disableChat: settingsRef.current.disableChat,
        maxPlayers: settingsRef.current.maxPlayers ?? undefined,
      });
      hasHostedRef.current = true;
    }

    return () => {
      socket.off("room_created", handleRoomCreated);
    };
  }, [quizId, status, socket, user?.id]);

  if (!quizId) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-warning/40 bg-warning/10 text-warning">
            <FiAlertTriangle size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground">
              No quiz selected
            </h1>
            <p className="text-muted">
              Choose a quiz to host from your library.
            </p>
          </div>
          <Link to="/my-quizzes">
            <Button type="button">Go to My Quizzes</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (roomCode) {
    return (
      <Navigate to={`/lobby/${roomCode}`} replace state={{ isHost: true }} />
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        {status !== "connected" ? (
          <p className="text-muted">Connecting to the game server...</p>
        ) : (
          <p className="text-muted">Creating your room...</p>
        )}
      </div>
    </div>
  );
}

export default Host;
