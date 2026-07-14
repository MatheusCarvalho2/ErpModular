# Implementation Plan: Grupos de Permissão

**Branch**: `004-grupos-permissao` | **Date**: 2026-07-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-grupos-permissao/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Substituir o papel binário `Membership.role` (`ADMIN`/`MEMBER`) por **grupos de permissão** por empresa: presets indelíveis **Admin** (acesso total) e **Operadores** (default do sistema para não-Admins, nasce com CRUD de negócio completo, customizável). Admin pode criar grupos personalizados, editar permissões (matriz CRUD por recurso), vincular usuários e, ao excluir grupo personalizado, reassociar membros automaticamente a Operadores. Autorização nas Server Actions passa de `requireAdmin()` para checagens por chave de permissão (`requirePermission`), com bypass implícito para quem está no grupo Admin. Persistência Prisma (novos modelos + FK em Membership), sessão JWT com `permissionGroupId` / flags derivadas, i18n pt-BR, seed/migration de MEMBER→Operadores, E2E Playwright dos caminhos críticos. Impacto colateral: módulo Serviços deixa de tratar “membro” como só-leitura quando o usuário está em Operadores com defaults.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js LTS  

**Primary Dependencies**: Next.js (App Router), React, Tailwind CSS, Prisma 6, Auth.js (NextAuth v5), Playwright (E2E), Vitest (unit opcional)  

**Storage**: SQLite local (`file:./dev.db`) via Prisma; PostgreSQL opcional  

**Testing**: Playwright E2E (defaults Admin/Operadores, personalizar Operadores, criar grupo, vincular, excluir→reassociar, deny remoção Admin, deny sem permissão, isolamento); Vitest para catálogo/helpers se não-triviais  

**Target Platform**: Web app (desktop-first; browsers modernos)  

**Project Type**: Web application (full-stack Next.js na raiz)  

**Performance Goals**: Configurar Operadores &lt; 3 min (SC-001); criar grupo + vincular &lt; 5 min (SC-002)  

**Constraints**: Isolamento por empresa; só Admin gerencia grupos/vínculos; Operadores = default não-Admin; exclusão de personalizado reassocia a Operadores; Admin indelével e com permissões irredutíveis; i18n pt-BR; sem API REST pública  

**Scale/Scope**: UI de gestão de grupos + authz refactor; catálogo inicial = CRUD do módulo Serviços (+ permissões exclusivas de Admin forçadas no código); 1 default Operadores por empresa; migrar seed `membro@demo.local` → Operadores

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
*Source: `.specify/memory/constitution.md` (ErpModular Constitution v1.0.0)*

| Gate | Status | Notes |
|------|--------|--------|
| **I. Automated Testing** | PASS | FR-015 / paths críticos em Playwright; helper de catálogo com unit se não-trivial |
| **II. Seed When Necessary** | PASS | Seed cria Admin + Operadores por empresa demo; admin → Admin; `membro@demo.local` → Operadores; credenciais pt-BR |
| **III. Internationalization** | PASS | Strings novas do módulo/nav via `messages/pt-BR` + `t()` |
| **IV. Spec-Driven Delivery** | PASS | Plan/contracts derivados de `spec.md` + clarificações 2026-07-14 |
| **V. Simplicity** | PASS | Sem soft-delete de grupo; sem multi-grupo por usuário; catálogo em código (+ junction); sem next-intl |

**Post-Phase 1 re-check**: PASS — `data-model.md` e `contracts/` cobrem presets, default Operadores, reassociação na exclusão e permissões granulares sem ampliar escopo (convite de usuários fora).

## Project Structure

### Documentation (this feature)

```text
specs/004-grupos-permissao/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   ├── ui-routes.md
│   └── permission-group-actions.md
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
/
├── app/
│   ├── app/
│   │   ├── layout.tsx                 # shell existente
│   │   └── grupos-permissao/
│   │       ├── page.tsx               # lista (Admin)
│   │       ├── novo/page.tsx          # criar personalizado
│   │       └── [id]/
│   │           └── editar/page.tsx    # editar permissões / nome
│   └── api/auth/[...nextauth]/
├── components/
│   ├── shell/Sidebar.tsx              # link Grupos (Admin)
│   └── permission-groups/             # List, Form, PermissionMatrix, AssignUser
├── lib/
│   ├── auth.ts                        # session: permissionGroupId, isAdmin, permissions
│   ├── permissions/
│   │   ├── catalog.ts               # chaves CRUD por recurso
│   │   └── authz.ts                 # requireSession, requireAdmin, requirePermission
│   └── permission-groups/             # queries + Server Actions
├── messages/
│   └── pt-BR.ts
├── prisma/
│   ├── schema.prisma                  # PermissionGroup, PermissionGrant, Membership.groupId
│   ├── migrations/
│   └── seed.ts                        # presets + vínculo Operadores
├── tests/
│   ├── e2e/                           # grupos-permissao-*.spec.ts (+ authz serviços)
│   └── unit/                          # catalog helpers (opcional)
└── package.json
```

**Structure Decision**: Continuar monólito Next.js na raiz. Gestão sob `/app/grupos-permissao` (Admin-only). Authz centralizada em `lib/permissions/*`; módulo Serviços atualiza mutations/páginas para `requirePermission` em vez de `role === "ADMIN"`.

## Complexity Tracking

> Sem violações de constituição a justificar — tabela omitida.
