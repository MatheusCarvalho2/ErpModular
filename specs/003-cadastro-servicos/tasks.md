# Tasks: Cadastro de Serviços

**Input**: Design documents from `/specs/003-cadastro-servicos/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constitution I / FR-013). Playwright E2E por story; unit para `normalizeName`.

**Seed**: MEMBER + serviços demo (Constitution II); credenciais documentadas em pt-BR.

**i18n**: Camada mínima pt-BR para strings do módulo (Constitution III).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js App Router project at repository root (`app/`, `components/`, `lib/`, `prisma/`, `messages/`, `tests/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependências e estrutura de pastas do módulo

- [x] T001 Add Playwright (and Vitest if used for unit) plus `test:e2e` / `test:unit` scripts in `package.json`
- [x] T002 [P] Create directories `app/app/servicos/`, `components/services/`, `lib/services/`, `messages/`, `tests/e2e/`, `tests/unit/`
- [x] T003 [P] Add Playwright config in `playwright.config.ts` (baseURL `http://localhost:3000`, testDir `tests/e2e`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema Service, sessão com role, i18n, helpers, seed, nav — MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add Prisma model `Service` (+ `Company.services`) per `data-model.md` in `prisma/schema.prisma`
- [x] T005 Create migration for `Service` under `prisma/migrations/`
- [x] T006 [P] Implement `normalizeName` in `lib/service-name.ts` (trim, NFD, strip diacritics, lowercase)
- [x] T007 [P] Implement i18n helper `t` in `lib/i18n.ts` and dictionary stub in `messages/pt-BR.ts`
- [x] T008 Extend Auth.js JWT/session with `role` from `Membership` in `lib/auth.ts`
- [x] T009 [P] Add authz helpers `requireSession` / `requireAdmin` in `lib/services/authz.ts`
- [x] T010 Extend seed: MEMBER user + ≥1 active Service (+ optional inactive + optional 2nd company) in `prisma/seed.ts`; document credentials in `README.md` (pt-BR)
- [x] T011 Add sidebar nav item Serviços → `/app/servicos` via i18n in `components/shell/Sidebar.tsx`
- [x] T012 [P] Unit tests for `normalizeName` (case/accent) in `tests/unit/service-name.test.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Cadastrar um novo serviço (Priority: P1) 🎯 MVP

**Goal**: Administrador cria serviço (Nome*, Descrição*, opcionais valor/tempo/desc. produto) com validação e unicidade entre ativos

**Independent Test**: Login admin → `/app/servicos/novo` → salvar válidos → serviço existe; sem obrigatórios falha; MEMBER não cria; “Café”/“cafe” colidem se ambos ativos

### Tests for User Story 1 (REQUIRED) ⚠️

> Write these tests FIRST; ensure they FAIL before implementation

- [x] T013 [P] [US1] E2E: admin cria serviço válido e vê confirmação/listagem em `tests/e2e/servicos-create.spec.ts`
- [x] T014 [P] [US1] E2E: rejeita obrigatórios vazios e nome duplicado case/acento-insensitive em `tests/e2e/servicos-create-validation.spec.ts`
- [x] T015 [P] [US1] E2E: MEMBER não consegue criar (UI e/ou ação) em `tests/e2e/servicos-create-authz.spec.ts`

### Implementation for User Story 1

- [x] T016 [US1] Implement `createService` Server Action (validação, `nameNormalized`, `priceCents`, `durationMinutes`, company scope, ADMIN only) in `lib/services/actions.ts` per `contracts/service-actions.md`
- [x] T017 [P] [US1] Add i18n keys for create form labels/errors/success in `messages/pt-BR.ts`
- [x] T018 [US1] Build `ServiceForm` (name, price, hours+minutes, description, productDescription) in `components/services/ServiceForm.tsx`
- [x] T019 [US1] Create page wiring form + admin guard in `app/app/servicos/novo/page.tsx`
- [x] T020 [US1] Ensure unauthenticated access to `/app/servicos/novo` redirects to login (middleware/existing `/app` guard); MEMBER denied with i18n message

**Checkpoint**: US1 testable — admin can create; validation + authz enforced

---

## Phase 4: User Story 2 - Consultar serviços cadastrados (Priority: P1)

**Goal**: Qualquer autenticado lista serviços ativos da própria empresa; empty state; inativos ocultos na visão padrão

**Independent Test**: Com seed ativos, MEMBER e ADMIN veem lista; sem ativos → empty; inativos não aparecem no default; outra empresa não vaza

### Tests for User Story 2 (REQUIRED) ⚠️

- [x] T021 [P] [US2] E2E: lista ativos (admin e membro) e empty state em `tests/e2e/servicos-list.spec.ts`
- [x] T022 [P] [US2] E2E: isolamento por empresa (se seed 2ª empresa) em `tests/e2e/servicos-tenant.spec.ts`

### Implementation for User Story 2

- [x] T023 [US2] Implement list query helper (filter `companyId` + `active: true` by default) in `lib/services/queries.ts`
- [x] T024 [P] [US2] Add i18n keys for list columns, empty state, CTA in `messages/pt-BR.ts`
- [x] T025 [US2] Build list UI (name, price pt-BR, duration h+min) in `components/services/ServiceList.tsx`
- [x] T026 [US2] Implement list page (empty state; ADMIN CTA → novo) in `app/app/servicos/page.tsx`
- [x] T027 [US2] Format helpers for BRL cents and hours+minutes display in `lib/services/format.ts` (or colocated)

**Checkpoint**: US1 + US2 work — create then list for company users

---

## Phase 5: User Story 3 - Editar um serviço existente (Priority: P2)

**Goal**: ADMIN edita campos de serviço da própria empresa; MEMBER e cross-company negados; unicidade na troca de nome

**Independent Test**: Admin edita ativo → mudanças na lista; obrigatórios vazios bloqueiam; MEMBER não edita; id de outra empresa negado

### Tests for User Story 3 (REQUIRED) ⚠️

- [x] T028 [P] [US3] E2E: admin edita serviço e vê valores atualizados em `tests/e2e/servicos-edit.spec.ts`
- [x] T029 [P] [US3] E2E: MEMBER e id cross-company negados em `tests/e2e/servicos-edit-authz.spec.ts`

### Implementation for User Story 3

- [x] T030 [US3] Implement `updateService` Server Action in `lib/services/actions.ts` per contract
- [x] T031 [P] [US3] Add i18n keys for edit page/errors in `messages/pt-BR.ts`
- [x] T032 [US3] Reuse/extend `ServiceForm` for edit mode in `components/services/ServiceForm.tsx`
- [x] T033 [US3] Implement edit page with load-by-id (company-scoped) in `app/app/servicos/[id]/editar/page.tsx`
- [x] T034 [US3] Add edit action entry points from list for ADMIN only in `components/services/ServiceList.tsx`

**Checkpoint**: US3 testable independently with seed/create service

---

## Phase 6: User Story 4 - Inativar e reativar serviço (Priority: P2)

**Goal**: ADMIN soft-inativa (some da lista padrão) e reativa (com checagem de unicidade); filtro/visão de inativos; MEMBER não altera status

**Independent Test**: Inativar → some do default; visão inativos → reativar → volta; MEMBER blocked; reativar com nome colidindo com outro ativo falha

### Tests for User Story 4 (REQUIRED) ⚠️

- [x] T035 [P] [US4] E2E: inativar/reativar e filtro inativos em `tests/e2e/servicos-active.spec.ts`
- [x] T036 [P] [US4] E2E: MEMBER não inativa/reativa; conflito de nome na reativação em `tests/e2e/servicos-active-authz.spec.ts`

### Implementation for User Story 4

- [x] T037 [US4] Implement `setServiceActive` Server Action in `lib/services/actions.ts` per contract
- [x] T038 [P] [US4] Add i18n keys for inactivate/reactivate/filter in `messages/pt-BR.ts`
- [x] T039 [US4] Extend list query for `?status=inactive` (ADMIN) in `lib/services/queries.ts` and `app/app/servicos/page.tsx`
- [x] T040 [US4] Build status actions UI in `components/services/ServiceStatusActions.tsx` and wire into list/edit for ADMIN

**Checkpoint**: All four stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Docs e fechamento Constitution / quickstart

- [x] T041 [P] Update `README.md` with Serviços routes, MEMBER credentials, and `test:e2e` command (pt-BR)
- [x] T042 Confirm all new Serviços UI strings use `t()` / `messages/pt-BR.ts` (no hard-coded module copy)
- [x] T043 Confirm seed idempotent and fixtures match `quickstart.md` / `data-model.md`
- [x] T044 Run validation scenarios from `specs/003-cadastro-servicos/quickstart.md` and fix gaps
- [x] T045 [P] Align any leftover home copy in `app/app/page.tsx` if it still claims “sem módulos de negócio”

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After Foundational; pairs with US1 for full P1 (list after create)
- **US3 (Phase 5)**: After Foundational; practical dependency on Service rows (seed or US1)
- **US4 (Phase 6)**: After Foundational; benefits from US2 list filter UI
- **Polish (Phase 7)**: After desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 only — MVP create path
- **US2 (P1)**: After Phase 2 — can proceed in parallel with US1 if staffed; integrates on `/app/servicos`
- **US3 (P2)**: After Phase 2 — needs existing Service (seed OK)
- **US4 (P2)**: After Phase 2 — shares list page with US2 (coordinate `page.tsx` / list components)

### Within Each User Story

- Tests FIRST (fail) → actions/helpers → UI → wire pages
- i18n keys before or with UI that consumes them

### Parallel Opportunities

- T002/T003; T006/T007/T009/T012 in Foundational
- T013–T015 tests in parallel; T017 parallel to T016 start
- T021–T022; T028–T029; T035–T036 test pairs
- After Phase 2: US1 and US2 can proceed in parallel with care on `app/app/servicos/page.tsx`

---

## Parallel Example: User Story 1

```bash
# Tests in parallel:
Task: "E2E admin cria serviço em tests/e2e/servicos-create.spec.ts"
Task: "E2E validação em tests/e2e/servicos-create-validation.spec.ts"
Task: "E2E authz MEMBER em tests/e2e/servicos-create-authz.spec.ts"

# Then implementation:
Task: "createService in lib/services/actions.ts"
Task: "i18n keys in messages/pt-BR.ts"  # parallel with action
Task: "ServiceForm + novo/page.tsx"
```

---

## Parallel Example: User Story 4

```bash
Task: "E2E inativar/reativar em tests/e2e/servicos-active.spec.ts"
Task: "E2E authz/conflito em tests/e2e/servicos-active-authz.spec.ts"
Task: "setServiceActive + filter query + ServiceStatusActions"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup  
2. Complete Phase 2: Foundational  
3. Complete Phase 3: US1 (create)  
4. **STOP and VALIDATE** with T013–T015 / manual create path  
5. Demo admin cadastro before list polish if needed  

### Incremental Delivery

1. Setup + Foundational → foundation ready  
2. US1 → create MVP  
3. US2 → list/empty/tenant  
4. US3 → edit  
5. US4 → soft-inactivate/reactivate  
6. Polish → README + quickstart green  

### Parallel Team Strategy

1. Team finishes Setup + Foundational together  
2. Dev A: US1 · Dev B: US2 · then US3/US4  
3. Coordinate shared files: `lib/services/actions.ts`, `app/app/servicos/page.tsx`, `messages/pt-BR.ts`

---

## Notes

- [P] = different files, no incomplete dependencies
- [USn] required on story-phase tasks only
- Every task has checkbox, ID, and file path
- Suggested MVP: Phase 1–3 (Setup + Foundational + US1)
- Avoid hard delete, categories, OS/fiscal, multi-locale
