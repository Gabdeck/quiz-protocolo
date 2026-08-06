import type { Metadata } from "next";
import { ResultExperience } from "@/src/components/results/ResultExperience";

export const metadata: Metadata = { title: "Sua análise", robots: { index: false, follow: false, noarchive: true } };
export default function ResultPage() { return <ResultExperience />; }
