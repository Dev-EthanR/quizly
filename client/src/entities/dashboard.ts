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

export interface HostedSession {
  id: string;
  quizId: string;
  quizTitle: string;
  quizCoverImage: string | null;
  playerCount: number;
  questionCount: number;
  playedAt: string;
}
