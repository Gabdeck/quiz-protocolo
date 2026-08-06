export type ProductKey = "completeProtocol" | "lifeInOrder" | "antiProcrastination" | "goalsExecution" | "discipline21" | "evolution30";

export const products = [
  { key: "lifeInOrder" as const, number: "01", name: "Vida em Ordem", promise: "Recupere o controle da sua rotina.", contents: ["Identifique o que desorganiza sua vida", "Elimine excessos e defina prioridades", "Construa uma rotina sustentável"] },
  { key: "antiProcrastination" as const, number: "02", name: "Antiprocrastinação", promise: "Pare de transformar tarefas importantes em problemas maiores.", contents: ["Entenda por que você procrastina", "Divida tarefas e reduza distrações", "Retome depois de falhar"] },
  { key: "goalsExecution" as const, number: "03", name: "Execução de Metas", promise: "Transforme objetivos em ações que saem do papel.", contents: ["Escolha poucas prioridades", "Divida metas em etapas", "Acompanhe o progresso"] },
  { key: "discipline21" as const, number: "04", name: "21 Dias de Disciplina", promise: "Treine sua capacidade de continuar.", contents: ["Escolha um compromisso possível", "Aja em dias difíceis", "Fortaleça a confiança na própria palavra"] },
  { key: "evolution30" as const, number: "05", name: "30 Dias de Evolução", promise: "Integre o que aprendeu em uma rotina sustentável.", contents: ["Revise sua evolução", "Integre organização, ação e disciplina", "Crie seu próximo ciclo"] },
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
