import type { Pillar } from "./types";

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
