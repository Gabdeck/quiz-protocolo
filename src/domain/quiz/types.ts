export type Pillar = "organization" | "execution" | "discipline" | "direction";

export type Score = 0 | 1 | 2 | 3;

export type QuizOption = { id: string; label: string; score: Score };

export type QuizIcon = "calendar" | "list" | "layers" | "zap" | "search" | "refresh" | "shield" | "undo" | "repeat" | "flag" | "idea" | "hourglass";

export type QuizQuestion = {
  id: string;
  pillar: Pillar;
  title: string;
  mobileTitle: string;
  icon: QuizIcon;
  interaction: "single-auto";
  options: QuizOption[];
};

export type QuizAnswers = Record<string, string>;

export type ResultBand = {
  min: number;
  max: number;
  title: string;
  description: string;
};

export type QuizResult = {
  totalScore: number;
  structureScore: number;
  pillarScores: Record<Pillar, number>;
  primaryBlocker: Pillar;
  secondaryBlocker: Pillar;
  strongestPillar: Pillar;
  band: ResultBand;
};

export type UtmData = Record<string, string>;

export type QuizSession = {
  version: 1;
  answers: QuizAnswers;
  currentStep: number;
  identificationAnswer?: string;
  mainPainAnswer?: string;
  completedAt?: string;
  result?: QuizResult;
  utms: UtmData;
  source?: string;
};
