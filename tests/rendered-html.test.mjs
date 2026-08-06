import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the diagnostic intro", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Diagnóstico de Evolução/);
  assert.match(html, /Descubra quais padrões estão/);
  assert.match(html, /COMEÇAR MINHA ANÁLISE/);
  assert.match(html, /Organização/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("server-renders the integrated offer", async () => {
  const response = await render("/oferta");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Protocolo da Evolução/);
  assert.match(html, /R\$27,00/);
  assert.match(html, /Vida em Ordem/);
  assert.match(html, /7 dias/);
});
