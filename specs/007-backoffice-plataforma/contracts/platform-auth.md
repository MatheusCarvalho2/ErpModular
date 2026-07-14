# Platform Auth Contract

**Feature**: `007-backoffice-plataforma`  
**Surface**: Auth.js (NextAuth v5) em `lib/auth.ts` + middleware + `lib/platform/authz.ts`

## Providers

| Provider id | Used by | Success criteria |
|-------------|---------|------------------|
| `credentials` (ERP existente) | `/login` | email/senha ok; `User.active`; `!isPlatformOperator`; Membership existe; `Company.active`; senha válida |
| `platform` (novo) | `/backoffice/login` | email/senha ok; `User.active`; `isPlatformOperator`; senha válida; **sem** exigir Membership |

## Session shape

```ts
// plataforma
{ sessionKind: "platform", user: { id, email, name } }

// erp (existente + campos)
{ sessionKind: "erp", user: { id, email, name, companyId, companyName, permissionGroupId, isAdmin, permissions } }
```

`mustChangePassword` pode ficar só no DB e ser revalidado em `requireSession` / layout (não obrigatório no JWT se reler sempre).

## Clients

| Action | Notes |
|--------|-------|
| `signIn("platform", { email, password, redirect: false })` | Form backoffice |
| `signIn("credentials", …)` | Form ERP (inalterado) |
| `signOut` | Ambos; redirect para o login da respectiva superfície |

## requirePlatformOperator

| Check | Failure |
|-------|---------|
| Sessão presente + `sessionKind === "platform"` | unauthenticated |
| DB: user `isPlatformOperator && active` | forbidden / unauthenticated |

Usado em todas as Server Actions e pages do backoffice.

## ERP authorize / requireSession deltas

| Check | Failure |
|-------|---------|
| `User.active === false` | auth fail |
| `Company.active === false` | auth fail / session invalid |
| `mustChangePassword === true` | force `/change-password` (pages/middleware); actions de negócio podem retornar erro dedicado se chamadas direto |

## Error UX

| Case | Behavior |
|------|----------|
| Credenciais inválidas (qualquer provider) | mensagem genérica i18n (sem revelar se e-mail existe) |
| Usuário empresa no login platform | mesma mensagem genérica de falha |
| Operador no login ERP | falha (sem membership / flag) — mensagem ERP existente ou genérica |
