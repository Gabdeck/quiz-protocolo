import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import type { DiagnosticPillar, ResistanceBand, Subpattern, UtmData } from "@/src/domain/quiz/types";

const pillars: DiagnosticPillar[] = ["organization", "execution", "discipline"];
const resistanceBands: ResistanceBand[] = ["low", "moderate", "high", "very_high"];
const subpatterns: Subpattern[] = ["dispersion", "urgency_reactivity", "unclear_next_step", "postponement", "escape_productivity", "pressure_dependence", "loss_of_rhythm", "all_or_nothing", "recurring_restart"];
const allowedTracking = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "manychat"];

type LeadPayload = {
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
      id: crypto.randomUUID(),
      email,
      primaryBlocker: payload.primaryBlocker,
      secondaryBlocker: payload.secondaryBlocker,
      primarySubpattern: payload.primarySubpattern ?? null,
      resistanceBand: payload.resistanceBand,
      utmsJson: JSON.stringify(normalizeTracking(payload.utms)),
      source: payload.source?.slice(0, 500),
      funnelVersion: 3,
      quizVersion: 3,
      consentVersion: "lead-save-v1",
    };

    const db = await getDb();
    await db.insert(leads).values(values).onConflictDoUpdate({
      target: leads.email,
      set: {
        primaryBlocker: values.primaryBlocker,
        secondaryBlocker: values.secondaryBlocker,
        primarySubpattern: values.primarySubpattern,
        resistanceBand: values.resistanceBand,
        utmsJson: values.utmsJson,
        source: values.source,
        funnelVersion: values.funnelVersion,
        quizVersion: values.quizVersion,
        consentVersion: values.consentVersion,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Não foi possível salvar agora. Você ainda pode ver sua recomendação." }, { status: 500 });
  }
}
