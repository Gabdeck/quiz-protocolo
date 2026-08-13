import assert from "node:assert/strict";
import test from "node:test";
import { quizQuestions } from "../src/content/quiz.ts";
import { calculateResult, classifySubpattern, getNeedLevel, getResistanceBand } from "../src/domain/quiz/scoring.ts";
import { buildCheckoutUrl, buildConfiguredCheckoutUrl, isValidCheckoutUrl } from "../src/lib/validation/checkout.ts";
import { captureTracking, migrateLegacySession, parseSession } from "../src/lib/storage/session.ts";

const answersAt = (index: number) => Object.fromEntries(quizQuestions.map((question) => [question.id, question.options[index].id]));

test("usa exatamente nove perguntas, três por pilar", () => {
  assert.equal(quizQuestions.length, 9);
  for (const pillar of ["organization", "execution", "discipline"] as const) {
    assert.equal(quizQuestions.filter((question) => question.stage === pillar).length, 3);
  }
});

test("calcula os três pilares entre zero e nove", () => {
  const stable = calculateResult(answersAt(0));
  const severe = calculateResult(answersAt(3));
  assert.equal(stable.diagnosticScore, 0);
  assert.deepEqual(stable.pillarScores, { organization: 0, execution: 0, discipline: 0 });
  assert.equal(severe.diagnosticScore, 27);
  assert.deepEqual(severe.pillarScores, { organization: 9, execution: 9, discipline: 9 });
});

test("classifica as quatro faixas de resistência nas fronteiras", () => {
  assert.equal(getResistanceBand(0), "low");
  assert.equal(getResistanceBand(6), "low");
  assert.equal(getResistanceBand(7), "moderate");
  assert.equal(getResistanceBand(13), "moderate");
  assert.equal(getResistanceBand(14), "high");
  assert.equal(getResistanceBand(20), "high");
  assert.equal(getResistanceBand(21), "very_high");
  assert.equal(getResistanceBand(27), "very_high");
});

test("aplica desempate determinístico", () => {
  const result = calculateResult(answersAt(2));
  assert.equal(result.primaryBlocker, "discipline");
  assert.equal(result.secondaryBlocker, "execution");
});

test("classifica subpadrões por evidência e usa fallback abaixo do limiar", () => {
  const answers = answersAt(0);
  answers.p4 = "p4-2";
  assert.equal(classifySubpattern("execution", answers), "escape_productivity");
  answers.p4 = "p4-0";
  answers.p5 = "p5-1";
  assert.equal(classifySubpattern("execution", answers), null);
});

test("cobre os nove subpadrões planejados", () => {
  const cases = [
    ["organization", "p1", "p1-3", "dispersion"], ["organization", "p2", "p2-2", "urgency_reactivity"], ["organization", "p3", "p3-3", "unclear_next_step"],
    ["execution", "p5", "p5-3", "postponement"], ["execution", "p4", "p4-2", "escape_productivity"], ["execution", "p4", "p4-3", "pressure_dependence"],
    ["discipline", "p7", "p7-2", "loss_of_rhythm"], ["discipline", "p8", "p8-3", "all_or_nothing"], ["discipline", "p7", "p7-3", "recurring_restart"],
  ] as const;
  for (const [pillar, questionId, optionId, expected] of cases) {
    const answers = answersAt(0);
    answers[questionId] = optionId;
    assert.equal(classifySubpattern(pillar, answers), expected);
  }
});

test("calibra níveis internos pela força dos pilares", () => {
  assert.equal(getNeedLevel(2, 5), "strengthening");
  assert.equal(getNeedLevel(5, 13), "structuring");
  assert.equal(getNeedLevel(8, 20), "correction");
});

test("recusa resposta ausente", () => assert.throws(() => calculateResult({}), /p1/));
test("aceita somente parâmetros permitidos", () => assert.deepEqual(captureTracking("?utm_source=instagram&email=x%40x.com&manychat=abc"), { utm_source: "instagram", manychat: "abc" }));
test("valida URLs seguras", () => { assert.equal(isValidCheckoutUrl("https://checkout.example.com/x"), true); assert.equal(isValidCheckoutUrl("javascript:alert(1)"), false); });
test("retorna null quando checkout não foi configurado", () => assert.equal(buildCheckoutUrl("completeProtocol", { utm_source: "instagram" }), null));
test("propaga UTMs para checkout configurado", () => assert.equal(buildConfiguredCheckoutUrl("https://checkout.example.com/buy?offer=1", { utm_source: "instagram", manychat: "abc" }), "https://checkout.example.com/buy?offer=1&utm_source=instagram&manychat=abc"));
test("restaura v3 e migra somente rastreamento de versões antigas", () => {
  assert.equal(parseSession(JSON.stringify({ version: 3, answers: { p1: "p1-2" }, currentStep: 4, utms: {} })).currentStep, 4);
  assert.deepEqual(parseSession("{inválido"), { version: 3, answers: {}, currentStep: 0, utms: {} });
  assert.deepEqual(migrateLegacySession(JSON.stringify({ version: 2, answers: { p1: "p1-3" }, currentStep: 9, utms: { utm_source: "meta" }, source: "https://example.com" })), {
    version: 3, answers: {}, currentStep: 0, utms: { utm_source: "meta" }, source: "https://example.com",
  });
});
