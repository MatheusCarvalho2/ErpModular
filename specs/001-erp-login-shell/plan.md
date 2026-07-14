# Implementation Plan: ERP Login e Shell do Sistema

**Branch**: `001-erp-login-shell` | **Date**: 2026-07-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-erp-login-shell/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Presetup do ERP: bootstrap Next.js + Tailwind + Prisma com autenticação e-mail/senha, tela de login split (formulário à esquerda / imagem à direita), sessão persistente (~7 dias), modelo multiempresa com no máximo um vínculo usuário↔empresa, e shell autenticado (header + sidebar com “Início”). Auth.js (Credentials) + PostgreSQL; rotas públicas vs `/app` protegidas por middleware.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js LTS  

**Primary Dependencies**: Next.js (App Router), Tailwind CSS, Prisma ORM, Auth.js (NextAuth v5), bcrypt  

**Storage**: SQLite local por padrão (`file:./dev.db`); PostgreSQL opcional via `docker-compose.yml`  

**Testing**: Playwright (fluxos E2E de auth/shell); Vitest opcional para helpers  

**Target Platform**: Web app (desktop-first; browsers modernos)  

**Project Type**: Web application (full-stack Next.js)  

**Performance Goals**: Login completo &lt; 30s (SC-001); UX responsiva em uso normal  

**Constraints**: Sem self-signup/MFA/OAuth neste presetup; sessão 7 dias sem “Lembrar-me”; UI pt-BR; um membership por usuário  

**Scale/Scope**: Greenfield; 1–N empresas no modelo; seed com 1 empresa + 1 usuário; 2 superfícies (login + shell home)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição do repositório ainda é placeholder (sem princípios ratificados). Gates aplicados nesta feature:

| Gate | Status | Notes |
|------|--------|--------|
| Spec alinhada (login + shell + multiempresa 1:1) | PASS | Clarificações incorporadas |
| Stack alinhada à intenção do projeto | PASS | Next.js + Tailwind + Prisma |
| Sem escopo fora (módulos ERP, SSO, MFA) | PASS | Documentado em Assumptions / contracts |
| Design multiempresa evolutivo | PASS | Membership com UNIQUE(userId) |

**Post-Phase 1 re-check**: PASS — data-model e contracts respeitam FR-013–015 e não introduzem signup/OAuth.

## Project Structure

### Documentation (this feature)

```text
specs/001-erp-login-shell/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── auth-api.md
│   └── ui-routes.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          # shell: header + sidebar
│   │   └── page.tsx            # Início / boas-vindas
│   ├── api/auth/[...nextauth]/route.ts
│   ├── layout.tsx
│   └── page.tsx                # redirect → /login ou /app
├── components/
│   ├── auth/                   # formulário login, split layout
│   └── shell/                  # Header, Sidebar
├── lib/
│   ├── auth.ts                 # Auth.js config
│   ├── prisma.ts
│   └── password.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/                     # imagem login + assets
├── middleware.ts               # protege /app, redireciona /login
├── tests/e2e/                  # Playwright
├── package.json
├── tailwind.config.ts          # ou CSS Tailwind v4
└── .env.example
```

**Structure Decision**: Single Next.js App Router project na raiz (greenfield). Route groups `(auth)` e `(app)` separam login do shell. Prisma + Auth.js no mesmo repo. Estrutura pronta para módulos futuros sob `app/(app)/...`.

## Complexity Tracking

> Sem violações de constituição a justificar — tabela omitida.
