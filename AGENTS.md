<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Autenticação (obrigatório em rotas privadas)

- Toda **Server Action de mutação** deve chamar `verifySession()` (de `@/lib/dal`) **antes** de qualquer ação — a guarda por `proxy.ts` NÃO cobre Server Actions.
- Toda **página privada** (sob `src/app/(privates)/`) deve chamar `await verifySession()` no topo (Server Component). Não confie só em layout (layouts não re-renderizam em navegação).
- O JWT (`user_auth_token` em cookie httpOnly) é verificado localmente com `jose` em `src/lib/session.ts`.
- Não exponha dados ou realize mutações sem garantir que o usuário está autenticado.
