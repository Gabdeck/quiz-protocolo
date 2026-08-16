import type { DiagnosticPillar, ResistanceBand, Subpattern, UtmData } from "@/src/domain/quiz/types";
import { getSupabaseLeadClient } from "@/src/lib/supabase/server";

const pillars: DiagnosticPillar[] = ["organization", "execution", "discipline"];
const resistanceBands: ResistanceBand[] = ["low", "moderate", "high", "very_high"];
const subpatterns: Subpattern[] = ["dispersion", "urgency_reactivity", "unclear_next_step", "postponement", "escape_productivity", "pressure_dependence", "loss_of_rhythm", "all_or_nothing", "recurring_restart"];
const allowedTracking = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "manychat"];

type LeadPayload = {
  name?: string;
  email?: string;
  company?: string;
  primaryBlocker?: DiagnosticPillar;
  secondaryBlocker?: DiagnosticPillar;
  primarySubpattern?: Subpattern | null;
  resistanceBand?: ResistanceBand;
  utms?: UtmData;
  source?: string;
};

function normalizeTracking(input: UtmData | undefined) {
  return Object.fromEntries(allowedTracking.flatMap((key) => {
    const value = input?.[key]?.slice(0, 180).trim();
    return value ? [[key, value]] : [];
  }));
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 8_192) {
      return Response.json({ error: "Requisição muito grande." }, { status: 413 });
    }

    const payload = (await request.json()) as LeadPayload;
    if (payload.company) return Response.json({ ok: true }, { status: 201 });

    const name = payload.name?.trim().replace(/\s+/g, " ") ?? "";
    if (name.length < 2 || name.length > 120) {
      return Response.json({ error: "Informe seu nome." }, { status: 400 });
    }

    const email = payload.email?.trim().toLowerCase() ?? "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }
    if (!payload.primaryBlocker || !pillars.includes(payload.primaryBlocker) || !payload.secondaryBlocker || !pillars.includes(payload.secondaryBlocker)) {
      return Response.json({ error: "Resultado do diagnóstico inválido." }, { status: 400 });
    }
    if (!payload.resistanceBand || !resistanceBands.includes(payload.resistanceBand)) {
      return Response.json({ error: "Faixa de resistência inválida." }, { status: 400 });
    }
    if (payload.primarySubpattern && !subpatterns.includes(payload.primarySubpattern)) {
      return Response.json({ error: "Padrão do diagnóstico inválido." }, { status: 400 });
    }

    const values = {
      name,
      email,
      primary_blocker: payload.primaryBlocker,
      secondary_blocker: payload.secondaryBlocker,
      primary_subpattern: payload.primarySubpattern ?? null,
      resistance_band: payload.resistanceBand,
      utms: normalizeTracking(payload.utms),
      source: payload.source?.slice(0, 500),
      funnel_version: 3,
      quiz_version: 3,
      consent_version: "lead-save-v1",
    };

    const { error } = await getSupabaseLeadClient()
      .from("leads")
      .insert(values);
    if (error && error.code !== "23505") {
      console.error("Supabase lead insert failed", { code: error.code, message: error.message });
      throw new Error("Supabase lead insert failed");
    }
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Lead capture failed", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Não foi possível salvar agora. Você ainda pode ver sua recomendação." }, { status: 500 });
  }
}
