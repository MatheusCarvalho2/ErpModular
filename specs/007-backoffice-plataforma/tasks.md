# Tasks: Backoffice da Plataforma

**Input**: Design documents from `/specs/007-backoffice-plataforma/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constitution I / FR-013). Playwright E2E por story; Vitest para `slug` se não-trivial.

**Seed**: Operador `platform@erpmodular.local`, empresa/usuário inativos de fixture; flags `active` / `isPlatformOperator` / `mustChangePassword` (Constitution II); credenciais pt-BR.

**i18n**: Strings do backoffice, login dedicado e troca de senha via `messages/pt-BR.ts` + `t()` (Constitution III).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js App Router project at repository root (`app/`, `components/`, `lib/`, `prisma/`, `messages/`, `tests/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estrutura de pastas do módulo (stack NextAuth/Playwright/i18n já existe)

- [x] T001 Create directories `app/(platform)/backoffice/`, `app/(platform)/backoffice/login/`, `app/(platform)/backoffice/empresas/`, `app/(platform)/backoffice/usuarios/`, `app/change-password/`, `components/platform/`, `lib/platform/` per `plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, auth plataforma, middleware, authz, seed operador, i18n stubs — MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Extend Prisma `User` with `active`, `isPlatformOperator`, `mustChangePassword` and `Company` with `active` per `data-model.md` in `prisma/schema.prisma`
- [x] T003 Create migration for platform fields under `prisma/migrations/`
- [x] T004 [P] Implement `slugifyCompanyName` (+ unique suffix helper) in `lib/platform/slug.ts`
- [x] T005 [P] Unit tests for slug helper in `tests/unit/platform-slug.test.ts`
- [x] T006 Implement `requirePlatformOperator` in `lib/platform/authz.ts` per `contracts/platform-auth.md`
- [x] T007 Extend Auth.js: Credentials provider `platform`, JWT/session `sessionKind`, ERP `authorize` checks `User.active` / `!isPlatformOperator` / `Company.active` in `lib/auth.ts` per `contracts/platform-auth.md` and `research.md` R2–R3
- [x] T008 Extend `requireSession` / ERP layout guards for inactive user/company and `mustChangePassword` redirect signal in `lib/permissions/authz.ts` (and/or `app/app/layout.tsx`) per `contracts/platform-auth.md`
- [x] T009 Update `middleware.ts` matcher for `/backoffice/:path*` and `/change-password`; route guards for `sessionKind` per `contracts/ui-routes.md`
- [x] T010 [P] Add i18n stubs `backoffice.*`, `auth.changePassword.*`, platform login errors in `messages/pt-BR.ts`
- [x] T011 Extend seed: upsert platform operator `platform@erpmodular.local` (`isPlatformOperator=true`, no membership); set `active=true` on existing demo users/companies; add ≥1 inactive company and ≥1 inactive client user fixtures; document credentials in `README.md` (pt-BR) in `prisma/seed.ts`
- [x] T012 [P] Extend E2E helpers: `CREDENTIALS.platform`, `loginPlatformAs(page, …)` in `tests/e2e/helpers.ts`

**Checkpoint**: Foundation ready — schema, dual auth, middleware, seed operador; user stories can begin

---

## Phase 3: User Story 1 - Acessar o backoffice da plataforma (Priority: P1) 🎯 MVP

**Goal**: Super admin entra por `/backoffice/login` na ferramenta externa; usuários de empresa são negados; login ERP continua só no ERP

**Independent Test**: `loginPlatformAs` → `/backoffice`; credenciais `admin@demo.local` falham no login plataforma; sessão ERP em `/app` não abre console plataforma; anônimo em `/backoffice` → login dedicado

### Tests for User Story 1 (REQUIRED) ⚠️

> Write these tests FIRST; ensure they FAIL before implementation

- [x] T013 [P] [US1] E2E: platform login success → `/backoffice` shell in `tests/e2e/backoffice-login.spec.ts`
- [x] T014 [P] [US1] E2E: tenant user denied on `/backoffice/login` and cannot open console in `tests/e2e/backoffice-login-deny.spec.ts`
- [x] T015 [P] [US1] E2E: unauthenticated `/backoffice` redirects to `/backoffice/login` (not `/login`) in `tests/e2e/backoffice-auth-redirect.spec.ts`

### Implementation for User Story 1

- [x] T016 [P] [US1] Build `PlatformLoginForm` (provider `platform`, i18n) in `components/platform/PlatformLoginForm.tsx`
- [x] T017 [US1] Implement `/backoffice/login` page in `app/(platform)/backoffice/login/page.tsx` per `contracts/ui-routes.md`
- [x] T018 [US1] Implement platform shell layout (nav placeholder: Dashboard/Empresas/Usuários/Sair + `requirePlatformOperator`) in `app/(platform)/backoffice/layout.tsx`
- [x] T019 [US1] Add minimal `/backoffice` landing page (placeholder until US4) in `app/(platform)/backoffice/page.tsx`
- [x] T020 [US1] Ensure ERP `/login` still lands tenant users on `/app` only (regression; no redirect to backoffice) — adjust `components/auth/LoginForm.tsx` / middleware if needed

**Checkpoint**: US1 testable — entrada dedicada e isolamento ERP ↔ plataforma

---

## Phase 4: User Story 2 - Liberar acesso (empresa, usuário, edição, reset senha) (Priority: P1)

**Goal**: Criar/editar empresas e usuários (usuário → sempre Admin da empresa); reset com senha temporária + `/change-password` no ERP

**Independent Test**: Platform cria empresa + usuário → login ERP como Admin; e-mail duplicado rejeitado; reset → troca obrigatória antes de `/app`; editar nome/e-mail persiste

### Tests for User Story 2 (REQUIRED) ⚠️

- [x] T021 [P] [US2] E2E: create company + user then ERP login as company Admin in `tests/e2e/backoffice-provision.spec.ts`
- [x] T022 [P] [US2] E2E: duplicate email rejected; edit company/user fields in `tests/e2e/backoffice-users-edit.spec.ts`
- [x] T023 [P] [US2] E2E: reset password → forced change at `/change-password` then `/app` in `tests/e2e/backoffice-password-reset.spec.ts`

### Implementation for User Story 2

- [x] T024 [US2] Implement company queries (`listCompanies`, get-by-id) in `lib/platform/queries.ts` per `contracts/platform-actions.md`
- [x] T025 [US2] Implement `createCompany`, `updateCompany` Server Actions (slug, unique active name, `ensureCompanyPermissionPresets`) in `lib/platform/actions.ts`
- [x] T026 [US2] Implement user queries + `createUser` (Membership → Admin), `updateUser`, `resetUserPassword` in `lib/platform/actions.ts` / `lib/platform/queries.ts`
- [x] T027 [P] [US2] Add i18n keys for empresas/usuários forms, lists, validation, reset in `messages/pt-BR.ts`
- [x] T028 [P] [US2] Build `CompanyForm` / `CompanyList` in `components/platform/CompanyForm.tsx` and `components/platform/CompanyList.tsx`
- [x] T029 [P] [US2] Build `UserForm` / `UserList` (incl. reset password UI) in `components/platform/UserForm.tsx` and `components/platform/UserList.tsx`
- [x] T030 [US2] Wire pages `/backoffice/empresas`, `/nova`, `/[id]` in `app/(platform)/backoffice/empresas/` per `contracts/ui-routes.md`
- [x] T031 [US2] Wire pages `/backoffice/usuarios`, `/novo`, `/[id]` in `app/(platform)/backoffice/usuarios/` per `contracts/ui-routes.md`
- [x] T032 [US2] Implement `changeOwnPassword` action + `ChangePasswordForm` + page `app/change-password/page.tsx` in `lib/platform/actions.ts` (or `lib/auth/password-actions.ts`) and `components/auth/ChangePasswordForm.tsx`
- [x] T033 [US2] Enforce `mustChangePassword` gate: middleware/layout redirect `/app` → `/change-password` until cleared

**Checkpoint**: US1+US2 — provisionar cliente e gerir acesso/senha

---

## Phase 5: User Story 3 - Inativar e reativar contas (Priority: P1)

**Goal**: Inativar/reativar usuários e empresas; bloqueio de login ERP; salvaguardar último operador plataforma

**Independent Test**: Inativar usuário → login ERP falha; reativar ok; inativar empresa → membros não entram; tentar inativar último platform operator → negado

### Tests for User Story 3 (REQUIRED) ⚠️

- [x] T034 [P] [US3] E2E: inactivate/reactivate user blocks/allows ERP login in `tests/e2e/backoffice-user-active.spec.ts`
- [x] T035 [P] [US3] E2E: inactivate/reactivate company blocks/allows ERP login in `tests/e2e/backoffice-company-active.spec.ts`
- [x] T036 [P] [US3] E2E: cannot deactivate last active platform operator (action-level or UI) in `tests/e2e/backoffice-last-operator.spec.ts`

### Implementation for User Story 3

- [x] T037 [US3] Implement `setCompanyActive`, `setUserActive`, `setPlatformOperatorActive` (last-operator guard) in `lib/platform/actions.ts` per `contracts/platform-actions.md`
- [x] T038 [P] [US3] Add i18n keys for activate/inactivate feedback in `messages/pt-BR.ts`
- [x] T039 [US3] Wire status actions UI on company/user detail+list in `components/platform/` (e.g. `CompanyStatusActions.tsx`, `UserStatusActions.tsx`)
- [x] T040 [US3] Confirm ERP `authorize` / `requireSession` reject inactive user or inactive company (regression covered by T034–T035)

**Checkpoint**: US3 — controle de assinatura/acesso via status

---

## Phase 6: User Story 4 - Dashboard resumo de clientes (Priority: P2)

**Goal**: Totais de empresas e usuários clientes (exclui operadores) + usuários por empresa

**Independent Test**: Com seed, dashboard bate contagens; criar/inativar altera números na mesma sessão

### Tests for User Story 4 (REQUIRED) ⚠️

- [x] T041 [P] [US4] E2E: dashboard totals match seed fixtures (companies + client users excl. platform; per-company counts) in `tests/e2e/backoffice-dashboard.spec.ts`
- [x] T042 [P] [US4] E2E: after create/inactivate company, dashboard updates coherently in `tests/e2e/backoffice-dashboard-updates.spec.ts`

### Implementation for User Story 4

- [x] T043 [US4] Implement `getDashboardSummary` in `lib/platform/queries.ts` (or actions) per `contracts/platform-actions.md`
- [x] T044 [P] [US4] Add i18n keys for dashboard labels/empty in `messages/pt-BR.ts`
- [x] T045 [US4] Build `DashboardSummary` UI in `components/platform/DashboardSummary.tsx`
- [x] T046 [US4] Replace `/backoffice` placeholder with dashboard page in `app/(platform)/backoffice/page.tsx`

**Checkpoint**: All stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Docs, cobertura i18n/seed, validação quickstart

- [x] T047 [P] Update `README.md` with backoffice URL + platform credentials (pt-BR) if not fully done in T011
- [x] T048 Confirm all new user-facing strings use `t()` / `messages/pt-BR.ts` (no hard-coded backoffice/change-password copy)
- [x] T049 Confirm seed idempotent (re-run `npx prisma db seed` does not duplicate platform/fixtures)
- [x] T050 Run `specs/007-backoffice-plataforma/quickstart.md` validation scenarios manually or via E2E suite
- [x] T051 [P] Optional: unit tests for dashboard count helpers if extracted in `tests/unit/platform-dashboard.test.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After Foundational; ideally after US1 (shell/nav exists)
- **US3 (Phase 5)**: After Foundational; needs US2 list/detail pages for status UI (or add actions on minimal pages)
- **US4 (Phase 6)**: After Foundational; strongest value after US2/US3 data exists
- **Polish (Phase 7)**: After desired stories complete

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories — MVP
- **US2 (P1)**: Uses platform shell from US1; independently testable with provision→ERP login
- **US3 (P1)**: Uses company/user surfaces from US2; independently testable via setActive + ERP login
- **US4 (P2)**: Read-only aggregates; can start after Foundational + seed, validates best with US2/US3 data

### Within Each User Story

- Tests FIRST (fail before implementation)
- Actions/queries before UI
- Pages after components
- Story complete before next priority when sequential

### Parallel Opportunities

- Phase 2: T004/T005, T010, T012 in parallel where marked [P]
- US1: T013–T015 tests in parallel; T016 parallel to test writing
- US2: T021–T023 tests in parallel; T027–T029 UI components in parallel after actions
- US3: T034–T036 tests in parallel
- US4: T041–T042 tests in parallel; T044 with T043

---

## Parallel Example: User Story 1

```bash
# Tests in parallel:
Task: "E2E platform login success in tests/e2e/backoffice-login.spec.ts"
Task: "E2E tenant deny in tests/e2e/backoffice-login-deny.spec.ts"
Task: "E2E redirect unauthenticated in tests/e2e/backoffice-auth-redirect.spec.ts"

# Then implementation:
Task: "PlatformLoginForm in components/platform/PlatformLoginForm.tsx"
Task: "login page + layout + landing under app/(platform)/backoffice/"
```

---

## Parallel Example: User Story 2

```bash
# After actions exist, UI in parallel:
Task: "CompanyForm/List in components/platform/"
Task: "UserForm/List in components/platform/"
Task: "i18n keys in messages/pt-BR.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1–2 (Setup + Foundational)
2. Complete Phase 3: US1
3. **STOP and VALIDATE**: login dedicado + deny tenant
4. Demo entrada da ferramenta externa

### Incremental Delivery

1. Setup + Foundational → dual auth + seed
2. US1 → acesso plataforma (MVP)
3. US2 → liberar empresas/usuários + reset senha
4. US3 → inativar/reativar
5. US4 → dashboard
6. Polish → README + quickstart

### Parallel Team Strategy

1. Team finishes Foundational together
2. Then: Dev A US1→US2 shells; Dev B can draft US4 queries against seed; Dev C US3 after list pages exist

---

## Notes

- [P] = different files, no incomplete-task dependencies
- [USn] maps to spec user stories
- Usuário criado no backoffice → **sempre** grupo Admin (`ensureCompanyPermissionPresets` + systemKey ADMIN)
- Operadores plataforma **fora** das contagens de usuários clientes
- Commit after each task or logical group
- Verify E2E fail before implementing each story
