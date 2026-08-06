import Link from "next/link";
import { Brand } from "./Brand";

export function LegalPlaceholder({ title }: { title: string }) {
  return <main className="legal-page"><Brand /><section className="surface legal-card"><span className="eyebrow">PÁGINA INFORMATIVA</span><h1>{title}</h1><p>Este conteúdo é um placeholder claramente identificado. Substitua esta página pelo documento jurídico ou canal oficial antes da publicação comercial definitiva.</p><Link className="button secondary" href="/">Voltar ao início</Link></section></main>;
}
