import { useLocation, useParams } from "react-router-dom";
import { FiZap } from "react-icons/fi";

interface PlayLocation {
  state?: {
    isHost?: boolean;
  };
}

function Play() {
  const { roomCode } = useParams();
  const { state } = useLocation() as PlayLocation;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
        <FiZap size={28} />
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">
          The quiz is starting!
        </h1>
        <p className="text-muted">
          Room <span className="font-semibold text-foreground">{roomCode}</span>{" "}
          {state?.isHost ? "is starting" : "is about to begin"} — gameplay is
          coming soon.
        </p>
      </div>
    </div>
  );
}

export default Play;
