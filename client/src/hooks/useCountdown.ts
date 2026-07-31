import { useEffect, useState } from "react";

export function useCountdown(deadline: number | null, initialSeconds = 0): number {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    deadline === null
      ? initialSeconds
      : Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (deadline === null) {
      return;
    }

    const update = () => {
      setRemainingSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };

    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [deadline]);

  return remainingSeconds;
}
