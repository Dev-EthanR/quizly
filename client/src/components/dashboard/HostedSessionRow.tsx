import { FiUsers } from "react-icons/fi";
import type { HostedSession } from "../../lib/dashboard";

interface HostedSessionRowProps {
  session: HostedSession;
}

function HostedSessionRow({ session }: HostedSessionRowProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-chat">
        {session.quizCoverImage ? (
          <img
            src={session.quizCoverImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold text-muted">
            {session.quizTitle.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="truncate font-semibold text-foreground">
          {session.quizTitle}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <FiUsers className="h-4 w-4" />
            {session.playerCount}{" "}
            {session.playerCount === 1 ? "player" : "players"}
          </span>
          <span>
            {session.questionCount}{" "}
            {session.questionCount === 1 ? "question" : "questions"}
          </span>
          <span>{new Date(session.playedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default HostedSessionRow;
