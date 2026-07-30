export interface HostSummaryPlayer {
  playerId: string;
  name: string;
  color?: string;
  score: number;
  correctCount: number;
  connected: boolean;
  accuracy: number;
  avgResponseMs: number;
}

export interface HostSummaryQuestion {
  questionIndex: number;
  prompt: string;
  correctCount: number;
  totalPlayers: number;
  accuracy: number;
  avgResponseMs: number;
}

export interface HostSummaryFastestPlayer {
  playerId: string;
  name: string;
  avgResponseMs: number;
}

export interface HostSummaryHardestQuestion {
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
