# Research: Grupos de Permissão

**Feature**: `004-grupos-permissao`  
**Date**: 2026-07-14

## R1 — Substituir `Membership.role` por grupo

**Decision**: Introduzir `PermissionGroup` por empresa e `Membership.permissionGroupId` (obrigatório). Remover o uso de `Membership.role` (`ADMIN`/`MEMBER`) após migration: Admin = grupo com `systemKey = ADMIN`; não-Admins = `OPERADORES` ou grupo personalizado (`systemKey` null).

**Rationale**: Spec exige grupos customizáveis e vínculos; string binária não escala para matriz CRUD. Clarificação: todos os não-Admins vão para Operadores por default.

**Alternatives considered**:
- Manter `role` + tabela de permissões paralela — duplicidade e risco de divergência.
- Múltiplos grupos por usuário — fora do escopo (FR-009: exatamente um).

## R2 — Modelo de grants

**Decision**: Catálogo de permissões em código (`lib/permissions/catalog.ts`) com chaves estáveis (`services:list`, `services:create`, `services:update`, `services:setActive`). Persistência: tabela `PermissionGrant` (`permissionGroupId` + `permissionKey`). Grupo Admin **não** armazena grants (acesso total implícito). Operadores e personalizados armazenam subset do catálogo de negócio.

**Rationale**: Catálogo versionado no app evita migração de seed a cada string; junction cobre customização (FR-003/005). Privilégios de “remover/gerir Admin” **não** entram no catálogo grantável — só `systemKey === ADMIN` (FR-004/012).

**Alternatives considered**:
- Tabela `Permission` normalizada no DB — overkill para poucos módulos.
- ACL por registro — fora do escopo.

## R3 — Defaults de Operadores e seed

**Decision**: Ao criar empresa (e no seed), criar Admin + Operadores; Operadores recebe **todas** as chaves de CRUD de negócio do catálogo atual. Memberships antigas `MEMBER` → Operadores; `ADMIN` → Admin. Credencial `membro@demo.local` permanece, agora no grupo Operadores (pode escrever em Serviços até Admin restringir).

**Rationale**: Clarificação Q1 (opção B) + Q2 (Operadores default do sistema).

**Alternatives considered**:
- Default só-leitura (MEMBER legado) — rejeitado pelo usuário.
- Sem grants até configuração — risco de produto “travado”.

## R4 — Exclusão de grupo personalizado

**Decision**: Hard delete do grupo personalizado; em transação, reassociar todos os `Membership` afetados ao grupo Operadores da mesma empresa. Bloquear exclusão de Admin e Operadores.

**Rationale**: Clarificação explícita do usuário; evita órfãos e UI de “escolha destino”.

**Alternatives considered**:
- Bloquear até reassociação manual — rejeitado.
- Soft-inactivate — complexidade sem ganho pedido.

## R5 — Sessão e authz

**Decision**:
- JWT/session: `permissionGroupId`, `isAdmin` (derived), `permissions: string[]` (vazio se `isAdmin`).
- `requireAdmin()` → `isAdmin`.
- `requirePermission(key)` → `isAdmin || permissions.includes(key)`.
- Ao mudar grupo/permissões: inválida sessão atual do usuário afetado na **próxima** requisição (reler Membership/grants no `jwt` callback quando `trigger`/`update` ou sempre reidratar grants do DB no callback se barato; mínimo: releitura no authorize já existente + `session.update` após mutações de vínculo).

**Rationale**: Continua o padrão Auth.js do projeto; substitui `role` sem reinventar auth.

**Alternatives considered**:
- Checar DB em toda Server Action sem cache na sessão — correto mas mais latência; híbrido: session + enforce companyId no DB.
- Casbin/OPA — overkill (Principle V).

## R6 — UI e rotas

**Decision**: Área Admin-only `/app/grupos-permissao` (lista, novo, editar). Matriz de checkboxes por recurso×ação. Atribuição de usuário a grupo na própria edição do grupo ou lista de memberships da empresa (mínimo: ao editar grupo, lista de usuários; ou tela simples de vínculo na lista). Nav: item “Grupos de permissão” visível só para Admin.

**Rationale**: Espelha padrão `/app/servicos`; FR-012.

**Alternatives considered**:
- Settings genérico — desnecessário agora.
- REST público — não há clientes externos.

## R7 — Impacto no módulo Serviços

**Decision**: Trocar gates `requireAdmin` / `role === "ADMIN"` por `requirePermission` nas mutações e CTAs:
- listar: `services:list` (Operadores default tem)
- criar/editar/inativar: `services:create|update|setActive`

Atualizar E2E que esperavam deny write para `membro@demo.local`: ou (a) restringir Operadores no teste antes de assert deny, ou (b) introduzir usuário em grupo “Só leitura” no seed de teste. Preferir (a) no teste de deny + novo teste de Operadores default com write permitido.

**Rationale**: Default B muda o contrato comportamental de MEMBER.

**Alternatives considered**:
- Manter Serviços só-Admin até Admin “abrir” Operadores — contradiz clarificação B.

## R8 — i18n

**Decision**: Extender `messages/pt-BR.ts` com chaves `nav.permissionGroups`, `permissionGroups.*` (lista, form, erros, empty). Sem novos locales.

**Rationale**: Constitution III; padrão de `003`.
