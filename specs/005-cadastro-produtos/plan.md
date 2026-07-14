# Implementation Plan: Cadastro de Produtos e Vínculo com Cliente

**Branch**: `005-cadastro-produtos` | **Date**: 2026-07-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-cadastro-produtos/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Módulo de **Produtos** (catálogo por empresa), **Clientes** (nome + telefone obrigatório) e **vínculos cliente–produto** com identificador operacional único entre ativos (case/acento-insensitive), série e observação opcionais. Telefone único entre clientes ativos por padrão, com fluxo de **vínculo entre pessoas** para compartilhar telefone. Soft-inactivate; inativar cliente não cascateia vínculos. Mutações via Server Actions + permissões CRUD no catálogo de `004` (`products:*`, `clients:*`, `clientProducts:*`). Seed demo (Air fryer, clientes, vínculos) e E2E Playwright dos caminhos críticos; i18n pt-BR.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js LTS  

**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Prisma 6, Auth.js (NextAuth v5), Playwright, Vitest  

**Storage**: SQLite local (`file:./dev.db`) via Prisma; PostgreSQL opcional (compose existente)  

**Testing**: Playwright E2E (CRUD produtos/clientes, vínculo+identificador, telefone+vínculo pessoas, authz, tenant); Vitest para normalização de nome/identificador/telefone  

**Target Platform**: Web app (desktop-first; browsers modernos)  

**Project Type**: Web application (full-stack Next.js na raiz)  

**Performance Goals**: Cadastro produto &lt; 2 min; cliente + vínculo &lt; 3 min (SC-001/002); mutações e busca por identificador responsivas em uso normal  

**Constraints**: Isolamento por `companyId`; authz via `requirePermission`; sem hard delete; i18n pt-BR; unicidade nome produto e identificador case/acento-insensitive; telefone único entre ativos salvo vínculo entre pessoas  

**Scale/Scope**: 3 recursos UI (Produtos, Clientes, vínculos no detalhe do cliente); 3–4 modelos Prisma novos; extensão do catálogo de permissões; seed + E2E alinhados a `003`/`004`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
*Source: `.specify/memory/constitution.md` (ErpModular Constitution v1.0.0)*

| Gate | Status | Notes |
|------|--------|--------|
| **I. Automated Testing** | PASS | FR-016: Playwright nos caminhos críticos + unit nos helpers de normalização |
| **II. Seed When Necessary** | PASS | Seed: produto Air fryer, ≥2 clientes (cenário telefone), ≥1 vínculo com identificador; README/quickstart pt-BR |
| **III. Internationalization** | PASS | Novas strings em `messages/pt-BR.ts` (`products.*`, `clients.*`, `clientProducts.*`, nav, permissionGroups.resource.*) |
| **IV. Spec-Driven Delivery** | PASS | Plan/contracts derivados de `spec.md` + clarificações 2026-07-14 |
| **V. Simplicity** | PASS | Espelha padrão Serviços; sem OS/fiscal/etiquetas/serviço↔produto; Server Actions sem REST público |

**Post-Phase 1 re-check**: PASS — `data-model.md` e `contracts/` cobrem FR-001–016, soft-inactivate, telefone+vínculo entre pessoas, identificador normalizado e três recursos de permissão sem ampliar escopo.

## Project Structure

### Documentation (this feature)

```text
specs/005-cadastro-produtos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-routes.md
│   ├── product-actions.md
│   ├── client-actions.md
│   └── client-product-actions.md
└── tasks.md             # /speckit-tasks — NOT created here
```

### Source Code (repository root)

```text
/
├── app/app/
│   ├── produtos/
│   │   ├── page.tsx                 # lista (+ filtro inativos)
│   │   ├── novo/page.tsx
│   │   └── [id]/editar/page.tsx
│   └── clientes/
│       ├── page.tsx                 # lista (+ busca por identificador)
│       ├── novo/page.tsx            # + fluxo telefone duplicado / vínculo pessoas
│       └── [id]/
│           ├── page.tsx             # detalhe + lista vínculos + form vincular
│           └── editar/page.tsx
├── components/
│   ├── products/
│   ├── clients/
│   └── shell/Sidebar.tsx            # nav Produtos + Clientes
├── lib/
│   ├── permissions/catalog.ts       # + products/clients/clientProducts keys
│   ├── normalize-text.ts            # (ou reuso) NFD/case/acento — nome + identifier
│   ├── phone.ts                     # normalizePhoneDigits
│   ├── products/                    # actions, queries
│   ├── clients/                     # actions, queries (+ person link)
│   └── client-products/             # actions, queries (vínculo equipamento)
├── messages/pt-BR.ts
├── prisma/schema.prisma             # Product, Client, ClientPersonLink/group, ClientProduct
├── prisma/seed.ts
└── tests/
    ├── e2e/                         # produtos-*, clientes-*, client-products-*, tenant
    └── unit/                        # normalize + phone + unicidade helpers
```

**Structure Decision**: Continuar monólito Next.js na raiz. Espelhar `app/app/servicos` + `lib/services`. Vínculos produto↔cliente vivem no detalhe do cliente (`/app/clientes/[id]`), não em módulo UI separado. Três recursos no catálogo de permissões para atender FR-014.

## Complexity Tracking

> Sem violações de constituição a justificar — tabela omitida.
