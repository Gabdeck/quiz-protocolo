import type {
  DiagnosticPillar,
  NeedLevel,
  OfferPersonalization,
  PersonalizedReport,
  QuizResult,
  Subpattern,
} from "./types";

export const blockerLabels: Record<DiagnosticPillar, string> = {
  organization: "Organização",
  execution: "Execução",
  discipline: "Continuidade",
};

const revelationLead: Record<NeedLevel, (label: string) => string> = {
  correction: (label) => `Seu principal ponto de resistência está na ${label}.`,
  structuring: (label) => `O ponto que mais limita a consistência do seu progresso está na ${label}.`,
  strengthening: (label) => `Entre as áreas avaliadas, ${label} é o ponto mais vulnerável da sua estrutura atual.`,
};

const explanations: Record<DiagnosticPillar, Record<NeedLevel, string>> = {
  organization: {
    correction: "Suas respostas mostram que demandas do momento frequentemente ocupam o espaço das prioridades, mesmo quando você sabe que precisa avançar em outra direção.",
    structuring: "Você consegue organizar parte do dia, mas ainda perde prioridade quando novas demandas competem pela sua atenção.",
    strengthening: "Você demonstra controle sobre a rotina, mas ele fica mais vulnerável quando várias decisões e demandas aparecem ao mesmo tempo.",
  },
  execution: {
    correction: "Suas respostas mostram uma distância recorrente entre reconhecer o que importa e começar antes que a pressão aumente.",
    structuring: "Você consegue agir em algumas situações, mas o início ainda depende demais de vontade, prazo ou desconforto acumulado.",
    strengthening: "Você costuma transformar intenção em ação, mas esse movimento fica mais vulnerável quando a tarefa exige começar sem motivação imediata.",
  },
  discipline: {
    correction: "Suas respostas mostram que interrupções pequenas frequentemente quebram a sequência e tornam cada retomada mais difícil.",
    structuring: "Você consegue manter parte do que começa, mas ainda não possui uma forma suficientemente estável de atravessar oscilações e retomar.",
    strengthening: "Você demonstra capacidade de continuar, mas essa base fica mais vulnerável quando o ritmo é interrompido por alguns dias.",
  },
};

const patternCopy: Record<Subpattern, string> = {
  dispersion: "O padrão que mais apareceu foi a dispersão: o dia recebe muitas ações, mas nem sempre a prioridade recebe espaço suficiente.",
  urgency_reactivity: "O padrão que mais apareceu foi reagir ao que chega primeiro, fazendo urgência e facilidade decidirem a ordem do dia.",
  unclear_next_step: "O padrão que mais apareceu foi a falta de um próximo passo concreto, que mantém mudanças importantes vagas e difíceis de iniciar.",
  postponement: "O padrão que mais apareceu foi o adiamento: a tarefa continua presente, mas o início é deslocado para um momento que parece mais favorável.",
  escape_productivity: "O padrão que mais apareceu foi ocupar-se com outras tarefas para evitar justamente a ação que teria maior impacto.",
  pressure_dependence: "O padrão que mais apareceu foi depender da pressão para agir, quando prazo e desconforto já tornaram a tarefa maior.",
  loss_of_rhythm: "O padrão que mais apareceu foi perder ritmo depois de uma oscilação e encontrar dificuldade para recuperar a sequência.",
  all_or_nothing: "O padrão que mais apareceu foi tratar uma interrupção pequena como quebra completa do plano, enfraquecendo a retomada.",
  recurring_restart: "O padrão que mais apareceu foi o recomeço recorrente: muita energia para iniciar novamente e pouca estrutura para continuar.",
};

const genericPattern: Record<DiagnosticPillar, string> = {
  organization: "Não apareceu um comportamento isolado forte. A vulnerabilidade está na forma como prioridades perdem proteção quando o dia fica mais exigente.",
  execution: "Não apareceu um comportamento isolado forte. A vulnerabilidade está no atrito variável entre decidir e realmente começar.",
  discipline: "Não apareceu um comportamento isolado forte. A vulnerabilidade está na retomada quando a sequência deixa de ser perfeita.",
};

const consequences: Record<DiagnosticPillar, Record<QuizResult["resistanceBand"], string>> = {
  organization: {
    low: "Hoje esse custo parece mais contido, mas fortalecer esse ponto reduz a dependência de dias tranquilos para proteger o que importa.",
    moderate: "Sem uma estrutura mais clara, dias produtivos podem continuar alternando com períodos de muito esforço e pouco avanço relevante.",
    high: "Esse funcionamento tende a manter metas importantes atrás de demandas imediatas, mesmo quando existe esforço e tempo investidos.",
    very_high: "Se o padrão continuar, a rotina pode seguir consumindo energia enquanto mudanças importantes permanecem adiadas e a frustração aumenta.",
  },
  execution: {
    low: "Hoje esse custo parece mais contido, mas fortalecer o início reduz a dependência de motivação e circunstâncias favoráveis.",
    moderate: "Sem um mecanismo de início, tarefas importantes podem continuar ocupando espaço mental antes de finalmente receberem ação.",
    high: "O adiamento tende a aumentar pressão e peso mental, fazendo você agir mais tarde e em condições piores.",
    very_high: "Se o padrão continuar, pressão e urgência podem seguir sendo o gatilho principal para ações que poderiam começar de forma mais simples.",
  },
  discipline: {
    low: "Hoje esse custo parece mais contido, mas fortalecer a retomada evita que seu progresso dependa de sequências sempre favoráveis.",
    moderate: "Sem uma regra de retomada, oscilações normais podem continuar interrompendo avanços que já estavam sendo construídos.",
    high: "Cada interrupção tende a exigir um novo esforço de começo, reduzindo o progresso acumulado ao longo do tempo.",
    very_high: "Se o padrão continuar, novos recomeços podem consumir energia repetidamente sem criar a continuidade que seus objetivos exigem.",
  },
};

const blockerMechanism: Record<DiagnosticPillar, string> = {
  organization: "um sistema simples de priorização, proteção de atenção e próximos passos concretos",
  execution: "uma forma de transformar intenção em ação sem esperar vontade, pressão ou urgência",
  discipline: "uma estrutura de constância e retomada que continue funcionando depois de interrupções",
};

const bridgeCopy: Record<DiagnosticPillar, string> = {
  organization: "O Protocolo da Evolução transforma prioridades em decisões práticas que continuam protegidas quando o dia muda.",
  execution: "O Protocolo da Evolução encurta a distância entre decidir e começar com ações que cabem no dia real.",
  discipline: "O Protocolo da Evolução cria uma forma simples de continuar e retomar sem depender de uma sequência perfeita.",
};

const secondarySentence = (result: QuizResult) => {
  const primaryScore = result.pillarScores[result.primaryBlocker];
  const secondaryScore = result.pillarScores[result.secondaryBlocker];
  if (primaryScore - secondaryScore > 2 || secondaryScore < 3) return "";
  return ` A ${blockerLabels[result.secondaryBlocker]} aparece próxima e ajuda a manter essa dificuldade.`;
};

export function buildPersonalizedReport(result: QuizResult): PersonalizedReport {
  const primary = result.primaryBlocker;
  return {
    revelation: revelationLead[result.needLevel](blockerLabels[primary]),
    explanation: `${explanations[primary][result.needLevel]}${secondarySentence(result)}`,
    pattern: result.primarySubpattern ? patternCopy[result.primarySubpattern] : genericPattern[primary],
    consequence: consequences[primary][result.resistanceBand],
    need: `Para mudar isso, você precisa de ${blockerMechanism[primary]}. O conjunto das suas respostas indica que esse é o mecanismo com maior potencial de destravar seu próximo avanço.`,
    bridge: bridgeCopy[primary],
  };
}

const landingPattern: Partial<Record<Subpattern, string>> = {
  dispersion: "proteger prioridades antes que o dia se disperse",
  urgency_reactivity: "tirar a urgência do comando da sua rotina",
  unclear_next_step: "transformar mudanças vagas em próximos passos claros",
  postponement: "encurtar a distância entre decidir e começar",
  escape_productivity: "direcionar esforço para a ação de maior impacto",
  pressure_dependence: "agir antes que a pressão vire o principal gatilho",
  loss_of_rhythm: "recuperar o ritmo sem depender de uma sequência perfeita",
  all_or_nothing: "continuar depois de dias imperfeitos",
  recurring_restart: "sair do ciclo de recomeços e tornar a retomada mais simples",
};

export function buildOfferPersonalization(result: QuizResult): OfferPersonalization {
  const pattern = result.primarySubpattern ? landingPattern[result.primarySubpattern] : undefined;
  const mechanism = pattern ?? blockerMechanism[result.primaryBlocker];
  return {
    hero: `Seu diagnóstico mostrou onde o progresso perde força. Agora você precisa de uma estrutura para ${mechanism}.`,
    startingPoint: `${blockerLabels[result.primaryBlocker]}: ${mechanism}.`,
  };
}
