# Tasks: Cadastro de Produtos e Vínculo com Cliente

**Input**: Design documents from `/specs/005-cadastro-produtos/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constitution I / FR-016). Playwright E2E por story; Vitest para normalização de texto/telefone/identificador.

**Seed**: Product Air fryer, clientes demo, vínculos com identifiers, re-sync Operadores (Constitution II); credenciais pt-BR.

**i18n**: Strings dos módulos/nav/permission resources via `messages/pt-BR.ts` + `t()` (Constitution III).

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

- [x] T001 Create directories `app/app/produtos/`, `app/app/clientes/`, `components/products/`, `components/clients/`, `lib/products/`, `lib/clients/`, `lib/client-products/` per `plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema Prisma, helpers de normalização, catálogo de permissões, i18n stubs, nav, seed mínimo — MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add Prisma models `Product`, `Client`, `ClientProduct` (+ relations on `Company`) per `data-model.md` in `prisma/schema.prisma`
- [x] T003 Create migration for Product/Client/ClientProduct under `prisma/migrations/`
- [x] T004 [P] Extract/reuse text normalizer (`trim`, NFD, strip diacritics, lowercase) in `lib/normalize-text.ts` (prefer shared over duplicating `lib/service-name.ts`; keep service name API stable or re-export)
- [x] T005 [P] Implement `normalizePhoneDigits` in `lib/phone.ts`
- [x] T006 [P] Unit tests for text + phone + identifier normalization in `tests/unit/normalize-text.test.ts` and `tests/unit/phone.test.ts`
- [x] T007 Extend permission catalog with `products:*`, `clients:*`, `clientProducts:*` (list/create/update/setActive) in `lib/permissions/catalog.ts`; update `tests/unit/permissions-catalog.test.ts`
- [x] T008 [P] Add i18n stubs `nav.products`, `nav.clients`, `products.*`, `clients.*`, `clientProducts.*`, `permissionGroups.resource.products|clients|clientProducts` in `messages/pt-BR.ts`
- [x] T009 Add sidebar links Produtos → `/app/produtos` and Clientes → `/app/clientes` (gated by `products:list` / `clients:list`) in `components/shell/Sidebar.tsx`
- [x] T010 Extend seed: upsert Product “Air fryer”, ≥2 Clients, ≥1 ClientProduct with identifiers; call Operadores full-business reset so new keys apply in `prisma/seed.ts`; document fixtures in `README.md` (pt-BR)

**Checkpoint**: Foundation ready — schema, permissions, nav, seed, helpers; user stories can begin

---

## Phase 3: User Story 1 - Cadastrar produto no catálogo (Priority: P1) 🎯 MVP

**Goal**: Usuário com `products:create` cadastra produto (Nome*, Descrição opcional) com unicidade case/acento-insensitive entre ativos

**Independent Test**: Login com create → `/app/produtos/novo` → salvar → produto na empresa; sem nome falha; duplicado “Air fryer”/“air fryer” rejeitado; sem permissão negado

### Tests for User Story 1 (REQUIRED) ⚠️

> Write these tests FIRST; ensure they FAIL before implementation

- [x] T011 [P] [US1] E2E: criar produto válido e ver na listagem em `tests/e2e/produtos-create.spec.ts`
- [x] T012 [P] [US1] E2E: rejeitar nome vazio e duplicado case/acento em `tests/e2e/produtos-create-validation.spec.ts`
- [x] T013 [P] [US1] E2E: sem `products:create` não cria em `tests/e2e/produtos-create-authz.spec.ts`

### Implementation for User Story 1

- [x] T014 [US1] Implement `createProduct` Server Action (validação, `nameNormalized`, company scope, `products:create`) in `lib/products/actions.ts` per `contracts/product-actions.md`
- [x] T015 [P] [US1] Add i18n keys for product create labels/errors/success in `messages/pt-BR.ts`
- [x] T016 [US1] Build `ProductForm` in `components/products/ProductForm.tsx`
- [x] T017 [US1] Create page + permission guard in `app/app/produtos/novo/page.tsx`
- [x] T018 [US1] Ensure unauthenticated `/app/produtos/*` redirects to login (existing `/app` middleware); forbidden without create permission

**Checkpoint**: US1 testable — produto pode ser criado com validação e authz

---

## Phase 4: User Story 2 - Consultar produtos do catálogo (Priority: P1)

**Goal**: Quem tem `products:list` vê produtos ativos da empresa; empty state; inativos ocultos no default

**Independent Test**: Com seed/ativos, lista mostra nomes; empty sem ativos; inativo fora do default; outra empresa não vaza

### Tests for User Story 2 (REQUIRED) ⚠️

- [x] T019 [P] [US2] E2E: lista ativos + empty state em `tests/e2e/produtos-list.spec.ts`
- [x] T020 [P] [US2] E2E: isolamento por empresa em `tests/e2e/produtos-tenant.spec.ts`

### Implementation for User Story 2

- [x] T021 [US2] Implement list/get queries (`companyId` + `active` default) in `lib/products/queries.ts`
- [x] T022 [P] [US2] Add i18n keys for list columns/empty/CTA in `messages/pt-BR.ts`
- [x] T023 [US2] Build `ProductList` in `components/products/ProductList.tsx`
- [x] T024 [US2] Implement list page (CTA novo se `products:create`) in `app/app/produtos/page.tsx` per `contracts/ui-routes.md`

**Checkpoint**: US1 + US2 — criar e listar produtos da empresa

---

## Phase 5: User Story 3 - Cadastrar cliente (Priority: P1)

**Goal**: Criar cliente com Nome* + Telefone*; nomes podem repetir; telefone único entre ativos com fluxo `PHONE_IN_USE` → confirmar vínculo entre pessoas (`personGroupId`)

**Independent Test**: Criar cliente válido; rejeitar sem telefone; mesmo nome ok; telefone duplicado bloqueia até confirmar link; após link, dois clientes com mesmo telefone associados

### Tests for User Story 3 (REQUIRED) ⚠️

- [x] T025 [P] [US3] E2E: criar cliente com nome+telefone em `tests/e2e/clientes-create.spec.ts`
- [x] T026 [P] [US3] E2E: validação obrigatórios + nomes duplicados permitidos em `tests/e2e/clientes-create-validation.spec.ts`
- [x] T027 [P] [US3] E2E: telefone duplicado bloqueia e vínculo entre pessoas permite coexistência em `tests/e2e/clientes-phone-link.spec.ts`
- [x] T028 [P] [US3] E2E: sem `clients:create` negado em `tests/e2e/clientes-create-authz.spec.ts`

### Implementation for User Story 3

- [x] T029 [US3] Implement `createClient` (phone normalize, `PHONE_IN_USE` + `linkToPersonId` / personGroup) in `lib/clients/actions.ts` per `contracts/client-actions.md`
- [x] T030 [P] [US3] Add i18n keys for client form, phone conflict, person-link CTA in `messages/pt-BR.ts`
- [x] T031 [US3] Build `ClientForm` with phone-conflict UX (show existing + confirm link) in `components/clients/ClientForm.tsx`
- [x] T032 [US3] Create page + `clients:create` guard in `app/app/clientes/novo/page.tsx`
- [x] T033 [US3] Implement list query + list page (ativos; empty; CTA) in `lib/clients/queries.ts`, `components/clients/ClientList.tsx`, `app/app/clientes/page.tsx`

**Checkpoint**: US3 testable — clientes + telefone + vínculo entre pessoas

---

## Phase 6: User Story 4 - Vincular produto ao cliente com identificador (Priority: P1)

**Goal**: No detalhe do cliente, vincular produto ativo + identificador* (série/obs opcionais); identificador único entre ativos (case/acento); busca por identificador; mesmo catálogo em vários clientes

**Independent Test**: Três clientes + Air fryer com ids `1`,`2`,`3`; duplicate/cafe-Café rejeitado; busca `2` acha cliente certo; produto inativo fora do select

### Tests for User Story 4 (REQUIRED) ⚠️

- [x] T034 [P] [US4] E2E: vincular produto+identificador (+ série/obs) no cliente em `tests/e2e/client-products-create.spec.ts`
- [x] T035 [P] [US4] E2E: rejeitar identificador duplicado case/acento em `tests/e2e/client-products-identifier.spec.ts`
- [x] T036 [P] [US4] E2E: busca por identificador localiza cliente em `tests/e2e/clientes-search-identifier.spec.ts`
- [x] T037 [P] [US4] E2E: sem `clientProducts:create` negado em `tests/e2e/client-products-create-authz.spec.ts`

### Implementation for User Story 4

- [x] T038 [US4] Implement `createClientProduct` + uniqueness of `identifierNormalized` in `lib/client-products/actions.ts` per `contracts/client-product-actions.md`
- [x] T039 [US4] Implement list-by-client + `findByIdentifier` in `lib/client-products/queries.ts`
- [x] T040 [P] [US4] Add i18n keys for link form, identifier errors, search in `messages/pt-BR.ts`
- [x] T041 [US4] Build `ClientProductForm` + `ClientProductList` in `components/clients/ClientProductForm.tsx` and `components/clients/ClientProductList.tsx`
- [x] T042 [US4] Implement client detail page `/app/clientes/[id]` with vínculos + form (product select = ativos) in `app/app/clientes/[id]/page.tsx`
- [x] T043 [US4] Wire identifier search on `/app/clientes` (`?identifier=` or search field) in `app/app/clientes/page.tsx`

**Checkpoint**: Caso de uso principal — 3 air fryers com identifiers distintos e busca

---

## Phase 7: User Story 5 - Editar e inativar produto, cliente e vínculo (Priority: P2)

**Goal**: Update + soft-inactivate/reativar para Product, Client, ClientProduct; inativar cliente sem cascata; product inativo some do select; editar identifier/série/obs; liberar identifier ao inativar vínculo

**Independent Test**: Editar nome produto/cliente/identifier; inativar vínculo/cliente/produto conforme spec; reativar com regras de unicidade; sem permissão negado

### Tests for User Story 5 (REQUIRED) ⚠️

- [x] T044 [P] [US5] E2E: editar/inativar/reativar produto em `tests/e2e/produtos-edit-active.spec.ts`
- [x] T045 [P] [US5] E2E: editar cliente; inativar cliente mantém vínculos e busca identifier em `tests/e2e/clientes-edit-active.spec.ts`
- [x] T046 [P] [US5] E2E: editar/inativar vínculo (libera identifier) em `tests/e2e/client-products-edit-active.spec.ts`
- [x] T047 [P] [US5] E2E: write negado sem `*:update`/`*:setActive` em `tests/e2e/cadastros-write-authz.spec.ts`

### Implementation for User Story 5

- [x] T048 [US5] Implement `updateProduct` + `setProductActive` in `lib/products/actions.ts`; edit page + status UI in `app/app/produtos/[id]/editar/page.tsx`, `components/products/ProductStatusActions.tsx`
- [x] T049 [US5] Implement `updateClient` + `setClientActive` (phone conflict/link on edit; no cascade) in `lib/clients/actions.ts`; edit page in `app/app/clientes/[id]/editar/page.tsx`, `components/clients/ClientStatusActions.tsx`
- [x] T050 [US5] Implement `updateClientProduct` + `setClientProductActive` in `lib/client-products/actions.ts`; UI no detalhe do cliente
- [x] T051 [US5] Add inactive filters/toggles for products and clients lists when user has `*:setActive` in `app/app/produtos/page.tsx` and `app/app/clientes/page.tsx`
- [x] T052 [P] [US5] Add i18n keys for edit/inactivate/reactivate/errors in `messages/pt-BR.ts`

**Checkpoint**: Ciclo completo soft-CRUD dos três recursos

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentação, regressão de permissões, validação quickstart

- [x] T053 [P] Update E2E grupos presets expectations for new `data-permission` keys if needed in `tests/e2e/grupos-presets.spec.ts`
- [x] T054 [P] Confirm README + `specs/005-cadastro-produtos/quickstart.md` credentials/fixtures match seed (pt-BR)
- [x] T055 Confirm all new user-facing strings use `t()` / `messages/pt-BR.ts` (no hard-coded UI in new surfaces)
- [x] T056 Run `npm run test:unit` and `npm run test:e2e` for produtos/clientes/client-products; fix failures
- [x] T057 Manual pass of critical scenarios in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1–US2 (Phases 3–4)**: After Foundational; US2 naturally follows US1 but list can stub empty until create exists
- **US3 (Phase 5)**: After Foundational; independent of products UI (catalog seed helps US4)
- **US4 (Phase 6)**: Needs Product (US1/seed) + Client (US3) available
- **US5 (Phase 7)**: After US1–US4 surfaces exist
- **Polish (Phase 8)**: After desired stories complete

### User Story Dependencies

| Story | Depends on | Independently testable? |
|-------|------------|-------------------------|
| US1 Produto create | Foundational | Yes |
| US2 Produto list | Foundational (+ US1 or seed) | Yes with seed |
| US3 Cliente create/list + phone link | Foundational | Yes |
| US4 Vínculo + identifier search | US1/US3 or seed products+clients | Yes with seed |
| US5 Edit/inativar | Prior CRUD UIs | Yes |

### Within Each User Story

- Tests FIRST (fail before implementation)
- Actions/queries before UI
- i18n keys with or before forms
- Checkpoint before next priority story when sequencing

### Parallel Opportunities

- T004/T005/T006 and T008 in Foundational can proceed in parallel after T002–T003
- Within a story, E2E specs marked [P] can be authored in parallel
- US1 and US3 can be developed in parallel after Foundational (different trees)
- US2 parallelizable with US1 UI finishing if seed provides products

---

## Parallel Example: User Story 1

```bash
# Tests in parallel:
Task: "E2E create in tests/e2e/produtos-create.spec.ts"
Task: "E2E validation in tests/e2e/produtos-create-validation.spec.ts"
Task: "E2E authz in tests/e2e/produtos-create-authz.spec.ts"

# After actions exist:
Task: "i18n keys in messages/pt-BR.ts"
Task: "ProductForm in components/products/ProductForm.tsx"
```

## Parallel Example: User Story 3 + 4 prep

```bash
# After Foundational:
Developer A: US1 + US2 (products tree)
Developer B: US3 (clients tree)
# Then either: US4 (needs both)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup
2. Phase 2 Foundational
3. Phase 3 US1 (cadastrar produto)
4. **STOP and VALIDATE** via US1 E2E / manual
5. Demo catálogo

### Incremental Delivery

1. Setup + Foundational
2. US1 → MVP catálogo
3. US2 → listagem
4. US3 → clientes + telefone/pessoas
5. US4 → valor de negócio (vínculo + identifier)
6. US5 → edição/inativação
7. Polish + full suite

### Suggested MVP scope

**US1 only** (cadastrar produto) for first demo; **US1–US4** for the air-fryer business case from the spec.

---

## Notes

- [P] = different files, no incomplete-task dependencies
- [Story] labels map to US1–US5 in `spec.md`
- Reuse `requirePermission` from `lib/permissions/authz.ts` (004) — do not reintroduce binary `role`
- Re-seed Operadores after catalog growth so grants include new keys
- Avoid hard delete; soft `active` only
- Commit after each task or logical group
- Verify tests fail before implementing
