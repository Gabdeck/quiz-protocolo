export type FunnelEvent = "diagnostic_view" | "diagnostic_started" | "question_answered" | "question_viewed" | "answer_selected" | "question_auto_advanced" | "back_used" | "answer_changed" | "restart_confirmed" | "awareness_viewed" | "diagnostic_completed" | "result_viewed" | "offer_viewed" | "cta_clicked" | "individual_plan_clicked" | "checkout_redirected" | "diagnostic_restarted" | "lead_form_viewed" | "lead_submitted" | "lead_captured" | "lead_capture_failed" | "lead_capture_skipped";

export const FUNNEL_VERSION = 3;
export const QUIZ_VERSION = 3;

export function track(event: FunnelEvent, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, funnelVersion: FUNNEL_VERSION, quizVersion: QUIZ_VERSION, ...data, timestamp: new Date().toISOString() };
  try {
    const host = window as unknown as { dataLayer?: Array<Record<string, unknown>>; fbq?: (...args: unknown[]) => void };
    host.dataLayer?.push(payload);
    host.fbq?.("trackCustom", event, data);
    window.dispatchEvent(new CustomEvent("protocolo:analytics", { detail: payload }));
  } catch { /* Analytics must never block the funnel. */ }
}
