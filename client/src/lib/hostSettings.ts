export interface HostSettings {
  randomizeQuestionOrder: boolean;
  allowLateJoins: boolean;
  showCorrectAnswers: boolean;
}

export const DEFAULT_HOST_SETTINGS: HostSettings = {
  randomizeQuestionOrder: false,
  allowLateJoins: true,
  showCorrectAnswers: true,
};
