# Data Model: ERP Login e Shell do Sistema

**Feature**: `001-erp-login-shell`  
**Date**: 2026-07-14

## Entities

### Company (Empresa)

| Field | Type | Rules |
|-------|------|--------|
| id | UUID / cuid | PK |
| name | string | required, 1–120 chars |
| slug | string | required, unique, URL-safe |
| createdAt | datetime | auto |
| updatedAt | datetime | auto |

**Notes**: Sistema comporta N empresas. Seed cria ao menos uma.

### User (Usuário)

| Field | Type | Rules |
|-------|------|--------|
| id | UUID / cuid | PK |
| email | string | required, unique, formato e-mail, case-insensitive único |
| passwordHash | string | required (nunca armazenar senha em claro) |
| name | string | required, display no header |
| createdAt | datetime | auto |
| updatedAt | datetime | auto |

**Notes**: Identificador de login = e-mail apenas.

### Membership (Vínculo usuário↔empresa)

| Field | Type | Rules |
|-------|------|--------|
| id | UUID / cuid | PK |
| userId | FK → User | required, **UNIQUE** neste presetup |
| companyId | FK → Company | required |
| role | string / enum | default `MEMBER` (sem RBAC rico neste presetup) |
| createdAt | datetime | auto |

**Constraints**:
- `UNIQUE(userId)` → um usuário ≤ 1 empresa (FR-014).
- `UNIQUE(userId, companyId)` redundante enquanto `userId` for único; manter `companyId` indexado.
- Futuro multi-vínculo: remover `UNIQUE(userId)` e exigir seleção de empresa no login.

**Notes**: Preferir Membership a `User.companyId` direto para não reescrever o modelo quando multi-membership for liberado.

### Session (lógica / Auth.js)

Não é necessariamente uma tabela de domínio se JWT for usado. Conceito de negócio:

| Attribute | Rules |
|-----------|--------|
| userId | usuário autenticado |
| companyId | empresa do Membership ativo |
| expiresAt | ~7 dias após login (ou rolling conforme Auth.js `maxAge`) |

Se strategy `database`: tabela de sessões do Auth.js/Prisma Adapter; payload deve incluir `companyId`.

## Relationships

```text
Company 1 ─── * Membership * ─── 1 User
                 │
                 └── UNIQUE(userId)  // presetup
```

## Validation rules (auth)

- Login: e-mail obrigatório + formato válido; senha obrigatória (mín. comprimento definido na implementação, sugerido ≥ 8).
- Credenciais inválidas: mensagem genérica (não distinguir “e-mail inexistente” vs “senha errada”).
- Usuário sem Membership: autenticação não deve resultar em acesso ao shell; erro de acesso organizacional.

## State transitions

```text
[Anônimo] --login ok + membership--> [Autenticado na Empresa X]
[Autenticado] --logout | expiry--> [Anônimo]
[Autenticado] --acesso /login--> redirect shell
[Anônimo] --acesso /app/*--> redirect /login
```

## Seed (mínimo)

1. Company: ex. “Empresa Demo” / slug `demo`
2. User: e-mail + senha documentados no quickstart
3. Membership: User → Company Demo, role `ADMIN` (rótulo apenas)
