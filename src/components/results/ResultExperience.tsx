"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ClipboardCheck,
  ListChecks,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";
import { blockerLabels, buildPersonalizedReport } from "@/src/domain/quiz/personalization";
import type { DiagnosticPillar, QuizSession } from "@/src/domain/quiz/types";
import { track } from "@/src/lib/analytics";
import { loadSession } from "@/src/lib/storage/session";
import { Brand } from "@/src/components/shared/Brand";
import { buildResultPresentation } from "./resultPresentation";
import { LeadCapture } from "./LeadCapture";

const processingSteps = [
  "Analisando suas respostas",
  "Identificando o padrão predominante",
  "Preparando seu diagnóstico",
];

const pillars: DiagnosticPillar[] = ["organization", "execution", "discipline"];

export function ResultExperience() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession>();
  const [processing, setProcessing] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const stored = loadSession();
    if (!stored.result) {
      router.replace("/diagnostico");
      return;
    }
    queueMicrotask(() => setSession(stored));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intervalMs = reduce ? 60 : 500;
    const timer = window.setInterval(
      () => setActiveStep((current) => Math.min(current + 1, processingSteps.length - 1)),
      intervalMs,
    );
    const done = window.setTimeout(() => {
      window.clearInterval(timer);
      setProcessing(false);
      track("result_viewed", { primaryBlocker: stored.result?.primaryBlocker, subpattern: stored.result?.primarySubpattern ?? "generic", resistanceBand: stored.result?.resistanceBand });
    }, reduce ? 180 : 1500);
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
      <small>Leitura educativa baseada somente nas respostas fornecidas.</small>
    </section>
  </main>;

  const result = session.result;
  const report = buildPersonalizedReport(result);
  const presentation = buildResultPresentation(result);
  const primaryLabel = blockerLabels[result.primaryBlocker];

  return <main className="result-page report-page report-visual">
    <header className="site-header report-header">
      <Brand />
      <span className="header-note report-status"><ShieldCheck size={16} /> Análise concluída</span>
    </header>

    <article className="report-shell report-visual-shell">
      <header className="report-visual-hero">
        <div>
          <span className="eyebrow">SEU DIAGNÓSTICO DE EVOLUÇÃO</span>
          <h1><HighlightedBlocker text={report.revelation} blocker={primaryLabel} /></h1>
          <p>{report.explanation}</p>
        </div>
        <aside className="report-evidence" aria-label="Análise baseada em 9 perguntas">
          <ClipboardCheck size={25} />
          <span>Análise baseada em</span>
          <strong>9 perguntas</strong>
        </aside>
      </header>

      <details className="report-pillar-card">
        <summary><span><b>Seus 3 pilares</b><small>Quanto maior a pontuação, maior a resistência.</small></span><strong>{primaryLabel}: {result.pillarScores[result.primaryBlocker]}/9</strong></summary>
        <div className="report-pillar-list">
          {pillars.map((pillar) => <PillarScore key={pillar} pillar={pillar} score={result.pillarScores[pillar]} primary={pillar === result.primaryBlocker} />)}
        </div>
      </details>

      <section className="report-pattern-card report-analysis-card" aria-labelledby="pattern-title">
        <div className="report-card-copy">
          <span>O padrão que mais apareceu</span>
          <h2 id="pattern-title">{presentation.name}</h2>
          <p>{report.pattern}</p>
        </div>
        <div className="report-cycle" aria-label={`Ciclo identificado: ${presentation.cycle.join(", ")}`}>
          {presentation.cycle.map((step, index) => <div className="report-cycle-item" key={step}>
            <b>{step}</b>
            {index < presentation.cycle.length - 1 && <ArrowRight size={18} aria-hidden />}
          </div>)}
        </div>
      </section>

      <section className="report-consequence-card report-analysis-card" aria-labelledby="consequence-title">
        <div className="report-card-icon"><AlertTriangle size={25} /></div>
        <div>
          <h2 id="consequence-title">Por que isso merece atenção</h2>
          <p>{report.consequence}</p>
        </div>
      </section>

      <section className="report-need-card report-analysis-card" aria-labelledby="need-title">
        <div className="report-card-icon report-need-icon"><Target size={28} /></div>
        <div className="report-need-copy">
          <span>O que você precisa agora</span>
          <h2 id="need-title">{presentation.needTitle}</h2>
          <p>{report.need}</p>
        </div>
        <ul>
          {presentation.needBenefits.map((benefit) => <li key={benefit}><Check size={17} /> <span>{benefit}</span></li>)}
        </ul>
      </section>

      <section className="report-offer-bridge">
        <h2>{presentation.bridgeHeadline[0]} <em>{presentation.bridgeHeadline[1]}</em></h2>
        <p>{report.bridge}</p>
      </section>

      <LeadCapture session={session} />
    </article>
  </main>;
}

function HighlightedBlocker({ text, blocker }: { text: string; blocker: string }) {
  const index = text.lastIndexOf(blocker);
  if (index < 0) return text;
  return <>{text.slice(0, index)}<strong>{blocker}</strong>{text.slice(index + blocker.length)}</>;
}

function PillarScore({ pillar, score, primary }: { pillar: DiagnosticPillar; score: number; primary: boolean }) {
  return <article className={primary ? "is-primary" : undefined}>
    <div className="report-pillar-name">
      <PillarIcon pillar={pillar} />
      <h3>{blockerLabels[pillar]}</h3>
    </div>
    <div className="report-score-row">
      <div className="report-score-segments" aria-label={`${blockerLabels[pillar]}: ${score} de 9 pontos`}>
        {Array.from({ length: 9 }, (_, index) => <i className={index < score ? "filled" : undefined} key={index} />)}
      </div>
      <b>{score}<small>/9</small></b>
    </div>
    {primary && <span className="report-primary-tag">Maior resistência</span>}
  </article>;
}

function PillarIcon({ pillar }: { pillar: DiagnosticPillar }) {
  if (pillar === "organization") return <ListChecks size={20} aria-hidden />;
  if (pillar === "execution") return <Zap size={20} aria-hidden />;
  return <RefreshCcw size={20} aria-hidden />;
}
