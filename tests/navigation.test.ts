import assert from "node:assert/strict";
import test from "node:test";
import { quizQuestions } from "../src/content/quiz.ts";
import { advanceIfCurrent, persistAnswer, previousSessionStep } from "../src/domain/quiz/navigation.ts";
import type { QuizSession } from "../src/domain/quiz/types.ts";

const session = (): QuizSession => ({ version: 3, answers: {}, currentStep: 0, utms: {} });

test("persiste resposta antes de avançar", () => {
  const answered = persistAnswer(session(), "p1", "p1-2");
  assert.equal(answered.currentStep, 0);
  assert.equal(answered.answers.p1, "p1-2");
  const advanced = advanceIfCurrent(answered, 0, 10);
  assert.equal(advanced.currentStep, 1);
  assert.equal(advanced.answers.p1, "p1-2");
});

test("ignora avanço pendente quando etapa mudou", () => {
  const current = { ...session(), currentStep: 3 };
  assert.equal(advanceIfCurrent(current, 2, 10), current);
});

test("voltar preserva respostas e respeita início", () => {
  const answered = { ...persistAnswer(session(), "p1", "p1-1"), currentStep: 2 };
  assert.equal(previousSessionStep(answered).currentStep, 1);
  assert.equal(previousSessionStep(answered).answers.p1, "p1-1");
  assert.equal(previousSessionStep(session()).currentStep, 0);
});

test("todas perguntas preservam IDs, títulos mobile e avanço automático", () => {
  assert.equal(quizQuestions.length, 9);
  quizQuestions.forEach((question, index) => {
    assert.equal(question.id, `p${index + 1}`);
    assert.ok(question.mobileTitle.length > 10);
    assert.ok(question.icon);
    assert.equal(question.interaction, "single-auto");
    question.options.forEach((option, optionIndex) => assert.equal(option.id, `p${index + 1}-${optionIndex}`));
  });
});
