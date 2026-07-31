export interface GamePlayedRecord {
  userId: string;
  name: string;
  color?: string | undefined;
  score: number;
  rank: number;
  totalPlayers: number;
  correctCount: number;
  avgAnswerMs: number;
  won: boolean;
}

export interface QuestionBreakdownRecord {
  questionIndex: number;
  prompt: string;
  correctCount: number;
  totalPlayers: number;
  accuracy: number;
  avgResponseMs: number;
}

export interface RecordGameSessionParams {
  quizId: string;
  hostUserId?: string | undefined;
  playerCount: number;
  questionCount: number;
  completionRate: number;
  questionBreakdown: QuestionBreakdownRecord[];
  participants: GamePlayedRecord[];
}

export interface PlayedHistoryRow {
  score: number;
  rank: number;
  totalPlayers: number;
  correctCount: number;
  questionCount: number;
  avgAnswerMs: number;
  won: boolean;
  playedAt: Date;
}

export interface HostedSessionSummary {
  playerCount: number;
}
