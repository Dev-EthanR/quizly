import type { QuestionBreakdownRecord } from "./gameHistory.js";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface DashboardStats {
  gamesPlayed: number;
  averageScore: number;
  bestFinish: number | null;
  wins: number;
  achievements: Achievement[];
}

export interface HostedSessionPlayerSummary {
  playerId: string;
  name: string;
  color?: string | undefined;
  score: number;
  correctCount: number;
  connected: boolean;
  accuracy: number;
  avgResponseMs: number;
}

export interface HostedSessionFastestPlayer {
  playerId: string;
  name: string;
  avgResponseMs: number;
}

export interface HostedSessionHardestQuestion {
  questionIndex: number;
  prompt: string;
  accuracy: number;
}

export interface HostedSessionDetail {
  quizTitle: string;
  quizCoverImage: string | null;
  playedAt: Date;
  leaderboard: HostedSessionPlayerSummary[];
  totalQuestions: number;
  totalPlayers: number;
  averageAccuracy: number;
  averageResponseMs: number;
  completionRate: number;
  questionBreakdown: QuestionBreakdownRecord[];
  fastestPlayer: HostedSessionFastestPlayer | null;
  hardestQuestion: HostedSessionHardestQuestion | null;
}
