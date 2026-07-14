# Research: Cadastro de Serviços

**Feature**: `003-cadastro-servicos`  
**Date**: 2026-07-14

## R1 — Persistência do Serviço e escopo por empresa

**Decision**: Modelo Prisma `Service` com `companyId` FK → `Company`, campos de domínio da spec, `active Boolean @default(true)`, timestamps; relação `Company.services`.

**Rationale**: Reutiliza isolamento multiempresa já modelado em Membership; queries sempre filtradas por `session.user.companyId`.

**Alternatives considered**:
- Tenant só em código sem FK — frágil e sem integridade referencial.
- Soft-delete com `deletedAt` sem flag `active` — equivalente, mas boolean é mais explícito para listagem padrão.

## R2 — Valor e tempo

**Decision**:
- Valor cobrado: `priceCents Int?` (centavos BRL); UI formata pt-BR (`R$`).
- Tempo gasto: UI horas + minutos; persistência `durationMinutes Int?` (total em minutos). `null` = não informado; `0` permitido.

**Rationale**: Inteiros evitam float; conversão h/min ↔ minutos é trivial e testável; atende “1h 30min”.

**Alternatives considered**:
- `Decimal` para preço — ok, mas cents é mais simples em SQLite/testes.
- Guardar hours/minutes como dois campos — redundante vs total minutos.
- Só minutos na UI — rejeitado pela clarificação (opção B).

## R3 — Unicidade de nome (ativos, case/acento-insensitive)

**Decision**:
- Coluna `nameNormalized String` calculada por helper (`NFD` + remoção de diacríticos + `toLowerCase` + trim).
- Na criação/edição/reativação: rejeitar se existir outro `Service` com mesmo `companyId`, `nameNormalized` e `active: true`.
- Sem unique constraint global no DB (inativos podem reutilizar o nome); enforced em Server Action dentro de transação.

**Rationale**: Unique parcial “só ativos” em Prisma/SQLite é limitado; app-level + coluna normalizada atende FR-005 com clareza e testes unitários no helper.

**Alternatives considered**:
- Unique `(companyId, nameNormalized)` sempre — bloqueia reuso após inativar (contradiz clarificação).
- Partial unique index SQL raw — possível depois; adia simplicidade do MVP.

## R4 — Papel ADMIN na sessão

**Decision**: Expor `role` (`ADMIN` | `MEMBER`) no JWT/session a partir de `Membership.role` no `authorize` / callbacks Auth.js (campo já existe no schema/seed).

**Rationale**: Spec exige create/edit/inativar só para admin; hoje `role` não sobe à sessão — bloqueador funcional.

**Alternatives considered**:
- Consultar Membership a cada Server Action sem session.role — correto mas repetitivo; session.role + revalidação em action é suficiente.
- RBAC rico (permissões granulares) — fora de escopo / Complexity.

## R5 — Mutações e rotas UI

**Decision**: Server Actions (`"use server"`) para create/update/setActive; páginas App Router sob `/app/servicos` (lista), `/app/servicos/novo`, `/app/servicos/[id]/editar`. Guards: middleware já exige auth em `/app`; actions checam `companyId` + `role`.

**Rationale**: Padrão natural App Router; ainda não há API REST de domínio; evita inventar endpoint público.

**Alternatives considered**:
- Route Handlers REST — útil para clientes externos; desnecessário agora.
- Client-only fetch + route handlers — mais boilerplate.

## R6 — i18n

**Decision**: Camada mínima: `messages/pt-BR.ts` (objeto de chaves) + `lib/i18n.ts` com `t(key)`. Usar em nav Serviços, formulários, erros, empty states deste módulo. Login/shell legado pode permanecer hard-coded nesta feature (sem migrar tudo), mas **novas** strings do módulo MUST usar i18n.

**Rationale**: Constitution III; next-intl seria overkill para um locale único neste incremento (Principle V).

**Alternatives considered**:
- next-intl / next-i18n — mais infra do que o necessário agora.
- Continuar hard-code pt-BR — falha no gate III para superfícies novas.

## R7 — Soft-inactivate UX

**Decision**: Listagem padrão = `active: true`. Admin vê toggle/filtro “Inativos” (query `?status=inactive` ou segment) + ações Inativar/Reativar na lista ou no formulário de edição.

**Rationale**: Atende FR-011 sem inventar segundo módulo.

**Alternatives considered**:
- Página separada só de inativos — ok, mas filtro na mesma lista é mais simples.
- Hard delete — rejeitado pela clarificação.

## R8 — Seed e testes

**Decision**:
- Seed: manter `admin@demo.local` (ADMIN); adicionar `membro@demo.local` / senha documentada (MEMBER); ≥1 serviço ativo demo; opcional 1 inativo para cenários de filtro.
- Playwright: instalar e cobrir login admin create+list, validação obrigatórios, unicidade (café/Cafe), deny write para MEMBER, inativar/reativar, isolamento multiempresa se segundo company fixture for barata (senão documentar teste com dois seed companies).

**Rationale**: Constitution I + II; suite E2E ainda não existe no repo (002 não implementado) — esta feature introduz o mínimo necessário aos caminhos críticos.

**Alternatives considered**:
- Só testes manuais — falha gate I sem exceção justificada.
- Adiar Playwright até 002 — aumentaria risco de merge sem cobertura do módulo.
