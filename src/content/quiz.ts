import type { QuizIcon, QuizQuestion, QuizStage, Score } from "@/src/domain/quiz/types";

export const stageLabels: Record<QuizStage, string> = {
  organization: "Organização",
  execution: "Execução",
  discipline: "Continuidade",
};

export const pillarLabels = stageLabels;

const makeQuestion = (
  id: string,
  stage: QuizStage,
  kind: QuizQuestion["kind"],
  title: string,
  mobileTitle: string,
  icon: QuizIcon,
  options: string[],
): QuizQuestion => ({
  id,
  stage,
  kind,
  title,
  mobileTitle,
  icon,
  interaction: "single-auto",
  options: options.map((label, index) => ({
    id: `${id}-${index}`,
    label,
    ...(kind === "profile" ? {} : { score: index as Score }),
  })),
});

export const quizQuestions: QuizQuestion[] = [
  makeQuestion("p1", "organization", "diagnostic", "Quando você termina um dia comum, qual sensação aparece com mais frequência?", "Como você termina um dia comum?", "calendar", [
    "Fiz o que realmente precisava fazer.",
    "Fiz bastante coisa, mas algumas prioridades ficaram para depois.",
    "Passei o dia resolvendo coisas e ainda sinto que avancei pouco.",
    "Chego ao fim do dia pensando: ‘eu fiz um monte de coisa, mas o que realmente mudou?’",
  ]),
  makeQuestion("p2", "organization", "diagnostic", "Quando existem várias coisas importantes para resolver ao mesmo tempo, como você costuma decidir por onde começar?", "Como você decide por onde começar?", "list", [
    "Sei qual é a prioridade e começo por ela.",
    "Tenho uma ideia, mas mudo conforme aparecem novas demandas.",
    "Acabo fazendo primeiro o que parece mais fácil ou urgente.",
    "Fico tão dividido entre as opções que perco tempo sem avançar de verdade.",
  ]),
  makeQuestion("p3", "organization", "diagnostic", "Pensando nas coisas que você diz que quer mudar na sua vida, quantas têm um próximo passo realmente claro?", "Quantas mudanças têm um próximo passo claro?", "layers", [
    "Quase todas.",
    "Algumas têm, outras ainda estão vagas.",
    "Poucas têm um caminho claro.",
    "Sei que preciso mudar várias coisas, mas nem sei exatamente por onde começar.",
  ]),
  makeQuestion("p4", "execution", "diagnostic", "Quando existe algo importante que você sabe que precisa fazer, mas não está com vontade, o que geralmente acontece?", "O que acontece quando falta vontade?", "zap", [
    "Começo mesmo sem vontade.",
    "Adio um pouco, mas normalmente faço depois.",
    "Encontro outras coisas para fazer antes.",
    "Vou empurrando até a pressão me obrigar a agir.",
  ]),
  makeQuestion("p5", "execution", "diagnostic", "Quantas vezes você já terminou um dia sabendo que tinha tempo, mas mesmo assim não fez aquilo que mais importava?", "Quantas vezes o mais importante ficou para depois?", "search", [
    "Raramente.",
    "Acontece algumas vezes.",
    "Acontece com frequência.",
    "Mais vezes do que eu gostaria de admitir.",
  ]),
  makeQuestion("p6", "execution", "diagnostic", "Quando você adia algo importante, qual destas situações mais se parece com o que acontece depois?", "O que acontece depois que você adia?", "refresh", [
    "Reorganizo e faço em outro momento.",
    "A tarefa continua voltando à minha cabeça.",
    "Sinto culpa por não ter feito e ela parece cada vez maior.",
    "Só volto a agir quando o prazo, a pressão ou o problema já aumentaram.",
  ]),
  makeQuestion("p7", "discipline", "diagnostic", "Quando você decide mudar um hábito, organizar sua rotina ou começar um novo projeto, o que normalmente acontece depois das primeiras semanas?", "O que acontece depois das primeiras semanas?", "shield", [
    "Consigo manter até virar parte da rotina.",
    "Oscilo, mas normalmente consigo continuar.",
    "Começo bem e vou perdendo o ritmo.",
    "Começo motivado, paro e algum tempo depois tento começar tudo de novo.",
  ]),
  makeQuestion("p8", "discipline", "diagnostic", "Quando você falha por um ou dois dias no que havia planejado, qual é sua reação mais comum?", "O que você faz quando falha por um ou dois dias?", "undo", [
    "Continuo normalmente no dia seguinte.",
    "Demoro um pouco, mas retomo.",
    "Sinto que perdi o ritmo e começo a desanimar.",
    "Abandono e penso que vou recomeçar quando estiver mais preparado.",
  ]),
  makeQuestion("p9", "discipline", "diagnostic", "Quantas vezes você sente que já sabe o que deveria fazer, mas continua tendo dificuldade para sustentar isso por tempo suficiente?", "Você sabe o que fazer, mas não consegue sustentar?", "repeat", [
    "Poucas vezes.",
    "Em algumas áreas da minha vida.",
    "Em várias áreas.",
    "Esse é exatamente um dos meus maiores problemas.",
  ]),
];

export const awarenessCards = {
  organization: {
    eyebrow: "Organização",
    title: "Estar ocupado não significa estar avançando.",
    leftTitle: "Dia cheio",
    leftItems: ["Responder ao que aparece", "Alternar entre urgências", "Terminar cansado"],
    rightTitle: "Dia que avança",
    rightItems: ["Escolher uma prioridade", "Proteger tempo para ela", "Concluir o que move a meta"],
    cta: "ANALISAR MINHA EXECUÇÃO",
  },
  execution: {
    eyebrow: "Execução",
    title: "Procrastinação não termina quando você adia.",
    cta: "CONTINUAR DIAGNÓSTICO",
  },
} as const;
