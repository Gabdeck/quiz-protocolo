import assert from "node:assert/strict";
import test from "node:test";
import { quizQuestions } from "../src/content/quiz.ts";
import { buildPersonalizedReport } from "../src/domain/quiz/personalization.ts";
import { calculateResult } from "../src/domain/quiz/scoring.ts";

const answersWith = (organization: number, execution: number, discipline: number, direction: number) => {
  const scores = { organization, execution, discipline, direction };
  return Object.fromEntries(quizQuestions.map((question) => [question.id, question.options[scores[question.pillar]].id]));
};

test("monta todas as seções do relatório para cada bloqueio principal", () => {
  const cases = [
    answersWith(3, 1, 0, 0),
    answersWith(0, 3, 1, 0),
    answersWith(0, 1, 3, 0),
    answersWith(0, 0, 1, 3),
  ];

  for (const answers of cases) {
    const result = calculateResult(answers);
    const report = buildPersonalizedReport(result, "consistency", "often");
    assert.ok(report.summary.length > 80);
    assert.ok(report.primaryBlocker.length > 100);
    assert.ok(report.secondaryBlocker.length > 100);
    assert.ok(report.routineImpact.length > 100);
    assert.ok(report.consequences.length > 150);
    assert.ok(report.strengths.length > 100);
    assert.ok(report.initialRecommendation.length > 150);
  }
});

test("relatório preserva desempate e personaliza dor declarada", () => {
  const result = calculateResult(answersWith(2, 2, 2, 2));
  const report = buildPersonalizedReport(result, "time", "past");
  assert.equal(result.primaryBlocker, "discipline");
  assert.match(report.summary, /tempo passando/i);
  assert.match(report.routineImpact, /já viveu esse ciclo/i);
});
