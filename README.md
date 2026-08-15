# Diagnóstico de Evolução

Funil do **Protocolo da Evolução**: introdução, quiz de 9 perguntas, duas pausas de clareza, processamento, resultado personalizado, captura opcional de lead e redirecionamento para uma landing externa.

## Stack

- Next.js App Router via vinext, React 19 e TypeScript estrito
- Tailwind CSS 4 para pipeline de estilos; design próprio em `app/globals.css`
- Sessão local versionada e captura opcional de e-mail em Cloudflare D1
- Analytics desacoplado, compatível com `dataLayer` e Meta Pixel quando presentes
- Vitest para domínio e Node Test para renderização do build
- Build ESM compatível com Cloudflare Workers/Sites

## Rotas

- `/` — introdução do diagnóstico
- `/diagnostico` — perguntas, conscientizações e personalização
- `/resultado` — processamento e análise personalizada; `noindex`
- `/privacidade`, `/termos`, `/contato` — placeholders claramente marcados

## Estrutura principal

```text
app/                         rotas, metadados e estilos globais
src/components/quiz/         introdução e fluxo do diagnóstico
src/components/results/      processamento e resultado
src/content/                 perguntas e textos do diagnóstico
src/domain/quiz/             tipos, pontuação e personalização
src/lib/analytics/           eventos do funil
src/lib/storage/             sessão local versionada e UTMs
src/lib/validation/          validação da URL da landing externa
tests/                       testes unitários e de renderização
```

## Uso local

Requer Node.js `>=22.13.0`.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Validação completa:

```bash
npm run typecheck
npm run lint
npm test
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local`. Nenhum segredo deve usar prefixo `NEXT_PUBLIC_`; estas variáveis são públicas por definição.

- `NEXT_PUBLIC_SITE_URL`: URL canônica do site
- `LANDING_PAGE_URL`: URL completa da landing externa aberta após o diagnóstico
- `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`: identificadores opcionais de analytics
- `NEXT_PUBLIC_PRIVACY_URL`, `NEXT_PUBLIC_TERMS_URL`, `NEXT_PUBLIC_CONTACT_URL`: destinos legais reais

Sem uma URL válida, o resultado exibe um aviso claro e nunca envia o visitante para `#`. UTMs permitidas (`utm_*`, `ref`, `manychat`) são adicionadas à landing externa.

## Edição de conteúdo

- Perguntas e alternativas: `src/content/quiz.ts`. Pontuação continua explícita em cada alternativa.
- Faixas, cálculo e desempate: `src/domain/quiz/scoring.ts`. Desempate: disciplina, execução, organização, direção.
- Textos personalizados: `src/domain/quiz/personalization.ts`.
A imagem social do diagnóstico fica em `public/og.png`.

## Sessão e privacidade

A chave `protocolo-evolucao:session:v3` armazena respostas, etapa, resultado, horário aproximado e UTMs no dispositivo. O e-mail só é enviado ao D1 quando a pessoa escolhe salvar o diagnóstico; as respostas completas não são enviadas. Para limpar manualmente:

```js
localStorage.removeItem("protocolo-evolucao:session:v3")
```

O botão “Reiniciar análise” faz a mesma limpeza. Sessões inválidas ou de outra versão voltam ao estado inicial.

## Analytics

Eventos: `diagnostic_view`, `diagnostic_started`, `question_answered`, `awareness_viewed`, `diagnostic_completed`, `result_viewed`, `cta_clicked` e `diagnostic_restarted`.

Somente dados operacionais são emitidos: ID/índice, pilar, pontuação, etapa, faixa, CTA, UTMs e timestamp. Respostas completas não são enviadas. Falhas de analytics nunca bloqueiam o redirecionamento.

## Publicação

O projeto usa o plugin `sites()` do starter e `.openai/hosting.json`. Execute `npm run build` antes de publicar com Sites. Configure a URL da landing externa, o domínio e os links legais no ambiente hospedado.

## Decisões técnicas

- Conteúdo, domínio e interface separados para evitar regras duplicadas.
- Cada pilar mantém escala de 0 a 9; `resistanceBand` é inferida do total de 0 a 27.
- Resultado é educativo, sem alegação clínica ou científica.
- Sem escassez, contadores, depoimentos ou estatísticas inventadas.
- CTA mobile aparece só após a primeira dobra e pode ser fechado.
