import assert from "node:assert/strict";
import test from "node:test";
import { quizQuestions } from "../src/content/quiz.ts";
import { calculateResult, pillarStructure } from "../src/domain/quiz/scoring.ts";
import { buildCheckoutUrl, buildConfiguredCheckoutUrl, isValidCheckoutUrl } from "../src/lib/validation/checkout.ts";
import { captureTracking, parseSession } from "../src/lib/storage/session.ts";

const answersAt = (score: number) => Object.fromEntries(quizQuestions.map((q) => [q.id, q.options[score].id]));

test("calcula extremos e nível de estrutura", () => {
  assert.equal(calculateResult(answersAt(0)).totalScore, 0);
  assert.equal(calculateResult(answersAt(0)).structureScore, 100);
  assert.equal(calculateResult(answersAt(3)).totalScore, 36);
  assert.equal(calculateResult(answersAt(3)).structureScore, 0);
  assert.equal(pillarStructure(0), 100);
  assert.equal(pillarStructure(9), 0);
});

test("soma pilares e aplica desempate determinístico", () => {
  const result = calculateResult(answersAt(2));
  assert.deepEqual(result.pillarScores, { organization: 6, execution: 6, discipline: 6, direction: 6 });
  assert.equal(result.primaryBlocker, "discipline");
  assert.equal(result.secondaryBlocker, "execution");
});

test("recusa resposta ausente", () => assert.throws(() => calculateResult({}), /p1/));
test("aceita somente parâmetros permitidos", () => assert.deepEqual(captureTracking("?utm_source=instagram&email=x%40x.com&manychat=abc"), { utm_source: "instagram", manychat: "abc" }));
test("valida URLs seguras", () => { assert.equal(isValidCheckoutUrl("https://checkout.example.com/x"), true); assert.equal(isValidCheckoutUrl("javascript:alert(1)"), false); });
test("retorna null quando checkout não foi configurado", () => assert.equal(buildCheckoutUrl("completeProtocol", { utm_source: "instagram" }), null));
test("propaga UTMs permitidas para checkout configurado", () => assert.equal(buildConfiguredCheckoutUrl("https://checkout.example.com/buy?offer=1", { utm_source: "instagram", manychat: "abc" }), "https://checkout.example.com/buy?offer=1&utm_source=instagram&manychat=abc"));
test("restaura sessão válida e recupera sessão corrompida", () => {
  assert.equal(parseSession(JSON.stringify({ version: 1, answers: { p1: "p1-2" }, currentStep: 4, utms: {} })).currentStep, 4);
  assert.deepEqual(parseSession("{inválido"), { version: 1, answers: {}, currentStep: 0, utms: {} });
});
