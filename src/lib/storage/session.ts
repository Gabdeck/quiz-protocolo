import type { QuizSession, UtmData } from "@/src/domain/quiz/types";

export const SESSION_KEY = "protocolo-evolucao:session:v1";
const allowedTracking = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "manychat"];

export const emptySession = (): QuizSession => ({ version: 1, answers: {}, currentStep: 0, utms: {} });

export function parseSession(raw: string | null): QuizSession {
  try {
    const parsed = JSON.parse(raw ?? "null") as Partial<QuizSession> | null;
    if (!parsed || parsed.version !== 1 || typeof parsed.answers !== "object") return emptySession();
    return { ...emptySession(), ...parsed, answers: parsed.answers ?? {}, utms: parsed.utms ?? {} };
  } catch { return emptySession(); }
}

export function captureTracking(search: string): UtmData {
  const params = new URLSearchParams(search);
  return Object.fromEntries(allowedTracking.flatMap((key) => {
    const value = params.get(key)?.slice(0, 180).trim();
    return value ? [[key, value]] : [];
  }));
}

export function loadSession(): QuizSession {
  if (typeof window === "undefined") return emptySession();
  try { return parseSession(localStorage.getItem(SESSION_KEY)); } catch { return emptySession(); }
}

export function saveSession(session: QuizSession) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* Private mode can block storage. Flow still works in memory. */ }
}

export function resetSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* no-op */ }
}
