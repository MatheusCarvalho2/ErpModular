# Research: Ordens de Serviço

**Feature**: `006-ordens-servico`  
**Date**: 2026-07-14

## R1 — Espelhar padrão CRUD existente

**Decision**: Mesma fatia de `003`/`005`: rotas App Router sob `/app/ordens-servico`, Server Actions com `requirePermission` / `isAdmin`, Prisma scoped por `companyId`, listagens tenant-safe, Sidebar + i18n pt-BR, Playwright E2E + Vitest pontual.

**Rationale**: Consistência e Principle V; authz/seed/E2E já estabelecidos.

**Alternatives considered**:
- REST API pública — desnecessária.
- Microserviço de OS — overkill.

## R2 — Modelo ServiceOrderStatus (catálogo por empresa)

**Decision**:
- Modelo `ServiceOrderStatus` com: `companyId`, `name`, `nameNormalized`, `sortOrder` (int), `isDefaultInitial` (bool), `role` enum `OPERATIONAL | COMPLETED | CANCELLED`, `active`, timestamps.
- Seed/migração: cinco status base — Recebido, Orçando, Aguardando, Fazendo (`OPERATIONAL`), Pronto (`COMPLETED`); Recebido com `isDefaultInitial = true`.
- Seed demo MAY incluir também **Cancelado** (`CANCELLED`) para facilitar testes (documentado); não substitui a capacidade do admin de criar outros.
- Unicidade de nome entre ativos: `nameNormalized` (mesmo helper NFD/case/acento de serviços).
- Vários status ativos MAY compartilhar o mesmo `role`.
- Exatamente um `isDefaultInitial` ativo por empresa (app/transaction enforce); padrão inicial MUST ter `role = OPERATIONAL`.
- Soft `active`; não hard delete. Inativar: não remover das ordens que já referenciam; sumir das seleções novas.
- Helper `ensureDefaultServiceOrderStatuses(companyId)` chamado no provisionamento/seed de empresa (idempotente).

**Rationale**: Clarificações Q3–Q4 + FR-007–011.

**Alternatives considered**:
- Status globais do sistema imutáveis — contradiz “admin modifica”.
- Sequência rígida de transição — rejeitada na spec.
- Só booleans `isFinal` / `isCancelled` — enum `role` cobre três papéis mutuamente exclusivos com clareza.

## R3 — Modelo ServiceOrder

**Decision**:
- `ServiceOrder`: `companyId`, `serviceId`, `clientId`, `clientProductId`, `statusId`, `priceCents` (Int, ≥ 0; zero ok), `workDescription` (String?, descrição do serviço prestado), timestamps.
- FKs vivas para Service / Client / ClientProduct / ServiceOrderStatus (mesmo tenant).
- Valor cobrado: ao criar, pré-preencher de `Service.priceCents` (se null → campo vazio ou 0 conforme UX; persistir Int ≥ 0 obrigatório no save — se serviço sem preço, operador informa ou grava 0).
- Sem `active` na ordem nesta versão: ciclo de vida = status (COMPLETED/CANCELLED). Sem hard delete.
- Múltiplas ordens por `clientProductId` permitidas (clarificação Q2).
- Após criar: update de `priceCents`, `workDescription`, `statusId` com `serviceOrders:update` **somente se** status atual for `OPERATIONAL`.
- Se status atual `COMPLETED` ou `CANCELLED`: mutação exige `isAdmin` **ou** permissão `serviceOrders:editClosed`.
- Correção de `serviceId` / `clientId` / `clientProductId`: exige `isAdmin` **ou** `serviceOrders:correctLinks` (e, se ordem fechada, também `editClosed` ou admin). Equipamento MUST pertencer ao cliente e ser ativo (exceto correção histórica documentada: preferir ativos na seleção).

**Rationale**: Spec US1–2 + clarificações Q1/Q3.

**Alternatives considered**:
- Snapshot denormalizado de nomes/preço do serviço — preço já é cópia; nomes vivos bastam (deferred na clarify); evita sync.
- Soft-inactivate da ordem separado do status — redundante com papel cancelado.

## R4 — Permissões

**Decision**: Estender `lib/permissions/catalog.ts`:

| Resource | Keys |
|----------|------|
| `serviceOrders` | `serviceOrders:list`, `serviceOrders:create`, `serviceOrders:update`, `serviceOrders:correctLinks`, `serviceOrders:editClosed` |
| `serviceOrderStatuses` | `serviceOrderStatuses:list`, `serviceOrderStatuses:create`, `serviceOrderStatuses:update`, `serviceOrderStatuses:setActive` |

- **Admin** (`systemKey`): acesso total (já implícito).
- **Operadores** (preset): receber `serviceOrders:list|create|update` **apenas** (não `correctLinks`, `editClosed`, nem `serviceOrderStatuses:*`).
- Grupos personalizados: matriz UI permite conceder qualquer chave (equivale a “permissão especial” da spec).
- Ajustar `businessPermissionKeys()` / reset de Operadores para **excluir** keys sensíveis (não dar full `PERMISSION_KEYS` cego).

**Rationale**: Spec restringe gestão de status e pós-encerramento; Operadores precisam do fluxo diário de OS.

**Alternatives considered**:
- Só `isAdmin` sem keys de status — impede grupo custom “gerente de status”.
- Todas as keys no preset Operadores — viola somente-leitura pós-encerramento e admin-only de status.

## R5 — UI / rotas

**Decision**:
- Módulo principal: `/app/ordens-servico` (lista + filtro `?statusId=`), `/novo`, `/[id]` (detalhe/edição conforme permissões).
- Catálogo de status: `/app/ordens-servico/status` (ou `/app/status-ordens`) — Admin / `serviceOrderStatuses:list`.
- Form criar: selects serviço → cliente → equipamentos do cliente; onChange serviço preenche `priceCents`; status default = `isDefaultInitial`.
- Lista: colunas cliente, serviço, equipamento (produto + identifier), valor, status.

**Rationale**: Alinha nav aos módulos existentes; status como sub-área administrativa.

**Alternatives considered**: Status embutido só em Configurações genéricas — ainda não existe; sub-rota do módulo basta.

## R6 — Seed e serviço demo

**Decision**:
- `ensureDefaultServiceOrderStatuses` na Empresa Demo (e Outra Empresa se seed tocar).
- Upsert serviço **“Reparo de eletrodoméstico”** (ativo, com preço sugerido) na Demo — spec/demo; complementar Troca de óleo já existente.
- Upsert ≥1 `ServiceOrder` demo: José Demo + vínculo identifier `2` (Air fryer) + serviço reparo + status Recebido (ou Fazendo).
- Documentar credenciais/fixtures em quickstart pt-BR.

**Rationale**: Constitution II; Independente Test US1.

**Alternatives considered**: Só status sem ordem demo — E2E mais frágil.

## R7 — Testes

**Decision**:
- Playwright: criar OS com pré-preenchimento de valor; editar status operacional; operador blocked em OS Pronto; admin edita pós-encerramento; admin CRUD status / papel; filtro por status; authz; tenant isolation; várias OS mesmo equipamento.
- Vitest: helper de role/gated update; normalização nome status se extrair puro.

**Rationale**: Constitution I / FR-015.

**Alternatives considered**: Só unit — insuficiente para jornadas de permissão.

## R8 — i18n

**Decision**: Namespaces `orders.*`, `orderStatuses.*`, `nav.orders`, `permissionGroups.resource.serviceOrders|serviceOrderStatuses`, labels de actions extras (`correctLinks`, `editClosed`). Nomes dos cinco status seed: dados da empresa (pt-BR no seed), não chaves i18n por instância; rótulos de **papel** (operacional/finalizado/cancelado) via i18n.

**Rationale**: FR-014; status custom = dados.

**Alternatives considered**: i18n por cada status seed — quebra rename do admin.
