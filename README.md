<p align="center">
    <img src="./public/assets/logo/logo-full-866x288.png" width="640" height="auto" alt="ShopixTurbo" />
</p>

# ShopixTurbo Frontend

Aplicação web do ShopixTurbo, o painel que coloca sua loja Shopee no controle total: produtos, pedidos, custos e a margem real de lucro em um só lugar, sem planilhas.

Este frontend consome a API do [ShopixTurbo Backend](https://github.com/developer-gilberto/shopixturbo-backend), que faz a integração com a API oficial da Shopee.

## ⚠️ Antes de continuar

Este projeto ainda está em desenvolvimento, se você encontrar algum problema, comportamento inesperado, bugs, por favor reporte o problema ao desenvolvedor:

Ao reportar, inclua:

- Passos para reproduzir o bug
- O que você esperava que acontecesse
- O que realmente aconteceu
- Logs ou prints se possível

👉 [Reportar bug ao desenvolvedor](https://github.com/developer-gilberto/shopixturbo-frontend/issues/new)

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando a Aplicação](#executando-a-aplicação)
- [Rotas e Navegação](#rotas-e-navegação)
- [API Interna](#api-interna)
- [Autenticação e Proteção de Rotas](#autenticação-e-proteção-de-rotas)
- [Integração com o Backend](#integração-com-o-backend)
- [Tema e Design Tokens](#tema-e-design-tokens)
- [Testes](#testes)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Segurança](#segurança)
- [Desenvolvimento](#desenvolvimento)
- [Deploy](#deploy)

---

## Documentação para IA

Este projeto utiliza **OpenCode** com agentes e skills especializados:

| Arquivo                                 | Propósito                         |
| --------------------------------------- | --------------------------------- |
| `AGENTS.md`                             | Regras, padrões e autenticação    |
| `.opencode/skills/nextjs-app-router-patterns/SKILL.md`    | Padrões de App Router com RSC  |
| `.opencode/skills/accelint-nextjs-best-practices/SKILL.md` | Boas práticas de performance Next.js |

> **Para IA/Desenvolvedores:** Sempre siga as regras definidas em `AGENTS.md` ao fazer alterações no código, especialmente a obrigatoriedade de `verifySession()` em rotas privadas e Server Actions.

---

## Sobre o Projeto

O ShopixTurbo Frontend é uma interface web construída com Next.js (App Router) que apresenta os dados de custo e lucro da sua loja Shopee. A aplicação consome a API do backend ShopixTurbo usando os tokens de acesso da loja armazenados com segurança no backend, garantindo que o frontend **nunca** tenha acesso às suas senhas ou aos tokens da Shopee.

### Funcionalidades Principais

- **Landing Page e Login**: Página inicial com destaque das funcionalidades e formulário de login
- **Autenticação**: Registro de usuário, login, verificação de e-mail e reenvio do e-mail de verificação
- **Conexão com a Shopee**: Fluxo completo de autorização da loja (OAuth/Shopee), com redirecionamento ao finalizá-la
- **Dashboard**: Cards de resumo dos pedidos, gráfico de visão geral de custos, ranking dos produtos mais vendidos e mais lucrativos e alertas de produtos sem custo cadastrado
- **Relatórios**: Geração de relatório em texto com impressão direta no navegador (`plain-report`) e envio por e-mail (`mailto`)
- **Gestão de Produtos**: Busca por nome/SKU/ID, sincronização com a Shopee, seleção em massa e cadastro do preço de custo e impostos do governo (individual ou em lote)
- **Gestão de Pedidos**: Busca por ID de pedido, filtro por status e período, tabela completa com quebra de custos e lucro por item (cards no mobile)
- **Minha Conta**: Dados do usuário, informações da loja conectada e status da integração
- **Tema Escuro**: Toggle manual de tema claro/escuro com persistência em `localStorage`
- **Impressão**: Layout de impressão dedicado que exibe apenas o relatório em texto

---

## Tecnologias

| Categoria       | Tecnologia      | Versão          |
| --------------- | --------------- | --------------- |
| Framework       | Next.js         | 16.3.4          |
| Linguagem       | TypeScript      | ^5.9.3          |
| UI Library      | React           | 19.2.8          |
| Estilo          | Tailwind CSS    | ^4.3.3          |
| Ícones          | react-icons     | ^5.7.0          |
| Autenticação    | jose (JWT)      | ^6.2.12         |
| Linting         | Biome           | 2.4.2           |
| Package Manager | pnpm            | 12.3.4          |

---

## Estrutura do Projeto

```
shopixturbo-frontend/
├── .opencode/                     # Configuração OpenCode (IA)
│   └── skills/                    # Skills especializadas
│       ├── nextjs-app-router-patterns/      # Padrões App Router
│       └── accelint-nextjs-best-practices/  # Boas práticas Next.js
├── public/                        # Assets estáticos
│   └── assets/logo/               # Logos e favicons
├── src/                           # Código fonte
│   ├── actions/                   # Server Actions (mutations)
│   │   ├── auth.ts                # signIn, signUp, signOut, reverificação
│   │   ├── products.ts            # syncProducts, updateProductCost
│   │   └── shopee.ts              # connectShop, processShopeeCallback
│   ├── app/                       # Rotas (App Router)
│   │   ├── api/orders/route.ts    # API interna de pedidos (client-side)
│   │   ├── (privates)/            # Rotas autenticadas
│   │   │   ├── dashboard/         # Painel com relatório e rankings
│   │   │   ├── my-account/        # Conta e loja conectada
│   │   │   ├── orders/            # Pedidos (tabela/cards, busca e filtros)
│   │   │   ├── products/          # Catálogo e gestão de custos
│   │   │   └── layout.tsx         # AppShell + verifySession
│   │   ├── (publics)/             # Rotas públicas
│   │   │   ├── signup/            # Registro de usuário
│   │   │   └── verification/email/ # Verificação de e-mail
│   │   ├── globals.css            # Design tokens (temas claro/escuro)
│   │   ├── layout.tsx             # Layout raiz (anti-flash do tema)
│   │   ├── page.tsx               # Landing page + login + callback Shopee
│   │   ├── error.tsx              # Erro global
│   │   ├── loading.tsx            # Loading global
│   │   └── not-found.tsx          # 404
│   ├── components/                # Componentes React
│   │   ├── layout/                # app-shell, header, sidebar, footer...
│   │   ├── orders/                # orders-content, busca, skeleton
│   │   ├── products/              # modais de custo, seleção, busca
│   │   └── ui/                    # componentes de UI genéricos
│   ├── lib/                       # Camada de dados e utilitários
│   │   ├── dal.ts                 # verifySession (DAL)
│   │   ├── orders-data.ts         # tipos e cache da API de pedidos
│   │   ├── report-text.ts         # geração do relatório em texto
│   │   └── session.ts             # cookies, JWT (jose) e verificação
│   └── proxy.ts                   # Middleware (proteção de rotas)
├── .env.local                     # Variáveis de ambiente locais
├── biome.json                     # Configuração do Biome
├── next.config.ts                 # Configuração Next.js
├── package.json                   # Dependências e scripts
├── postcss.config.mjs             # Configuração do PostCSS (Tailwind)
└── tsconfig.json                  # Configuração TypeScript
```

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 20.x ou superior)
- **pnpm** (gerenciador de pacotes)
- O **ShopixTurbo Backend** rodando (o frontend depende da API dele)

> O backend também precisa do **PostgreSQL** e **Redis** (via `docker-compose` do próprio backend) para funcionar de ponta a ponta.

---

## Instalação

1. **Clone o repositório:**

```bash
git clone https://github.com/developer-gilberto/shopixturbo-frontend
cd shopixturbo-frontend
```

2. **Instale as dependências:**

```bash
pnpm install
```

3. **Configure as variáveis de ambiente:**

Crie o arquivo `.env.local` na raiz do projeto com a seguinte estrutura:

```bash
# URL base da API do ShopixTurbo Backend
BACKEND_URL=http://localhost:8000/api/v1

JWT_SECRET=sua_chave_super_secreta_com_mais_de_32_chars
```

> O `.env.local` não deve ser versionado (o `.gitignore` o exclui). Veja a seção [Configuração](#configuração) para a descrição completa das variáveis.

---

## Configuração

### Variáveis de Ambiente

Edite o arquivo `.env.local` com suas configurações:

```env
# URL base da API do ShopixTurbo Backend
BACKEND_URL=http://localhost:8000/api/v1

JWT_SECRET=sua_chave_super_secreta_com_mais_de_32_chars
```

### Descrição das Variáveis

| Variável      | Descrição                                                        | Padrão                   |
| ------------- | ---------------------------------------------------------------- | ------------------------ |
| `BACKEND_URL` | URL base da API do ShopixTurbo Backend (com prefixo `/api/v1`)   | -                        |
| `JWT_SECRET`  | Chave secreta usada para validar o JWT gerado pelo backend (mín. 32 caracteres; deve ser idêntica à do backend) | - |

> **Importante:** o JWT é validado **localmente** (com `jose`) usando o mesmo `JWT_SECRET` do backend. Se as chaves divergirem, a sessão será rejeitada e o usuário será redirecionado para o login.

---

## Executando a Aplicação

```bash
# Desenvolvimento (com hot reload)
pnpm run dev

# Produção (build otimizado)
pnpm run build
pnpm run start

# Lint e formatação com Biome
pnpm run lint
```

A aplicação fica disponível em `http://localhost:3000` (porta padrão do Next.js).

---

## Rotas e Navegação

### Rotas Públicas

| Rota                            | Descrição                                               | Auth |
| ------------------------------- | ------------------------------------------------------- | ---- |
| `/`                             | Landing page + formulário de login + callback da Shopee | Não  |
| `/signup`                       | Registro de novo usuário                                | Não  |
| `/verification/email`           | Verificação de e-mail / reenvio do link de verificação  | Não  |

Na rota `/`, a presença dos parâmetros `?code=` e `?shop_id=` dispara o fluxo de callback da Shopee (`ShopeeCallbackForm`), que conclui a conexão da loja à conta.

### Rotas Privadas

| Rota          | Descrição                                                                                 | Auth |
| ------------- | ----------------------------------------------------------------------------------------- | ---- |
| `/dashboard`  | Resumo financeiro, gráfico de custos, ranking de produtos e relatório imprimível          | Sim  |
| `/products`   | Catálogo com busca, sincronização e cadastro de custo/impostos (individual e em lote)     | Sim  |
| `/orders`     | Pedidos com busca por ID, filtros por status/período, tabela completa e cards no mobile   | Sim  |
| `/my-account` | Dados do usuário e da loja conectada + conexão à Shopee                                   | Sim  |

### Proteção de Rotas (Middleware)

O arquivo `src/proxy.ts` é o middleware Next.js (`proxy` export). Ele:

- Redireciona rotas **privadas** (`/dashboard`, `/products`, `/orders`, `/my-account`) sem o cookie de autenticação → `/`
- Redireciona usuários **autenticados** da `/` (e rotas públicas) → `/dashboard`, exceto durante o callback da Shopee

Haverá também a verificação em camada de Server Component (DAL), descrita na seção [Autenticação e Proteção de Rotas](#autenticação-e-proteção-de-rotas).

---

## API Interna

### `GET /api/orders`

Endpoint interno consumido pelo componente **client-side** da página de pedidos (`OrdersContent`). Ele autentica o usuário, consulta o backend e enriquece a resposta com as imagens dos produtos.

| Query Param     | Tipo   | Padrão           | Descrição                                          |
| --------------- | ------ | ---------------- | -------------------------------------------------- |
| `order_status`  | string | `READY_TO_SHIP`  | Status dos pedidos (de `ORDER_STATUSES`)           |
| `interval_days` | string | `15`             | Intervalo em dias a ser consultado                 |
| `order_id`      | string | -                | ID (order_sn) de um pedido específico para busca   |
| `cursor`        | string | -                | Cursor da próxima página (de `pagination.next_cursor` do relatório) |

**Resposta (200 OK):**

```json
{
  "searchedOrders": [{ "order_sn": "...", "order_status": "...", "item_list": [] }],
  "orderSearchError": null,
  "report": {
    "status": "ok",
    "orders": [],
    "summary": {},
    "pagination": { "more": false, "next_cursor": null },
    "productImageByItemId": {}
  }
}
```

O campo `report.status` pode ser `ok`, `empty` (nenhum pedido no período/status) ou `error`. Quando `searchedOrders` não é nulo, `orderSearchError` contém a mensagem quando o pedido não é encontrado.

O relatório é paginado em lotes de 20 pedidos. `report.pagination.more` indica se existem mais páginas e `report.pagination.next_cursor` deve ser enviado como `cursor` na próxima requisição para avançar de página (o `/api/orders` repassa o valor como `cursor` ao backend, que o encaminha à API da Shopee).

O cache em memória (em `src/lib/orders-data.ts`) deduplica chamadas iguais dentro da mesma sessão, reduzindo idas ao backend.

---

## Autenticação e Proteção de Rotas

A autenticação é baseada em **JWT** guardado em **cookie httpOnly**:

| Cookie            | Configuração                                    | Propósito                       |
| ----------------- | ----------------------------------------------- | ------------------------------- |
| `user_auth_token` | `httpOnly`, `SameSite=Lax`, `Secure` em produção | Token JWT da sessão            |
| `shop_id`         | `httpOnly`, `SameSite=Lax`, `Secure` em produção | ID da loja conectada           |

Fluxo:

1. **Login/Registro**: As Server Actions (`src/actions/auth.ts`) chamam o backend e salvam o `user_auth_token` no cookie.
2. **Validação local**: `src/lib/session.ts` verifica e decodifica o JWT com `jose` (HS256) usando `JWT_SECRET` — sem chamar o backend a cada requisição.
3. **Middleware**: `src/proxy.ts` redireciona rotas privadas sem cookie para o login.
4. **Server Components**: `verifySession()` (em `src/lib/dal.ts`) é chamado no topo de **toda página privada** e de **toda Server Action de mutação** (`verifySession` retorna o usuário ou redireciona para `/`). Esta validação é obrigatória porque o middleware não cobre Server Actions.

---

## Integração com o Backend

O frontend se comunica com o ShopixTurbo Backend sempre com o token JWT no header `Authorization: Bearer <token>`:

| Finalidade                   | Endpoint do Backend                                 | Método |
| ---------------------------- | --------------------------------------------------- | ------ |
| Login                        | `/auth/signin`                                      | POST   |
| Registro                     | `/auth/signup`                                      | POST   |
| Reenvio de verificação       | `/auth/resend-verification-email`                   | POST   |
| URL de autorização da Shopee | `/integration/shopee/auth-url`                      | GET    |
| Callback de acesso           | `/integration/shopee/callback/access-token`         | GET    |
| Dados da loja                | `/shops/full/:shop_id`                              | GET    |
| Relatório de pedidos         | `/report/orders/:shop_id`                           | GET    |
| Detalhes de pedidos          | `/orders/details/:shop_id`                          | GET    |
| Informação de produtos       | `/products/:shop_id`                                | GET    |
| Sincronização de produtos    | `/sync/products/:shop_id`                           | POST   |
| Custo/impostos dos produtos  | `/products/cost-taxes/:shop_id`                     | PATCH  |

O relatório de custos e lucros (`/report/orders/:shop_id`) entrega, por pedido e por item:

- **Resumo** (`summary`): receita total, frete, comissão da Shopee, custo de aquisição, impostos do governo, custo total, lucro líquido e margem geral
- **Preço de venda** (`unit_price`, `revenue`): obtido dos dados financeiros da Shopee
- **Custo do produto** (`unit_cost`): preço de custo cadastrado no catálogo interno
- **Impostos** (`unit_government_taxes`, `total_government_taxes`): impostos do governo calculados a partir do catálogo
- **Tarifa Shopee** (`shopee_commission`): comissão da Shopee
- **Frete** (`shipping_paid_by_seller`): frete pago pelo vendedor, calculado a partir dos dados financeiros
- **Lucro líquido** (`net_profit_margin`) e **margem** (`margin_percent`): diferença entre receita e custo
- **Flags de integridade**: `is_matched_to_product`, `has_partial_cost_data`, `orders_with_missing_cost_data`, `unmatched_item_skus`, `products_with_missing_cost_data`

As imagens dos produtos são resolvidas a partir do catálogo interno (endpoint `/products/:shop_id`) e o `next/image` restringe os domínios permitidos no `next.config.ts`.

---

## Tema e Design Tokens

### Design Tokens

Todo o visual usa tokens semânticos definidos em `src/app/globals.css` e expostos ao Tailwind via `@theme inline`:

- **Cores da marca** (`primary-100/300/500/600/700` → `primary-soft/mutted/base/hover/pressed`)
- **Segmentos do gráfico** (`graphic-cost`, `graphic-tax`, `graphic-fee-shopee`, `graphic-shipping`, `graphic-profit`)
- **Indicadores** de lucro (`profit`) e prejuízo (`prejudice`)
- **Texto** (`heading`, `body`, `label`, `subtitle`)
- **Superfícies** (`card-bg`, `btn-muted`, `nav-active-bg`, `page-bg`)
- **Bordas** (`card-border`, `card-border-strong`), **raios** (`radius-card`, `radius-btn-input`) e **sombras** (`card`, `btn-primary`)

### Tema Escuro

- A paleta escura é definida no bloco `.dark { ... }` sobrescrevendo os mesmos tokens.
- O toggle do tema é persistido em `localStorage` (`theme = 'dark' | 'light'`; padrão: claro).
- O `ThemeToggle` (no header) adiciona/remove a classe `.dark` no `<html>`.
- Um script inline (`next/script` `beforeInteractive`) aplica o tema **antes da hidratação**, evitando flashes de cor.

### Impressão

O CSS em `@media print` esconde toda a interface e exibe apenas o relatório (`.plain-report`) em fonte monoespaçada, permitindo imprimir o relatório direto do navegador sem elementos da aplicação.

---

## Testes

> ⚠️ **Estado atual:** o projeto ainda **não possui testes automatizados** (unitários ou E2E). A verificação atual é feita com `pnpm exec tsc --noEmit` (type checking) e `pnpm run lint` (Biome). A adição de testes faz parte do roadmap.

---

## Scripts Disponíveis

| Script            | Descrição                         |
| ----------------- | --------------------------------- |
| `pnpm run dev`    | Inicia o servidor de desenvolvimento |
| `pnpm run build`  | Compila o projeto para produção   |
| `pnpm run start`  | Inicia o servidor de produção     |
| `pnpm run lint`   | Executa o linter e formatação (Biome `check --write`) |
| `pnpm run format` | Formata o código (Biome `check --write`) |

---

## Segurança

O projeto implementa múltiplas camadas de segurança:

1. **JWT em cookie httpOnly**: token de sessão inacessível ao JavaScript do navegador.
2. **Validação local do JWT**: `jose` com HS256 e `JWT_SECRET`, mantido apenas no servidor.
3. **Proteção de rotas em duas camadas**: middleware (`proxy.ts`) + `verifySession()` em Server Components e Server Actions.
4. **`server-only`**: os módulos que manipulam cookies/secrets (`session.ts`, `dal.ts`) são restritos ao servidor.
5. **Cookie `shop_id`**: armazenado de forma segura e restaurado a partir do payload do JWT no login.
6. **`next/image` allowlist**: apenas imagens de `cf.shopee.com.br` são permitidas como remotes.
7. **Sem exposição de credenciais**: o frontend nunca manipula senha, tokens da Shopee ou chaves de API; a comunicação com a Shopee é feita apenas pelo backend.
8. **Cookies `SameSite=Lax`** e `Secure` em produção.

---

## Desenvolvimento

### Linting e Formatação

O projeto utiliza Biome para linting e formatação:

```bash
# Verificar e corrigir código (auto-fix)
pnpm run lint

# Formatar código (auto-fix)
pnpm run format
```

### Configuração Biome

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.2/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": {
    "ignoreUnknown": true,
    "includes": ["**", "!node_modules", "!.next", "!dist", "!build", "!.opencode"]
  },
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2 },
  "javascript": { "formatter": { "quoteStyle": "single" } },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true },
    "domains": { "next": "recommended", "react": "recommended" }
  }
}
```

### Padrões de Código

- Utilitários Tailwind via design tokens semânticos (sem cores hardcoded)
- Componentes tipados com TypeScript `strict`
- Server Components por padrão; `'use client'` apenas quando necessário
- Convenção de commits: `feat:`, `fix:`, `chore:`, `refactor:` seguidos de descrição curta

---

## Deploy

A aplicação Next.js pode ser publicada na **Vercel** (quando a conta for conectada ao repositório), ou em qualquer plataforma que rode Node.js 20+:

```bash
pnpm run build
pnpm run start
```

Antes do deploy, configure as variáveis `BACKEND_URL` e `JWT_SECRET` no ambiente, e aponte o `FRONTEND_URL` do backend para a URL pública desta aplicação (para CORS e links de verificação de e-mail).

---

## 🧑‍💻 Desenvolvedor

Feito com muito ❤️ por **Gilberto Lopes** Full Stack Developer.

### Saiba mais sobre o desenvolvedor

- Email: developer.gilberto@gmail.com
- [Site pessoal](https://gilbertolopes.dev)
- [LinkedIn](https://linkedin.com/in/gilbertolopes-dev)
- [GitHub](https://github.com/developer-gilberto)
- [Instagran](https://www.instagram.com/developer.gilberto/)

## Licença e Direitos

### ShopixTurbo 🚀

**Exceto conforme expressamente estabelecido de outra forma por escrito, o titular dos direitos autorais deste software e qualquer outra pessoa que controle os direitos autorais reserva todos os direitos a respeito do software distribuído.**

**Nenhuma permissão é concedida para cópia, distribuição, modificação ou sublicenciamento do software. O uso comercial deste software requer uma licença comercial válida emitida pelo titular dos direitos autorais.**

**Para obter permissão, entre em contato com o criador e desenvolvedor do ShopixTurbo® Gilberto Lopes developer.gilberto@gmail.com**

ShopixTurbo®
All Rights Reserved®
© Copy Right
Todos os Direitos Reservados