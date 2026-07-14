# UI Routes: Ordens de Serviço

**Feature**: `006-ordens-servico`  
**Date**: 2026-07-14

## Ordens

| Path | Permission | Purpose |
|------|------------|---------|
| `/app/ordens-servico` | `serviceOrders:list` | Lista; filtro `?statusId=`; empty state + CTA se `create` |
| `/app/ordens-servico/novo` | `serviceOrders:create` | Criar com selects serviço/cliente/equipamento; pré-fill valor; status default |
| `/app/ordens-servico/[id]` | `serviceOrders:list` | Detalhe; editar campos se autorizado; read-only se fechada e sem `editClosed` |

## Status (catálogo)

| Path | Permission | Purpose |
|------|------------|---------|
| `/app/ordens-servico/status` | `serviceOrderStatuses:list` (ou Admin) | Lista status; criar/editar/papel/padrão/ordenar; inativar se `setActive` |

## Nav

| Item | Href | Visibility |
|------|------|------------|
| Ordens de Serviço | `/app/ordens-servico` | `serviceOrders:list` — i18n `nav.orders` |
| Status de OS (admin) | `/app/ordens-servico/status` | `serviceOrderStatuses:list` ou Admin — i18n `nav.orderStatuses` (pode ser link secundário na lista de OS) |

## Guards

| Condition | Result |
|-----------|--------|
| Não autenticado | redirect `/login` |
| Sem `serviceOrders:list` | deny / redirect `/app` |
| Sem create/update | páginas/actions forbidden |
| OS de outra empresa | not found |
| OS COMPLETED/CANCELLED sem `editClosed`/Admin | UI read-only; actions recusam mutação |
| Correção vínculos sem `correctLinks`/Admin | campos vínculos desabilitados; action forbidden |
| Status UI sem `serviceOrderStatuses:*` | redirect / deny |

## Lista padrão

| Aspect | Behavior |
|--------|----------|
| Default | todas as OS da empresa (ou ordenadas por `createdAt` desc) |
| Filtro status | `?statusId=` → só aquele status |
| Empty | empty state + CTA create se permitido |
| Colunas mínimas | cliente, serviço, equipamento (produto + identifier), valor, status |
