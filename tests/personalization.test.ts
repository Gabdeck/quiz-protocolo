import assert from "node:assert/strict";
import test from "node:test";
import { quizQuestions } from "../src/content/quiz.ts";
import { buildOfferPersonalization, buildPersonalizedReport } from "../src/domain/quiz/personalization.ts";
import { calculateResult } from "../src/domain/quiz/scoring.ts";
import { buildResultPresentation } from "../src/components/results/resultPresentation.ts";
import type { DiagnosticPillar, QuizAnswers, Subpattern } from "../src/domain/quiz/types.ts";

const answersFor = (scores: Record<DiagnosticPillar, number>): QuizAnswers => Object.fromEntries(quizQuestions.map((question) => [question.id, question.options[scores[question.stage]].id]));

test("gera relatório proporcional para cada bloqueio", () => {
  const cases = [
    answersFor({ organization: 3, execution: 1, discipline: 0 }),
    answersFor({ organization: 0, execution: 3, discipline: 1 }),
    answersFor({ organization: 0, execution: 1, discipline: 3 }),
  ];
  for (const answers of cases) {
    const report = buildPersonalizedReport(calculateResult(answers));
    assert.ok(report.revelation.length > 30);
    assert.ok(report.explanation.length > 60);
    assert.match(report.pattern, /padrão|vulnerabilidade/i);
    assert.match(report.need, /você precisa/i);
    assert.match(report.bridge, /Protocolo da Evolução/);
  }
});

test("faixa inferida modula por que isso importa", () => {
  const low = buildPersonalizedReport(calculateResult(answersFor({ organization: 0, execution: 0, discipline: 0 })));
  const severe = buildPersonalizedReport(calculateResult(answersFor({ organization: 3, execution: 3, discipline: 3 })));
  assert.match(low.consequence, /custo parece mais contido/i);
  assert.match(severe.consequence, /se o padrão continuar/i);
  assert.doesNotMatch(severe.consequence, /garant|inevitável|sempre/i);
});

test("bloqueio secundário aparece somente quando próximo", () => {
  const close = buildPersonalizedReport(calculateResult(answersFor({ organization: 2, execution: 2, discipline: 0 })));
  const distant = buildPersonalizedReport(calculateResult(answersFor({ organization: 3, execution: 0, discipline: 0 })));
  assert.match(close.explanation, /aparece próxima/i);
  assert.doesNotMatch(distant.explanation, /aparece próxima/i);
});

test("landing continua a conversa usando bloqueio e subpadrão", () => {
  const answers = answersFor({ organization: 0, execution: 3, discipline: 0 });
  answers.p4 = "p4-3";
  answers.p6 = "p6-3";
  const result = calculateResult(answers);
  const offer = buildOfferPersonalization(result);
  assert.equal(result.primarySubpattern, "pressure_dependence");
  assert.match(offer.hero, /pressão/i);
  assert.match(offer.startingPoint, /Execução/i);
});

test("apresentação visual cobre pilares e os nove subpadrões", () => {
  const expected: Record<Subpattern, string> = {
    dispersion: "Dispersão", urgency_reactivity: "Reatividade à urgência", unclear_next_step: "Falta de próximo passo",
    postponement: "Adiamento", escape_productivity: "Produtividade de fuga", pressure_dependence: "Dependência de pressão",
    loss_of_rhythm: "Perda de ritmo", all_or_nothing: "Tudo ou nada", recurring_restart: "Recomeço recorrente",
  };
  const base = calculateResult(answersFor({ organization: 0, execution: 0, discipline: 3 }));
  for (const [subpattern, name] of Object.entries(expected) as Array<[Subpattern, string]>) {
    const presentation = buildResultPresentation({ ...base, primarySubpattern: subpattern });
    assert.equal(presentation.name, name);
    assert.equal(presentation.cycle.length, 4);
    assert.equal(presentation.needBenefits.length, 3);
  }
});
