import { useState } from "react";
import { FiPlay } from "react-icons/fi";
import ErrorRetry from "../ui/ErrorRetry";
import Pagination from "../ui/Pagination";
import RecentGameRow from "./RecentGameRow";
import DashboardRowSkeleton from "./DashboardRowSkeleton";
import EmptyState from "./EmptyState";
import { useRecentGames } from "../../hooks/useRecentGames";

const ROW_SKELETON_COUNT = 4;

function RecentGamesTab() {
  const [page, setPage] = useState(1);
  const { data: result, isLoading, isError, refetch } = useRecentGames(page);
  const games = result?.games;

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
        message="Couldn't load your recent games."
        onRetry={() => refetch()}
      />
    );
  }

  if (!games || games.length === 0) {
    return (
      <EmptyState
        icon={FiPlay}
        title="No games played yet"
        description="Join a live quiz with a room code and your results will show up here."
        action={{ label: "Join a game", to: "/" }}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {games.map((game) => (
          <RecentGameRow key={game.id} game={game} />
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

export default RecentGamesTab;
