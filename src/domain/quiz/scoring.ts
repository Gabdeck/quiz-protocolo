import { quizQuestions } from "@/src/content/quiz";
import type {
  DiagnosticPillar,
  NeedLevel,
  QuizAnswers,
  QuizResult,
  ResistanceBand,
  Subpattern,
} from "./types";

const diagnosticPillars: DiagnosticPillar[] = ["organization", "execution", "discipline"];
const tieBreak: DiagnosticPillar[] = ["discipline", "execution", "organization"];

type PatternRules = {
  priority: Subpattern[];
  evidence: Partial<Record<Subpattern, Record<string, number>>>;
};

const patternRules: Record<DiagnosticPillar, PatternRules> = {
  organization: {
    priority: ["unclear_next_step", "urgency_reactivity", "dispersion"],
    evidence: {
      dispersion: { "p1-2": 2, "p1-3": 3, "p2-3": 2 },
      urgency_reactivity: { "p1-1": 1, "p2-1": 1, "p2-2": 2 },
      unclear_next_step: { "p3-1": 1, "p3-2": 2, "p3-3": 3 },
    },
  },
  execution: {
    priority: ["pressure_dependence", "escape_productivity", "postponement"],
    evidence: {
      postponement: { "p4-1": 1, "p5-1": 1, "p5-2": 2, "p5-3": 3, "p6-1": 1, "p6-2": 2 },
      escape_productivity: { "p4-2": 3 },
      pressure_dependence: { "p4-3": 3, "p6-3": 3 },
    },
  },
  discipline: {
    priority: ["recurring_restart", "all_or_nothing", "loss_of_rhythm"],
    evidence: {
      loss_of_rhythm: { "p7-2": 2, "p8-2": 2, "p9-1": 1, "p9-2": 1 },
      all_or_nothing: { "p8-3": 3 },
      recurring_restart: { "p7-3": 3, "p8-3": 1, "p9-3": 3 },
    },
  },
};

export function classifySubpattern(pillar: DiagnosticPillar, answers: QuizAnswers): Subpattern | null {
  const rules = patternRules[pillar];
  const ranked = rules.priority.map((pattern, priorityIndex) => {
    const evidence = rules.evidence[pattern] ?? {};
    const matchedWeights = Object.entries(evidence)
      .filter(([optionId]) => Object.values(answers).includes(optionId))
      .map(([, weight]) => weight);
    return {
      pattern,
      total: matchedWeights.reduce((sum, weight) => sum + weight, 0),
      strongest: Math.max(0, ...matchedWeights),
      priorityIndex,
    };
  }).sort((a, b) => b.total - a.total || b.strongest - a.strongest || a.priorityIndex - b.priorityIndex);

  return ranked[0].total >= 2 ? ranked[0].pattern : null;
}

export function getResistanceBand(diagnosticScore: number): ResistanceBand {
  if (diagnosticScore >= 21) return "very_high";
  if (diagnosticScore >= 14) return "high";
  if (diagnosticScore >= 7) return "moderate";
  return "low";
}

export function getNeedLevel(primaryScore: number, diagnosticScore: number): NeedLevel {
  if (primaryScore >= 7 || diagnosticScore >= 19) return "correction";
  if (primaryScore <= 3 && diagnosticScore <= 9) return "strengthening";
  return "structuring";
}

export function calculateResult(answers: QuizAnswers): QuizResult {
  const selected = new Map(quizQuestions.map((question) => {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option) throw new Error(`Resposta ausente ou inválida: ${question.id}`);
    return [question.id, option] as const;
  }));

  const pillarScores: Record<DiagnosticPillar, number> = { organization: 0, execution: 0, discipline: 0 };
  for (const question of quizQuestions.filter((item) => item.kind === "diagnostic")) {
    const score = selected.get(question.id)?.score;
    if (score === undefined || !diagnosticPillars.includes(question.stage as DiagnosticPillar)) throw new Error(`Pontuação inválida: ${question.id}`);
    pillarScores[question.stage as DiagnosticPillar] += score;
  }

  const diagnosticScore = Object.values(pillarScores).reduce((sum, value) => sum + value, 0);
  const ranked = tieBreak.slice().sort((a, b) => pillarScores[b] - pillarScores[a] || tieBreak.indexOf(a) - tieBreak.indexOf(b));
  const subpatterns = Object.fromEntries(diagnosticPillars.map((pillar) => [pillar, classifySubpattern(pillar, answers)])) as Record<DiagnosticPillar, Subpattern | null>;
  const primaryBlocker = ranked[0];

  return {
    diagnosticScore,
    pillarScores,
    primaryBlocker,
    secondaryBlocker: ranked[1],
    subpatterns,
    primarySubpattern: subpatterns[primaryBlocker],
    resistanceBand: getResistanceBand(diagnosticScore),
    needLevel: getNeedLevel(pillarScores[primaryBlocker], diagnosticScore),
  };
}
