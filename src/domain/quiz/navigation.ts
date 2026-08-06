import type { QuizSession } from "./types";

export function persistAnswer(session: QuizSession, questionId: string, optionId: string): QuizSession {
  return { ...session, answers: { ...session.answers, [questionId]: optionId } };
}

export function advanceIfCurrent(session: QuizSession, expectedStep: number, lastStep: number): QuizSession {
  if (session.currentStep !== expectedStep) return session;
  return { ...session, currentStep: Math.min(session.currentStep + 1, lastStep) };
}

export function previousSessionStep(session: QuizSession): QuizSession {
  return { ...session, currentStep: Math.max(0, session.currentStep - 1) };
}
