import type { UtmData } from "@/src/domain/quiz/types";

const allowedTracking = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "manychat"]);

export function isValidLandingPageUrl(value?: string): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:");
  } catch {
    return false;
  }
}

export function buildLandingRedirectPath(utms: UtmData): string {
  const params = new URLSearchParams(utms);
  const query = params.toString();
  return query ? `/continuar?${query}` : "/continuar";
}

export function buildConfiguredLandingPageUrl(base: string | undefined, utms: UtmData): string | null {
  if (!isValidLandingPageUrl(base)) return null;
  const url = new URL(base);
  for (const [key, value] of Object.entries(utms)) {
    if (allowedTracking.has(key)) url.searchParams.set(key, value.slice(0, 180));
  }
  return url.toString();
}
