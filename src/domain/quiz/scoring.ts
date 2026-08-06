import { quizQuestions } from "@/src/content/quiz";
import type { Pillar, QuizAnswers, QuizResult, ResultBand } from "./types";

export const resultBands: ResultBand[] = [
  { min: 0, max: 9, title: "Base relativamente estável", description: "Você já desenvolveu algumas estruturas positivas, mas ainda pode existir uma distância entre aquilo que planeja e aquilo que consegue sustentar. O próximo passo é fortalecer os pontos que ainda oscilam." },
  { min: 10, max: 18, title: "Evolução instável", description: "Você consegue avançar em alguns momentos, mas sua evolução ainda depende muito de motivação, energia e condições favoráveis. O desafio é transformar avanços isolados em continuidade." },
  { min: 19, max: 27, title: "Ciclo de interrupção", description: "Você sabe o que precisa mudar, mas encontra dificuldades para organizar, começar, continuar e concluir. Não parece faltar vontade. Falta uma estrutura capaz de proteger seu progresso." },
  { min: 28, max: 36, title: "Evolução bloqueada pelos padrões atuais", description: "Os comportamentos identificados parecem afetar diferentes áreas ao mesmo tempo. É um ciclo que conecta rotina, execução, metas e continuidade." },
];

const tieBreak: Pillar[] = ["discipline", "execution", "organization", "direction"];

export function calculateResult(answers: QuizAnswers): QuizResult {
  const pillarScores: Record<Pillar, number> = { organization: 0, execution: 0, discipline: 0, direction: 0 };
  for (const question of quizQuestions) {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option) throw new Error(`Resposta ausente ou inválida: ${question.id}`);
    pillarScores[question.pillar] += option.score;
  }
  const totalScore = Object.values(pillarScores).reduce((sum, value) => sum + value, 0);
  const ranked = tieBreak.slice().sort((a, b) => pillarScores[b] - pillarScores[a] || tieBreak.indexOf(a) - tieBreak.indexOf(b));
  const stable = tieBreak.slice().sort((a, b) => pillarScores[a] - pillarScores[b] || tieBreak.indexOf(b) - tieBreak.indexOf(a));
  const band = resultBands.find((item) => totalScore >= item.min && totalScore <= item.max) ?? resultBands[0];
  return {
    totalScore,
    structureScore: Math.round(((36 - totalScore) / 36) * 100),
    pillarScores,
    primaryBlocker: ranked[0],
    secondaryBlocker: ranked[1],
    strongestPillar: stable[0],
    band,
  };
}

export const pillarStructure = (difficulty: number) => Math.round(((9 - difficulty) / 9) * 100);
