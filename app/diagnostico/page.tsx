import type { Metadata } from "next";
import { QuizFlow } from "@/src/components/quiz/QuizFlow";

export const metadata: Metadata = { title: "Diagnóstico", robots: { index: false, follow: true } };
export default function DiagnosticPage() { return <QuizFlow />; }
