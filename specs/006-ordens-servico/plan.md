# Implementation Plan: Ordens de Serviço

**Branch**: `006-ordens-servico` | **Date**: 2026-07-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-ordens-servico/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Módulo de **Ordens de Serviço** que une serviço padrão, cliente e equipamento (`ClientProduct`), com valor cobrado pré-preenchido (editável), descrição do serviço prestado e **status configuráveis** por empresa (papéis operacional / finalizado / cancelado). Seed dos cinco status base (Pronto = finalizado). Operadores editam OS operacional; pós-encerramento e correção de vínculos para Admin (ou permissões especiais). Server Actions + Prisma; i18n pt-BR; Playwright nos caminhos críticos.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js LTS  

**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Prisma 6, Auth.js (NextAuth v5), Playwright, Vitest  

**Storage**: SQLite local (`file:./dev.db`) via Prisma; PostgreSQL opcional (compose existente)  

**Testing**: Playwright E2E (criar OS + prefill, status, read-only fechada, admin status catalog, authz, tenant); Vitest para gates de role/permissão se extrair helpers puros  

**Target Platform**: Web app (desktop-first; browsers modernos)  

**Project Type**: Web application (full-stack Next.js na raiz)  

**Performance Goals**: Abrir OS &lt; 2 min (SC-001); mudança de status &lt; 1 min (SC-003); mutações responsivas em uso normal  

**Constraints**: Isolamento `companyId`; authz `requirePermission` / Admin; sem hard delete; i18n pt-BR; valor ≥ 0; várias OS por equipamento; Operadores sem preset de status/`editClosed`/`correctLinks`  

**Scale/Scope**: 1 módulo UI OS + sub-área status; 2 modelos Prisma novos; extensão catálogo permissões; seed + E2E; depende de `003`/`004`/`005`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
*Source: `.specify/memory/constitution.md` (ErpModular Constitution v1.0.0)*

| Gate | Status | Notes |
|------|--------|--------|
| **I. Automated Testing** | PASS | FR-015: Playwright caminhos críticos + unit em helpers de gate/normalização status |
| **II. Seed When Necessary** | PASS | Status base + serviço reparo + OS demo; quickstart pt-BR |
| **III. Internationalization** | PASS | `orders.*`, `orderStatuses.*`, nav, permissionGroups; nomes de status = dados |
| **IV. Spec-Driven Delivery** | PASS | Plan/contracts de `spec.md` + clarificações 2026-07-14 |
| **V. Simplicity** | PASS | Sem NF-e/pagamento/agenda/impressão; FKs vivas; grafo de status livre; espelha padrão módulos existentes |

**Post-Phase 1 re-check**: PASS — `data-model.md` e `contracts/` cobrem FR-001–015, papéis de status, locks pós-encerramento, correctLinks e preset Operadores sem keys sensíveis.

## Project Structure

### Documentation (this feature)

```text
specs/006-ordens-servico/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-routes.md
│   ├── service-order-actions.md
│   └── service-order-status-actions.md
└── tasks.md             # /speckit-tasks — NOT created here
```

### Source Code (repository root)

```text
/
├── app/app/
│   └── ordens-servico/
│       ├── page.tsx                 # lista + filtro status
│       ├── novo/page.tsx
│       ├── [id]/page.tsx           # detalhe / edição gated
│       └── status/page.tsx          # catálogo de status (admin)
├── components/
│   ├── service-orders/
│   └── service-order-statuses/
├── components/shell/Sidebar.tsx     # nav.orders (+ link status se permitido)
├── lib/
│   ├── permissions/catalog.ts       # + serviceOrders* / serviceOrderStatuses* ; Operadores preset filtrado
│   ├── service-orders/              # actions, queries
│   └── service-order-statuses/      # actions, queries, ensureDefault*
├── messages/pt-BR.ts
├── prisma/schema.prisma             # ServiceOrderStatus, ServiceOrder
├── prisma/seed.ts
└── tests/
    ├── e2e/                         # ordens-*, order-statuses-*, tenant/authz
    └── unit/                        # status role gates / nameNormalized se aplicável
```

**Structure Decision**: Continuar monólito Next.js na raiz. Espelhar `servicos`/`produtos`. Catálogo de status como sub-rota do módulo OS (não módulo shell separado). Nomes de modelos Prisma em inglês (`ServiceOrder`, `ServiceOrderStatus`); UI em pt-BR via i18n.

## Complexity Tracking

> Sem violações de constituição a justificar — tabela omitida.
