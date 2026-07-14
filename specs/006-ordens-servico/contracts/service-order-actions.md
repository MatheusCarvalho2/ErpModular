# Contract: Service Order Actions

**Feature**: `006-ordens-servico`  
**Date**: 2026-07-14  
**Surface**: Next.js Server Actions (`lib/service-orders/actions.ts`)

## Types

```ts
type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; code?: string };

type CreateServiceOrderInput = {
  serviceId: string;
  clientId: string;
  clientProductId: string;
  priceCents: number; // ≥ 0
  workDescription?: string | null;
  statusId?: string; // default = isDefaultInitial da empresa
};

type UpdateServiceOrderInput = {
  id: string;
  priceCents?: number;
  workDescription?: string | null;
  statusId?: string;
};

type CorrectServiceOrderLinksInput = {
  id: string;
  serviceId: string;
  clientId: string;
  clientProductId: string;
};
```

## Actions

### `createServiceOrder(input)`

| | |
|--|--|
| Permission | `serviceOrders:create` |
| Validates | tenant; service/client/clientProduct **ativos** mesma empresa; clientProduct.clientId === clientId; status ativo (default inicial se omitido, role OPERATIONAL); priceCents ≥ 0 |
| Prefill | caller MAY enviar priceCents já copiado de `Service.priceCents`; action NÃO altera Service |
| Success | `{ ok: true, id }` + revalidate `/app/ordens-servico` |
| Errors | validation / forbidden / not found — i18n keys |

### `updateServiceOrder(input)`

| | |
|--|--|
| Permission | `serviceOrders:update`; se status atual COMPLETED/CANCELLED → também Admin **ou** `serviceOrders:editClosed` |
| Allows | priceCents, workDescription, statusId (status destino ativo da empresa) |
| Forbids | mudar service/client/clientProduct (usar `correctServiceOrderLinks`) |
| Success | `{ ok: true }` + revalidate list + detail |

### `correctServiceOrderLinks(input)`

| | |
|--|--|
| Permission | Admin **ou** `serviceOrders:correctLinks`; se OS fechada → também Admin **ou** `editClosed` |
| Validates | mesmos vínculos ativos/coerentes que create |
| Success | `{ ok: true }` |

## Queries (`lib/service-orders/queries.ts`)

| Function | Permission (page) | Behavior |
|----------|-------------------|----------|
| `listServiceOrdersForCompany(companyId, { statusId? })` | list | includes cliente, serviço, clientProduct+product, status |
| `getServiceOrderForCompany(id, companyId)` | list | detail com relações; null se outro tenant |
| Helpers select | create page | serviços ativos; clientes ativos; clientProducts ativos do cliente; status ativos ordenados |

## AuthZ matrix (resumo)

| Situação | create | update valor/status | correct links |
|----------|--------|---------------------|---------------|
| Operacional + Operadores | ✓ | ✓ | ✗ |
| Fechada + Operadores | — | ✗ | ✗ |
| Fechada + Admin/editClosed | — | ✓ | com correctLinks |
| Outro tenant | ✗ | ✗ | ✗ |
