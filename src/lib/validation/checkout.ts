import type { ProductKey } from "@/src/content/products";
import { checkoutLinks } from "@/src/content/products";
import type { UtmData } from "@/src/domain/quiz/types";

export function isValidCheckoutUrl(value?: string): value is string {
  if (!value) return false;
  try { const url = new URL(value); return url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:"); } catch { return false; }
}

export function buildCheckoutUrl(product: ProductKey, utms: UtmData): string | null {
  const base = checkoutLinks[product];
  return buildConfiguredCheckoutUrl(base, utms);
}

export function buildConfiguredCheckoutUrl(base: string | undefined, utms: UtmData): string | null {
  if (!isValidCheckoutUrl(base)) return null;
  const url = new URL(base);
  for (const [key, value] of Object.entries(utms)) url.searchParams.set(key, value);
  return url.toString();
}
