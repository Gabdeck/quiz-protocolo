import type { Pillar, QuizIcon, QuizQuestion, Score } from "@/src/domain/quiz/types";

const labels: Record<Pillar, string> = {
  organization: "Organização",
  execution: "Execução",
  discipline: "Disciplina",
  direction: "Direção",
};

const makeQuestion = (
  id: string,
  pillar: Pillar,
  title: string,
  mobileTitle: string,
  icon: QuizIcon,
  options: string[],
): QuizQuestion => ({
  id,
  pillar,
  title,
  mobileTitle,
  icon,
  interaction: "single-auto",
  options: options.map((label, index) => ({
    id: `${id}-${index}`,
    label,
    score: index as Score,
  })),
});

export const pillarLabels = labels;

export const quizQuestions: QuizQuestion[] = [
  makeQuestion("p1", "organization", "Mesmo sabendo o que precisa fazer, o que costuma acontecer com seus planos ao longo do dia?", "O que acontece com seus planos ao longo do dia?", "calendar", ["Consigo seguir o que planejei na maior parte do tempo.", "Cumpro algumas coisas, mas outras sempre ficam para depois.", "As urgências tomam conta e abandono minhas prioridades.", "Chego ao fim do dia sem ter feito o que realmente importava."]),
  makeQuestion("p2", "organization", "Qual destas situações mais se repete na sua rotina?", "Qual situação mais se repete na sua rotina?", "list", ["Tenho prioridades claras e consigo respeitá-las.", "Começo o dia com uma ideia, mas acabo mudando os planos.", "Faço muitas coisas, porém avanço pouco no que realmente importa.", "Passo o dia resolvendo problemas e sinto que minha vida continua parada."]),
  makeQuestion("p3", "organization", "Quando várias coisas precisam da sua atenção ao mesmo tempo, como você reage?", "Quando tudo pede atenção, o que você faz?", "layers", ["Defino o que é mais importante e começo por isso.", "Resolvo primeiro o que parece mais fácil.", "Tento fazer tudo ao mesmo tempo e não termino quase nada.", "Fico sobrecarregado, me distraio ou acabo adiando tudo."]),
  makeQuestion("p4", "execution", "Quando existe uma tarefa importante que você não está com vontade de fazer, o que normalmente acontece?", "O que acontece quando você não está com vontade?", "zap", ["Começo mesmo sem vontade.", "Adio um pouco, mas ainda consigo realizar.", "Procuro outras tarefas para sentir que estou sendo produtivo.", "Continuo adiando até a tarefa virar um problema maior."]),
  makeQuestion("p5", "execution", "Quantas vezes você já pesquisou, planejou ou pensou muito sobre uma mudança, mas demorou para realmente começar?", "Você planeja muito antes de começar?", "search", ["Poucas vezes.", "Algumas vezes.", "Isso acontece com frequência.", "Tenho acumulado mais planos do que resultados."]),
  makeQuestion("p6", "execution", "Quando você finalmente começa algo importante, qual costuma ser o maior problema?", "Qual maior dificuldade depois que você começa?", "refresh", ["Manter a mesma intensidade durante muito tempo.", "Continuar quando os resultados demoram a aparecer.", "Voltar depois de perder alguns dias.", "Normalmente abandono antes de criar qualquer consistência."]),
  makeQuestion("p7", "discipline", "O que mais costuma determinar se você vai cumprir um compromisso pessoal?", "O que decide se você cumpre um compromisso?", "shield", ["A importância que ele tem para mim.", "A quantidade de tempo disponível.", "O meu nível de energia naquele dia.", "A minha motivação no momento."]),
  makeQuestion("p8", "discipline", "Quando você falha por um ou dois dias em uma rotina, o que costuma fazer?", "O que você faz quando perde um ou dois dias?", "undo", ["Retomo no próximo momento possível.", "Demoro alguns dias, mas consigo voltar.", "Penso que perdi o ritmo e deixo para recomeçar depois.", "Abandono e crio um novo plano semanas depois."]),
  makeQuestion("p9", "discipline", "Qual frase descreve melhor sua relação com novos hábitos?", "Como novos hábitos costumam terminar?", "repeat", ["Consigo começar pequeno e aumentar aos poucos.", "Começo bem, mas perco o ritmo com o tempo.", "Tento mudar várias coisas ao mesmo tempo e me sobrecarrego.", "Vivo repetindo o ciclo de começar, falhar e recomeçar."]),
  makeQuestion("p10", "direction", "Quando você pensa nas metas que definiu nos últimos meses, qual cenário mais se aproxima da realidade?", "O que aconteceu com suas metas recentes?", "flag", ["Mantive o foco e avancei de forma consistente.", "Avancei em algumas, mas deixei outras de lado.", "Comecei várias coisas e concluí poucas.", "Ainda tenho praticamente as mesmas metas, mas continuo no mesmo lugar."]),
  makeQuestion("p11", "direction", "O que costuma acontecer quando aparece uma nova ideia ou objetivo?", "O que uma nova ideia faz com seus planos?", "idea", ["Avalio se faz sentido antes de mudar meus planos.", "Tento encaixar junto com o que já estava fazendo.", "Perco o foco da meta anterior e começo a nova.", "Acumulo vários começos, mas poucas conclusões."]),
  makeQuestion("p12", "direction", "Se seus hábitos continuarem exatamente como estão pelos próximos 12 meses, qual resultado parece mais provável?", "Se nada mudar por 12 meses, onde você estará?", "hourglass", ["Estarei mais perto dos meus objetivos.", "Terei algum progresso, mas abaixo do que poderia.", "Provavelmente continuarei enfrentando os mesmos problemas.", "Vou me arrepender de ter deixado mais um ano passar da mesma forma."]),
];

export const awarenessCards = {
  organization: {
    eyebrow: "Uma pausa para observar",
    title: "Estar ocupado não significa estar avançando.",
    body: "Muitas pessoas terminam o dia cansadas porque resolveram dezenas de pequenas urgências, mas não avançaram naquilo que realmente poderia mudar suas vidas. Estar sempre ocupado pode esconder falta de prioridade, excesso de distrações e dificuldade para proteger o que importa.",
    leftTitle: "Dia cheio",
    leftItems: ["Mensagens e notificações", "Pequenos problemas", "Interrupções constantes"],
    rightTitle: "Dia que gera progresso",
    rightItems: ["Uma prioridade clara", "Tempo protegido", "Ação concluída e revisão simples"],
    cta: "ANALISAR MINHA EXECUÇÃO",
  },
  execution: {
    eyebrow: "O ciclo do adiamento",
    title: "Procrastinação não é apenas deixar para depois.",
    body: "O adiamento constante pode aumentar pressão, culpa, estresse, acúmulo de pendências e perda de confiança na própria palavra. O padrão pode estar na distância entre sua intenção e sua capacidade de executar com consistência.",
    cycle: ["Tarefa importante", "Adiamento", "Alívio momentâneo", "Pressão e culpa", "A tarefa parece maior", "Novo adiamento"],
    note: "Análise educativa. Não representa diagnóstico clínico.",
    cta: "ANALISAR MINHA CONSTÂNCIA",
  },
};

export const identificationOptions = [
  { id: "often", label: "Sim, muitas vezes." },
  { id: "some", label: "Algumas partes se parecem comigo." },
  { id: "past", label: "Já aconteceu, mas hoje consigo lidar melhor." },
  { id: "no", label: "Não me identifico com esse padrão." },
];

export const mainPainOptions = [
  { id: "delay", label: "Saber o que preciso fazer, mas continuar adiando." },
  { id: "consistency", label: "Começar mudanças e nunca conseguir manter." },
  { id: "busy", label: "Fazer muita coisa, mas sentir que minha vida não avança." },
  { id: "time", label: "Perceber o tempo passando e continuar preso aos mesmos padrões." },
];
