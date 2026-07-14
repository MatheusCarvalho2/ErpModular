# Contract: Product Server Actions

**Feature**: `005-cadastro-produtos`  
**Date**: 2026-07-14

Contrato lógico das Server Actions (sem API HTTP pública). Sessão Auth.js obrigatória; escopo `companyId`.

**Result shape**: `{ ok: true, id?: string }` | `{ ok: false, error: string }` (i18n/pt-BR)

## `createProduct`

| Field | Required | Notes |
|-------|----------|--------|
| name | yes | trim → `nameNormalized` |
| description | no | |

**Authz**: `products:create`  

**Effects**: `Product` com `active: true`, `companyId` da sessão.  

**Errors**: unauthenticated; forbidden; validation; duplicate active name.

## `updateProduct`

| Field | Required | Notes |
|-------|----------|--------|
| id | yes | mesma empresa |
| name, description | same as create | |

**Authz**: `products:update`  

**Errors**: not found; validation; duplicate active name (outro id).

## `setProductActive`

| Field | Required | Notes |
|-------|----------|--------|
| id | yes | |
| active | yes | `false` inativa; `true` reativa |

**Authz**: `products:setActive`  

**Effects**: soft; reativação respeita unicidade de nome entre ativos. Não altera `ClientProduct` existentes.

## Leitura

List/get via Server Components + queries Prisma (`companyId`, `active` conforme filtro). Sem action obrigatória.
