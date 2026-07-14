# Implementation Plan: Backoffice da Plataforma

**Branch**: `007-backoffice-plataforma` | **Date**: 2026-07-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-backoffice-plataforma/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Entregar uma **ferramenta externa** de backoffice (entrada/login dedicados em `/backoffice`) para o **super admin da plataforma** controlar empresas clientes e usuários do ErpModular: criar/editar, inativar/reativar, redefinir senha (temporária + troca obrigatória no ERP), e dashboard com totais (empresas e usuários clientes, excluindo operadores de plataforma) mais usuários por empresa. Modelo: flag `isPlatformOperator` sem `Membership`; `active` em `User`/`Company`; sessão Auth.js com `sessionKind: platform | erp`; authz `requirePlatformOperator` separada do matriz de permissões da empresa. Seed + i18n pt-BR + E2E Playwright dos caminhos críticos.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js LTS  

**Primary Dependencies**: Next.js (App Router), React, Tailwind CSS, Prisma 6, Auth.js (NextAuth v5), Playwright (E2E), Vitest (unit opcional para slug/counts)  

**Storage**: SQLite local (`file:./dev.db`) via Prisma; PostgreSQL opcional  

**Testing**: Playwright E2E (login dedicado, deny usuário empresa, CRUD empresa/usuário, inativar, reset senha + troca, dashboard); Vitest se helpers de contagem/slug forem não-triviais  

**Target Platform**: Web app (desktop-first; browsers modernos)  

**Project Type**: Web application (full-stack Next.js na raiz)  

**Performance Goals**: Provisionar empresa + 1º usuário + validar login ERP &lt; 5 min (SC-001); inativar &lt; 1 min após achar registro (SC-006)  

**Constraints**: Entrada/login dedicados (`/backoffice/*`); usuários de empresa nunca acessam backoffice; usuário criado no backoffice → sempre grupo Admin da empresa; um usuário → no máximo uma empresa; sem e-mail transacional / billing; i18n pt-BR; sem API REST pública  

**Scale/Scope**: Console plataforma (dashboard + empresas + usuários); 1 operador seed; fixtures ativo/inativo; impacto em `authorize` ERP (checar `active` + `mustChangePassword`) e middleware

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
*Source: `.specify/memory/constitution.md` (ErpModular Constitution v1.0.0)*

| Gate | Status | Notes |
|------|--------|--------|
| **I. Automated Testing** | PASS | FR-013: E2E dos caminhos críticos (acesso, CRUD, status, reset+troca, dashboard) |
| **II. Seed When Necessary** | PASS | FR-014: operador plataforma + empresas/usuários ativos e inativos; credenciais pt-BR |
| **III. Internationalization** | PASS | copy do backoffice + login dedicado + troca de senha via `messages/pt-BR` + `t()` |
| **IV. Spec-Driven Delivery** | PASS | Plan/contracts derivados de `spec.md` + clarificações 2026-07-14 |
| **V. Simplicity** | PASS | Flag em `User` (sem tabela PlatformRole); um NextAuth; sem billing/e-mail |

**Post-Phase 1 re-check**: PASS — `data-model.md` e `contracts/` cobrem operador sem membership, entrada dedicada, `active`, senha temporária e métricas do dashboard sem ampliar escopo (self-service, billing, impersonation fora).

## Project Structure

### Documentation (this feature)

```text
specs/007-backoffice-plataforma/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-routes.md
│   ├── platform-auth.md
│   └── platform-actions.md
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
/
├── app/
│   ├── (auth)/
│   │   └── login/                 # ERP (existente)
│   ├── (platform)/
│   │   └── backoffice/
│   │       ├── login/page.tsx     # login dedicado
│   │       ├── layout.tsx         # shell plataforma (requirePlatformOperator)
│   │       ├── page.tsx           # dashboard
│   │       ├── empresas/
│   │       └── usuarios/
│   ├── change-password/page.tsx   # troca obrigatória (usuário ERP)
│   └── app/                       # ERP shell (existente)
├── components/
│   ├── platform/                  # forms, lists, dashboard cards
│   └── auth/                      # ChangePasswordForm (ou similar)
├── lib/
│   ├── auth.ts                    # provider platform + sessionKind; ERP active checks
│   ├── platform/
│   │   ├── authz.ts               # requirePlatformOperator
│   │   ├── actions.ts             # companies/users/password/dashboard mutations
│   │   ├── queries.ts
│   │   └── slug.ts                # (ou helpers)
│   └── permissions/authz.ts       # requireSession: deny inactive / mustChangePassword
├── messages/pt-BR.ts
├── middleware.ts                  # /backoffice + /change-password
├── prisma/schema.prisma           # active, isPlatformOperator, mustChangePassword
├── prisma/seed.ts
└── tests/e2e/
    ├── helpers.ts                 # loginPlatformAs, CREDENTIALS.platform
    └── backoffice-*.spec.ts
```

**Structure Decision**: Continuar monólito Next.js na raiz. Backoffice sob `app/(platform)/backoffice/*` com layout próprio (não reutiliza Sidebar do ERP). Auth compartilhada (Auth.js) com provider e `sessionKind` distintos. Domínio plataforma em `lib/platform/*`, fora do catálogo de permissões da empresa.

## Complexity Tracking

> Sem violações de constituição a justificar — tabela omitida.
