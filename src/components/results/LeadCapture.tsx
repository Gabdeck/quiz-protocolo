"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Check, Mail } from "lucide-react";
import type { QuizSession } from "@/src/domain/quiz/types";
import { track } from "@/src/lib/analytics";
import { buildLandingRedirectPath } from "@/src/lib/validation/landing";

export function LeadCapture({ session }: { session: QuizSession }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "skipped" | "error">("idle");
  const result = session.result!;
  const canContinue = status === "saved" || status === "skipped";
  const landingPageUrl = buildLandingRedirectPath(session.utms);

  useEffect(() => {
    track("lead_form_viewed", { primaryBlocker: result.primaryBlocker });
  }, [result.primaryBlocker]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    track("lead_submitted", { primaryBlocker: result.primaryBlocker });
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          primaryBlocker: result.primaryBlocker,
          secondaryBlocker: result.secondaryBlocker,
          primarySubpattern: result.primarySubpattern,
          resistanceBand: result.resistanceBand,
          utms: session.utms,
          source: session.source,
        }),
      });
      if (!response.ok) throw new Error("capture failed");
      setStatus("saved");
      track("lead_captured", { primaryBlocker: result.primaryBlocker });
    } catch {
      setStatus("error");
      track("lead_capture_failed", { primaryBlocker: result.primaryBlocker });
    }
  };

  const skip = () => {
    setStatus("skipped");
    track("lead_capture_skipped", { primaryBlocker: result.primaryBlocker });
  };

  return <section className="lead-capture" aria-labelledby="lead-capture-title">
    {!canContinue ? <>
      <div className="lead-capture-icon"><Mail size={24} aria-hidden /></div>
      <div className="lead-capture-copy">
        <span>GUARDE ESTA ANÁLISE</span>
        <h2 id="lead-capture-title">Salve seu diagnóstico antes de continuar.</h2>
        <p>Registramos seu resultado para que a recomendação continue conectada ao padrão que você acabou de identificar.</p>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="lead-fields">
          <div><label htmlFor="lead-name">Seu nome</label><input id="lead-name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Como podemos chamar você?" /></div>
          <div><label htmlFor="lead-email">Seu melhor e-mail</label><input id="lead-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} aria-describedby="lead-helper lead-error" placeholder="voce@exemplo.com" /></div>
          <button className="button primary" type="submit" disabled={status === "saving"}>{status === "saving" ? "SALVANDO..." : "SALVAR MEU DIAGNÓSTICO"}</button>
        </div>
        <div className="lead-honeypot" aria-hidden><label htmlFor="company">Empresa</label><input id="company" name="company" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} /></div>
        <p id="lead-helper" className="lead-helper">Sem spam. Seus dados não incluem as respostas completas. Consulte a <Link href="/privacidade">Política de Privacidade</Link>.</p>
        {status === "error" && <p id="lead-error" className="lead-error" role="alert">Não foi possível salvar agora. Você ainda pode continuar para sua recomendação.</p>}
        <button className="lead-skip" type="button" onClick={skip}>Agora não, ver recomendação</button>
      </form>
    </> : <div className="lead-success" aria-live="polite">
      {status === "saved" && <span><Check size={18} /> Diagnóstico salvo</span>}
      <h2 id="lead-capture-title">Sua recomendação já está pronta.</h2>
      <p>Veja como transformar o ponto identificado em uma estrutura prática para o dia a dia.</p>
      <a href={landingPageUrl} className="button primary button-large" onClick={() => track("cta_clicked", { ctaLabel: "Ver minha recomendação", ctaLocation: "result_lead_capture", primaryBlocker: result.primaryBlocker })}>
        VER MINHA RECOMENDAÇÃO <ArrowRight size={17} />
      </a>
    </div>}
  </section>;
}
