"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Brand, Footer } from "@/src/components/shared/Brand";
import { faqs } from "@/src/content/landing";
import { prices, products } from "@/src/content/products";
import { offerSecondLine } from "@/src/domain/quiz/personalization";
import type { Pillar, QuizSession } from "@/src/domain/quiz/types";
import { pillarLabels } from "@/src/content/quiz";
import { track } from "@/src/lib/analytics";
import { loadSession } from "@/src/lib/storage/session";
import { buildCheckoutUrl } from "@/src/lib/validation/checkout";
import { PlanMockup } from "./PlanMockup";

const benefits = [
  ["Clareza", "Escolha o que merece atenção agora."],
  ["Ação", "Reduza tarefas até elas caberem no dia real."],
  ["Continuidade", "Retome sem transformar falha em abandono."],
  ["Direção", "Conecte rotina, metas e revisão em um sistema."],
];

export function OfferPage() {
  const [session, setSession] = useState<QuizSession>();
  const [checkoutError, setCheckoutError] = useState(false);

  useEffect(() => {
    const stored = loadSession();
    queueMicrotask(() => setSession(stored));
    track("offer_viewed", { primaryBlocker: stored.result?.primaryBlocker, hasDiagnostic: Boolean(stored.result) });
  }, []);

  const pillar: Pillar = session?.result?.primaryBlocker ?? "organization";

  const checkout = (ctaType: string) => {
    track("cta_clicked", { product: "completeProtocol", ctaType, primaryBlocker: pillar });
    const url = buildCheckoutUrl("completeProtocol", session?.utms ?? {});
    if (!url) {
      setCheckoutError(true);
      return;
    }
    track("checkout_redirected", { product: "completeProtocol", utms: session?.utms ?? {} });
    window.location.assign(url);
  };

  const checkoutCta = (location: string) => <button className="button primary button-large offer-checkout-button" onClick={() => checkout(location)}>
    QUERO O PROTOCOLO COMPLETO <ArrowRight size={17} />
  </button>;

  return <main className="offer-page offer-v2">
    <header className="site-header offer-header-v2">
      <Brand />
      <nav aria-label="Navegação da oferta"><a href="#planos">Os cinco Planos</a><a href="#oferta">Oferta</a></nav>
    </header>

    <section className="offer-hero-v2">
      <div className="offer-hero-copy">
        <span className="eyebrow">CONTINUAÇÃO DA SUA ANÁLISE</span>
        <h1>Transforme clareza em uma forma prática de continuar.</h1>
        <p>{offerSecondLine[pillar]}</p>
        <a href="#oferta" className="button primary button-large" onClick={() => track("cta_clicked", { ctaType: "offer_hero_anchor", primaryBlocker: pillar })}>
          CONHECER O PROTOCOLO <ArrowRight size={17} />
        </a>
      </div>
      <div className="offer-hero-product">
        <div className="diagnostic-continuity"><span>Seu ponto de partida</span><strong>{pillarLabels[pillar]}</strong></div>
        <PlanMockup />
      </div>
    </section>

    <section className="protocol-intro-v2" id="planos">
      <div className="protocol-statement">
        <span>Protocolo da Evolução</span>
        <h2>Cinco Planos. Uma sequência lógica.</h2>
        <p>Organização, ação, metas e disciplina trabalhadas na ordem certa, sem exigir mudança total de uma vez.</p>
      </div>
      <div className="plans-list-v2">
        {products.map((product) => <article key={product.key}>
          <span>{product.number}</span>
          <div><h3>{product.name}</h3><p>{product.promise}</p></div>
          <ul>{product.contents.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
        </article>)}
      </div>
    </section>

    <section className="benefits-v2">
      <header><h2>O que o sistema ajuda você a construir.</h2></header>
      <div>{benefits.map(([title, body], index) => <article key={title} className={index === 0 || index === 3 ? "featured" : ""}>
        <span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p>
      </article>)}</div>
    </section>

    <section className="offer-pricing-v2" id="oferta">
      <div className="offer-pricing-copy">
        <span className="eyebrow">ACESSO COMPLETO</span>
        <h2>Uma estrutura completa por um único investimento.</h2>
        <p>Os cinco Planos trabalham juntos. Você começa pela base e avança sem depender de um novo recomeço.</p>
        <div className="offer-assurance"><ShieldCheck size={26} /><div><b>7 dias de garantia</b><span>Avalie os materiais dentro das condições da plataforma de pagamento.</span></div></div>
      </div>
      <div className="offer-card-v2">
        <span>PROTOCOLO COMPLETO</span>
        <h3>Protocolo da Evolução</h3>
        <p>De <s>{prices.separateTotal}</s> por</p>
        <strong>{prices.complete}</strong>
        <small>pagamento único</small>
        <ul><li><Check size={16} />Cinco Planos de Execução</li><li><Check size={16} />Acesso digital imediato</li><li><Check size={16} />Sem mensalidade</li><li><Check size={16} />Garantia de 7 dias</li></ul>
        {checkoutCta("offer_pricing")}
        <p className="checkout-note">Checkout seguro. Acesso enviado após confirmação.</p>
      </div>
    </section>

    <section className="faq-v2">
      <header><h2>Dúvidas antes de começar.</h2></header>
      <div>{faqs.slice(0, 4).map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden>+</span></summary><p>{answer}</p></details>)}</div>
    </section>

    <section className="offer-final-v2">
      <span>Seu próximo passo</span>
      <h2>Comece pelo ponto certo. Continue com estrutura.</h2>
      <p>Use sua análise como direção e os cinco Planos como caminho prático.</p>
      {checkoutCta("offer_final")}
      <small>{prices.complete}, pagamento único, acesso digital e 7 dias de garantia.</small>
    </section>

    <Footer />

    {checkoutError && <div className="checkout-alert" role="alert">
      <button aria-label="Fechar aviso" onClick={() => setCheckoutError(false)}>×</button>
      <b>Checkout ainda não configurado.</b>
      <p>Adicione a URL real antes de publicar a campanha.</p>
    </div>}
  </main>;
}
