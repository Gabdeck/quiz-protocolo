"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { awarenessCards, identificationOptions, mainPainOptions, pillarLabels, quizQuestions } from "@/src/content/quiz";
import { calculateResult } from "@/src/domain/quiz/scoring";
import type { QuizSession } from "@/src/domain/quiz/types";
import { track } from "@/src/lib/analytics";
import { emptySession, loadSession, resetSession, saveSession } from "@/src/lib/storage/session";
import { Brand } from "@/src/components/shared/Brand";

type Step = { type: "question"; questionIndex: number } | { type: "awareness"; kind: "organization" | "execution" | "discipline" } | { type: "identification" } | { type: "pain" } | { type: "urgency" };
const steps: Step[] = [
  { type: "question", questionIndex: 0 }, { type: "question", questionIndex: 1 }, { type: "question", questionIndex: 2 }, { type: "awareness", kind: "organization" },
  { type: "question", questionIndex: 3 }, { type: "question", questionIndex: 4 }, { type: "question", questionIndex: 5 }, { type: "awareness", kind: "execution" },
  { type: "question", questionIndex: 6 }, { type: "question", questionIndex: 7 }, { type: "question", questionIndex: 8 }, { type: "awareness", kind: "discipline" },
  { type: "question", questionIndex: 9 }, { type: "question", questionIndex: 10 }, { type: "question", questionIndex: 11 }, { type: "pain" }, { type: "urgency" },
];

export function QuizFlow() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession>(emptySession);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const stored = loadSession(); queueMicrotask(() => { setSession({ ...stored, currentStep: Math.min(stored.currentStep, steps.length - 1) }); setReady(true); }); }, []);
  const update = (next: QuizSession) => { setSession(next); saveSession(next); };
  const step = steps[session.currentStep] ?? steps[0];
  const answeredCount = Object.keys(session.answers).filter((key) => key.startsWith("p")).length;
  const progress = Math.round((answeredCount / 12) * 100);
  const advance = () => { if (busy) return; setBusy(true); const next = { ...session, currentStep: Math.min(session.currentStep + 1, steps.length - 1) }; update(next); window.setTimeout(() => setBusy(false), 300); };
  const back = () => update({ ...session, currentStep: Math.max(0, session.currentStep - 1) });

  if (!ready) return <main className="quiz-shell"><div className="loading-line" aria-label="Carregando diagnóstico" /></main>;

  return <main className="quiz-shell">
    <header className="quiz-header"><Brand /><button className="text-button" onClick={() => { resetSession(); setSession(emptySession()); track("diagnostic_restarted"); }}>Reiniciar análise</button></header>
    <div className="progress-wrap" aria-label={`Progresso: ${progress}%`}><div className="progress-meta"><span>SEU DIAGNÓSTICO</span><b>{progress}% concluído</b></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div></div>
    <section className="quiz-stage" aria-live="polite">
      {step.type === "question" && <QuestionStep index={step.questionIndex} selected={session.answers[quizQuestions[step.questionIndex].id]} onSelect={(id) => update({ ...session, answers: { ...session.answers, [quizQuestions[step.questionIndex].id]: id } })} onNext={() => { const q = quizQuestions[step.questionIndex]; const option = q.options.find((o) => o.id === session.answers[q.id]); if (!option) return; track("question_answered", { questionId: q.id, questionIndex: step.questionIndex + 1, pillar: q.pillar, score: option.score }); advance(); }} onBack={back} canBack={session.currentStep > 0} busy={busy} />}
      {step.type === "awareness" && step.kind !== "discipline" && <Awareness kind={step.kind} onNext={() => { track("awareness_viewed", { stage: step.kind }); advance(); }} onBack={back} />}
      {step.type === "awareness" && step.kind === "discipline" && <Identification selected={session.identificationAnswer} onSelect={(value) => update({ ...session, identificationAnswer: value })} onNext={advance} onBack={back} />}
      {step.type === "pain" && <Pain selected={session.mainPainAnswer} onSelect={(value) => update({ ...session, mainPainAnswer: value })} onNext={advance} onBack={back} />}
      {step.type === "urgency" && <Urgency onBack={back} onFinish={() => { try { const result = calculateResult(session.answers); const next = { ...session, result, completedAt: new Date().toISOString() }; update(next); track("diagnostic_completed", { totalScore: result.totalScore, band: result.band.title, primaryBlocker: result.primaryBlocker }); router.push("/resultado"); } catch { update({ ...session, currentStep: 0 }); } }} />}
    </section>
  </main>;
}

function QuestionStep({ index, selected, onSelect, onNext, onBack, canBack, busy }: { index: number; selected?: string; onSelect: (id: string) => void; onNext: () => void; onBack: () => void; canBack: boolean; busy: boolean }) {
  const q = quizQuestions[index];
  return <div className="question-panel animate-in">
    <div className="question-kicker"><span>{pillarLabels[q.pillar]}</span><b>PERGUNTA {index + 1} DE 12</b></div>
    <h1>{q.title}</h1>
    <div className="options" role="radiogroup" aria-label={q.title}>{q.options.map((option, i) => <button type="button" role="radio" aria-checked={selected === option.id} className={`option ${selected === option.id ? "selected" : ""}`} key={option.id} onClick={() => onSelect(option.id)}><span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{option.label}</span><i aria-hidden>{selected === option.id ? "✓" : ""}</i></button>)}</div>
    <div className="quiz-actions">{canBack ? <button className="button ghost" onClick={onBack}>← VOLTAR</button> : <span />}<button className="button primary" disabled={!selected || busy} onClick={onNext}>CONTINUAR →</button></div>
  </div>;
}

function Awareness({ kind, onNext, onBack }: { kind: "organization" | "execution"; onNext: () => void; onBack: () => void }) {
  const card = awarenessCards[kind];
  return <div className="awareness-panel animate-in"><span className="eyebrow">{card.eyebrow}</span><h1>{card.title}</h1><p className="lead">{card.body}</p>
    {"cycle" in card ? <div className="cycle-row">{card.cycle?.map((item, i) => <div key={item}><span>{i + 1}</span>{item}</div>)}</div> : <div className="compare-mini"><div><b>{card.leftTitle}</b>{card.leftItems?.map((x) => <span key={x}>{x}</span>)}</div><div className="positive"><b>{card.rightTitle}</b>{card.rightItems?.map((x) => <span key={x}>{x}</span>)}</div></div>}
    {"note" in card && <p className="educational-note">{card.note}</p>}<div className="quiz-actions"><button className="button ghost" onClick={onBack}>← VOLTAR</button><button className="button primary" onClick={onNext}>{card.cta} →</button></div>
  </div>;
}

function Identification({ selected, onSelect, onNext, onBack }: { selected?: string; onSelect: (id: string) => void; onNext: () => void; onBack: () => void }) {
  return <div className="awareness-panel animate-in"><span className="eyebrow">CONTINUIDADE</span><h1>Talvez este ciclo pareça familiar:</h1><blockquote>“Eu começo a semana decidido a mudar. Organizo tudo e, durante alguns dias, parece que vai dar certo. Depois surge um imprevisto, perco um dia e começo a esperar a próxima segunda-feira para recomeçar.”</blockquote><p>Esse padrão surge quando a mudança depende apenas de motivação e não existe um sistema para continuar nos dias comuns e retomar depois de uma falha.</p><h2>Você já se sentiu preso em um ciclo parecido?</h2><AuxOptions options={identificationOptions} selected={selected} onSelect={onSelect} /><div className="quiz-actions"><button className="button ghost" onClick={onBack}>← VOLTAR</button><button className="button primary" disabled={!selected} onClick={onNext}>CONCLUIR MINHA ANÁLISE →</button></div></div>;
}

function Pain({ selected, onSelect, onNext, onBack }: { selected?: string; onSelect: (id: string) => void; onNext: () => void; onBack: () => void }) {
  return <div className="question-panel animate-in"><div className="question-kicker"><span>Personalização</span><b>ÚLTIMA PERGUNTA</b></div><h1>Entre todas essas situações, qual mais incomoda você hoje?</h1><p className="subtle">Esta resposta não altera sua pontuação. Ela ajuda a tornar sua análise mais relevante.</p><AuxOptions options={mainPainOptions} selected={selected} onSelect={onSelect} /><div className="quiz-actions"><button className="button ghost" onClick={onBack}>← VOLTAR</button><button className="button primary" disabled={!selected} onClick={onNext}>CONTINUAR →</button></div></div>;
}

function AuxOptions({ options, selected, onSelect }: { options: { id: string; label: string }[]; selected?: string; onSelect: (id: string) => void }) {
  return <div className="options compact" role="radiogroup">{options.map((option) => <button type="button" role="radio" aria-checked={selected === option.id} className={`option ${selected === option.id ? "selected" : ""}`} key={option.id} onClick={() => onSelect(option.id)}><span>{option.label}</span><i>{selected === option.id ? "✓" : ""}</i></button>)}</div>;
}

function Urgency({ onFinish, onBack }: { onFinish: () => void; onBack: () => void }) {
  return <div className="awareness-panel urgency animate-in"><span className="eyebrow">UMA ÚLTIMA REFLEXÃO</span><h1>O tempo sozinho não corrige um padrão.</h1><p className="lead">Quando os mesmos comportamentos se repetem durante meses, eles podem começar a parecer parte da personalidade. Mas suas respostas não indicam necessariamente falta de capacidade. Elas podem indicar falta de uma estrutura que conecte organização, execução, metas e continuidade.</p><div className="quote-grid"><span>“Eu sempre fui desorganizado.”</span><span>“Nunca consigo terminar nada.”</span><span>“Não tenho disciplina.”</span></div><p className="transition-copy">Agora vamos comparar suas respostas e identificar quais pilares mais interferem na sua evolução atual.</p><div className="quiz-actions"><button className="button ghost" onClick={onBack}>← VOLTAR</button><button className="button primary" onClick={onFinish}>GERAR MINHA ANÁLISE →</button></div></div>;
}
