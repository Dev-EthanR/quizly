import type { ReactNode } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiAward,
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
import { AVATAR_COLORS } from "../../lib/avatarColors";
import { getInitials } from "../../lib/initials";

interface HostSummaryPlayer {
  playerId: string;
  name: string;
  color?: string;
  score: number;
  correctCount: number;
  connected: boolean;
  accuracy: number;
  avgResponseMs: number;
}

interface HostSummaryQuestion {
  questionIndex: number;
  prompt: string;
  correctCount: number;
  totalPlayers: number;
  accuracy: number;
  avgResponseMs: number;
}

interface HostSummaryFastestPlayer {
  playerId: string;
  name: string;
  avgResponseMs: number;
}

interface HostSummaryHardestQuestion {
  questionIndex: number;
  prompt: string;
  accuracy: number;
}

export interface HostSummaryData {
  leaderboard: HostSummaryPlayer[];
  totalQuestions: number;
  totalPlayers: number;
  averageAccuracy: number;
  averageResponseMs: number;
  completionRate: number;
  questionBreakdown: HostSummaryQuestion[];
  fastestPlayer: HostSummaryFastestPlayer | null;
  hardestQuestion: HostSummaryHardestQuestion | null;
}

interface HostSummaryScreenProps {
  summary: HostSummaryData;
  onBack?: () => void;
  heading?: string;
  subheading?: ReactNode;
}

function formatResponseTime(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function avatarColorFor(colorId?: string): string {
  return (AVATAR_COLORS.find((c) => c.id === colorId) ?? AVATAR_COLORS[0]!).bgClass;
}

function accuracyBarColor(accuracy: number): string {
  if (accuracy >= 70) return "bg-secondary";
  if (accuracy >= 40) return "bg-warning";
  return "bg-danger";
}

function accuracyTextColor(accuracy: number): string {
  if (accuracy >= 70) return "text-secondary";
  if (accuracy >= 40) return "text-warning";
  return "text-danger";
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
    <div className="flex min-h-screen flex-col items-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-3xl font-bold text-foreground">{heading ?? "Game Summary"}</h1>
        {subheading && <p className="text-sm text-muted">{subheading}</p>}
      </div>

      {winner && (
        <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8">
          <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <FiAward className="h-3.5 w-3.5" />
            Winner
          </span>
          <Avatar initials={getInitials(winner.name)} bgClass={avatarColorFor(winner.color)} size="lg" />
          <span className="max-w-full truncate text-xl font-bold text-foreground">
            {winner.name}
          </span>
          <span className="text-sm text-muted">
            {winner.score} pts &middot; {winner.correctCount}/{totalQuestions} correct
          </span>
        </div>
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
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                <FiZap className="h-5 w-5" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs text-muted">Fastest responder</span>
                <span className="truncate font-semibold text-foreground">
                  {fastestPlayer.name} &middot; {formatResponseTime(fastestPlayer.avgResponseMs)} avg
                </span>
              </div>
            </div>
          )}

          {hardestQuestion && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger">
                <FiBarChart2 className="h-5 w-5" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs text-muted">Hardest question</span>
                <span className="truncate font-semibold text-foreground">
                  {hardestQuestion.prompt} &middot; {hardestQuestion.accuracy}% correct
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {questionBreakdown.length > 0 && (
        <div className="flex w-full max-w-2xl flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted">Question breakdown</h2>
          <ol className="flex flex-col gap-2">
            {questionBreakdown.map((question) => (
              <li
                key={question.questionIndex}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {question.questionIndex + 1}
                </span>
                <span className="max-w-[40%] shrink-0 truncate text-sm text-foreground">
                  {question.prompt}
                </span>
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-background">
                  <div
                    className={clsx("h-full rounded-full", accuracyBarColor(question.accuracy))}
                    style={{ width: `${question.accuracy}%` }}
                  />
                </div>
                <span
                  className={clsx(
                    "shrink-0 text-sm font-semibold",
                    accuracyTextColor(question.accuracy),
                  )}
                >
                  {question.accuracy}%
                </span>
                <span className="shrink-0 text-sm text-muted">
                  {formatResponseTime(question.avgResponseMs)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {rest.length > 0 && (
        <div className="flex w-full max-w-2xl flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted">Leaderboard</h2>
          <ol className="flex flex-col gap-2">
            {rest.map((entry, index) => (
              <li
                key={entry.playerId}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="w-5 shrink-0 text-sm font-bold text-muted">#{index + 2}</span>
                  <Avatar
                    initials={getInitials(entry.name)}
                    bgClass={avatarColorFor(entry.color)}
                  />
                  <span className="truncate font-medium text-foreground">{entry.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3 text-sm">
                  <span className="text-muted">{entry.correctCount}/{totalQuestions} correct</span>
                  <span className="font-bold text-primary">{entry.score} pts</span>
                </span>
              </li>
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
