import api from "./api";
import type { Achievement, HostedSession, RecentGame } from "../entities/dashboard";

export interface DashboardStats {
  gamesPlayed: number;
  averageScore: number;
  bestFinish: number | null;
  wins: number;
  achievements: Achievement[];
}

export interface RecentGamesResult {
  games: RecentGame[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface HostedSessionsResult {
  sessions: HostedSession[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface HostedSessionPlayerSummary {
  playerId: string;
  name: string;
  color?: string;
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

export interface HostedSessionQuestionBreakdown {
  questionIndex: number;
  prompt: string;
  correctCount: number;
  totalPlayers: number;
  accuracy: number;
  avgResponseMs: number;
}

export interface HostedSessionDetail {
  quizTitle: string;
  quizCoverImage: string | null;
  playedAt: string;
  leaderboard: HostedSessionPlayerSummary[];
  totalQuestions: number;
  totalPlayers: number;
  averageAccuracy: number;
  averageResponseMs: number;
  completionRate: number;
  questionBreakdown: HostedSessionQuestionBreakdown[];
  fastestPlayer: HostedSessionFastestPlayer | null;
  hardestQuestion: HostedSessionHardestQuestion | null;
}

interface FetchGamesParams {
  page: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/api/users/me/stats");
  return data;
}

export async function fetchRecentGames({
  page,
}: FetchGamesParams): Promise<RecentGamesResult> {
  const { data } = await api.get<RecentGamesResult>("/api/users/me/games", {
    params: { page },
  });
  return data;
}

export async function fetchHostedSessions({
  page,
}: FetchGamesParams): Promise<HostedSessionsResult> {
  const { data } = await api.get<HostedSessionsResult>(
    "/api/users/me/hosted-sessions",
    { params: { page } },
  );
  return data;
}

export async function fetchHostedSessionDetail(
  sessionId: string,
): Promise<HostedSessionDetail> {
  const { data } = await api.get<HostedSessionDetail>(
    `/api/users/me/hosted-sessions/${sessionId}`,
  );
  return data;
}
