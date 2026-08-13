export type ProductKey = "completeProtocol" | "lifeInOrder" | "antiProcrastination" | "goalsExecution" | "discipline21" | "evolution30";

export const products = [
  { key: "lifeInOrder" as const, number: "01", name: "Vida em Ordem", promise: "Recupere o controle da sua rotina.", contents: ["Identifique o que desorganiza sua vida", "Defina prioridades que sobrevivem ao dia real"] },
  { key: "antiProcrastination" as const, number: "02", name: "Antiprocrastinação", promise: "Reduza o peso de começar o que importa.", contents: ["Entenda o mecanismo do adiamento", "Divida tarefas e reduza o atrito inicial"] },
  { key: "goalsExecution" as const, number: "03", name: "Execução de Metas", promise: "Transforme objetivos em ações visíveis.", contents: ["Escolha poucas prioridades", "Divida metas em próximos passos"] },
  { key: "discipline21" as const, number: "04", name: "21 Dias de Disciplina", promise: "Treine sua capacidade de continuar.", contents: ["Escolha um compromisso possível", "Mantenha uma versão mínima nos dias difíceis"] },
  { key: "evolution30" as const, number: "05", name: "30 Dias de Evolução", promise: "Integre tudo em uma rotina sustentável.", contents: ["Revise o progresso sem recomeçar", "Crie seu próximo ciclo de evolução"] },
];

export const prices = { individual: "R$17,90", complete: "R$27,00", separateTotal: "R$89,50", difference: "R$9,10", kit: "R$9,90" };

export const checkoutLinks: Record<ProductKey, string | undefined> = {
  completeProtocol: process.env.NEXT_PUBLIC_CHECKOUT_PROTOCOL_URL,
  lifeInOrder: process.env.NEXT_PUBLIC_CHECKOUT_LIFE_IN_ORDER_URL,
  antiProcrastination: process.env.NEXT_PUBLIC_CHECKOUT_ANTI_PROCRASTINATION_URL,
  goalsExecution: process.env.NEXT_PUBLIC_CHECKOUT_GOALS_EXECUTION_URL,
  discipline21: process.env.NEXT_PUBLIC_CHECKOUT_DISCIPLINE_21_URL,
  evolution30: process.env.NEXT_PUBLIC_CHECKOUT_EVOLUTION_30_URL,
};
