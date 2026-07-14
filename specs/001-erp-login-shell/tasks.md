# Tasks: ERP Login e Shell do Sistema

**Input**: Design documents from `/specs/001-erp-login-shell/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados explicitamente na spec — tarefas de teste E2E omitidas; validação via quickstart na fase Polish.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js App Router project at repository root (`app/`, `components/`, `lib/`, `prisma/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap greenfield Next.js + Tailwind + Prisma

- [x] T001 Scaffold Next.js (App Router) + TypeScript + Tailwind at repository root (`package.json`, `app/layout.tsx`, `app/globals.css`, `next.config.ts`, `tsconfig.json`)
- [x] T002 [P] Add Prisma, Auth.js (next-auth v5), bcryptjs and related types to `package.json` / install dependencies
- [x] T003 [P] Create `.env.example` with `DATABASE_URL`, `AUTH_SECRET`, and optional `AUTH_URL`
- [x] T004 [P] Create directory placeholders `components/auth/`, `components/shell/`, `lib/`, `prisma/`, `public/`, `tests/e2e/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema multiempresa, Prisma client, password helpers, Auth.js skeleton, root routing — MUST complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Define Prisma models `Company`, `User`, `Membership` (UNIQUE on `userId`) in `prisma/schema.prisma`
- [x] T006 Create initial migration under `prisma/migrations/` and document migrate command
- [x] T007 Implement Prisma client singleton in `lib/prisma.ts`
- [x] T008 [P] Implement password hash/verify helpers in `lib/password.ts`
- [x] T009 Implement Auth.js config (Credentials provider stubs, JWT session `maxAge` 7 days, session callback with `companyId`) in `lib/auth.ts`
- [x] T010 Wire Auth.js route handler in `app/api/auth/[...nextauth]/route.ts`
- [x] T011 Implement seed (1 Company + 1 User + 1 Membership) in `prisma/seed.ts` and register seed in `package.json`
- [x] T012 Implement root redirect in `app/page.tsx` (`/` → `/login` or `/app` by session)

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 - Autenticar e entrar no sistema (Priority: P1) 🎯 MVP

**Goal**: Tela de login split (form esquerda / imagem direita), autenticação e-mail+senha, redirect para área interna no contexto da única empresa

**Independent Test**: Abrir `/login`, entrar com seed; ver redirect para `/app` sem seletor de empresa; credenciais inválidas permanecem no login com erro

### Implementation for User Story 1

- [x] T013 [P] [US1] Add login visual asset (or placeholder image) in `public/login-hero.jpg` (or `.png`/`.webp`)
- [x] T014 [P] [US1] Implement split login layout chrome in `components/auth/LoginSplitLayout.tsx` (form left, image right; stack/hide image on narrow viewports)
- [x] T015 [US1] Implement login form (e-mail, senha, Entrar, validação, erro genérico pt-BR) in `components/auth/LoginForm.tsx`
- [x] T016 [US1] Complete Credentials authorize in `lib/auth.ts` (verify email/password via Prisma + bcrypt; reject users without Membership with organizational access error path)
- [x] T017 [US1] Create login page composing layout + form in `app/(auth)/login/page.tsx`
- [x] T018 [US1] Redirect authenticated users away from `/login` toward `/app` (in `app/(auth)/login/page.tsx` and/or `middleware.ts` as appropriate)
- [x] T019 [US1] Create minimal authenticated landing stub in `app/(app)/page.tsx` so successful login has a destination (basic welcome ok; full shell is US2)

**Checkpoint**: US1 testable — login flow works end-to-end with seed user

---

## Phase 4: User Story 2 - Usar o shell interno (header + barra lateral) (Priority: P1)

**Goal**: Área autenticada com header, sidebar (“Início”) e conteúdo de boas-vindas

**Independent Test**: Após login, `/app` mostra header (sistema + usuário), sidebar com “Início” navegável, e área principal com boas-vindas

### Implementation for User Story 2

- [x] T020 [P] [US2] Implement `components/shell/Header.tsx` (nome do sistema, usuário da sessão, slot para logout action)
- [x] T021 [P] [US2] Implement `components/shell/Sidebar.tsx` with navigable “Início” → `/app`
- [x] T022 [US2] Compose shell layout (header + sidebar + main) in `app/(app)/layout.tsx` using session data from `lib/auth.ts`
- [x] T023 [US2] Enhance welcome/home content in `app/(app)/page.tsx` (pt-BR boas-vindas; sem módulos de negócio)
- [x] T024 [US2] Optionally show company name (read-only context) in `components/shell/Header.tsx` without company switcher

**Checkpoint**: US1 + US2 — login lands in full shell with Início

---

## Phase 5: User Story 3 - Proteger rotas e encerrar sessão (Priority: P2)

**Goal**: Bloquear `/app/*` sem sessão; logout no header; pós-logout sem acesso via back

**Independent Test**: Anônimo em `/app` → `/login`; autenticado clica Sair → `/login`; `/app` após logout exige login de novo

### Implementation for User Story 3

- [x] T025 [US3] Implement middleware protecting `/app` and redirecting unauthenticated users to `/login` in `middleware.ts`
- [x] T026 [US3] Align middleware with Auth.js session (export `auth` wrapper / matcher) per `lib/auth.ts` and `contracts/auth-api.md`
- [x] T027 [US3] Implement logout control in `components/shell/LogoutButton.tsx` (signOut → `/login`)
- [x] T028 [US3] Wire logout into `components/shell/Header.tsx`
- [x] T029 [US3] Ensure post-logout navigation to authenticated URLs cannot show protected content (middleware + session cookie cleared)

**Checkpoint**: All three user stories independently demonstrable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Docs, env hygiene, quickstart validation

- [x] T030 [P] Document seed credentials and run steps in `README.md` (align with `specs/001-erp-login-shell/quickstart.md`)
- [x] T031 [P] Verify `.env.example` matches required vars used by `lib/auth.ts` and `prisma/schema.prisma`
- [x] T032 Confirm pt-BR copy on login errors, header, sidebar, and welcome in `components/auth/`, `components/shell/`, `app/(app)/page.tsx`
- [x] T033 Run end-to-end manual validation per `specs/001-erp-login-shell/quickstart.md` (login ok/fail, protect `/app`, logout, optional session persistence smoke)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on Foundational; practically needs US1 login destination (T019) — build after or with US1 landing stub
- **User Story 3 (Phase 5)**: Depends on Foundational + shell header (US2) for logout UX; middleware can start earlier but logout UI needs T020/T022
- **Polish (Phase 6)**: After desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — MVP
- **US2 (P1)**: After Phase 2; uses session from US1 auth
- **US3 (P2)**: After Phase 2; logout integrates with US2 Header; route guards complement US1

### Within Each User Story

- Auth authorize before relying on session in pages
- Layout components before composing pages
- Middleware after Auth.js route works

### Parallel Opportunities

- Phase 1: T002, T003, T004 after T001 starts
- Phase 2: T008 parallel with T007; T011 after T005–T008
- US1: T013 || T014 before T015–T017
- US2: T020 || T021 before T022
- Polish: T030 || T031

---

## Parallel Example: User Story 1

```bash
# After foundation:
Task: "Add login visual asset in public/login-hero.jpg"
Task: "Implement LoginSplitLayout in components/auth/LoginSplitLayout.tsx"

# Then sequentially:
Task: "Implement LoginForm in components/auth/LoginForm.tsx"
Task: "Complete Credentials authorize in lib/auth.ts"
Task: "Create app/(auth)/login/page.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Implement Header in components/shell/Header.tsx"
Task: "Implement Sidebar in components/shell/Sidebar.tsx"
# Then:
Task: "Compose app/(app)/layout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup
2. Phase 2 Foundational
3. Phase 3 US1 (login + stub `/app`)
4. **STOP and VALIDATE** with seed credentials
5. Continue US2 shell, then US3 guards/logout

### Incremental Delivery

1. Setup + Foundational → DB + Auth ready
2. US1 → Login demo (MVP)
3. US2 → Full shell
4. US3 → Hardened session boundaries
5. Polish → Quickstart checklist green

### Parallel Team Strategy

1. Pair on Setup + Foundational
2. Dev A: US1 login UI + authorize
3. Dev B: US2 shell components (needs session shape from Auth)
4. Either: US3 middleware + logout after shell header exists

---

## Notes

- [P] = different files, no incomplete-task dependency
- Story labels map to spec User Stories 1–3
- No Playwright tasks unless later requested — use quickstart manual validation (T033)
- Commit after each task or logical group
- Avoid: self-signup, MFA, OAuth, company switcher, business modules
