"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pillarLabels } from "@/src/content/quiz";
import { blockerCopy, identificationCopy, painCopy } from "@/src/domain/quiz/personalization";
import { pillarStructure } from "@/src/domain/quiz/scoring";
import type { QuizSession } from "@/src/domain/quiz/types";
import { track } from "@/src/lib/analytics";
import { loadSession } from "@/src/lib/storage/session";
import { Brand } from "@/src/components/shared/Brand";

const messages = ["Calculando sua pontuação", "Comparando seus quatro pilares", "Identificando seu principal bloqueio", "Preparando sua recomendação", "Concluindo sua análise"];

export function ResultExperience() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession>();
  const [processing, setProcessing] = useState(true);
  const [message, setMessage] = useState(0);
  useEffect(() => {
    const stored = loadSession();
    if (!stored.result || !stored.mainPainAnswer || !stored.identificationAnswer) { router.replace("/diagnostico"); return; }
    queueMicrotask(() => setSession(stored));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 250 : 800;
    const timer = window.setInterval(() => setMessage((m) => Math.min(m + 1, messages.length - 1)), duration);
    const done = window.setTimeout(() => { window.clearInterval(timer); setProcessing(false); track("result_viewed", { band: stored.result?.band.title, primaryBlocker: stored.result?.primaryBlocker }); }, reduce ? 1200 : 4200);
    return () => { window.clearTimeout(done); window.clearInterval(timer); };
  }, [router]);
  if (!session?.result) return <main className="result-page"><div className="loading-line" /></main>;
  if (processing) return <main className="processing-page"><Brand /><section><div className="processing-seal"><span>ANALISANDO</span><i /></div><span className="eyebrow">SUAS RESPOSTAS FORAM REGISTRADAS</span><h1>Preparando sua análise.</h1><p aria-live="polite">{messages[message]}…</p><div className="processing-track"><i style={{ width: `${((message + 1) / messages.length) * 100}%` }} /></div><small>Esta análise é educativa e baseada somente nas respostas fornecidas.</small></section></main>;

  const result = session.result;
  return <main className="result-page">
    <header className="site-header"><Brand /><span className="header-note">Análise concluída</span></header>
    <section className="result-hero"><span className="eyebrow">SEU DIAGNÓSTICO DE EVOLUÇÃO</span><h1>Sua análise está <em>pronta.</em></h1><p>{painCopy[session.mainPainAnswer!]}</p></section>
    <section className="score-section surface"><div className="score-ring" style={{ "--score": `${result.structureScore * 3.6}deg` } as React.CSSProperties}><div><strong>{result.structureScore}</strong><span>DE 100</span></div></div><div><span className="section-label">NÍVEL DE ESTRUTURA ATUAL</span><h2>{result.band.title}</h2><p>{result.band.description}</p><small>Indicador educativo, não científico ou clínico.</small></div></section>
    <section className="result-map"><div className="section-heading"><span className="eyebrow">MAPA DOS QUATRO PILARES</span><h2>Onde sua estrutura está mais firme — e onde pede atenção.</h2><p>Barras maiores indicam estrutura mais estável.</p></div><div className="pillar-bars">{(Object.keys(result.pillarScores) as Array<keyof typeof result.pillarScores>).map((pillar) => { const value = pillarStructure(result.pillarScores[pillar]); return <div key={pillar}><div><b>{pillarLabels[pillar]}</b><span>{value} de 100</span></div><div className="bar"><i style={{ width: `${value}%` }} /></div></div>; })}</div></section>
    <section className="insight-grid"><article className="insight primary-insight"><span>01 · PRINCIPAL BLOQUEIO</span><h2>{pillarLabels[result.primaryBlocker]}</h2><p>{blockerCopy[result.primaryBlocker]}</p></article><article className="insight"><span>02 · SEGUNDO PONTO DE ATENÇÃO</span><h2>{pillarLabels[result.secondaryBlocker]}</h2><p>{blockerCopy[result.secondaryBlocker]}</p></article><article className="insight stable"><span>BASE MAIS ESTÁVEL</span><h2>{pillarLabels[result.strongestPillar]}</h2><p>Este pilar apresenta sua estrutura mais estável hoje. Use o que já funciona nele como apoio para fortalecer os demais, sem exigir perfeição.</p></article></section>
    <section className="identification-callout"><span className="quote-mark">“</span><p>{identificationCopy[session.identificationAnswer!]}</p></section>
    <section className="result-conclusion"><span className="eyebrow">O QUE SUA ANÁLISE MOSTRA</span><h2>Não é uma dificuldade isolada. É um sistema.</h2><p>Organização, execução, metas e disciplina funcionam como partes do mesmo sistema. Quando uma perde força, as outras também são afetadas. Por isso, tentar resolver apenas a procrastinação ou apenas a rotina costuma gerar mudanças temporárias.</p><Link href="/oferta" className="button primary button-large" onClick={() => track("cta_clicked", { ctaType: "result_recommendation" })}>VER O PLANO RECOMENDADO PARA MIM →</Link><small>Recomendação baseada no principal ponto identificado.</small></section>
  </main>;
}
