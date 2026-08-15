import type { UtmData } from "@/src/domain/quiz/types";

export function isValidLandingPageUrl(value?: string): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:");
  } catch {
    return false;
  }
}

export function buildLandingPageUrl(utms: UtmData): string | null {
  return buildConfiguredLandingPageUrl(process.env.NEXT_PUBLIC_LANDING_PAGE_URL, utms);
}

export function buildConfiguredLandingPageUrl(base: string | undefined, utms: UtmData): string | null {
  if (!isValidLandingPageUrl(base)) return null;
  const url = new URL(base);
  for (const [key, value] of Object.entries(utms)) url.searchParams.set(key, value);
  return url.toString();
}
