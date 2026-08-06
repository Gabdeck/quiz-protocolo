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
    saveSession({ ...session, utms, source: document.referrer || session.source });
    track("diagnostic_view", { utms });
  }, []);
  return <main className="intro-page">
    <header className="site-header"><Brand /><span className="header-note">Diagnóstico gratuito · 3 min</span></header>
    <section className="intro-hero">
      <div className="intro-copy">
        <span className="eyebrow"><span className="status-dot" /> ANÁLISE PERSONALIZADA</span>
        <h1>Descubra quais padrões estão <em>impedindo sua evolução.</em></h1>
        <p className="lead">Em menos de 3 minutos, vamos analisar como sua rotina, execução, disciplina e metas têm afetado seu progresso.</p>
        <div className="benefit-grid">
          {["Análise dos quatro pilares", "Principal bloqueio identificado", "Recomendação de próximo passo", "Resultado imediato"].map((item, i) => <div key={item}><span>0{i + 1}</span>{item}</div>)}
        </div>
        <Link href="/diagnostico" className="button primary button-large" onClick={() => track("diagnostic_started")}>COMEÇAR MINHA ANÁLISE <span aria-hidden>↗</span></Link>
        <p className="microcopy">Rápido, gratuito e sem necessidade de cadastro.</p>
      </div>
      <aside className="diagnostic-card" aria-label="Os quatro pilares analisados">
        <div className="card-orbit"><span>DIAGNÓSTICO</span><strong>4</strong><small>PILARES</small></div>
        <div className="pillar-list">
          {["Organização", "Execução", "Disciplina", "Direção"].map((item, i) => <div key={item}><span>{String(i + 1).padStart(2, "0")}</span><b>{item}</b><i /></div>)}
        </div>
        <p>Uma leitura clara do seu momento atual, sem respostas certas ou erradas.</p>
      </aside>
    </section>
    <div className="intro-notice"><span>ANTES DE COMEÇAR</span><p>Responda considerando como você realmente tem vivido nas últimas semanas, não como gostaria de estar vivendo.</p></div>
  </main>;
}
