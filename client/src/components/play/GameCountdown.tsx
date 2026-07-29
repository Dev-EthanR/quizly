import { useEffect, useState } from "react";

interface GameCountdownProps {
  onComplete: () => void;
}

const COUNTDOWN_START = 3;

function GameCountdown({ onComplete }: GameCountdownProps) {
  const [count, setCount] = useState(COUNTDOWN_START);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }

    const timeout = setTimeout(() => setCount((prev) => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [count, onComplete]);

  if (count <= 0) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <p className="text-lg font-medium text-muted">Get ready...</p>
      <span
        key={count}
        className="animate-countdown-pop text-9xl font-extrabold text-primary"
      >
        {count}
      </span>
    </div>
  );
}

export default GameCountdown;
