import type { QuizSession, UtmData } from "@/src/domain/quiz/types";

export const SESSION_KEY = "protocolo-evolucao:session:v3";
export const LEGACY_SESSION_KEYS = ["protocolo-evolucao:session:v2", "protocolo-evolucao:session:v1"];
const allowedTracking = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "manychat"];

type LegacySession = { version?: number; utms?: UtmData; source?: string };

export const emptySession = (): QuizSession => ({ version: 3, answers: {}, currentStep: 0, utms: {} });

export function parseSession(raw: string | null): QuizSession {
  try {
    const parsed = JSON.parse(raw ?? "null") as Partial<QuizSession> | null;
    if (!parsed || parsed.version !== 3 || typeof parsed.answers !== "object") return emptySession();
    return { ...emptySession(), ...parsed, answers: parsed.answers ?? {}, utms: parsed.utms ?? {} };
  } catch { return emptySession(); }
}

export function migrateLegacySession(raw: string | null): QuizSession {
  try {
    const legacy = JSON.parse(raw ?? "null") as LegacySession | null;
    if (!legacy || ![1, 2].includes(legacy.version ?? 0)) return emptySession();
    return { ...emptySession(), utms: legacy.utms ?? {}, source: legacy.source };
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
  try {
    const current = localStorage.getItem(SESSION_KEY);
    if (current) return parseSession(current);
    const legacyRaw = LEGACY_SESSION_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) ?? null;
    const migrated = migrateLegacySession(legacyRaw);
    localStorage.setItem(SESSION_KEY, JSON.stringify(migrated));
    return migrated;
  } catch { return emptySession(); }
}

export function saveSession(session: QuizSession) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* Private mode can block storage. Flow still works in memory. */ }
}

export function resetSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* no-op */ }
}
