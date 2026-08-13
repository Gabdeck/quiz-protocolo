import type { DiagnosticPillar, QuizResult, Subpattern } from "@/src/domain/quiz/types";

type PatternPresentation = { name: string; cycle: [string, string, string, string] };

export type ResultPresentation = PatternPresentation & {
  needTitle: string;
  needBenefits: [string, string, string];
  bridgeHeadline: [string, string];
};

const patterns: Record<Subpattern, PatternPresentation> = {
  dispersion: { name: "Dispersão", cycle: ["Começa o dia", "A atenção se espalha", "A prioridade perde espaço", "O dia termina cheio"] },
  urgency_reactivity: { name: "Reatividade à urgência", cycle: ["Define a prioridade", "Surge uma demanda", "Reage ao urgente", "Adia o importante"] },
  unclear_next_step: { name: "Falta de próximo passo", cycle: ["Quer mudar", "O passo fica vago", "O início trava", "A ideia continua aberta"] },
  postponement: { name: "Adiamento", cycle: ["Reconhece a tarefa", "Adia o início", "O peso aumenta", "Tenta depois"] },
  escape_productivity: { name: "Produtividade de fuga", cycle: ["Enfrenta o importante", "Troca por outra tarefa", "Sente movimento", "A prioridade continua"] },
  pressure_dependence: { name: "Dependência de pressão", cycle: ["Sabe o que fazer", "Espera", "A pressão aumenta", "Age no limite"] },
  loss_of_rhythm: { name: "Perda de ritmo", cycle: ["Começa", "Perde o ritmo", "Adia a retomada", "Recomeça"] },
  all_or_nothing: { name: "Tudo ou nada", cycle: ["Segue o plano", "Falha um dia", "Considera tudo perdido", "Abandona"] },
  recurring_restart: { name: "Recomeço recorrente", cycle: ["Começa motivado", "Interrompe", "Espera outro momento", "Recomeça"] },
};

const genericPatterns: Record<DiagnosticPillar, PatternPresentation> = {
  organization: { name: "Prioridades sem proteção", cycle: ["Define o que importa", "O dia fica exigente", "A prioridade perde proteção", "O avanço oscila"] },
  execution: { name: "Atrito para começar", cycle: ["Decide agir", "O atrito aparece", "O início atrasa", "A pressão cresce"] },
  discipline: { name: "Retomada vulnerável", cycle: ["Começa", "A rotina oscila", "A retomada demora", "A sequência se quebra"] },
};

const needTitles: Record<DiagnosticPillar, string> = {
  organization: "Um sistema simples para proteger o que realmente importa.",
  execution: "Uma sequência prática para começar antes da pressão.",
  discipline: "Uma forma simples de continuar e retomar no dia real.",
};

const blockerBenefits: Record<DiagnosticPillar, [string, string]> = {
  organization: ["Escolher uma prioridade antes das urgências", "Transformar objetivos em próximos passos visíveis"],
  execution: ["Reduzir a tarefa até ela caber no momento atual", "Começar antes que a pressão aumente"],
  discipline: ["Manter uma versão mínima nos dias difíceis", "Retomar sem tratar interrupção como abandono"],
};

const integratedBenefit: Record<DiagnosticPillar, string> = {
  organization: "Conectar prioridade, execução e revisão numa mesma estrutura",
  execution: "Transformar intenção em uma ação pequena e visível",
  discipline: "Criar uma regra de retomada para os dias imperfeitos",
};

const bridgeHeadlines: Record<DiagnosticPillar, [string, string]> = {
  organization: ["Você não precisa fazer mais.", "Precisa proteger o que faz diferença."],
  execution: ["Você não precisa esperar mais vontade.", "Precisa tornar o início mais simples."],
  discipline: ["Você não precisa começar de novo.", "Precisa aprender a continuar."],
};

export function buildResultPresentation(result: QuizResult): ResultPresentation {
  const pattern = result.primarySubpattern ? patterns[result.primarySubpattern] : genericPatterns[result.primaryBlocker];
  return {
    ...pattern,
    needTitle: needTitles[result.primaryBlocker],
    needBenefits: [...blockerBenefits[result.primaryBlocker], integratedBenefit[result.primaryBlocker]],
    bridgeHeadline: bridgeHeadlines[result.primaryBlocker],
  };
}
