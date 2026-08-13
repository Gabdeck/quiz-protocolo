"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { awarenessCards, quizQuestions, stageLabels } from "@/src/content/quiz";
import { calculateResult } from "@/src/domain/quiz/scoring";
import { advanceIfCurrent, persistAnswer } from "@/src/domain/quiz/navigation";
import type { QuizSession, QuizStage } from "@/src/domain/quiz/types";
import { track } from "@/src/lib/analytics";
import { emptySession, loadSession, resetSession, saveSession } from "@/src/lib/storage/session";

type AwarenessKind = keyof typeof awarenessCards;
type Step =
  | { type: "question"; questionIndex: number }
  | { type: "awareness"; kind: AwarenessKind };

export const quizSteps: Step[] = [
  { type: "question", questionIndex: 0 }, { type: "question", questionIndex: 1 }, { type: "question", questionIndex: 2 }, { type: "awareness", kind: "organization" },
  { type: "question", questionIndex: 3 }, { type: "question", questionIndex: 4 }, { type: "question", questionIndex: 5 }, { type: "awareness", kind: "execution" },
  { type: "question", questionIndex: 6 }, { type: "question", questionIndex: 7 }, { type: "question", questionIndex: 8 },
];

const stages: QuizStage[] = ["organization", "execution", "discipline"];

export function QuizFlow() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession>(emptySession);
  const sessionRef = useRef<QuizSession>(emptySession());
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const pendingAdvance = useRef<number | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const persist = useCallback((makeNext: (current: QuizSession) => QuizSession) => {
    setSession((current) => {
      const next = makeNext(current);
      sessionRef.current = next;
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
    sessionRef.current = bounded;
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
      track("question_viewed", { questionId: question.id, questionIndex: step.questionIndex + 1, stage: question.stage, questionKind: question.kind });
    }
  }, [ready, session.currentStep, step]);

  const moveTo = useCallback((nextStep: number, nextReviewing = false) => {
    persist((current) => ({ ...current, currentStep: Math.max(0, Math.min(nextStep, quizSteps.length - 1)) }));
    setReviewing(nextReviewing);
    setBusy(false);
  }, [persist]);

  const completeDiagnostic = useCallback((current: QuizSession) => {
    try {
      const result = calculateResult(current.answers);
      const next = { ...current, result, completedAt: new Date().toISOString() };
      sessionRef.current = next;
      saveSession(next);
      setSession(next);
      track("diagnostic_completed", {
        diagnosticScore: result.diagnosticScore,
        pillarScores: result.pillarScores,
        primaryBlocker: result.primaryBlocker,
        subpattern: result.primarySubpattern ?? "generic",
        resistanceBand: result.resistanceBand,
        funnelVersion: 3,
        quizVersion: 3,
      });
      router.push("/resultado");
    } catch {
      moveTo(0);
    }
  }, [moveTo, router]);

  const confirmAutoAdvance = useCallback((expectedStep: number, questionId: string, isFinal: boolean) => {
    pendingAdvance.current = null;
    const current = sessionRef.current;
    if (current.currentStep !== expectedStep) return;
    track("question_auto_advanced", { questionId, fromStep: expectedStep });
    setReviewing(false);
    setBusy(false);
    if (isFinal) {
      completeDiagnostic(current);
      return;
    }
    const next = advanceIfCurrent(current, expectedStep, quizSteps.length - 1);
    sessionRef.current = next;
    saveSession(next);
    setSession(next);
  }, [completeDiagnostic]);

  const scheduleAdvance = useCallback((questionId: string, isFinal: boolean) => {
    cancelPendingAdvance();
    setBusy(true);
    const expectedStep = sessionRef.current.currentStep;
    pendingAdvance.current = window.setTimeout(() => confirmAutoAdvance(expectedStep, questionId, isFinal), 250);
  }, [cancelPendingAdvance, confirmAutoAdvance]);

  const selectAnswer = useCallback((questionIndex: number, optionId: string) => {
    if (busy) return;
    const question = quizQuestions[questionIndex];
    const option = question.options.find((item) => item.id === optionId);
    if (!option) return;
    const previous = sessionRef.current.answers[question.id];
    persist((current) => persistAnswer(current, question.id, optionId));
    track("answer_selected", { questionId: question.id, questionIndex: questionIndex + 1, stage: question.stage, questionKind: question.kind, optionIndex: question.options.indexOf(option) + 1 });
    track("question_answered", { questionId: question.id, questionIndex: questionIndex + 1, stage: question.stage, questionKind: question.kind, ...(option.score === undefined ? {} : { score: option.score }) });
    if (previous && previous !== optionId) track("answer_changed", { questionId: question.id, questionIndex: questionIndex + 1 });
    if (!reviewing) scheduleAdvance(question.id, questionIndex === quizQuestions.length - 1);
  }, [busy, persist, reviewing, scheduleAdvance]);

  const resumeCompletedStep = useCallback(() => {
    cancelPendingAdvance();
    const currentStep = quizSteps[sessionRef.current.currentStep];
    if (currentStep.type === "question" && currentStep.questionIndex === quizQuestions.length - 1) {
      completeDiagnostic(sessionRef.current);
      return;
    }
    moveTo(sessionRef.current.currentStep + 1, false);
  }, [cancelPendingAdvance, completeDiagnostic, moveTo]);

  const goBack = useCallback(() => {
    if (sessionRef.current.currentStep === 0) return;
    cancelPendingAdvance();
    const previousStep = sessionRef.current.currentStep - 1;
    const target = quizSteps[previousStep];
    track("back_used", { fromStep: sessionRef.current.currentStep, toStep: previousStep });
    moveTo(previousStep, target.type === "question");
  }, [cancelPendingAdvance, moveTo]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || confirmRestart) return;
      event.preventDefault();
      goBack();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [confirmRestart, goBack]);

  const restart = () => {
    cancelPendingAdvance();
    resetSession();
    const next = emptySession();
    sessionRef.current = next;
    setSession(next);
    setReviewing(false);
    setConfirmRestart(false);
    track("restart_confirmed");
    track("diagnostic_restarted");
  };

  if (!ready) return <main className="quiz-shell"><div className="loading-line" aria-label="Carregando diagnóstico" /></main>;

  const segmentProgress = stages.map((stage) => quizQuestions.filter((question) => question.stage === stage && session.answers[question.id]).length);
  const currentQuestion = step.type === "question" ? quizQuestions[step.questionIndex] : undefined;
  let progressLabel: string;
  if (step.type === "question") progressLabel = `${stageLabels[quizQuestions[step.questionIndex].stage]} · ${step.questionIndex + 1} de ${quizQuestions.length}`;
  else progressLabel = `${stageLabels[step.kind]} · Pausa de clareza`;

  return <main className="quiz-shell">
    <header className="quiz-topbar">
      <button type="button" className="quiz-icon-button" onClick={goBack} disabled={session.currentStep === 0} aria-label="Voltar"><ArrowLeft size={20} /></button>
      <div className="quiz-progress-center">
        <span className="quiz-progress-label">{progressLabel}</span>
        <div className="pillar-progress" aria-label={`${Object.keys(session.answers).length} de ${quizQuestions.length} perguntas respondidas`}>
          {segmentProgress.map((count, index) => <span className={currentQuestion?.stage === stages[index] ? "current" : ""} key={stages[index]} aria-label={`${stageLabels[stages[index]]}: ${count} de 3`}><i style={{ width: `${(count / 3) * 100}%` }} /></span>)}
        </div>
      </div>
      <button type="button" className="quiz-icon-button" onClick={() => setConfirmRestart(true)} aria-label="Reiniciar diagnóstico"><RotateCcw size={18} /></button>
    </header>

    <section className="quiz-stage" aria-live="polite">
      {step.type === "question" && <QuestionStep ref={titleRef} index={step.questionIndex} selected={session.answers[quizQuestions[step.questionIndex].id]} onSelect={selectAnswer} reviewing={reviewing} onResume={resumeCompletedStep} busy={busy} />}
      {step.type === "awareness" && <Awareness ref={titleRef} kind={step.kind} onNext={() => { track("awareness_viewed", { stage: step.kind }); moveTo(session.currentStep + 1); }} />}
    </section>

    {confirmRestart && <div className="restart-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setConfirmRestart(false); }}><div className="restart-dialog" role="dialog" aria-modal="true" aria-labelledby="restart-title"><span className="eyebrow">RECOMEÇAR</span><h2 id="restart-title">Apagar respostas atuais?</h2><p>Seu progresso será removido deste dispositivo.</p><div><button className="button ghost" onClick={() => setConfirmRestart(false)}>CANCELAR</button><button className="button primary" onClick={restart}>REINICIAR</button></div></div></div>}
  </main>;
}

const QuestionStep = function QuestionStep({ index, selected, onSelect, reviewing, onResume, busy, ref }: { index: number; selected?: string; onSelect: (index: number, id: string) => void; reviewing: boolean; onResume: () => void; busy: boolean; ref: React.Ref<HTMLHeadingElement> }) {
  const question = quizQuestions[index];
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (/^[1-4]$/.test(event.key)) {
        event.preventDefault();
        onSelect(index, question.options[Number(event.key) - 1].id);
        return;
      }
      if (event.key === "Enter") {
        const activeIndex = optionRefs.current.findIndex((node) => node === document.activeElement);
        if (activeIndex < 0) return;
        event.preventDefault();
        onSelect(index, question.options[activeIndex].id);
        return;
      }
      if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) return;
      event.preventDefault();
      const activeIndex = optionRefs.current.findIndex((node) => node === document.activeElement);
      const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (activeIndex + direction + question.options.length) % question.options.length;
      optionRefs.current[nextIndex]?.focus();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, onSelect, question.options]);

  return <div className="question-panel animate-in">
    <h1 ref={ref} tabIndex={-1}><span className="mobile-question-title">{question.mobileTitle}</span><span className="desktop-question-title">{question.title}</span></h1>
    <div className="options" role="radiogroup" aria-label={question.mobileTitle}>{question.options.map((option, optionIndex) => <button ref={(node) => { optionRefs.current[optionIndex] = node; }} type="button" role="radio" aria-checked={selected === option.id} className={`option ${selected === option.id ? "selected" : ""}`} key={option.id} onClick={() => onSelect(index, option.id)} disabled={busy}><span className="option-number" aria-hidden>{optionIndex + 1}</span><span>{option.label}</span><i aria-hidden>{selected === option.id && <Check size={18} />}</i></button>)}</div>
    {reviewing && <button className="review-next" disabled={!selected || busy} onClick={onResume}>PRÓXIMA <ArrowRight size={16} /></button>}
  </div>;
};

const Awareness = function Awareness({ kind, onNext, ref }: { kind: AwarenessKind; onNext: () => void; ref: React.Ref<HTMLHeadingElement> }) {
  const card = awarenessCards[kind];
  return <div className="awareness-panel animate-in"><span className="eyebrow">PAUSA DE CLAREZA</span><h1 ref={ref} tabIndex={-1}>{card.title}</h1>
    <button className="button primary awareness-cta" onClick={onNext}>CONTINUAR DIAGNÓSTICO <ArrowRight size={16} /></button>
  </div>;
};
