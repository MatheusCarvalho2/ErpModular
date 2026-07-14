# Server Actions: Backoffice da Plataforma

**Feature**: `007-backoffice-plataforma`  
**Surface**: `"use server"` em `lib/platform/actions.ts` (queries em `lib/platform/queries.ts`)

## Shared preconditions

| Check | Failure |
|-------|---------|
| `requirePlatformOperator()` | unauthenticated / forbidden |
| Escopo | cross-empresa intencional (único lugar permitido) |

Respostas: `{ ok: true, … } | { ok: false, error: string }` com `error` via `t()`.

---

## Companies

### listCompanies

**Input**: `q?`, `status?: "all" | "active" | "inactive"`  
**Result**: lista `{ id, name, slug, active, userCount }`.

### createCompany

**Input**: `name`  
**Rules**: nome não vazio; único entre empresas ativas; gera `slug` único; `active=true`; `ensureCompanyPermissionPresets(id)`.  
**Result**: `{ id }` ou erros de validação.

### updateCompany

**Input**: `id`, `name`  
**Rules**: empresa existe; nome válido; unicidade entre ativas (ignorando self).  
**Result**: ok / erros.

### setCompanyActive

**Input**: `id`, `active: boolean`  
**Rules**: idempotente; inativar empresa não remove dados.  
**Result**: ok / erros.

---

## Users (clientes)

### listUsers

**Input**: `q?`, `companyId?`, `status?: "all" | "active" | "inactive"`  
**Rules**: apenas `isPlatformOperator = false`.  
**Result**: `{ id, name, email, active, companyId, companyName, mustChangePassword }`.

### createUser

**Input**: `name`, `email`, `password`, `companyId`  
**Rules**:
- empresa existe (preferir ativa; se inativa, ou rejeitar com i18n claro — default: rejeitar create em empresa inativa);
- e-mail unique;
- cria User (`active=true`, `isPlatformOperator=false`, `mustChangePassword=false`);
- Membership → grupo `ADMIN` da empresa.
**Result**: `{ id }` / erros.

### updateUser

**Input**: `id`, `name?`, `email?`  
**Rules**: alvo é usuário cliente; e-mail unique se alterado.  
**Result**: ok / erros.

### setUserActive

**Input**: `id`, `active: boolean`  
**Rules**: só clientes; idempotente.  
**Result**: ok / erros.

### resetUserPassword

**Input**: `id`, `temporaryPassword`  
**Rules**: usuário cliente **ativo**; set hash; `mustChangePassword=true`.  
**Result**: ok / erros.

### setPlatformOperatorActive (interno / opcional UI mínima)

**Input**: `id`, `active`  
**Rules**: alvo `isPlatformOperator`; **negar** se seria o último operador ativo (FR-008).  
**Result**: ok / `lastPlatformOperator`.

---

## Password change (ERP — não platform)

### changeOwnPassword

**Authz**: sessão `erp` + `mustChangePassword` (ou allow anytime later — v1: só quando flag true)  
**Input**: `currentPassword`, `newPassword`  
**Rules**: verifica senha atual (temporária); valida nova; atualiza hash; `mustChangePassword=false`.  
**Result**: ok → cliente redireciona `/app`.

---

## Dashboard

### getDashboardSummary

**Authz**: platform  
**Result**:
```ts
{
  companies: { total, active, inactive },
  clientUsers: { total, active, inactive },
  usersPerCompany: Array<{ companyId, companyName, active, userCount }>
}
```

Operadores de plataforma excluídos de `clientUsers` e de `userCount`.

---

## revalidatePath

Após mutações: `/backoffice`, `/backoffice/empresas`, `/backoffice/usuarios` (e detalhe `[id]` quando couber).
