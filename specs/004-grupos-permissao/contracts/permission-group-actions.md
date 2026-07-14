# Server Actions: Grupos de Permissão

**Feature**: `004-grupos-permissao`  
**Surface**: `"use server"` actions em `lib/permission-groups/` (ou equivalente)

## Shared preconditions

| Check | Failure |
|-------|---------|
| Sessão autenticada + `companyId` | unauthenticated |
| `session.user.isAdmin` | forbidden |
| Escopo | apenas grupos/`Membership` da `companyId` da sessão |

## ensureCompanyPermissionPresets (interno / seed)

Garante Admin + Operadores na empresa; Operadores com todas as keys de negócio do catálogo. Idempotente.

## listPermissionGroups

**Authz**: Admin  
**Result**: grupos da empresa ordenados (presets primeiro).

## createPermissionGroup

**Authz**: Admin  
**Input**: `name`, `permissionKeys: string[]`  
**Rules**: nome único na empresa; keys ⊆ catálogo de negócio; cria grupo `systemKey = null` + grants.  
**Result**: id do grupo ou erros de validação i18n.

## updatePermissionGroup

**Authz**: Admin  
**Input**: `id`, `name?`, `permissionKeys?`  
**Rules**:
- Admin (`systemKey=ADMIN`): rejeitar alteração de permissões/nome de sistema.
- Operadores: permite só `permissionKeys` (nome imutável).
- Personalizado: nome + keys.
**Result**: ok / erros.

## deletePermissionGroup

**Authz**: Admin  
**Input**: `id`  
**Rules**: rejeitar se `systemKey` in (`ADMIN`,`OPERADORES`); senão, em transação: reassign memberships → Operadores da empresa; delete grants/grupo.  
**Result**: ok / erros.

## assignUserToGroup

**Authz**: Admin  
**Input**: `userId` (ou `membershipId`), `permissionGroupId`  
**Rules**:
- Grupo e usuário da mesma empresa.
- Não permitir sair do Admin se for o último Admin da empresa.
- Não-Admin callers already forbidden by shared precondition.
**Result**: ok / erros (`lastAdmin`, `notFound`, …).

## Authz helpers (consumidos por outros módulos)

| Helper | Behavior |
|--------|----------|
| `requireSession()` | sessão com company + group |
| `requireAdmin()` | `isAdmin` |
| `requirePermission(key)` | `isAdmin \|\| permissions.includes(key)` |

Serviços: mutations usam `requirePermission('services:create'|…)`.
