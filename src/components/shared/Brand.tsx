import Link from "next/link";

export function Brand() {
  return <Link href="/" className="brand" aria-label="Protocolo da Evolução — início"><span className="brand-mark">P</span><span>PROTOCOLO <i>DA EVOLUÇÃO</i></span></Link>;
}

export function Footer() {
  const links = [
    ["Política de Privacidade", process.env.NEXT_PUBLIC_PRIVACY_URL || "/privacidade"],
    ["Termos de Uso", process.env.NEXT_PUBLIC_TERMS_URL || "/termos"],
    ["Contato", process.env.NEXT_PUBLIC_CONTACT_URL || "/contato"],
  ];
  return <footer className="footer"><Brand /><p>Análise educativa. Resultados dependem da realidade e aplicação de cada pessoa.</p><nav aria-label="Links legais">{links.map(([label, href]) => <a href={href} key={label}>{label}</a>)}</nav><small>© {new Date().getFullYear()} Protocolo da Evolução</small></footer>;
}
