"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { Brand, Footer } from "@/src/components/shared/Brand";
import { faqs, practicalBenefits } from "@/src/content/landing";
import { prices, products } from "@/src/content/products";
import { blockerLabels, buildOfferPersonalization } from "@/src/domain/quiz/personalization";
import type { DiagnosticPillar, QuizSession } from "@/src/domain/quiz/types";
import { track } from "@/src/lib/analytics";
import { loadSession } from "@/src/lib/storage/session";
import { buildCheckoutUrl } from "@/src/lib/validation/checkout";
import { PlanMockup } from "./PlanMockup";
import { SocialProofSection } from "./SocialProofSection";

const painByPillar: Record<DiagnosticPillar, { title: string; body: string }> = {
  organization: {
    title: "O problema não é fazer pouco. É deixar o que importa sem proteção.",
    body: "Quando cada demanda nova redefine o seu dia, esforço e avanço deixam de ser a mesma coisa. Seu próximo passo precisa sobreviver ao urgente.",
  },
  execution: {
    title: "Saber o que fazer não encurta sozinho a distância até começar.",
    body: "Quando o início depende de vontade ou pressão, tarefas importantes crescem antes de receber ação. Seu próximo passo precisa caber no momento atual.",
  },
  discipline: {
    title: "Uma interrupção não precisa apagar o progresso que já existe.",
    body: "Quando perder o ritmo vira recomeçar do zero, cada tentativa custa mais energia. Seu próximo passo precisa incluir uma forma simples de retomar.",
  },
};

export function OfferPage() {
  const [session, setSession] = useState<QuizSession>();
  const [checkoutError, setCheckoutError] = useState(false);

  useEffect(() => {
    const stored = loadSession();
    queueMicrotask(() => setSession(stored));
    track("offer_viewed", { primaryBlocker: stored.result?.primaryBlocker, subpattern: stored.result?.primarySubpattern ?? "generic", resistanceBand: stored.result?.resistanceBand, hasDiagnostic: Boolean(stored.result) });
  }, []);

  const pillar: DiagnosticPillar = session?.result?.primaryBlocker ?? "organization";
  const personalization = session?.result ? buildOfferPersonalization(session.result) : {
    hero: "Organize prioridades, transforme intenção em ação e continue mesmo quando o ritmo mudar.",
    startingPoint: "Uma estrutura prática para organizar, executar e continuar.",
  };

  const checkout = (ctaLocation: string) => {
    track("cta_clicked", { product: "completeProtocol", ctaLabel: "Ir para o checkout", ctaLocation, primaryBlocker: pillar });
    const url = buildCheckoutUrl("completeProtocol", session?.utms ?? {});
    if (!url) {
      setCheckoutError(true);
      return;
    }
    track("checkout_redirected", { product: "completeProtocol", utms: session?.utms ?? {} });
    window.location.assign(url);
  };

  return <main className="offer-page offer-v3">
    <header className="site-header offer-header-v3">
      <Brand />
      <a href="#preco">Ver oferta</a>
    </header>

    <section className="offer-hero-v3">
      <div className="offer-hero-copy-v3">
        <span className="eyebrow">CONTINUAÇÃO DO SEU DIAGNÓSTICO</span>
        <h1>Transforme seu ponto de resistência em um plano de avanço.</h1>
        <p>{personalization.hero}</p>
        <a href="#solucao" className="button primary button-large" onClick={() => track("cta_clicked", { ctaLabel: "Ver como funciona", ctaLocation: "offer_hero", primaryBlocker: pillar })}>
          VER COMO FUNCIONA <ArrowRight size={17} />
        </a>
      </div>
      <div className="offer-product-visual">
        <div className="diagnostic-continuity"><span>Seu ponto de partida</span><strong>{blockerLabels[pillar]}</strong></div>
        <PlanMockup />
        <p>Os cinco Planos do Protocolo, organizados em uma sequência única de aplicação.</p>
      </div>
    </section>

    <section className="offer-problem-v3">
      <span>O QUE O RESULTADO REVELOU</span>
      <h2>{painByPillar[pillar].title}</h2>
      <p>{painByPillar[pillar].body}</p>
    </section>

    <section className="offer-solution-v3" id="solucao">
      <header>
        <span>PROTOCOLO DA EVOLUÇÃO</span>
        <h2>Cinco Planos. Uma sequência para o dia real.</h2>
        <p>O Protocolo é um material digital e autoguiado que conecta Organização, Execução e Continuidade sem exigir uma mudança total de uma vez.</p>
      </header>
      <div className="module-list-v3">
        {products.map((product) => <article key={product.key}>
          <span>{product.number}</span>
          <div><h3>{product.name}</h3><p>{product.promise}</p></div>
          <ul>{product.contents.map((item) => <li key={item}><Check size={16} aria-hidden />{item}</li>)}</ul>
        </article>)}
      </div>
    </section>

    <section className="practical-benefits-v3">
      <header><span>BENEFÍCIOS PRÁTICOS</span><h2>O que muda quando existe uma estrutura.</h2></header>
      <ol>{practicalBenefits.map((benefit, index) => <li key={benefit}><span>{String(index + 1).padStart(2, "0")}</span><p>{benefit}</p></li>)}</ol>
    </section>

    <SocialProofSection />

    <section className="guarantee-v3">
      <div className="guarantee-seal-v3"><ShieldCheck size={36} aria-hidden /><strong>7 dias</strong></div>
      <div><span>GARANTIA SIMPLES</span><h2>Conheça o Protocolo com tempo para decidir.</h2><p>Você tem 7 dias para acessar o material. Se não fizer sentido para você, solicite o reembolso dentro desse prazo.</p></div>
    </section>

    <section className="pricing-v3" id="preco">
      <div className="pricing-copy-v3">
        <span>ACESSO COMPLETO</span>
        <h2>Comece pelo ponto certo. Continue com estrutura.</h2>
        <p>Receba os cinco Planos e use seu diagnóstico como direção para aplicar o sistema.</p>
        <ul><li><Check size={18} />Acesso após a confirmação</li><li><Check size={18} />Pagamento único</li><li><Check size={18} />Sem mensalidade</li></ul>
      </div>
      <div className="price-card-v3">
        <span>PROTOCOLO COMPLETO</span>
        <p>De <s>{prices.separateTotal}</s> por</p>
        <strong>{prices.complete}</strong>
        <small>pagamento único</small>
        <button className="button primary button-large" onClick={() => checkout("offer_pricing")}>IR PARA O CHECKOUT <ArrowRight size={17} /></button>
        <p className="checkout-trust"><LockKeyhole size={15} /> Checkout externo seguro. Garantia de 7 dias.</p>
      </div>
    </section>

    <section className="faq-v3">
      <header><span>FAQ</span><h2>Respostas rápidas antes de comprar.</h2></header>
      <div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden>+</span></summary><p>{answer}</p></details>)}</div>
    </section>

    <Footer />

    {checkoutError && <div className="checkout-alert" role="alert">
      <button aria-label="Fechar aviso" onClick={() => setCheckoutError(false)}>×</button>
      <b>Checkout ainda não configurado.</b>
      <p>Adicione a URL real antes de publicar a campanha.</p>
    </div>}
  </main>;
}
