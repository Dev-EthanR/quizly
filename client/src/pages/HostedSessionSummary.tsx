import { useParams } from "react-router-dom";
import HostSummaryScreen from "../components/play/HostSummaryScreen";
import { useHostedSessionDetail } from "../hooks/useHostedSessionDetail";

function HostedSessionSummary() {
  const { sessionId } = useParams();
  const { data, isLoading, isError } = useHostedSessionDetail(sessionId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-muted">Loading game summary...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-muted">Couldn't load this game's summary.</p>
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
