import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiTarget,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import StatTile from "../ui/StatTile";
import RankedListRow from "./RankedListRow";
import WinnerCard from "./WinnerCard";
import InsightCard from "./InsightCard";
import QuestionBreakdownRow from "./QuestionBreakdownRow";
import { AVATAR_COLORS } from "../../lib/avatarColors";
import { getInitials } from "../../lib/initials";
import { formatResponseTime } from "../../lib/format";
import type { GameOverPayload } from "../../entities/socket";

interface HostSummaryScreenProps {
  summary: GameOverPayload;
  onBack?: () => void;
  heading?: string;
  subheading?: ReactNode;
}

function avatarColorFor(colorId?: string): string {
  return (AVATAR_COLORS.find((c) => c.id === colorId) ?? AVATAR_COLORS[0]!).bgClass;
}

function HostSummaryScreen({ summary, onBack, heading, subheading }: HostSummaryScreenProps) {
  const {
    leaderboard,
    totalQuestions,
    totalPlayers,
    averageAccuracy,
    averageResponseMs,
    completionRate,
    questionBreakdown,
    fastestPlayer,
    hardestQuestion,
  } = summary;

  const [winner, ...rest] = leaderboard;

  return (
    <div className="page-shell flex flex-col items-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="heading text-3xl">{heading ?? "Game Summary"}</h1>
        {subheading && <p className="text-sm text-muted">{subheading}</p>}
      </div>

      {winner && (
        <WinnerCard
          name={winner.name}
          avatarBgClass={avatarColorFor(winner.color)}
          score={winner.score}
          correctCount={winner.correctCount}
          totalQuestions={totalQuestions}
        />
      )}

      <div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={<FiUsers className="h-5 w-5" />} value={String(totalPlayers)} label="Players" />
        <StatTile icon={<FiTarget className="h-5 w-5" />} value={`${averageAccuracy}%`} label="Avg Accuracy" />
        <StatTile
          icon={<FiClock className="h-5 w-5" />}
          value={formatResponseTime(averageResponseMs)}
          label="Avg Response"
        />
        <StatTile icon={<FiCheckCircle className="h-5 w-5" />} value={`${completionRate}%`} label="Completion" />
      </div>

      {(fastestPlayer || hardestQuestion) && (
        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          {fastestPlayer && (
            <InsightCard
              icon={<FiZap className="h-5 w-5" />}
              tone="secondary"
              label="Fastest responder"
              value={`${fastestPlayer.name} · ${formatResponseTime(fastestPlayer.avgResponseMs)} avg`}
            />
          )}

          {hardestQuestion && (
            <InsightCard
              icon={<FiBarChart2 className="h-5 w-5" />}
              tone="danger"
              label="Hardest question"
              value={`${hardestQuestion.prompt} · ${hardestQuestion.accuracy}% correct`}
            />
          )}
        </div>
      )}

      {questionBreakdown.length > 0 && (
        <div className="flex w-full max-w-2xl flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted">Question breakdown</h2>
          <ol className="flex flex-col gap-2">
            {questionBreakdown.map((question) => (
              <QuestionBreakdownRow
                key={question.questionIndex}
                index={question.questionIndex}
                prompt={question.prompt}
                accuracy={question.accuracy}
                avgResponseMs={question.avgResponseMs}
              />
            ))}
          </ol>
        </div>
      )}

      {rest.length > 0 && (
        <div className="flex w-full max-w-2xl flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted">Leaderboard</h2>
          <ol className="flex flex-col gap-2">
            {rest.map((entry, index) => (
              <RankedListRow
                key={entry.playerId}
                left={
                  <>
                    <span className="w-5 shrink-0 text-sm font-bold text-muted">
                      #{index + 2}
                    </span>
                    <Avatar
                      initials={getInitials(entry.name)}
                      bgClass={avatarColorFor(entry.color)}
                    />
                    <span className="truncate font-medium text-foreground">
                      {entry.name}
                    </span>
                  </>
                }
                right={
                  <>
                    <span className="text-sm text-muted">
                      {entry.correctCount}/{totalQuestions} correct
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {entry.score} pts
                    </span>
                  </>
                }
              />
            ))}
          </ol>
        </div>
      )}

      <div className="flex items-center gap-3">
        {onBack && (
          <Button type="button" variant="secondary" onClick={onBack} className="flex items-center gap-2">
            <FiArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
        )}
        <Link to="/dashboard">
          <Button type="button" className="flex items-center gap-2">
            <FiHome className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default HostSummaryScreen;
