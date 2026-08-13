import Image from "next/image";
import { landingConfig } from "@/src/content/landing";

export function SocialProofSection() {
  const testimonials = landingConfig.testimonials.filter((item) => item.consentRecorded);
  if (!testimonials.length) return null;

  return <section className="social-proof-section" aria-labelledby="social-proof-title">
    <header><h2 id="social-proof-title">O que mudou na prática.</h2></header>
    <div className="social-proof-list">
      {testimonials.map((item) => <figure key={`${item.name}-${item.source}`}>
        {item.image && <Image src={item.image} alt="Registro real da experiência com o Protocolo" width={720} height={480} unoptimized />}
        <blockquote>“{item.text}”</blockquote>
        <figcaption><strong>{item.name}</strong><span>{item.context}</span></figcaption>
      </figure>)}
    </div>
  </section>;
}
