import axios from "axios";

export type AchievementId =
  | "rookie"
  | "first_win"
  | "perfect_score"
  | "speed_demon"
  | "lightning_reflexes"
  | "party_host"
  | "mega_host"
  | "on_fire"
  | "hot_streak"
  | "unstoppable"
  | "quiz_master"
  | "rising_host"
  | "veteran"
  | "centurion"
  | "flawless_victory"
  | "first_host"
  | "sharpshooter"
  | "podium_finish"
  | "runner_up"
  | "underdog"
  | "veteran_champion";

export interface Achievement {
  id: AchievementId;
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

export interface RecentGame {
  id: string;
  quizTitle: string;
  quizCoverImage: string | null;
  score: number;
  rank: number;
  totalPlayers: number;
  correctCount: number;
  questionCount: number;
  won: boolean;
  playedAt: string;
}

export interface RecentGamesResult {
  games: RecentGame[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface HostedSession {
  id: string;
  quizId: string;
  quizTitle: string;
  quizCoverImage: string | null;
  playerCount: number;
  questionCount: number;
  playedAt: string;
}

export interface HostedSessionsResult {
  sessions: HostedSession[];
  page: number;
  totalPages: number;
  totalCount: number;
}

interface FetchGamesParams {
  page: number;
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

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
