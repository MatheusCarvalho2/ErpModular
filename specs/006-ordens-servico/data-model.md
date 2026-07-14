# Data Model: Ordens de Serviço

**Feature**: `006-ordens-servico`  
**Date**: 2026-07-14

## Entities (reused)

### Company / User / Membership / PermissionGroup / PermissionGrant

Inalterados estruturalmente. Catálogo de permissões ganha `serviceOrders` e `serviceOrderStatuses` (ver [research.md](./research.md) R4). `Company` ganha relações `serviceOrderStatuses` e `serviceOrders`.

### Service / Client / ClientProduct / Product

Reutilizados como FKs da ordem. Seleção de novo atendimento exige `Service.active`, `Client.active`, `ClientProduct.active` (e `ClientProduct.clientId` = cliente escolhido), mesma `companyId`.

---

## Entities (new)

### ServiceOrderStatus (Status de ordem)

| Field | Type | Rules |
|-------|------|--------|
| id | cuid | PK |
| companyId | FK → Company | required; tenant |
| name | string | required, trim, 1–80 |
| nameNormalized | string | derivado de `name` (NFD/case/acento) |
| sortOrder | int | required; ordenação na UI |
| isDefaultInitial | boolean | default `false`; no máx. um ativo `true` por empresa |
| role | enum | `OPERATIONAL` \| `COMPLETED` \| `CANCELLED` |
| active | boolean | default `true` |
| createdAt / updatedAt | datetime | auto |

**Indexes**: `@@index([companyId, active])`, `@@index([companyId, sortOrder])`

**Uniqueness (app)**: para `active === true`, (`companyId`, `nameNormalized`) único.

**Default initial**:
- Ao marcar um status como padrão, limpar `isDefaultInitial` dos demais da empresa (transação).
- Padrão inicial MUST ter `role = OPERATIONAL` e `active = true`.
- Impedir inativar o único padrão sem apontar outro operacional ativo.

**Seed base (por empresa)**:

| name | role | isDefaultInitial | sortOrder |
|------|------|------------------|-----------|
| Recebido | OPERATIONAL | true | 10 |
| Orçando | OPERATIONAL | false | 20 |
| Aguardando | OPERATIONAL | false | 30 |
| Fazendo | OPERATIONAL | false | 40 |
| Pronto | COMPLETED | false | 50 |

Opcional seed demo: **Cancelado** / `CANCELLED` / sortOrder 60.

**Integrity**:
- Inativar: deixa de aparecer em selects de nova escolha; ordens existentes mantêm `statusId`.
- Não hard delete.
- Vários ativos com mesmo `role` permitidos.

---

### ServiceOrder (Ordem de Serviço)

| Field | Type | Rules |
|-------|------|--------|
| id | cuid | PK |
| companyId | FK → Company | required; denormalizado para tenant queries |
| serviceId | FK → Service | required; mesma empresa |
| clientId | FK → Client | required; mesma empresa |
| clientProductId | FK → ClientProduct | required; mesma empresa; `clientId` do vínculo = `clientId` da ordem |
| statusId | FK → ServiceOrderStatus | required; mesma empresa |
| priceCents | int | required; ≥ 0 (zero permitido) |
| workDescription | string? | opcional; trim; ≤ 4000; só espaços → null |
| createdAt / updatedAt | datetime | auto |

**Indexes**: `@@index([companyId, statusId])`, `@@index([companyId, createdAt])`, `@@index([clientId])`, `@@index([clientProductId])`, `@@index([serviceId])`

**Sem** campo `active` nesta versão — encerramento/cancelamento via `status.role`.

**Integrity**:
- Múltiplas ordens por `clientProductId` OK.
- Create: service/client/clientProduct/status ativos; status default = `isDefaultInitial` se omitido; `priceCents` default sugerido de `Service.priceCents` (se null, exigir input ou 0).
- Update vínculos (`serviceId`/`clientId`/`clientProductId`): só `correctLinks` ou Admin; cliente/equipamento coerentes.
- Update valor/descrição/status: `serviceOrders:update` se status atual OPERATIONAL; se COMPLETED/CANCELLED → `editClosed` ou Admin.
- Mudança de status: destino MUST ser status **ativo** da empresa (qualquer role). Reabrir = mudar de COMPLETED/CANCELLED para OPERATIONAL (só Admin/`editClosed`).
- FKs: preferir `onDelete: Restrict` em Service/Client/ClientProduct/Status para não apagar histórico acidentalmente.

## Relationships

```text
Company 1 ─── * ServiceOrderStatus
Company 1 ─── * ServiceOrder

ServiceOrder * ─── 1 Service
ServiceOrder * ─── 1 Client
ServiceOrder * ─── 1 ClientProduct
ServiceOrder * ─── 1 ServiceOrderStatus

Client 1 ─── * ClientProduct   (já existente; equipamento da OS)
```

## Validation rules

| Rule | Enforcement |
|------|-------------|
| Tenant isolation | todas queries/actions filtram `companyId` da sessão |
| Nome status único entre ativos | app + `nameNormalized` |
| Um default inicial operacional | transação ao setar `isDefaultInitial` |
| priceCents ≥ 0 | action |
| Equipamento do cliente | `ClientProduct.clientId === order.clientId` |
| Somente leitura pós-encerramento (operador) | checa `status.role` + permissões |
| Sem hard delete ordem/status | só soft status / muda role via status |

## State / role behavior

| Status role atual | Operador (`update`) | Admin / `editClosed` | Admin / `correctLinks` |
|-------------------|---------------------|----------------------|-------------------------|
| OPERATIONAL | valor, descrição, status | idem | vínculos |
| COMPLETED / CANCELLED | somente leitura | valor, descrição, status (reabrir ok) | vínculos (com editClosed/admin) |

Transições: grafo livre entre status **ativos** (sem sequência obrigatória).

## Permission keys (catálogo)

Ver research R4. Resumo Operadores: `serviceOrders:list|create|update`. Status catalog e `correctLinks`/`editClosed` fora do preset Operadores.

## Seed fixtures (Empresa Demo)

| Fixture | Propósito |
|---------|-----------|
| 5 status base (+ Cancelado opcional) | catálogo padrão |
| Serviço “Reparo de eletrodoméstico” | pré-preenchimento de valor |
| OS: José Demo + equipment id `2` + reparo + Recebido | demo / E2E |
| Credenciais | já existentes `admin@demo.local` / `membro@demo.local` |
