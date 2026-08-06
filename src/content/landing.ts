export const landingConfig = {
  sections: { problem: true, plans: true, transformation: true, method: true, pricing: true, individual: true, preview: true, access: true, kit: true, guarantee: true, faq: true },
  socialProofMode: "productPreview" as "testimonials" | "productPreview",
  testimonials: [] as Array<{ name: string; text: string; plan: string; image?: string; consentRecorded: boolean }>,
};

export const painItems = [
  { id: "delay", text: "Sabe o que precisa fazer, mas continua adiando" },
  { id: "consistency", text: "Começa mudanças e não consegue manter" },
  { id: "busy", text: "Vive ocupado, mas sente que não avança" },
  { id: "goals", text: "Cria metas, mas conclui poucas" },
  { id: "motivation", text: "Depende de motivação para agir" },
  { id: "time", text: "Está cansado de recomeçar" },
];

export const transformationItems = ["Mais clareza sobre o que importa", "Menos excesso de tarefas e distrações", "Menos resistência para começar", "Metas transformadas em ações", "Rotina mais organizada", "Capacidade de continuar em dias imperfeitos", "Retomada sem jogar o progresso fora", "Menos dependência de recomeços"];

export const faqs = [
  ["Eu já tentei criar uma rotina antes. Por que seria diferente?", "Porque o Protocolo não entrega apenas uma rotina pronta. Ele ajuda você a entender o que está desorganizando sua vida e construir uma estrutura adaptada à sua realidade."],
  ["Preciso seguir tudo perfeitamente?", "Não. O Protocolo trabalha com ações pequenas, versões mínimas e retomada após falhas. O objetivo é criar continuidade, não perfeição."],
  ["Tenho pouco tempo. Vou conseguir aplicar?", "Os Planos permitem avanço com pequenas ações. Você não precisa passar horas por dia estudando ou preenchendo materiais."],
  ["Posso comprar apenas um Plano?", "Sim. Cada Plano custa R$17,90. O Protocolo completo custa R$27,00 e trabalha todas as etapas em conjunto."],
  ["Como receberei o material?", "Após a confirmação do pagamento, você receberá as instruções de acesso no e-mail utilizado durante a compra."],
  ["O pagamento é mensal?", "Não. O valor de R$27,00 é único e não possui cobrança recorrente."],
  ["O Protocolo garante resultados?", "O Protocolo entrega orientação, exercícios e uma sequência prática. Os resultados dependem da realidade e da execução de cada pessoa."],
];
