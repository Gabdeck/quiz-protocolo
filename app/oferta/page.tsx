import type { Metadata } from "next";
import { OfferPage } from "@/src/components/landing/OfferPage";

export const metadata: Metadata = { title: "Protocolo da Evolução", description: "Cinco Planos de Execução conectados para organizar sua rotina, agir e construir continuidade." };
export default function Offer() { return <OfferPage />; }
