"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Check, RotateCcw,
} from "lucide-react";
import { awarenessCards, identificationOptions, mainPainOptions, pillarLabels, quizQuestions } from "@/src/content/quiz";
import { calculateResult } from "@/src/domain/quiz/scoring";
import { advanceIfCurrent, persistAnswer } from "@/src/domain/quiz/navigation";
import type { Pillar, QuizSession } from "@/src/domain/quiz/types";
import { track } from "@/src/lib/analytics";
import { emptySession, loadSession, resetSession, saveSession } from "@/src/lib/storage/session";

type Step =
  | { type: "question"; questionIndex: number }
  | { type: "awareness"; kind: "organization" | "execution" | "discipline" }
  | { type: "pain" }
  | { type: "urgency" };

export const quizSteps: Step[] = [
  { type: "question", questionIndex: 0 }, { type: "question", questionIndex: 1 }, { type: "question", questionIndex: 2 }, { type: "awareness", kind: "organization" },
  { type: "question", questionIndex: 3 }, { type: "question", questionIndex: 4 }, { type: "question", questionIndex: 5 }, { type: "awareness", kind: "execution" },
  { type: "question", questionIndex: 6 }, { type: "question", questionIndex: 7 }, { type: "question", questionIndex: 8 }, { type: "awareness", kind: "discipline" },
  { type: "question", questionIndex: 9 }, { type: "question", questionIndex: 10 }, { type: "question", questionIndex: 11 }, { type: "pain" }, { type: "urgency" },
];

const pillars: Pillar[] = ["organization", "execution", "discipline", "direction"];

export function QuizFlow() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession>(emptySession);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const pendingAdvance = useRef<number | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const persist = useCallback((makeNext: (current: QuizSession) => QuizSession) => {
    setSession((current) => {
      const next = makeNext(current);
      saveSession(next);
      return next;
    });
  }, []);

  const cancelPendingAdvance = useCallback(() => {
    if (pendingAdvance.current !== null) window.clearTimeout(pendingAdvance.current);
    pendingAdvance.current = null;
    setBusy(false);
  }, []);

  useEffect(() => {
    const stored = loadSession();
    const bounded = { ...stored, currentStep: Math.min(stored.currentStep, quizSteps.length - 1) };
    const storedStep = quizSteps[bounded.currentStep];
    queueMicrotask(() => {
      setSession(bounded);
      setReviewing(storedStep.type === "question" && Boolean(bounded.answers[quizQuestions[storedStep.questionIndex].id]));
      setReady(true);
    });
    return cancelPendingAdvance;
  }, [cancelPendingAdvance]);

  const step = quizSteps[session.currentStep] ?? quizSteps[0];

  useEffect(() => {
    if (!ready) return;
    titleRef.current?.focus({ preventScroll: true });
    if (step.type === "question") {
      const question = quizQuestions[step.questionIndex];
      track("question_viewed", { questionId: question.id, questionIndex: step.questionIndex + 1, pillar: question.pillar });
    }
  }, [ready, session.currentStep, step]);

  const moveTo = useCallback((nextStep: number, nextReviewing = false) => {
    persist((current) => ({ ...current, currentStep: Math.max(0, Math.min(nextStep, quizSteps.length - 1)) }));
    setReviewing(nextReviewing);
    setBusy(false);
  }, [persist]);

  const confirmAutoAdvance = useCallback((expectedStep: number, questionId?: string) => {
    pendingAdvance.current = null;
    setSession((current) => {
      if (current.currentStep !== expectedStep) return current;
      const next = advanceIfCurrent(current, expectedStep, quizSteps.length - 1);
      saveSession(next);
      if (questionId) track("question_auto_advanced", { questionId, fromStep: expectedStep });
      return next;
    });
    setReviewing(false);
    setBusy(false);
  }, []);

  const scheduleAdvance = useCallback((questionId?: string) => {
    cancelPendingAdvance();
    setBusy(true);
    const expectedStep = session.currentStep;
    pendingAdvance.current = window.setTimeout(() => confirmAutoAdvance(expectedStep, questionId), 250);
  }, [cancelPendingAdvance, confirmAutoAdvance, session.currentStep]);

  const selectAnswer = useCallback((questionIndex: number, optionId: string) => {
    if (busy) return;
    const question = quizQuestions[questionIndex];
    const option = question.options.find((item) => item.id === optionId);
    if (!option) return;
    const previous = session.answers[question.id];
    persist((current) => persistAnswer(current, question.id, optionId));
    track("answer_selected", { questionId: question.id, questionIndex: questionIndex + 1, pillar: question.pillar, optionIndex: question.options.indexOf(option) + 1, score: option.score });
    track("question_answered", { questionId: question.id, questionIndex: questionIndex + 1, pillar: question.pillar, score: option.score });
    if (previous && previous !== optionId) track("answer_changed", { questionId: question.id, questionIndex: questionIndex + 1 });
    if (!reviewing) scheduleAdvance(question.id);
  }, [busy, persist, reviewing, scheduleAdvance, session.answers]);

  const resumeCompletedStep = useCallback(() => {
    cancelPendingAdvance();
    moveTo(session.currentStep + 1, false);
  }, [cancelPendingAdvance, moveTo, session.currentStep]);

  const goBack = useCallback(() => {
    if (session.currentStep === 0) return;
    cancelPendingAdvance();
    const previousStep = session.currentStep - 1;
    const target = quizSteps[previousStep];
    track("back_used", { fromStep: session.currentStep, toStep: previousStep });
    moveTo(previousStep, target.type === "question" || target.type === "pain" || target.type === "awareness" && target.kind === "discipline");
  }, [cancelPendingAdvance, moveTo, session.currentStep]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || confirmRestart) return;
      event.preventDefault();
      goBack();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [confirmRestart, goBack]);

  const selectAux = (field: "identificationAnswer" | "mainPainAnswer", value: string) => {
    if (busy) return;
    const previous = session[field];
    persist((current) => ({ ...current, [field]: value }));
    track("answer_selected", { field, optionId: value, step: session.currentStep });
    if (previous && previous !== value) track("answer_changed", { field, step: session.currentStep });
    if (!reviewing) scheduleAdvance();
  };

  const restart = () => {
    cancelPendingAdvance();
    resetSession();
    setSession(emptySession());
    setReviewing(false);
    setConfirmRestart(false);
    track("restart_confirmed");
    track("diagnostic_restarted");
  };

  const finish = () => {
    cancelPendingAdvance();
    try {
      const result = calculateResult(session.answers);
      const next = { ...session, result, completedAt: new Date().toISOString() };
      saveSession(next);
      setSession(next);
      track("diagnostic_completed", { totalScore: result.totalScore, band: result.band.title, primaryBlocker: result.primaryBlocker });
      router.push("/resultado");
    } catch {
      moveTo(0);
    }
  };

  if (!ready) return <main className="quiz-shell"><div className="loading-line" aria-label="Carregando diagnóstico" /></main>;

  const segmentProgress = pillars.map((pillar) => quizQuestions.filter((q) => q.pillar === pillar && session.answers[q.id]).length);
  const currentQuestionIndex = step.type === "question" ? step.questionIndex : undefined;
  const currentQuestion = currentQuestionIndex === undefined ? undefined : quizQuestions[currentQuestionIndex];
  const progressLabel = currentQuestion
    ? `${pillarLabels[currentQuestion.pillar]} · Pergunta ${currentQuestionIndex! + 1} de 12`
    : step.type === "awareness"
      ? `${pillarLabels[step.kind]} · Pausa de clareza`
      : "Síntese · Etapa final";

  return <main className="quiz-shell">
    <header className="quiz-topbar">
      <button type="button" className="quiz-icon-button" onClick={goBack} disabled={session.currentStep === 0} aria-label="Voltar"><ArrowLeft size={20} /></button>
      <div className="quiz-progress-center">
        <span className="quiz-progress-label">{progressLabel}</span>
        <div className="pillar-progress" aria-label={`${Object.keys(session.answers).length} de 12 perguntas respondidas`}>
          {segmentProgress.map((count, index) => <span className={currentQuestion?.pillar === pillars[index] ? "current" : ""} key={pillars[index]} aria-label={`${pillarLabels[pillars[index]]}: ${count} de 3`}><i style={{ width: `${(count / 3) * 100}%` }} /></span>)}
        </div>
      </div>
      <button type="button" className="quiz-icon-button" onClick={() => setConfirmRestart(true)} aria-label="Reiniciar diagnóstico"><RotateCcw size={18} /></button>
    </header>

    <section className="quiz-stage" aria-live="polite">
      {step.type === "question" && <QuestionStep ref={titleRef} index={step.questionIndex} selected={session.answers[quizQuestions[step.questionIndex].id]} onSelect={selectAnswer} reviewing={reviewing} onResume={resumeCompletedStep} busy={busy} />}
      {step.type === "awareness" && step.kind !== "discipline" && <Awareness ref={titleRef} kind={step.kind} onNext={() => { track("awareness_viewed", { stage: step.kind }); moveTo(session.currentStep + 1); }} />}
      {step.type === "awareness" && step.kind === "discipline" && <Identification ref={titleRef} selected={session.identificationAnswer} onSelect={(value) => selectAux("identificationAnswer", value)} reviewing={reviewing} onResume={resumeCompletedStep} busy={busy} />}
      {step.type === "pain" && <Pain ref={titleRef} selected={session.mainPainAnswer} onSelect={(value) => selectAux("mainPainAnswer", value)} reviewing={reviewing} onResume={resumeCompletedStep} busy={busy} />}
      {step.type === "urgency" && <Urgency ref={titleRef} onFinish={finish} />}
    </section>

    <footer className="quiz-trust">Sem cadastro <span aria-hidden>·</span> resultado imediato <span aria-hidden>·</span> análise educativa</footer>

    {confirmRestart && <div className="restart-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setConfirmRestart(false); }}><div className="restart-dialog" role="dialog" aria-modal="true" aria-labelledby="restart-title"><span className="eyebrow">RECOMEÇAR</span><h2 id="restart-title">Apagar respostas atuais?</h2><p>Seu progresso será removido deste dispositivo.</p><div><button className="button ghost" onClick={() => setConfirmRestart(false)}>CANCELAR</button><button className="button primary" onClick={restart}>REINICIAR</button></div></div></div>}
  </main>;
}

const QuestionStep = function QuestionStep({ index, selected, onSelect, reviewing, onResume, busy, ref }: { index: number; selected?: string; onSelect: (index: number, id: string) => void; reviewing: boolean; onResume: () => void; busy: boolean; ref: React.Ref<HTMLHeadingElement> }) {
  const q = quizQuestions[index];
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (/^[1-4]$/.test(event.key)) {
        event.preventDefault();
        onSelect(index, q.options[Number(event.key) - 1].id);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const activeIndex = optionRefs.current.findIndex((node) => node === document.activeElement);
      const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (activeIndex + direction + q.options.length) % q.options.length;
      optionRefs.current[nextIndex]?.focus();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, onSelect, q.options]);

  return <div className="question-panel animate-in">
    <h1 ref={ref} tabIndex={-1}><span className="mobile-question-title">{q.mobileTitle}</span><span className="desktop-question-title">{q.title}</span></h1>
    <div className="options" role="radiogroup" aria-label={q.mobileTitle}>{q.options.map((option, optionIndex) => <button ref={(node) => { optionRefs.current[optionIndex] = node; }} type="button" role="radio" aria-checked={selected === option.id} className={`option ${selected === option.id ? "selected" : ""}`} key={option.id} onClick={() => onSelect(index, option.id)} disabled={busy}><span className="option-number" aria-hidden>{optionIndex + 1}</span><span>{option.label}</span><i aria-hidden>{selected === option.id && <Check size={18} />}</i></button>)}</div>
    {reviewing && <button className="review-next" disabled={!selected || busy} onClick={onResume}>PRÓXIMA <ArrowRight size={16} /></button>}
  </div>;
};

const Awareness = function Awareness({ kind, onNext, ref }: { kind: "organization" | "execution"; onNext: () => void; ref: React.Ref<HTMLHeadingElement> }) {
  const card = awarenessCards[kind];
  return <div className="awareness-panel animate-in"><span className="eyebrow">{card.eyebrow}</span><h1 ref={ref} tabIndex={-1}>{card.title}</h1>
    {"cycle" in card ? <><div className="cycle-row">{card.cycle?.map((item, index) => <div key={item}><span>{index + 1}</span>{item}</div>)}</div><p className="awareness-summary">Adiar alivia agora. Depois, aumenta pressão e reduz confiança.</p></> : <div className="compare-mini"><div><b>{card.leftTitle}</b>{card.leftItems?.map((item) => <span key={item}>{item}</span>)}</div><div className="positive"><b>{card.rightTitle}</b>{card.rightItems?.map((item) => <span key={item}>{item}</span>)}</div></div>}
    {"note" in card && <p className="educational-note">{card.note}</p>}<button className="button primary awareness-cta" onClick={onNext}>{card.cta} <ArrowRight size={16} /></button>
  </div>;
};

const Identification = function Identification({ selected, onSelect, reviewing, onResume, busy, ref }: { selected?: string; onSelect: (id: string) => void; reviewing: boolean; onResume: () => void; busy: boolean; ref: React.Ref<HTMLHeadingElement> }) {
  return <div className="awareness-panel identification-panel animate-in"><span className="eyebrow">CONTINUIDADE</span><h1 ref={ref} tabIndex={-1}>Você reconhece este ciclo?</h1><blockquote>“Começo decidido. Um imprevisto quebra o ritmo. Então espero outra segunda-feira para recomeçar.”</blockquote><p className="awareness-summary">Sem sistema de retomada, uma falha pequena vira abandono.</p><h2>Isso se parece com você?</h2><AuxOptions options={identificationOptions} selected={selected} onSelect={onSelect} busy={busy} />{reviewing && <button className="review-next" disabled={!selected || busy} onClick={onResume}>PRÓXIMA <ArrowRight size={16} /></button>}</div>;
};

const Pain = function Pain({ selected, onSelect, reviewing, onResume, busy, ref }: { selected?: string; onSelect: (id: string) => void; reviewing: boolean; onResume: () => void; busy: boolean; ref: React.Ref<HTMLHeadingElement> }) {
  return <div className="question-panel animate-in"><div className="question-kicker"><span>Personalização</span><b>ÚLTIMA PERGUNTA</b></div><h1 ref={ref} tabIndex={-1}>O que mais incomoda você hoje?</h1><p className="subtle">Não altera pontuação. Personaliza análise.</p><AuxOptions options={mainPainOptions} selected={selected} onSelect={onSelect} busy={busy} />{reviewing && <button className="review-next" disabled={!selected || busy} onClick={onResume}>PRÓXIMA <ArrowRight size={16} /></button>}</div>;
};

function AuxOptions({ options, selected, onSelect, busy }: { options: { id: string; label: string }[]; selected?: string; onSelect: (id: string) => void; busy: boolean }) {
  return <div className="options compact" role="radiogroup">{options.map((option) => <button type="button" role="radio" aria-checked={selected === option.id} className={`option ${selected === option.id ? "selected" : ""}`} key={option.id} onClick={() => onSelect(option.id)} disabled={busy}><span>{option.label}</span><i aria-hidden>{selected === option.id && <Check size={18} />}</i></button>)}</div>;
}

const Urgency = function Urgency({ onFinish, ref }: { onFinish: () => void; ref: React.Ref<HTMLHeadingElement> }) {
  return <div className="awareness-panel urgency animate-in"><span className="eyebrow">UMA ÚLTIMA REFLEXÃO</span><h1 ref={ref} tabIndex={-1}>O tempo sozinho não corrige um padrão.</h1><div className="quote-grid"><span>“Sempre fui desorganizado.”</span><span>“Nunca termino nada.”</span><span>“Não tenho disciplina.”</span></div><p className="transition-copy">Respostas podem indicar falta de estrutura, não falta de capacidade.</p><button className="button primary awareness-cta" onClick={onFinish}>GERAR MINHA ANÁLISE <ArrowRight size={16} /></button></div>;
};
