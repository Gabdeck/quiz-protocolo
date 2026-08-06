"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { pillarLabels } from "@/src/content/quiz";
import { buildPersonalizedReport } from "@/src/domain/quiz/personalization";
import { pillarStructure } from "@/src/domain/quiz/scoring";
import type { Pillar, QuizSession } from "@/src/domain/quiz/types";
import { track } from "@/src/lib/analytics";
import { loadSession } from "@/src/lib/storage/session";
import { Brand } from "@/src/components/shared/Brand";

const processingSteps = [
  "Calculando sua pontuação",
  "Comparando os quatro pilares",
  "Identificando os bloqueios centrais",
  "Preparando sua recomendação",
];

const pillars: Pillar[] = ["organization", "execution", "discipline", "direction"];

export function ResultExperience() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession>();
  const [processing, setProcessing] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const stored = loadSession();
    if (!stored.result || !stored.mainPainAnswer || !stored.identificationAnswer) {
      router.replace("/diagnostico");
      return;
    }
    queueMicrotask(() => setSession(stored));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setInterval(
      () => setActiveStep((current) => Math.min(current + 1, processingSteps.length - 1)),
      reduce ? 120 : 900,
    );
    const done = window.setTimeout(() => {
      window.clearInterval(timer);
      setProcessing(false);
      track("result_viewed", { band: stored.result?.band.title, primaryBlocker: stored.result?.primaryBlocker });
    }, reduce ? 600 : 4200);
    return () => {
      window.clearTimeout(done);
      window.clearInterval(timer);
    };
  }, [router]);

  if (!session?.result) return <main className="result-page"><div className="loading-line" /></main>;

  if (processing) return <main className="processing-page">
    <Brand />
    <section>
      <span className="eyebrow">RESPOSTAS REGISTRADAS</span>
      <h1>Preparando sua análise.</h1>
      <div className="processing-steps" aria-live="polite">
        {processingSteps.map((label, index) => <div className={index <= activeStep ? "active" : ""} key={label}>
          {index < activeStep ? <Check size={17} /> : index === activeStep ? <LoaderCircle className="step-spinner" size={17} /> : <span />}
          <b>{label}</b>
        </div>)}
      </div>
      <div className="processing-track" aria-label={`${Math.round(((activeStep + 1) / processingSteps.length) * 100)}% concluído`}>
        <i style={{ width: `${((activeStep + 1) / processingSteps.length) * 100}%` }} />
      </div>
      <small>Análise educativa baseada somente nas respostas fornecidas.</small>
    </section>
  </main>;

  const result = session.result;
  const report = buildPersonalizedReport(result, session.mainPainAnswer!, session.identificationAnswer!);

  return <main className="result-page report-page">
    <header className="site-header report-header"><Brand /><span className="header-note">Análise concluída</span></header>

    <article className="report-shell">
      <header className="report-intro">
        <div>
          <span className="eyebrow">SEU DIAGNÓSTICO DE EVOLUÇÃO</span>
          <h1>Um retrato da sua estrutura atual.</h1>
          <p>{report.summary}</p>
        </div>
        <div className="report-score" aria-label={`Nível de estrutura atual: ${result.structureScore} de 100`}>
          <div className="score-ring" style={{ "--score": `${result.structureScore * 3.6}deg` } as React.CSSProperties}>
            <div><strong>{result.structureScore}</strong><span>DE 100</span></div>
          </div>
          <div><span>NÍVEL DE ESTRUTURA</span><b>{result.band.title}</b><small>Indicador educativo</small></div>
        </div>
      </header>

      <section className="report-map" aria-labelledby="map-title">
        <div className="report-section-heading">
          <span>Mapa dos pilares</span>
          <h2 id="map-title">Onde seu progresso encontra resistência.</h2>
          <p>Quanto menor a estrutura, maior a necessidade de atenção naquele pilar.</p>
        </div>
        <div className="report-pillar-grid">
          {pillars.map((pillar) => {
            const value = pillarStructure(result.pillarScores[pillar]);
            const status = pillar === result.primaryBlocker ? "Principal bloqueio" : pillar === result.secondaryBlocker ? "Segundo bloqueio" : pillar === result.strongestPillar ? "Base mais estável" : "Ponto intermediário";
            return <article className={`report-pillar ${pillar === result.primaryBlocker ? "is-primary" : ""}`} key={pillar}>
              <span>{status}</span><strong>{value}</strong><h3>{pillarLabels[pillar]}</h3>
              <div aria-hidden><i style={{ width: `${value}%` }} /></div>
            </article>;
          })}
        </div>
      </section>

      <section className="report-findings" aria-label="Principais descobertas">
        <article className="report-finding report-finding-primary">
          <span>Principal bloqueio</span><h2>{pillarLabels[result.primaryBlocker]}</h2><p>{report.primaryBlocker}</p>
        </article>
        <article className="report-finding">
          <span>Segundo bloqueio</span><h2>{pillarLabels[result.secondaryBlocker]}</h2><p>{report.secondaryBlocker}</p>
        </article>
      </section>

      <section className="report-narrative">
        <article><span>Impacto na rotina</span><h2>Como esse padrão aparece no dia a dia.</h2><p>{report.routineImpact}</p></article>
        <article><span>Se nada mudar</span><h2>O custo tende a crescer em silêncio.</h2><p>{report.consequences}</p></article>
        <article className="report-strength"><span>Pontos fortes</span><h2>Existe uma base para começar.</h2><p>{report.strengths}</p></article>
        <article className="report-recommendation"><span>Recomendação inicial</span><h2>Seu primeiro movimento precisa ser específico.</h2><p>{report.initialRecommendation}</p></article>
      </section>

      <footer className="report-conclusion">
        <h2>Você não precisa corrigir tudo ao mesmo tempo.</h2>
        <p>Precisa trabalhar os pilares na ordem certa, com ações pequenas e uma estrutura capaz de sobreviver aos dias imperfeitos.</p>
        <Link href="/oferta" className="button primary button-large" onClick={() => track("cta_clicked", { ctaType: "result_protocol" })}>
          CONHECER O PROTOCOLO DA EVOLUÇÃO <ArrowRight size={17} />
        </Link>
        <small>Recomendação educativa baseada nas respostas fornecidas.</small>
      </footer>
    </article>
  </main>;
}
