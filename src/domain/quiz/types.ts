export type DiagnosticPillar = "organization" | "execution" | "discipline";

export type Pillar = DiagnosticPillar;

export type QuizStage = DiagnosticPillar;

export type Score = 0 | 1 | 2 | 3;

export type QuizOption = { id: string; label: string; score?: Score };

export type QuizIcon = "calendar" | "list" | "layers" | "zap" | "search" | "refresh" | "shield" | "undo" | "repeat" | "flag" | "idea" | "hourglass";

export type QuizQuestion = {
  id: string;
  stage: QuizStage;
  kind: "diagnostic" | "cost" | "profile";
  title: string;
  mobileTitle: string;
  icon: QuizIcon;
  interaction: "single-auto";
  options: QuizOption[];
};

export type QuizAnswers = Record<string, string>;

export type Subpattern =
  | "dispersion"
  | "urgency_reactivity"
  | "unclear_next_step"
  | "postponement"
  | "escape_productivity"
  | "pressure_dependence"
  | "loss_of_rhythm"
  | "all_or_nothing"
  | "recurring_restart";

export type NeedLevel = "correction" | "structuring" | "strengthening";

export type ResistanceBand = "low" | "moderate" | "high" | "very_high";

export type QuizResult = {
  diagnosticScore: number;
  pillarScores: Record<DiagnosticPillar, number>;
  primaryBlocker: DiagnosticPillar;
  secondaryBlocker: DiagnosticPillar;
  subpatterns: Record<DiagnosticPillar, Subpattern | null>;
  primarySubpattern: Subpattern | null;
  resistanceBand: ResistanceBand;
  needLevel: NeedLevel;
};

export type PersonalizedReport = {
  revelation: string;
  explanation: string;
  pattern: string;
  consequence: string;
  need: string;
  bridge: string;
};

export type OfferPersonalization = {
  hero: string;
  startingPoint: string;
};

export type UtmData = Record<string, string>;

export type QuizSession = {
  version: 3;
  answers: QuizAnswers;
  currentStep: number;
  completedAt?: string;
  result?: QuizResult;
  utms: UtmData;
  source?: string;
};
