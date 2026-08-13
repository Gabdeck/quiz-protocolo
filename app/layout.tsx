import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AnalyticsScripts } from "@/src/components/shared/AnalyticsScripts";

const sans = Manrope({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://protocolo-evolucao.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Diagnóstico de Evolução | Descubra o que está travando seu progresso", template: "%s | Protocolo da Evolução" },
  description: "Analise sua rotina, execução, disciplina e metas e descubra qual pilar mais interfere na sua evolução atual.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { type: "website", locale: "pt_BR", title: "Diagnóstico de Evolução", description: "Descubra o padrão que mais atrasa seu progresso.", images: [{ url: "/og-v3.png", width: 1672, height: 941, alt: "Protocolo da Evolução: descubra o padrão que mais atrasa seu progresso" }] },
  twitter: { card: "summary_large_image", title: "Diagnóstico de Evolução", description: "Descubra o padrão que mais atrasa seu progresso.", images: ["/og-v3.png"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={sans.variable}>{children}<AnalyticsScripts /></body></html>;
}
