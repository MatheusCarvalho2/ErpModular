# Implementation Plan: Cadastro de Serviços

**Branch**: `003-cadastro-servicos` | **Date**: 2026-07-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-cadastro-servicos/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Módulo de cadastro de serviços no ErpModular: listagem de serviços ativos por empresa para qualquer usuário autenticado; criação, edição, inativação e reativação restritas a administradores. Persistência via Prisma (`Service` escoped por `companyId`), mutações com Server Actions, `role` na sessão JWT para autorização, unicidade de nome entre ativos com comparação case/acento-insensitive, tempo em horas+minutos (armazenado em minutos), i18n pt-BR para strings do módulo, seed com admin + membro + serviços demo, e cobertura E2E Playwright dos caminhos críticos.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js LTS  

**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Prisma 6, Auth.js (NextAuth v5), Playwright (E2E)  

**Storage**: SQLite local (`file:./dev.db`) via Prisma; PostgreSQL opcional (compose existente)  

**Testing**: Playwright E2E dos fluxos críticos (authz, CRUD parcial, listagem, soft-inactivate, unicidade); helpers unitários Vitest opcionais para normalização de nome  

**Target Platform**: Web app (desktop-first; browsers modernos)  

**Project Type**: Web application (full-stack Next.js na raiz)  

**Performance Goals**: Cadastro válido &lt; 2 min (SC-001); listagem e mutações responsivas em uso normal  

**Constraints**: Isolamento por empresa; write = ADMIN; list ativos = autenticado; sem hard delete; i18n pt-BR apenas; unicidade ativa case/acento-insensitive  

**Scale/Scope**: 1 módulo (Serviços); ~4 rotas UI; 1 modelo novo; seed +2 fixtures (MEMBER + services); session estendida com `role`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
*Source: `.specify/memory/constitution.md` (ErpModular Constitution v1.0.0)*

| Gate | Status | Notes |
|------|--------|--------|
| **I. Automated Testing** | PASS | Caminhos críticos cobertos por Playwright (FR-013); helper de normalização de nome com teste unitário se não-trivial |
| **II. Seed When Necessary** | PASS | Seed estende Empresa Demo: admin existente, usuário MEMBER, ≥1 serviço ativo (e opcionalmente 1 inativo); credenciais documentadas em pt-BR |
| **III. Internationalization** | PASS | Introdução de camada i18n mínima (`messages/pt-BR` + helper `t`); strings do módulo Serviços + nav via i18n (sem hard-code novo nessas superfícies) |
| **IV. Spec-Driven Delivery** | PASS | Plan/contracts derivados de `spec.md` e clarificações |
| **V. Simplicity** | PASS | Sem categorias/OS/fiscais; Server Actions no app; sem API REST pública; i18n dictionary-only (sem multi-locale runtime) |

**Post-Phase 1 re-check**: PASS — `data-model.md` e `contracts/` respeitam FR-001–013, soft-inactivate, isolamento por empresa e papéis ADMIN/MEMBER sem ampliar escopo.

## Project Structure

### Documentation (this feature)

```text
specs/003-cadastro-servicos/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   ├── ui-routes.md
│   └── service-actions.md
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
/
├── app/
│   ├── app/
│   │   ├── layout.tsx              # shell (existente)
│   │   ├── page.tsx                # Início
│   │   └── servicos/
│   │       ├── page.tsx            # lista (ativos; filtro inativos p/ admin)
│   │       ├── novo/page.tsx       # formulário criar (ADMIN)
│   │       └── [id]/
│   │           └── editar/page.tsx # formulário editar (ADMIN)
│   └── api/auth/[...nextauth]/     # existente
├── components/
│   ├── shell/Sidebar.tsx           # link Serviços
│   └── services/                   # Form, List, StatusActions
├── lib/
│   ├── auth.ts                     # JWT/session + role
│   ├── prisma.ts
│   ├── i18n.ts                     # t(key) + locale pt-BR
│   ├── service-name.ts             # normalizeName (case/acento-insensitive)
│   └── services/                   # queries + authz helpers (opcional)
├── messages/
│   └── pt-BR.ts                    # dicionário UI
├── prisma/
│   ├── schema.prisma               # + Service; Company.services
│   ├── migrations/
│   └── seed.ts                     # MEMBER + serviços demo
├── tests/
│   ├── e2e/                        # Playwright — serviços
│   └── unit/                       # normalizeName (opcional)
├── playwright.config.ts
└── package.json                    # scripts test:e2e
```

**Structure Decision**: Continuar o monólito Next.js na raiz (padrão de `001`). Módulo sob `app/app/servicos` alinhado ao shell atual (`app/app/*`, não route group `(app)`). Mutações via Server Actions (sem REST público). i18n dictionary local suficiente para Constitution III sem next-intl nesta feature.

## Complexity Tracking

> Sem violações de constituição a justificar — tabela omitida.
