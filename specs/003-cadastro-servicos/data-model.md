# Data Model: Cadastro de Serviços

**Feature**: `003-cadastro-servicos`  
**Date**: 2026-07-14

## Entities (reused)

### Company / User / Membership

Inalterados em relação a `001`, exceto uso efetivo de `Membership.role`:

| role value | Meaning |
|------------|---------|
| `ADMIN` | Pode criar, editar, inativar e reativar serviços da empresa |
| `MEMBER` | Pode listar serviços ativos da empresa; write negado |

`session.user` passa a incluir `role` além de `id`, `email`, `name`, `companyId`, `companyName`.

## Entities (new)

### Service (Serviço)

| Field | Type | Rules |
|-------|------|--------|
| id | cuid | PK |
| companyId | FK → Company | required; isolamento de tenant |
| name | string | required, trim, 1–120 chars (display) |
| nameNormalized | string | required; derivado de `name` (case/acento-insensitive); usado na checagem de unicidade |
| description | string | required, trim, 1–2000 chars |
| productDescription | string? | opcional, trim, ≤ 2000 chars se presente |
| priceCents | int? | opcional; ≥ 0; unidade = centavos BRL |
| durationMinutes | int? | opcional; ≥ 0; total de minutos (UI: horas + minutos 0–59) |
| active | boolean | default `true`; `false` = inativo (soft) |
| createdAt | datetime | auto |
| updatedAt | datetime | auto |

**Indexes**:
- `@@index([companyId, active])` para listagens.
- Sem `@@unique([companyId, nameNormalized])` global (inativos podem reutilizar nome).

**Uniqueness (application rule)**:
Para `active === true`, o par (`companyId`, `nameNormalized`) MUST ser único entre registros ativos. Na reativação, a mesma regra aplica.

**Normalization** (`nameNormalized`):
1. Trim  
2. Unicode NFD  
3. Remover combining marks (diacríticos)  
4. Lowercase  

Ex.: `"Café Premium"` → `"cafe premium"`.

## Relationships

```text
Company 1 ─── * Service
Company 1 ─── * Membership * ─── 1 User
```

Serviço NÃO liga direto a User; auditoria de quem criou fica fora desta versão.

## Validation rules

| Rule | Behavior |
|------|----------|
| name / description obrigatórios | rejeitar se vazios ou só whitespace |
| priceCents | se presente, inteiro ≥ 0 |
| durationMinutes | se presente, inteiro ≥ 0; na UI, minutos 0–59 |
| name uniqueness (ativos) | conflito → erro pt-BR “nome já em uso” |
| company scope | todas as queries/mutations filtram `companyId` da sessão |
| write authz | somente `role === ADMIN` |
| list default | apenas `active: true` (e `companyId` da sessão) |

## State transitions

```text
[novo] --create--> [active]
[active] --inactivate (ADMIN)--> [inactive]
[inactive] --reactivate (ADMIN + nome disponível)--> [active]
[active|inactive] --edit (ADMIN)--> [mesmos estados; campos atualizados]
```

Hard delete: **não suportado**.

## Seed fixtures (esperado)

| Fixture | Purpose |
|---------|---------|
| Empresa Demo + `admin@demo.local` (ADMIN) | write paths |
| `membro@demo.local` (MEMBER) | deny create/edit/inactivate |
| ≥1 `Service` ativo na Empresa Demo | listagem |
| (opcional) 1 `Service` inativo | filtro/reativação |
| (recomendado) 2ª empresa + serviço | isolamento E2E |
