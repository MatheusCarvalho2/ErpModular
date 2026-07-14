# Contract: Service Order Status Actions

**Feature**: `006-ordens-servico`  
**Date**: 2026-07-14  
**Surface**: Next.js Server Actions (`lib/service-order-statuses/actions.ts`)

## Types

```ts
type StatusRole = "OPERATIONAL" | "COMPLETED" | "CANCELLED";

type CreateStatusInput = {
  name: string;
  sortOrder: number;
  role: StatusRole;
  isDefaultInitial?: boolean;
};

type UpdateStatusInput = {
  id: string;
  name?: string;
  sortOrder?: number;
  role?: StatusRole;
  isDefaultInitial?: boolean;
};
```

## Actions

### `createServiceOrderStatus(input)`

| | |
|--|--|
| Permission | `serviceOrderStatuses:create` (ou Admin) |
| Validates | nome único entre ativos (`nameNormalized`); se `isDefaultInitial` → role MUST OPERATIONAL e limpa outros defaults |
| Success | `{ ok: true, id }` + revalidate status routes |

### `updateServiceOrderStatus(input)`

| | |
|--|--|
| Permission | `serviceOrderStatuses:update` |
| Validates | unicidade nome; default inicial só OPERATIONAL; não deixar empresa sem default operacional ativo |
| Note | Rename reflete em todas as OS que apontam para o id (FK viva) |

### `setServiceOrderStatusActive(id, active)`

| | |
|--|--|
| Permission | `serviceOrderStatuses:setActive` |
| Validates | não inativar se for o único default sem substituto; não inativar último status ativo da empresa; não inativar default sem realocar |
| Effect | inativo some das seleções novas; OS existentes mantêm referência |

### `ensureDefaultServiceOrderStatuses(companyId)` (internal/seed)

Idempotente: cria os cinco status base se faltarem (por `nameNormalized`); não duplica.

## Queries

| Function | Behavior |
|----------|----------|
| `listStatusesForCompany(companyId, { active? })` | ordenado por `sortOrder` |
| `getDefaultInitialStatus(companyId)` | `isDefaultInitial && active` |

## Errors (codes sugeridos)

| Code | When |
|------|------|
| `NAME_IN_USE` | nome normalizado duplicado entre ativos |
| `INVALID_DEFAULT_ROLE` | tentar default com role ≠ OPERATIONAL |
| `CANNOT_DEACTIVATE_DEFAULT` | inativar default sem outro |
| `FORBIDDEN` | sem permissão |
