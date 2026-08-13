"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Brand } from "@/src/components/shared/Brand";
import { captureTracking, loadSession, saveSession } from "@/src/lib/storage/session";
import { track } from "@/src/lib/analytics";

export function Intro() {
  useEffect(() => {
    const session = loadSession();
    const utms = { ...session.utms, ...captureTracking(window.location.search) };
    const referrer = document.referrer && new URL(document.referrer).origin !== window.location.origin ? document.referrer : undefined;
    saveSession({ ...session, utms, source: session.source || referrer });
    track("diagnostic_view", { utms });
  }, []);
  return <main className="intro-page">
    <header className="site-header"><Brand /><span className="header-note">Diagnóstico gratuito</span></header>
    <section className="intro-hero">
      <div className="intro-copy">
        <span className="eyebrow">DIAGNÓSTICO PERSONALIZADO</span>
        <h1>Descubra o padrão que mais <em>atrasa seu progresso.</em></h1>
        <p className="lead">Entenda como organização, execução e continuidade influenciam o que você consegue sustentar no dia a dia.</p>
        <Link href="/diagnostico" className="button primary button-large" onClick={() => track("diagnostic_started", { funnelVersion: 3, quizVersion: 3 })}>COMEÇAR MEU DIAGNÓSTICO <span aria-hidden>→</span></Link>
        <p className="microcopy">9 perguntas. Cerca de 2 minutos.</p>
      </div>
    </section>
  </main>;
}
