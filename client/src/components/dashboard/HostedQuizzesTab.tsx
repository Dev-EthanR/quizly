import { useState } from "react";
import { FiVideo } from "react-icons/fi";
import ErrorRetry from "../ui/ErrorRetry";
import Pagination from "../ui/Pagination";
import HostedSessionRow from "./HostedSessionRow";
import DashboardRowSkeleton from "./DashboardRowSkeleton";
import EmptyState from "./EmptyState";
import { useHostedSessions } from "../../hooks/useHostedSessions";

const ROW_SKELETON_COUNT = 4;

function HostedQuizzesTab() {
  const [page, setPage] = useState(1);
  const { data: result, isLoading, isError, refetch } = useHostedSessions(page);
  const sessions = result?.sessions;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: ROW_SKELETON_COUNT }).map((_, index) => (
          <DashboardRowSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorRetry
        message="Couldn't load your hosted quizzes."
        onRetry={() => refetch()}
      />
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState
        icon={FiVideo}
        title="No hosted games yet"
        description="Host a quiz from your library and it will show up here once the game ends."
        action={{ label: "Go to My Quizzes", to: "/my-quizzes" }}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {sessions.map((session) => (
          <HostedSessionRow key={session.id} session={session} />
        ))}
      </div>

      <div className="mt-8">
        <Pagination
          page={page}
          totalPages={result?.totalPages ?? 1}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}

export default HostedQuizzesTab;
