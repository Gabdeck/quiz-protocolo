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
  ["Eu já tentei criar uma rotina antes. Por que seria diferente?", "O Protocolo não entrega uma rotina pronta. Ele organiza cinco frentes conectadas e ajuda você a construir uma estrutura compatível com sua realidade."],
  ["Preciso seguir tudo perfeitamente?", "Não. Os Planos trabalham com ações pequenas, versões mínimas e retomada após falhas. O objetivo é continuidade, não perfeição."],
  ["Tenho pouco tempo. Vou conseguir aplicar?", "Sim. A proposta é avançar com pequenas ações práticas, sem exigir horas de estudo ou preenchimento todos os dias."],
  ["Como receberei o material?", "Após a confirmação do pagamento, as instruções de acesso serão enviadas ao e-mail usado na compra."],
];
