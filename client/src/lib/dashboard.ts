import api from "./api";
import type { Achievement, HostedSession, RecentGame } from "../entities/dashboard";
import type { GameOverPayload } from "../entities/socket";

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

export interface HostedSessionDetail extends GameOverPayload {
  quizTitle: string;
  quizCoverImage: string | null;
  playedAt: string;
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
