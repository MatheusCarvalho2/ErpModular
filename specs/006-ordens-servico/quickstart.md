# Quickstart: Validar Ordens de Serviço

**Feature**: `006-ordens-servico`  
**Date**: 2026-07-14

## Prerequisites

- Node.js LTS
- Dependências instaladas; migrate + seed após implementação desta feature
- Variáveis: `DATABASE_URL`, `AUTH_SECRET` (ver `.env.example`)
- Features `003`/`005` já aplicadas (serviços, clientes, vínculos)

## Setup

```bash
npm install
cp .env.example .env   # se ainda não existir
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abrir `http://localhost:3000`.

## Credenciais seed (pt-BR)

| Papel | E-mail | Senha | Uso |
|-------|--------|-------|-----|
| Administrador | `admin@demo.local` | `Admin123!` | OS + correção vínculos + pós-encerramento + status |
| Operador / membro | `membro@demo.local` | `Membro123!` | list/create/update OS operacional (sem status catalog / editClosed / correctLinks no preset) |
| Admin outra empresa | `admin@outra.local` | `Admin123!` | Isolamento tenant |

Fixtures esperadas (Empresa Demo): status base (Recebido…Pronto; Pronto=COMPLETED), serviço **Reparo de eletrodoméstico**, cliente **José Demo** + Air fryer identifier `2`, ≥1 ordem demo — ver [data-model.md](./data-model.md).

## Cenários de validação manual

### 1. Criar ordem com pré-preenchimento

1. Login admin → **Ordens de Serviço** → nova.
2. Serviço “Reparo de eletrodoméstico”, cliente José Demo, equipamento Air fryer (`2`).
3. **Esperado**: valor sugerido pré-preenchido; ajustar valor/descrição; salvar → aparece na lista com status Recebido (padrão).

### 2. Atualizar status (operacional)

1. Abrir a OS → mudar Recebido → Orçando → Fazendo.
2. **Esperado**: listagem reflete o status.

### 3. Somente leitura em finalizado

1. Mudar status para **Pronto** (COMPLETED).
2. Login `membro@demo.local` → abrir a mesma OS → **não** edita valor/status.
3. Login admin → ainda edita / pode reabrir para Fazendo.

### 4. Catálogo de status

1. Admin → `/app/ordens-servico/status`.
2. Renomear um status; criar “Cancelado” com papel cancelado; marcar papéis.
3. Nova OS / mudança de status ofereceetem status ativos; OS antigas mostram nome atualizado.

### 5. Várias OS no mesmo equipamento

1. Criar segunda OS para o mesmo José Demo + identifier `2`.
2. **Esperado**: ambas existem (paralelo ok).

### 6. Permissões e tenant

1. Grupo sem `serviceOrders:create` → create negado.
2. `admin@outra.local` → não vê OS/status da Demo.

## Testes automatizados

```bash
npm run test:unit
npm run test:e2e
```

Cobrir no mínimo: create + prefill valor; update status; read-only CLOSED para membro; admin editClosed; status CRUD/papel/default; multi-OS mesmo equipment; authz; tenant. Contratos: [ui-routes.md](./contracts/ui-routes.md), [service-order-actions.md](./contracts/service-order-actions.md), [service-order-status-actions.md](./contracts/service-order-status-actions.md).

## Constitution

- Testes nos caminhos críticos (I)
- Seed idempotente documentado (II)
- Strings UI via i18n pt-BR (III)
