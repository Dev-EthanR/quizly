import { useParams } from "react-router-dom";
import HostSummaryScreen from "../components/play/HostSummaryScreen";
import ErrorRetry from "../components/ui/ErrorRetry";
import { useHostedSessionDetail } from "../hooks/useHostedSessionDetail";

function HostedSessionSummary() {
  const { sessionId } = useParams();
  const { data, isLoading, isError, refetch } = useHostedSessionDetail(sessionId);

  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center px-4 text-center">
        <p className="text-muted">Loading game summary...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page-shell flex items-center justify-center px-4">
        <ErrorRetry
          message="Couldn't load this game's summary."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <HostSummaryScreen
      summary={data}
      heading={data.quizTitle}
      subheading={`Played ${new Date(data.playedAt).toLocaleDateString()}`}
    />
  );
}

export default HostedSessionSummary;
