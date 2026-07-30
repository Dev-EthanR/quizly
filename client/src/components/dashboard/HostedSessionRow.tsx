import { useNavigate } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import HostQuizButton from "../quizzes/HostQuizButton";
import ImageFallback from "../ui/ImageFallback";
import type { HostedSession } from "../../lib/dashboard";

interface HostedSessionRowProps {
  session: HostedSession;
}

function HostedSessionRow({ session }: HostedSessionRowProps) {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/dashboard/hosted/${session.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          navigate(`/dashboard/hosted/${session.id}`);
        }
      }}
      className="flex cursor-pointer flex-col gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center"
    >
      <ImageFallback
        src={session.quizCoverImage}
        fallbackText={session.quizTitle}
        className="h-16 w-24"
      />

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

      <div
        className="shrink-0"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <HostQuizButton
          quizId={session.quizId}
          label="Host Again"
          className="flex w-full items-center justify-center gap-2 sm:w-auto"
        />
      </div>
    </div>
  );
}

export default HostedSessionRow;
