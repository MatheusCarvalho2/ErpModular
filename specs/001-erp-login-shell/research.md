# Research: ERP Login e Shell do Sistema

**Feature**: `001-erp-login-shell`  
**Date**: 2026-07-14

## R1 — Framework e bootstrap do app

**Decision**: Next.js (App Router) + TypeScript + Tailwind CSS + Prisma ORM.

**Rationale**: Alinhado à intenção explícita do projeto; App Router favorece layouts aninhados (login público vs shell autenticado), Server Components e Route Handlers para auth.

**Alternatives considered**:
- Pages Router — mais legado; menos adequado para layouts aninhados e middleware moderno.
- Separar frontend/backend — overkill para presetup de login + shell.

## R2 — Autenticação (e-mail + senha, sessão 7 dias)

**Decision**: Auth.js (NextAuth v5) com Credentials provider, sessões em cookie HTTP-only persistente (`maxAge` ≈ 7 dias), strategy `jwt` (ou `database` se preferir revogação server-side — default JWT + cookie para simplicidade do presetup).

**Rationale**: Integração madura com Next.js App Router + Prisma adapter disponível; atende FR-011 (persiste ao fechar o navegador) sem checkbox “Lembrar-me”; logout e proteção de rotas via `auth()` / middleware.

**Alternatives considered**:
- Sessão 100% custom (cookies manuais) — mais código e risco de bugs de segurança.
- Lucia Auth — ótimo, porém menos “padrão de mercado” documentado para Next.js do que Auth.js.
- OAuth/SSO — fora de escopo do presetup.

## R3 — Hash de senha

**Decision**: `bcrypt` (via `bcryptjs` ou `bcrypt`) com custo adequado (≥ 10).

**Rationale**: Padrão amplamente suportado; suficiente para presetup; Auth.js Credentials exige verificação manual do hash.

**Alternatives considered**:
- Argon2 — ligeiramente preferível em greenfield puro, mas bcrypt é mais simples de integrar no fluxo Credentials.
- Texto puro — rejeitado.

## R4 — Banco e multiempresa

**Decision**: Prisma com modelos `Company`, `User` e `Membership` (`UNIQUE(userId)`). Engine local: SQLite (`file:./dev.db`); PostgreSQL opcional via `docker-compose.yml`.

**Rationale**: Multiempresa (FR-013) + no máximo um vínculo por usuário (FR-014). SQLite permite bootstrap sem Docker; produção deve usar PostgreSQL.

**Alternatives considered**:
- PostgreSQL obrigatório na máquina local — bloqueado (Docker Desktop off).
- `User.companyId` direto — menos evolutivo para multi-membership futuro.
- Tenant por subdomínio — prematuro.

## R5 — Proteção de rotas

**Decision**: Next.js Middleware + checagem `auth()`: rotas sob `/app` (ou `(app)`) exigem sessão; `/login` redireciona autentificados para home interna.

**Rationale**: Atende FR-010 e cenários de User Story 3 com padrão App Router.

**Alternatives considered**:
- Só guards em layouts Client Components — vazam conteúdo mais facilmente e pioram UX de redirect.

## R6 — UI: login split + shell

**Decision**:
- Login: grid/flex 50/50 desktop — formulário esquerda, imagem direita; empilha ou oculta imagem em viewport estreito.
- Shell: layout `(app)` com `Sidebar` + `Header` + `children`; item “Início” → `/app` (ou `/app/inicio`).

**Rationale**: Spec clarificada (FR-002, FR-006–009); App Router layouts isolam chrome do shell.

**Alternatives considered**:
- Shell em componente único sem route groups — pior para crescer módulos.

## R7 — Seed / usuário inicial

**Decision**: Seed Prisma cria 1 `Company` + 1 `User` (admin de teste) com membership, credenciais documentadas em `quickstart.md`.

**Rationale**: Spec exige usuário de teste; sem self-signup.

**Alternatives considered**:
- Cadastro na UI — fora de escopo.

## R8 — Testes

**Decision**: Playwright para fluxos críticos (login ok/fail, redirect, logout, shell visível); Vitest opcional para helpers (validação de e-mail, hash).

**Rationale**: Success criteria são majoritariamente end-to-end/UX.

**Alternatives considered**:
- Só testes unitários — insuficientes para auth + redirects.

## R9 — Idioma e assets

**Decision**: UI pt-BR; imagem de login como asset estático em `public/` com fallback de cor/gradiente se falhar.

**Rationale**: Assumptions da spec.

## Resolved unknowns

Todos os itens de Technical Context foram decididos acima; nenhum `NEEDS CLARIFICATION` permanece para esta fase.
