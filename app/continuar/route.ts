import { buildConfiguredLandingPageUrl } from "@/src/lib/validation/landing";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const utms = Object.fromEntries(requestUrl.searchParams);
  const landingPageUrl = buildConfiguredLandingPageUrl(process.env.LANDING_PAGE_URL, utms);

  if (!landingPageUrl) {
    return new Response("A página de recomendação ainda não foi configurada.", { status: 503 });
  }

  return Response.redirect(landingPageUrl, 302);
}
