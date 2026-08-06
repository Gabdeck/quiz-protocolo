export type FunnelEvent = "diagnostic_view" | "diagnostic_started" | "question_answered" | "awareness_viewed" | "diagnostic_completed" | "result_viewed" | "offer_viewed" | "cta_clicked" | "individual_plan_clicked" | "checkout_redirected" | "diagnostic_restarted";

export function track(event: FunnelEvent, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...data, timestamp: new Date().toISOString() };
  try {
    const host = window as unknown as { dataLayer?: Array<Record<string, unknown>>; fbq?: (...args: unknown[]) => void };
    host.dataLayer?.push(payload);
    host.fbq?.("trackCustom", event, data);
    window.dispatchEvent(new CustomEvent("protocolo:analytics", { detail: payload }));
  } catch { /* Analytics must never block the funnel. */ }
}
