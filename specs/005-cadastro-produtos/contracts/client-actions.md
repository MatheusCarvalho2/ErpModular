# Contract: Client Server Actions

**Feature**: `005-cadastro-produtos`  
**Date**: 2026-07-14

**Result shape**:
- Sucesso: `{ ok: true, id?: string }`
- Falha genérica: `{ ok: false, error: string }`
- Conflito de telefone: `{ ok: false, code: "PHONE_IN_USE", error: string, existingClient: { id, name, phone } }`

## `createClient`

| Field | Required | Notes |
|-------|----------|--------|
| name | yes | trim; sem unicidade |
| phone | yes | trim → `phoneNormalized` (dígitos) |
| linkToPersonId | no | se informado e telefone colide com esse (ou grupo) cliente ativo, confirma vínculo entre pessoas |

**Authz**: `clients:create`  

**Effects**:
1. Sem conflito de telefone → cria cliente ativo (`personGroupId` null).
2. Conflito sem `linkToPersonId` → `PHONE_IN_USE` (não cria).
3. Conflito com `linkToPersonId` válido → cria cliente; assegura `personGroupId` compartilhado com o existente; mesmo `phoneNormalized`.

**Errors**: validation; forbidden; phone in use; link target not found / wrong company / inactive.

## `updateClient`

| Field | Required | Notes |
|-------|----------|--------|
| id | yes | mesma empresa |
| name, phone | yes | |
| linkToPersonId | no | mesmo fluxo se novo telefone colidir |

**Authz**: `clients:update`  

## `setClientActive`

| Field | Required | Notes |
|-------|----------|--------|
| id | yes | |
| active | yes | |

**Authz**: `clients:setActive`  

**Effects**: soft-inactivate **sem** cascata em `ClientProduct`. Reativação: se `phoneNormalized` colidir com outro ativo fora do mesmo `personGroupId`, rejeitar ou exigir novo fluxo de link (implementação MUST rejeitar silencioso duplicado; preferir erro + offer link).

## Leitura / busca

- List clientes ativos da empresa (`clients:list`).
- `findByIdentifier(identifier)` (permission `clients:list` ou `clientProducts:list`): resolve `identifierNormalized` → vínculo ativo → cliente (mesmo se cliente `active: false`).
