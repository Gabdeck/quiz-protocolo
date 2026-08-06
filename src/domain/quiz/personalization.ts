import type { PersonalizedReport, Pillar, QuizResult } from "./types";

export const blockerCopy: Record<Pillar, string> = {
  organization: "Sua rotina parece consumir mais energia do que deveria. O problema não é simplesmente ter tarefas demais, mas permitir que urgências e distrações ocupem o espaço das suas prioridades.",
  execution: "Você demonstra consciência do que precisa fazer, mas existe uma distância entre decidir e começar. Quanto mais essa distância aumenta, maior se torna o peso das tarefas.",
  discipline: "Seu maior desafio parece estar em continuar. Quando a motivação diminui ou um imprevisto interrompe sua sequência, retomar se torna mais difícil.",
  direction: "Você pode estar investindo energia em muitas metas ou mudando de foco antes de concluir o que começou. Isso gera movimento, mas pouco progresso acumulado.",
};

export const offerSecondLine: Record<Pillar, string> = {
  organization: "Comece recuperando o controle da rotina e proteja aquilo que realmente importa.",
  execution: "Reduza a distância entre saber o que fazer e realmente começar.",
  discipline: "Construa uma forma de continuar mesmo quando a motivação diminuir.",
  direction: "Transforme objetivos soltos em prioridades e ações claras.",
};

export const painCopy: Record<string, string> = {
  delay: "Você indicou que o que mais incomoda hoje é saber o que precisa fazer e, ainda assim, continuar adiando. Suas outras respostas mostram que isso não acontece de forma isolada.",
  consistency: "Você indicou que o que mais incomoda hoje é começar mudanças e nunca conseguir manter. Suas outras respostas mostram que isso não acontece de forma isolada.",
  busy: "Você indicou que o que mais incomoda hoje é fazer muita coisa sem sentir avanço real. Suas outras respostas ajudam a mostrar onde sua energia está se dispersando.",
  time: "Você indicou que o que mais incomoda hoje é perceber o tempo passando enquanto os mesmos padrões continuam. Suas respostas mostram quais áreas mais sustentam esse ciclo.",
};

export const identificationCopy: Record<string, string> = {
  often: "Você também relatou que o ciclo de começar, falhar e esperar um novo recomeço acontece com frequência. Isso reforça que a dificuldade está principalmente na continuidade.",
  some: "Algumas partes do ciclo de recomeços parecem familiares para você. Existe espaço para fortalecer a continuidade antes que uma falha vire abandono.",
  past: "Você já viveu esse ciclo e hoje consegue lidar melhor com ele. Essa base pode ajudar a fortalecer os pilares que ainda oscilam.",
  no: "Você não se identifica com o ciclo de recomeços. Sua análise considera isso e concentra a recomendação nos demais padrões relatados.",
};

const pillarImpact: Record<Pillar, string> = {
  organization: "Na rotina, isso tende a transformar prioridades em tarefas adiadas. Você reage ao que aparece, gasta energia decidindo novamente e termina dias cheios sem proteger o que realmente faria diferença.",
  execution: "Na rotina, isso aumenta o peso mental das tarefas importantes. A intenção permanece ativa, mas o início demora, outras atividades ocupam o espaço e a pressão cresce sem produzir avanço equivalente.",
  discipline: "Na rotina, isso faz pequenas interrupções parecerem perdas completas. Um dia difícil vira vários, a retomada exige energia demais e cada novo começo precisa reconstruir confiança.",
  direction: "Na rotina, isso distribui esforço entre objetivos concorrentes. Novas ideias substituem prioridades antes que produzam resultado, criando movimento frequente e pouco progresso acumulado.",
};

const pillarConsequence: Record<Pillar, string> = {
  organization: "Se esse padrão continuar, urgências devem seguir definindo sua agenda. Metas importantes podem permanecer em segundo plano, mesmo com esforço alto e pouco tempo livre.",
  execution: "Se esse padrão continuar, tarefas adiadas tendem a chegar maiores, mais urgentes e emocionalmente mais pesadas. O risco não é falta de capacidade, mas perder oportunidades de aplicar o que você já sabe.",
  discipline: "Se esse padrão continuar, planos podem depender cada vez mais de motivação e condições perfeitas. Isso reduz previsibilidade e fortalece a sensação de estar sempre começando novamente.",
  direction: "Se esse padrão continuar, sua energia pode continuar dividida entre muitas frentes. O custo aparece em metas abertas, decisões repetidas e dificuldade para reconhecer avanço concreto.",
};

const pillarStrength: Record<Pillar, string> = {
  organization: "Você demonstra capacidade de ordenar prioridades e criar alguma previsibilidade. Essa base pode proteger tempo para os outros pilares.",
  execution: "Você já consegue reduzir a distância entre decisão e ação em parte das situações. Essa prontidão pode ser usada para iniciar mudanças menores e verificáveis.",
  discipline: "Você possui sinais de continuidade e retomada. Essa capacidade ajuda a atravessar dias imperfeitos sem transformar uma falha em abandono.",
  direction: "Você mostra algum critério para escolher objetivos e avaliar novos caminhos. Essa clareza pode impedir que esforço seja diluído em metas concorrentes.",
};

const recommendation: Record<Pillar, string> = {
  organization: "Comece definindo uma prioridade diária e um limite claro para urgências. Seu primeiro ganho virá de proteger espaço, não de acrescentar mais tarefas.",
  execution: "Comece reduzindo cada prioridade à menor ação executável e marque um momento concreto para iniciá-la. Seu primeiro ganho virá de diminuir atrito, não de esperar mais motivação.",
  discipline: "Comece escolhendo um compromisso pequeno, com versão mínima para dias difíceis e regra de retomada para o dia seguinte. Seu primeiro ganho virá de continuar de forma imperfeita.",
  direction: "Comece elegendo um objetivo principal para o ciclo atual e registrando o que ficará conscientemente de fora. Seu primeiro ganho virá de concluir antes de expandir.",
};

const severityLead = (score: number) => {
  if (score >= 8) return "Suas respostas mostram presença forte e recorrente desse padrão.";
  if (score >= 5) return "Suas respostas mostram que esse padrão interfere com frequência no seu progresso.";
  return "Suas respostas indicam um ponto de atenção que ainda pode ser corrigido antes de ganhar força.";
};

export function buildPersonalizedReport(result: QuizResult, mainPainAnswer: string, identificationAnswer: string): PersonalizedReport {
  const primary = result.primaryBlocker;
  const secondary = result.secondaryBlocker;
  const strongest = result.strongestPillar;
  const pain = painCopy[mainPainAnswer] ?? result.band.description;
  const identification = identificationCopy[identificationAnswer] ?? "Seu padrão de continuidade foi considerado na leitura.";

  return {
    summary: `${pain} ${severityLead(result.pillarScores[primary])}`,
    primaryBlocker: `${blockerCopy[primary]} Este foi o pilar com maior dificuldade relativa na sua pontuação.`,
    secondaryBlocker: `${blockerCopy[secondary]} Ele funciona como reforço do bloqueio principal e ajuda a explicar por que tentativas isoladas perdem força.`,
    routineImpact: `${pillarImpact[primary]} ${identification}`,
    consequences: `${pillarConsequence[primary]} ${pillarConsequence[secondary]}`,
    strengths: `${pillarStrength[strongest]} Seu pilar mais estável foi ${strongest === primary ? "a própria base analisada" : "o ponto com menor dificuldade relativa"}, e ele pode servir como apoio prático para a mudança.`,
    initialRecommendation: `${recommendation[primary]} Depois, use o segundo pilar como apoio. ${recommendation[secondary]}`,
  };
}
