# Data Model: Grupos de Permissão

**Feature**: `004-grupos-permissao`  
**Date**: 2026-07-14

## Entities (changed)

### Membership

| Field | Change |
|-------|--------|
| `role` | **Removido** (ou migrado e dropado). Não é mais fonte de verdade. |
| `permissionGroupId` | FK → `PermissionGroup`, obrigatório |

Regras:
- Exatamente um grupo por membership/empresa.
- Não-Admin default: grupo `systemKey = OPERADORES`.
- Admin: grupo `systemKey = ADMIN`.
- Impedir estado “empresa sem nenhum membership no grupo Admin”.

`session.user` passa a expor: `permissionGroupId`, `isAdmin`, `permissions: string[]` (e pode manter `role` derivado só para compat transitória: `isAdmin ? "ADMIN" : "MEMBER"` — opcional; preferir migrar callers).

### Company

Nova relação: `permissionGroups PermissionGroup[]`.

## Entities (new)

### PermissionGroup

| Field | Type | Rules |
|-------|------|--------|
| id | cuid | PK |
| companyId | FK → Company | required; isolamento |
| name | string | required, trim, 1–80; único por `companyId` (case-insensitive recomendado) |
| systemKey | string? | `ADMIN` \| `OPERADORES` \| `null` (personalizado); único por empresa quando não null |
| createdAt | datetime | auto |
| updatedAt | datetime | auto |

**Presets (por empresa)**:
| systemKey | Nome UI | Editable permissões | Deletável | Grants no DB |
|-----------|---------|---------------------|-----------|--------------|
| `ADMIN` | Admin | Não (acesso total implícito) | Não | Nenhum (bypass) |
| `OPERADORES` | Operadores | Sim (só chaves de negócio) | Não | Sim — default = catálogo de negócio completo |
| `null` | nome livre | Sim (teto não-Admin) | Sim → membros vão para Operadores | Sim |

**Indexes**:
- `@@unique([companyId, systemKey])` onde systemKey not null (enforce em app se SQLite limitar partial unique).
- `@@unique([companyId, name])` ou unicidade app-level case-insensitive.

### PermissionGrant

| Field | Type | Rules |
|-------|------|--------|
| id | cuid | PK |
| permissionGroupId | FK → PermissionGroup | cascade delete |
| permissionKey | string | deve existir no catálogo de negócio; unique com groupId |

**Indexes**: `@@unique([permissionGroupId, permissionKey])`.

Não criar grants para grupo Admin.

## Permission catalog (código)

Recurso inicial **Serviços** (expandível):

| Key | Meaning |
|-----|---------|
| `services:list` | Listar / ver serviços (ativos; filtro inativos se também tiver setActive ou regra UI) |
| `services:create` | Criar serviço |
| `services:update` | Editar serviço |
| `services:setActive` | Inativar / reativar |

Chaves **não grantáveis** (só Admin via `systemKey`):
- Gerir grupos de permissão
- Atribuir usuários a grupos
- Remover / rebaixar Admin / eliminar último Admin

Novos módulos futuros adicionam chaves ao catálogo; no provisionamento, Operadores da empresa recebe as novas chaves de negócio (assinatura na Assumptions da spec).

## Relationships

```text
Company 1 ─── * PermissionGroup 1 ─── * PermissionGrant
PermissionGroup 1 ─── * Membership * ─── 1 User
Company 1 ─── * Membership
```

## Validation rules

| Rule | Behavior |
|------|----------|
| Nome obrigatório / único na empresa | conflito → erro pt-BR |
| Não excluir Admin / Operadores | rejeitar |
| Excluir personalizado | transação: memberships → Operadores; depois delete grupo (+ grants cascade) |
| Não deixar empresa sem Admin | bloquear reassociação que esvazie grupo Admin |
| Não-Admin não altera vínculo de Admin | reject |
| Grants só com keys do catálogo de negócio | rejeitar keys desconhecidas ou exclusivas |
| Company scope | queries/mutations filtram `companyId` da sessão |

## State transitions

```text
[empresa nova] --ensurePresets--> [Admin + Operadores (full business grants)]
[Operadores] --edit grants--> [Operadores com subset]
[Admin UI] --create--> [grupo personalizado + grants]
[personalizado] --delete--> [memberships → Operadores; grupo removido]
[Membership] --assign group--> [outro grupo da mesma empresa]
```

## Seed fixtures (esperado)

| Fixture | Purpose |
|---------|---------|
| Empresa Demo: grupos Admin + Operadores | defaults |
| `admin@demo.local` → Admin | gestão + acesso total |
| `membro@demo.local` → Operadores (full business) | default não-Admin; write serviços permitido até restringir |
| Empresa “outra”: mesmos presets + admin | isolamento E2E |
| (teste) grupo “Só leitura” opcional | deny create — ou criar no próprio E2E |

Credenciais permanecem documentadas em pt-BR (README / quickstart).
