export interface HostSettings {
  randomizeQuestionOrder: boolean;
  allowLateJoins: boolean;
  showCorrectAnswers: boolean;
  disableChat: boolean;
  maxPlayers: number | null;
}

export const DEFAULT_HOST_SETTINGS: HostSettings = {
  randomizeQuestionOrder: false,
  allowLateJoins: true,
  showCorrectAnswers: true,
  disableChat: false,
  maxPlayers: null,
};

export const MAX_PLAYERS_MIN = 1;
export const MAX_PLAYERS_MAX = 50;
