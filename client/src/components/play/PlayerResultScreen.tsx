import type { ReactNode } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { FiAward, FiCheckCircle, FiGrid, FiStar, FiTarget } from "react-icons/fi";
import Button from "../ui/Button";
import { useAuth } from "../../context/useAuth";

interface PlayerResultScreenProps {
  score: number;
  correctCount: number;
  totalQuestions: number;
  rank: number;
  totalPlayers: number;
}

interface StatTileProps {
  icon: ReactNode;
  value: string;
  label: string;
}

function StatTile({ icon, value, label }: StatTileProps) {
  return (
    <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
        {icon}
      </span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

function PlayerResultScreen({
  score,
  correctCount,
  totalQuestions,
  rank,
  totalPlayers,
}: PlayerResultScreenProps) {
  const { status } = useAuth();
  const accuracy =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isTopThree = totalPlayers > 0 && rank <= 3;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <FiAward className="h-7 w-7" />
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">
              Game over
            </span>
            <span className="text-6xl font-extrabold text-primary">#{rank}</span>
            <span className="text-sm text-muted">
              out of {totalPlayers} {totalPlayers === 1 ? "player" : "players"}
            </span>
          </div>

          {isTopThree && (
            <span className="flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
              <FiStar className="h-3.5 w-3.5" />
              Top finish
            </span>
          )}
        </div>

        <div className="h-px w-full bg-border" />

        <div
          className={clsx(
            "grid w-full gap-4",
            totalQuestions > 0 ? "grid-cols-3" : "grid-cols-1",
          )}
        >
          <StatTile icon={<FiAward className="h-5 w-5" />} value={String(score)} label="Points" />
          {totalQuestions > 0 && (
            <>
              <StatTile
                icon={<FiCheckCircle className="h-5 w-5" />}
                value={`${correctCount}/${totalQuestions}`}
                label="Correct"
              />
              <StatTile
                icon={<FiTarget className="h-5 w-5" />}
                value={`${accuracy}%`}
                label="Accuracy"
              />
            </>
          )}
        </div>

        <div className="h-px w-full bg-border" />

        <div className="flex w-full flex-col items-center gap-3">
          <Link to="/" className="w-full">
            <Button type="button" className="flex w-full items-center justify-center gap-2">
              <FiGrid className="h-4 w-4" />
              Join Another Game
            </Button>
          </Link>

          {status === "authenticated" ? (
            <Link
              to="/host"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/signin"
              state={{ mode: "signup" }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Sign up to save your scores
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerResultScreen;
