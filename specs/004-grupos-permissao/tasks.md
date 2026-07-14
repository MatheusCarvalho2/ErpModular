# Tasks: Grupos de Permissão

**Input**: Design documents from `/specs/004-grupos-permissao/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constitution I / FR-015). Playwright E2E por story; unit para catálogo se útil.

**Seed**: Presets Admin + Operadores por empresa; `membro@demo.local` → Operadores (Constitution II); credenciais pt-BR.

**i18n**: Strings do módulo/nav via `messages/pt-BR.ts` + `t()` (Constitution III).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js App Router project at repository root (`app/`, `components/`, `lib/`, `prisma/`, `messages/`, `tests/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estrutura de pastas do módulo (stack já existe)

- [x] T001 Create directories `app/app/grupos-permissao/`, `components/permission-groups/`, `lib/permissions/`, `lib/permission-groups/`, `tests/e2e/` (specs de grupos) per `plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, catálogo, sessão/authz, seed, migração Serviços de `role` → `requirePermission` — MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add Prisma models `PermissionGroup` + `PermissionGrant` and `Membership.permissionGroupId`; remove `Membership.role` per `data-model.md` in `prisma/schema.prisma`
- [x] T003 Create migration under `prisma/migrations/` (incl. data steps: presets por empresa, ADMIN→Admin, MEMBER→Operadores, backfill grants)
- [x] T004 [P] Implement permission catalog (`services:list|create|update|setActive`, helpers `businessPermissionKeys`, `isBusinessPermissionKey`) in `lib/permissions/catalog.ts`
- [x] T005 [P] Unit tests for catalog helpers in `tests/unit/permissions-catalog.test.ts`
- [x] T006 Implement `ensureCompanyPermissionPresets(companyId)` (Admin + Operadores + full business grants) in `lib/permission-groups/presets.ts`
- [x] T007 Replace `lib/services/authz.ts` with (or migrate to) `lib/permissions/authz.ts`: `requireSession`, `requireAdmin` (`isAdmin`), `requirePermission(key)` per `contracts/permission-group-actions.md`
- [x] T008 Extend Auth.js JWT/session with `permissionGroupId`, `isAdmin`, `permissions[]` (drop binary `role` or derive only if needed transitório) in `lib/auth.ts`
- [x] T009 Update Serviços Server Actions/pages to `requirePermission` (+ CTAs por permissão) in `lib/services/actions.ts`, `app/app/servicos/**`, `components/services/**` (remove `role === "ADMIN"`)
- [x] T010 Update seed: ensure presets; `admin@demo.local` → Admin; `membro@demo.local` → Operadores (full grants); 2ª empresa idem in `prisma/seed.ts`; document credentials in `README.md` (pt-BR)
- [x] T011 [P] Add i18n stub keys `nav.permissionGroups` + `permissionGroups.*` placeholders in `messages/pt-BR.ts`
- [x] T012 Add Admin-only sidebar link Grupos de permissão → `/app/grupos-permissao` in `components/shell/Sidebar.tsx`

**Checkpoint**: Foundation ready — DB, session, Serviços authz, seed; user stories can begin

---

## Phase 3: User Story 1 - Grupos padrão Admin e Operadores (Priority: P1) 🎯 MVP

**Goal**: Admin vê presets Admin e Operadores; Operadores com CRUD de negócio completo; Admin indelével / acesso total; não-Admin não remove Admin

**Independent Test**: Login admin → `/app/grupos-permissao` → vê Admin + Operadores; Operadores com todas permissões Serviços ligadas; tentar excluir Admin bloqueado; Operadores não acessa gestão de grupos

### Tests for User Story 1 (REQUIRED) ⚠️

> Write these tests FIRST; ensure they FAIL before implementation

- [x] T013 [P] [US1] E2E: admin vê presets Admin + Operadores e Operadores com grants de negócio completos em `tests/e2e/grupos-presets.spec.ts`
- [x] T014 [P] [US1] E2E: não-Admin (Operadores) não acessa `/app/grupos-permissao` em `tests/e2e/grupos-presets-authz.spec.ts`

### Implementation for User Story 1

- [x] T015 [US1] Implement `listPermissionGroups` query in `lib/permission-groups/queries.ts` (company scope, presets first)
- [x] T016 [P] [US1] Add i18n keys for list/badges/empty/errors in `messages/pt-BR.ts`
- [x] T017 [US1] Build `PermissionGroupList` (badges Sistema, sem excluir presets) in `components/permission-groups/PermissionGroupList.tsx`
- [x] T018 [US1] Implement list page with Admin guard in `app/app/grupos-permissao/page.tsx` per `contracts/ui-routes.md`
- [x] T019 [US1] Implement read-only detail/edit shell for Admin group (acesso total; sem matriz editável; deny delete) in `app/app/grupos-permissao/[id]/editar/page.tsx` + components as needed
- [x] T020 [US1] Enforce cannot delete/rename/reduce Admin in actions stub or early guards in `lib/permission-groups/actions.ts`

**Checkpoint**: US1 testable — presets visíveis; Admin protegido; Operadores default full business

---

## Phase 4: User Story 2 - Personalizar o grupo Operadores (Priority: P1)

**Goal**: Admin edita grants de Operadores (matriz CRUD); persistência; efeito em Serviços para usuário Operadores

**Independent Test**: Admin desliga `services:create` em Operadores → `membro@demo.local` não cria serviço; listagem ainda ok se `services:list` ligado

### Tests for User Story 2 (REQUIRED) ⚠️

- [x] T021 [P] [US2] E2E: admin salva matriz Operadores (remove create) e membro deixa de criar serviço em `tests/e2e/grupos-operadores-customize.spec.ts`
- [x] T022 [P] [US2] E2E: matriz não oferece permissões exclusivas de Admin em `tests/e2e/grupos-operadores-matrix.spec.ts`

### Implementation for User Story 2

- [x] T023 [US2] Implement `updatePermissionGroup` for Operadores (keys only; nome imutável) in `lib/permission-groups/actions.ts` per contract
- [x] T024 [P] [US2] Build `PermissionMatrix` (recursos × ações do catálogo de negócio) in `components/permission-groups/PermissionMatrix.tsx`
- [x] T025 [P] [US2] Add i18n keys for matrix labels/save/errors in `messages/pt-BR.ts`
- [x] T026 [US2] Wire edit page for Operadores (`systemKey=OPERADORES`) in `app/app/grupos-permissao/[id]/editar/page.tsx`
- [x] T027 [US2] Ensure session/permissions refresh path after grant update (JWT callback re-read or `session.update`) in `lib/auth.ts` / edit flow

**Checkpoint**: US1 + US2 — Operadores customizável e authz Serviços respeita grants

---

## Phase 5: User Story 3 - Criar e gerenciar grupos personalizados (Priority: P2)

**Goal**: Admin cria/edita/exclui grupos personalizados; exclusão reassocia membros a Operadores; unicidade de nome; não-Admin negado

**Independent Test**: Criar “Só leitura” com só `services:list`; excluir → usuários voltam a Operadores; nome duplicado rejeitado

### Tests for User Story 3 (REQUIRED) ⚠️

- [x] T028 [P] [US3] E2E: criar grupo personalizado + editar permissões em `tests/e2e/grupos-custom-create.spec.ts`
- [x] T029 [P] [US3] E2E: excluir personalizado reassocia a Operadores; deny delete presets; nome duplicado em `tests/e2e/grupos-custom-delete.spec.ts`
- [x] T030 [P] [US3] E2E: não-Admin não cria/edita grupos em `tests/e2e/grupos-custom-authz.spec.ts`

### Implementation for User Story 3

- [x] T031 [US3] Implement `createPermissionGroup` + `deletePermissionGroup` (reassign → Operadores em transação) in `lib/permission-groups/actions.ts`
- [x] T032 [US3] Extend `updatePermissionGroup` for personalizados (nome + keys) in `lib/permission-groups/actions.ts`
- [x] T033 [P] [US3] Add i18n keys for create/delete/name conflict in `messages/pt-BR.ts`
- [x] T034 [US3] Build create form + page in `components/permission-groups/PermissionGroupForm.tsx` and `app/app/grupos-permissao/novo/page.tsx`
- [x] T035 [US3] Wire delete action + confirm copy (menciona reassociação a Operadores) in `components/permission-groups/PermissionGroupList.tsx`
- [x] T036 [US3] Complete edit page for personalizados in `app/app/grupos-permissao/[id]/editar/page.tsx`

**Checkpoint**: US3 — CRUD de grupos personalizados + reassociação na exclusão

---

## Phase 6: User Story 4 - Vincular usuários a grupos (Priority: P2)

**Goal**: Admin atribui membership a um grupo; bloqueio do último Admin; não-Admin não altera vínculos Admin; efeito na autorização

**Independent Test**: Mover `membro@demo.local` para grupo restrito → deny create; tentar remover último Admin → bloqueado

### Tests for User Story 4 (REQUIRED) ⚠️

- [x] T037 [P] [US4] E2E: atribuir usuário a grupo muda authz (serviços) em `tests/e2e/grupos-assign-user.spec.ts`
- [x] T038 [P] [US4] E2E: bloquear remoção do último Admin; não-Admin não altera Admin em `tests/e2e/grupos-assign-authz.spec.ts`
- [x] T039 [P] [US4] E2E: isolamento por empresa (grupos/vínculos) em `tests/e2e/grupos-tenant.spec.ts`

### Implementation for User Story 4

- [x] T040 [US4] Implement `assignUserToGroup` (last-Admin guard, same company) in `lib/permission-groups/actions.ts` per contract
- [x] T041 [P] [US4] Build `AssignUserPanel` (lista memberships da empresa + select grupo) in `components/permission-groups/AssignUserPanel.tsx`
- [x] T042 [P] [US4] Add i18n keys for assign/lastAdmin errors in `messages/pt-BR.ts`
- [x] T043 [US4] Wire assign UI on group edit (and/or list) in `app/app/grupos-permissao/[id]/editar/page.tsx`
- [x] T044 [US4] After assign, invalidate/refresh session permissions for affected user path documented in `lib/auth.ts` (próxima ação protegida aplica novo grupo)

**Checkpoint**: All stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Regressão Serviços, docs, quickstart

- [x] T045 [P] Update legacy Serviços E2E that assumed MEMBER deny-write: assert Operadores default write OR restringir grants no teste antes do deny in `tests/e2e/servicos-*-authz.spec.ts`
- [x] T046 [P] Confirm i18n coverage for all new user-facing strings in `messages/pt-BR.ts`
- [x] T047 Confirm seed docs/credentials match fixtures in `README.md` and `specs/004-grupos-permissao/quickstart.md`
- [x] T048 Run quickstart.md validation scenarios (+ `npm run test:e2e` / `npm run test:unit`)
- [x] T049 [P] Remove dead imports of `Membership.role` / `lib/services/authz` antigos se restarem; grep limpo no repo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After Foundational; benefits from US1 list/edit shell
- **US3 (Phase 5)**: After Foundational; ideally after US2 matrix component exists (reuse `PermissionMatrix`)
- **US4 (Phase 6)**: After Foundational; ideally after US3 if assigning to custom groups in tests
- **Polish (Phase 7)**: After desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no story deps — **MVP**
- **US2 (P1)**: After Phase 2; reuses edit route from US1
- **US3 (P2)**: After Phase 2; reuses matrix from US2 when available
- **US4 (P2)**: After Phase 2; custom-group assign tests need US3 group

### Within Each User Story

- Tests FIRST (fail) → actions/queries → i18n/UI → wire pages
- Story complete before next priority when sequential

### Parallel Opportunities

- T004/T005 with migration work after schema drafted
- T013/T014, T021/T022, T028–T030, T037–T039 tests in parallel within a story
- T024/T025, T033/T034 UI+[P] i18n in parallel
- After Phase 2, US1 and early US2 scaffolding can overlap if careful with `actions.ts`

---

## Parallel Example: User Story 1

```bash
# Tests in parallel:
Task: "E2E presets in tests/e2e/grupos-presets.spec.ts"
Task: "E2E authz in tests/e2e/grupos-presets-authz.spec.ts"

# Then implementation:
Task: "listPermissionGroups in lib/permission-groups/queries.ts"
Task: "i18n keys in messages/pt-BR.ts"
Task: "PermissionGroupList + page"
```

---

## Parallel Example: User Story 3

```bash
Task: "E2E custom create in tests/e2e/grupos-custom-create.spec.ts"
Task: "E2E delete/reassign in tests/e2e/grupos-custom-delete.spec.ts"
Task: "E2E authz in tests/e2e/grupos-custom-authz.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 → Phase 2 (CRITICAL)
2. Phase 3: US1
3. **STOP and VALIDATE**: presets + Admin guard + seed Operadores full business
4. Demo gestão mínima

### Incremental Delivery

1. Setup + Foundational → session/authz/Serviços migrados
2. US1 → presets UI (MVP)
3. US2 → customizar Operadores
4. US3 → grupos personalizados + delete→Operadores
5. US4 → vincular usuários + last Admin
6. Polish → regressão E2E Serviços + quickstart

### Parallel Team Strategy

1. Team completes Phase 1–2 together
2. Dev A: US1 → US2; Dev B: stubs US3/US4 after matrix exists
3. Integrate on `actions.ts` carefully (sequential commits)

---

## Notes

- [P] = different files, no incomplete deps
- [USn] maps to spec user stories
- Suggested MVP: **US1** (presets + list); US2 closely follows for value of “default customizável”
- Impact: `membro@demo.local` pode escrever em Serviços até Admin restringir Operadores — E2E antigos devem ser atualizados (T045)
- Commit after each task or logical group
- Avoid: vague tasks, editing same action file in true parallel without coordination
