# Data Model: Backoffice da Plataforma

**Feature**: `007-backoffice-plataforma`  
**Date**: 2026-07-14

## Entities

### User (estendido)

| Field | Type | Notes |
|-------|------|-------|
| id | string (cuid) | PK |
| email | string | unique, login (normalizado lower-case) |
| passwordHash | string | bcrypt |
| name | string | obrigatório |
| active | boolean | default `true`; inativo → não autentica (ERP nem plataforma) |
| isPlatformOperator | boolean | default `false`; `true` → super admin; **sem** Membership |
| mustChangePassword | boolean | default `false`; após reset plataforma → `true` até troca no ERP |
| createdAt / updatedAt | datetime | |

**Rules**:
- Se `isPlatformOperator = true` → `membership` MUST ser null.
- Se `isPlatformOperator = false` → no máximo um `Membership` (já enforced).
- E-mail único global (clientes + operadores).

### Company (estendido)

| Field | Type | Notes |
|-------|------|-------|
| id | string (cuid) | PK |
| name | string | único entre empresas **ativas** (validação na aplicação) |
| slug | string | unique global; gerado do nome |
| active | boolean | default `true`; inativa → memberships não entram no ERP |
| createdAt / updatedAt | datetime | |
| memberships / permissionGroups / … | relations | existentes |

### Membership (inalterado estruturalmente)

Continua: `userId` unique, `companyId`, `permissionGroupId`. Usuários criados no backoffice → grupo com `systemKey = ADMIN` da empresa.

### Session (Auth.js JWT — não persistido em Prisma)

| Claim | Platform | ERP |
|-------|----------|-----|
| sessionKind | `"platform"` | `"erp"` |
| id / email / name | yes | yes |
| companyId / companyName / permissionGroupId / isAdmin / permissions | absent / N/A | yes |

## Relationships

```text
User (isPlatformOperator=true) ──✕── Membership

User (cliente) 1 ── 0..1 Membership ── N Company
Company 1 ── N PermissionGroup (Admin, Operadores, …)
Membership N ── 1 PermissionGroup
```

## State transitions

### User.active

```text
[active=true] --inactivate--> [active=false]
[active=false] --reactivate--> [active=true]
```

- Idempotente se já no estado alvo.
- Não permitir `active=false` no último `isPlatformOperator` ativo.

### Company.active

```text
[active=true] --inactivate--> [active=false]  // bloqueia login ERP dos membros
[active=false] --reactivate--> [active=true]
```

### mustChangePassword

```text
[false] --platform resetPassword--> [true]
[true]  --user changePassword (ERP)--> [false]
```

## Validation rules

| Rule | Entity |
|------|--------|
| e-mail formato + unique | User |
| nome empresa não vazio; unique entre ativas | Company |
| slug unique | Company |
| senha mínima (mesma política do projeto / seed) | User create/reset/change |
| create user: company existe e preferencialmente ativa | Membership |
| create user: sempre PermissionGroup ADMIN da empresa | Membership |
| reset password: só usuário cliente ativo (`!isPlatformOperator`) | User |
| edit e-mail: unique | User |

## Dashboard projections (read model)

Não são entidades persistidas; queries:

| Metric | Definition |
|--------|------------|
| companiesTotal | count Company |
| companiesActive / Inactive | filter `active` |
| clientUsersTotal | count User where `!isPlatformOperator` |
| clientUsersActive / Inactive | idem + `active` |
| usersPerCompany | per Company: count Membership |

## Seed fixtures (pt-BR)

| Fixture | Valores sugeridos | Propósito |
|---------|-------------------|-----------|
| Operador plataforma | `platform@erpmodular.local` / senha documentada; `isPlatformOperator=true`; `active=true`; sem membership | Login `/backoffice/login` |
| Empresa Demo | já existe (`demo`); `active=true` | Baseline |
| Empresa inativa (nova ou flag) | ex. slug `inativa-demo`; `active=false` | Dashboard + bloqueio login |
| Usuário inativo cliente | membership em empresa ativa; `active=false` | Teste inativação usuário |
| Admin/membros demo | existentes; `isPlatformOperator=false`; `active=true` | Regressão ERP |

Reexecução do seed MUST NOT duplicar fixtures gerenciados (upsert por e-mail/slug).
