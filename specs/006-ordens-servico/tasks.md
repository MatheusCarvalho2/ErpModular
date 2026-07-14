# Tasks: Ordens de Serviço

**Input**: Design documents from `/specs/006-ordens-servico/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constitution I / FR-015). Playwright E2E por story; Vitest para gates de role/permissão e normalização de nome de status.

**Seed**: Status base (Recebido…Pronto; Pronto=COMPLETED), serviço “Reparo de eletrodoméstico”, ≥1 ServiceOrder demo (José Demo + equipment `2`); Operadores **sem** keys sensíveis (Constitution II); credenciais pt-BR.

**i18n**: Strings `orders.*`, `orderStatuses.*`, nav, permission resources/actions via `messages/pt-BR.ts` + `t()` (Constitution III). Nomes de status = dados da empresa.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js App Router project at repository root (`app/`, `components/`, `lib/`, `prisma/`, `messages/`, `tests/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estrutura de pastas do módulo (stack Playwright/Vitest/i18n/authz já existe)

- [x] T001 Create directories `app/app/ordens-servico/`, `app/app/ordens-servico/novo/`, `app/app/ordens-servico/status/`, `components/service-orders/`, `components/service-order-statuses/`, `lib/service-orders/`, `lib/service-order-statuses/` per `plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema Prisma, permissões (preset Operadores filtrado), i18n stubs, nav, ensureDefaultStatuses, seed mínimo — MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add Prisma enum `ServiceOrderStatusRole` and models `ServiceOrderStatus`, `ServiceOrder` (+ relations on `Company`, `Service`, `Client`, `ClientProduct`) per `data-model.md` in `prisma/schema.prisma`
- [x] T003 Create migration for ServiceOrderStatus/ServiceOrder under `prisma/migrations/`
- [x] T004 [P] Implement `ensureDefaultServiceOrderStatuses(companyId)` (5 base statuses; Recebido default OPERATIONAL; Pronto COMPLETED) in `lib/service-order-statuses/ensure-defaults.ts`
- [x] T005 Extend permission catalog with `serviceOrders:list|create|update|correctLinks|editClosed` and `serviceOrderStatuses:list|create|update|setActive` in `lib/permissions/catalog.ts`; change Operadores preset / `businessPermissionKeys` (or equivalent) so Operadores get only `serviceOrders:list|create|update`; update `tests/unit/permissions-catalog.test.ts`
- [x] T006 [P] Add unit tests for order mutation gates (OPERATIONAL vs COMPLETED/CANCELLED + permission) in `tests/unit/service-order-gates.test.ts` (pure helpers in `lib/service-orders/gates.ts` if extracted)
- [x] T007 [P] Add i18n stubs `nav.orders`, `nav.orderStatuses`, `orders.*`, `orderStatuses.*`, `permissionGroups.resource.serviceOrders|serviceOrderStatuses`, action labels `correctLinks`/`editClosed` in `messages/pt-BR.ts`
- [x] T008 Add sidebar link Ordens de Serviço → `/app/ordens-servico` gated by `serviceOrders:list` in `components/shell/Sidebar.tsx`
- [x] T009 Extend seed in `prisma/seed.ts`: call `ensureDefaultServiceOrderStatuses` for demo (+ outra); upsert service “Reparo de eletrodoméstico”; upsert ≥1 ServiceOrder (José Demo + ClientProduct identifier `2`); re-sync Operadores **without** status/editClosed/correctLinks; document fixtures in `README.md` (pt-BR)

**Checkpoint**: Foundation ready — schema, permissions, nav, seed, helpers; user stories can begin

---

## Phase 3: User Story 1 - Abrir ordem de serviço com pré-preenchimento (Priority: P1) 🎯 MVP

**Goal**: Operador com `serviceOrders:create` cria OS (serviço + cliente + equipamento), valor pré-preenchido do serviço (editável), descrição opcional, status padrão Recebido; várias OS no mesmo equipamento OK

**Independent Test**: Login → `/app/ordens-servico/novo` → selecionar reparo + José Demo + Air fryer `2` → valor sugerido → ajustar → salvar → OS na lista; sem vínculos obrigatórios falha; sem permissão negado; tenant isolado

### Tests for User Story 1 (REQUIRED) ⚠️

> Write these tests FIRST; ensure they FAIL before implementation

- [x] T010 [P] [US1] E2E: criar OS com prefill de valor e ver na listagem em `tests/e2e/ordens-create.spec.ts`
- [x] T011 [P] [US1] E2E: rejeitar create sem serviço/cliente/equipamento ou priceCents inválido em `tests/e2e/ordens-create-validation.spec.ts`
- [x] T012 [P] [US1] E2E: sem `serviceOrders:create` não cria em `tests/e2e/ordens-create-authz.spec.ts`
- [x] T013 [P] [US1] E2E: isolamento por empresa em `tests/e2e/ordens-tenant.spec.ts`
- [x] T014 [P] [US1] E2E: duas OS no mesmo equipamento permitidas em `tests/e2e/ordens-multi-equipment.spec.ts`

### Implementation for User Story 1

- [x] T015 [US1] Implement queries: active services/clients; clientProducts by client; default status; `listServiceOrdersForCompany` / `getServiceOrderForCompany` in `lib/service-orders/queries.ts` per `contracts/service-order-actions.md`
- [x] T016 [US1] Implement `createServiceOrder` (tenant, active FKs, equipment belongs to client, default status, priceCents ≥ 0) in `lib/service-orders/actions.ts`
- [x] T017 [P] [US1] Add i18n keys for create form labels/errors/success/prefill in `messages/pt-BR.ts`
- [x] T018 [US1] Build `ServiceOrderForm` (service → client → equipment cascade; prefill price from selected service) in `components/service-orders/ServiceOrderForm.tsx`
- [x] T019 [US1] Create page + `serviceOrders:create` guard in `app/app/ordens-servico/novo/page.tsx`
- [x] T020 [US1] Build `ServiceOrderList` + list page (CTA novo se create; empty state) in `components/service-orders/ServiceOrderList.tsx` and `app/app/ordens-servico/page.tsx` per `contracts/ui-routes.md`

**Checkpoint**: US1 testable — OS pode ser criada com pré-preenchimento, listada e validada

---

## Phase 4: User Story 2 - Consultar e atualizar status da ordem (Priority: P1)

**Goal**: Listar/detalhar OS; em status OPERATIONAL editar valor/descrição/status; vínculos fixos salvo Admin/`correctLinks`; em COMPLETED/CANCELLED operador read-only; Admin/`editClosed` ainda edita

**Independent Test**: Mudar Recebido→Fazendo→Pronto; membro não edita Pronto; admin edita/reabre; membro sem correctLinks não muda serviço/cliente/equipamento; admin corrige vínculos

### Tests for User Story 2 (REQUIRED) ⚠️

- [x] T021 [P] [US2] E2E: atualizar status/valor em OS operacional em `tests/e2e/ordens-update.spec.ts`
- [x] T022 [P] [US2] E2E: membro read-only em Pronto; admin `editClosed` edita em `tests/e2e/ordens-closed-readonly.spec.ts`
- [x] T023 [P] [US2] E2E: correctLinks só Admin (ou key); operador bloqueado em `tests/e2e/ordens-correct-links.spec.ts`
- [x] T024 [P] [US2] E2E: sem `serviceOrders:update` negado em `tests/e2e/ordens-update-authz.spec.ts`

### Implementation for User Story 2

- [x] T025 [US2] Implement `updateServiceOrder` + `correctServiceOrderLinks` with role/permission gates in `lib/service-orders/actions.ts` per `contracts/service-order-actions.md`
- [x] T026 [P] [US2] Add i18n keys for detail/edit, read-only closed, correct-links, errors in `messages/pt-BR.ts`
- [x] T027 [US2] Build detail/edit UI (status select; disable fields by gate) in `components/service-orders/ServiceOrderDetail.tsx` (and/or edit sections)
- [x] T028 [US2] Implement detail page `/app/ordens-servico/[id]` with permission-aware actions in `app/app/ordens-servico/[id]/page.tsx`

**Checkpoint**: US1 + US2 — criar, listar, avançar status, locks pós-encerramento e correctLinks

---

## Phase 5: User Story 3 - Administrar catálogo de status (Priority: P2)

**Goal**: Admin gerencia status: CRUD soft, papel OPERATIONAL|COMPLETED|CANCELLED, default inicial operacional, reordenação, vários status por papel; rename reflete nas OS

**Independent Test**: Ver 5 seedados (Pronto=COMPLETED); criar Cancelado CANCELLED; renomear; mudar default; inativar com regras; grupo sem `serviceOrderStatuses:*` negado

### Tests for User Story 3 (REQUIRED) ⚠️

- [x] T029 [P] [US3] E2E: listar status base + papéis em `tests/e2e/order-statuses-list.spec.ts`
- [x] T030 [P] [US3] E2E: criar/renomear/definir papel/default e unicidade de nome em `tests/e2e/order-statuses-manage.spec.ts`
- [x] T031 [P] [US3] E2E: inativar status (histórico preservado; some do select) em `tests/e2e/order-statuses-active.spec.ts`
- [x] T032 [P] [US3] E2E: sem `serviceOrderStatuses:create|update` negado em `tests/e2e/order-statuses-authz.spec.ts`
- [x] T033 [P] [US3] Unit: nameNormalized uniqueness helper / default-initial rules in `tests/unit/service-order-status.test.ts`

### Implementation for User Story 3

- [x] T034 [US3] Implement status queries + `createServiceOrderStatus` / `updateServiceOrderStatus` / `setServiceOrderStatusActive` in `lib/service-order-statuses/queries.ts` and `lib/service-order-statuses/actions.ts` per `contracts/service-order-status-actions.md`
- [x] T035 [P] [US3] Add i18n keys for status catalog UI (roles, default, errors) in `messages/pt-BR.ts`
- [x] T036 [US3] Build status list/form components in `components/service-order-statuses/StatusList.tsx` and `StatusForm.tsx`
- [x] T037 [US3] Implement status admin page + nav secondary link in `app/app/ordens-servico/status/page.tsx` and `components/shell/Sidebar.tsx` (`nav.orderStatuses`, gated by `serviceOrderStatuses:list`)
- [x] T038 [US3] Wire status selects in order create/detail to only **active** statuses ordered by `sortOrder` (already partially in US1/US2 — ensure role-driven locks still use current status.role after rename)

**Checkpoint**: Catálogo de status configurável; OS respeitam papéis

---

## Phase 6: User Story 4 - Filtrar/acompanhar ordens por status (Priority: P3)

**Goal**: Filtrar listagem por `statusId`; limpar filtro volta à visão completa

**Independent Test**: OS em status distintos; `?statusId=` (ou UI) mostra só aquele; limpar mostra todas

### Tests for User Story 4 (REQUIRED) ⚠️

- [x] T039 [P] [US4] E2E: filtrar lista por status e limpar filtro em `tests/e2e/ordens-filter-status.spec.ts`

### Implementation for User Story 4

- [x] T040 [US4] Extend `listServiceOrdersForCompany` to accept `statusId` filter in `lib/service-orders/queries.ts`
- [x] T041 [P] [US4] Add i18n keys for filter UI in `messages/pt-BR.ts`
- [x] T042 [US4] Add status filter control on list page (`?statusId=`) in `app/app/ordens-servico/page.tsx` and `components/service-orders/ServiceOrderList.tsx`

**Checkpoint**: Operador organiza o dia por estágio da OS

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Consistência, docs, validação quickstart

- [x] T043 [P] Confirm all new user-facing strings use i18n (`messages/pt-BR.ts`); no hard-coded UI copy in new components
- [x] T044 [P] Confirm seed docs/credentials in `README.md` match fixtures (status, reparo, OS demo, Operadores keys)
- [x] T045 Run `npm run test:unit` and `npm run test:e2e` for ordens/order-statuses suites; fix failures
- [x] T046 Validate scenarios in `specs/006-ordens-servico/quickstart.md` manually once after green CI-local
- [x] T047 [P] Update `tests/unit/permissions-catalog.test.ts` assertions for filtered Operadores keys if not fully covered in T005

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After Foundational; practically after US1 list/detail shell (T015/T020) — independently testable with seed OS
- **US3 (Phase 5)**: After Foundational; can parallel US1/US2 after T004 exists; needs order selects wired (T038 touches order UI)
- **US4 (Phase 6)**: After US1 list page exists (T020)
- **Polish (Phase 7)**: After desired stories complete

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational — no dependency on US2–4
- **User Story 2 (P1)**: Uses create/list from US1; seed OS allows testing update without re-doing create UI
- **User Story 3 (P2)**: Status model from Foundational; UI independent; T038 integrates with order forms
- **User Story 4 (P3)**: Depends on list page from US1

### Within Each User Story

- Tests first (fail) → actions/queries → i18n → components → pages
- Story complete before next priority when staffing is sequential

### Parallel Opportunities

- T004, T006, T007 in Foundational after catalog/schema direction clear
- All E2E stubs marked [P] within a story can be drafted in parallel
- US3 status lib/UI can proceed in parallel with US1 form work after T002–T005
- T043, T044, T047 in Polish are [P]

---

## Parallel Example: User Story 1

```bash
# Tests in parallel:
Task: "E2E create + prefill in tests/e2e/ordens-create.spec.ts"
Task: "E2E validation in tests/e2e/ordens-create-validation.spec.ts"
Task: "E2E authz in tests/e2e/ordens-create-authz.spec.ts"
Task: "E2E tenant in tests/e2e/ordens-tenant.spec.ts"
Task: "E2E multi-equipment in tests/e2e/ordens-multi-equipment.spec.ts"

# After actions exist:
Task: "i18n create keys in messages/pt-BR.ts"
Task: "ServiceOrderForm in components/service-orders/ServiceOrderForm.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Tests in parallel:
Task: "E2E order-statuses-list.spec.ts"
Task: "E2E order-statuses-manage.spec.ts"
Task: "E2E order-statuses-active.spec.ts"
Task: "E2E order-statuses-authz.spec.ts"
Task: "Unit service-order-status.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: create + list + prefill + authz/tenant
5. Demo se ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → MVP (abrir OS)
3. US2 → acompanhar/editar + locks
4. US3 → admin configura status/papéis
5. US4 → filtro por status
6. Polish → quickstart + suites verdes

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Then:
   - Dev A: US1 → US2
   - Dev B: US3 (status catalog)
   - Dev C: US4 after list exists + polish

---

## Notes

- [P] = different files, no incomplete blockers
- [Story] labels map to spec user stories US1–US4
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at checkpoints to validate independently
- Avoid hard-coded UI strings; Operadores must not receive `serviceOrderStatuses:*`, `correctLinks`, `editClosed` by default
