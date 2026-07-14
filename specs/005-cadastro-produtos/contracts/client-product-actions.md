# Contract: ClientProduct (Vínculo) Server Actions

**Feature**: `005-cadastro-produtos`  
**Date**: 2026-07-14

**Result shape**: `{ ok: true, id?: string }` | `{ ok: false, error: string }`

## `createClientProduct`

| Field | Required | Notes |
|-------|----------|--------|
| clientId | yes | mesma empresa |
| productId | yes | produto **ativo** mesma empresa |
| identifier | yes | trim → `identifierNormalized` |
| serialNumber | no | |
| notes | no | |

**Authz**: `clientProducts:create`  

**Effects**: cria vínculo `active: true` com `companyId` da sessão.  

**Errors**: validation; product inactive/not found; client not found; duplicate active identifier (case/acento-insensitive).

## `updateClientProduct`

| Field | Required | Notes |
|-------|----------|--------|
| id | yes | mesma empresa |
| identifier | yes | unicidade entre outros ativos |
| serialNumber, notes | no | |
| productId | no/yes | se permitido trocar produto, só para ativo da empresa |

**Authz**: `clientProducts:update`  

## `setClientProductActive`

| Field | Required | Notes |
|-------|----------|--------|
| id | yes | |
| active | yes | inativar libera identifier para reuso; reativar checa unicidade |

**Authz**: `clientProducts:setActive`  

## Leitura

- List por `clientId` (ativos na visão padrão do detalhe) — `clientProducts:list`
- Lookup por identifier na empresa — usado pela busca em `/app/clientes`
