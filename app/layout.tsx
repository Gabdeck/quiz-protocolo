import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { AnalyticsScripts } from "@/src/components/shared/AnalyticsScripts";

const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const sans = Manrope({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://protocolo-evolucao.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Diagnóstico de Evolução | Descubra o que está travando seu progresso", template: "%s | Protocolo da Evolução" },
  description: "Analise sua rotina, execução, disciplina e metas e descubra qual pilar mais interfere na sua evolução atual.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { type: "website", locale: "pt_BR", title: "Diagnóstico de Evolução", description: "Descubra qual pilar mais interfere na sua evolução atual.", images: [{ url: "/og.png", width: 1730, height: 909, alt: "Diagnóstico de Evolução: clareza para seu próximo passo" }] },
  twitter: { card: "summary_large_image", title: "Diagnóstico de Evolução", description: "Descubra qual pilar mais interfere na sua evolução atual.", images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${display.variable} ${sans.variable}`}>{children}<AnalyticsScripts /></body></html>;
}
