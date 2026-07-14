# Contract: Service Server Actions

**Feature**: `003-cadastro-servicos`  
**Date**: 2026-07-14

Contrato lógico das Server Actions (sem API HTTP pública). Todas exigem sessão Auth.js válida.

## Contexto comum

| Input implícito | Rule |
|-----------------|------|
| `session.user.companyId` | Obrigatório; escopo de todas as queries |
| `session.user.role` | `ADMIN` para mutações de escrita; `MEMBER` só leitura via páginas |

**Result shape (conceitual)**:
- Sucesso: `{ ok: true, id?: string }` (+ `revalidatePath` das rotas de serviços)
- Falha: `{ ok: false, error: string }` onde `error` é chave i18n ou mensagem já resolvida em pt-BR

## `createService`

| Field | Required | Notes |
|-------|----------|--------|
| name | yes | trim; gera `nameNormalized` |
| description | yes | trim |
| productDescription | no | |
| priceCents | no | ≥ 0 se presente |
| durationMinutes | no | ≥ 0; derivado de horas/minutos da UI |

**Authz**: ADMIN  

**Effects**: Insere `Service` com `active: true`, `companyId` da sessão.  

**Errors**: unauthenticated; forbidden; validation; duplicate active name.

## `updateService`

| Field | Required | Notes |
|-------|----------|--------|
| id | yes | MUST ser da mesma empresa |
| name, description, … | same as create | |

**Authz**: ADMIN  

**Effects**: Atualiza campos; recalcula `nameNormalized` se nome mudar. Não muda empresa.  

**Errors**: not found (ouando fora da empresa); validation; duplicate active name (outro id).

## `setServiceActive`

| Field | Required | Notes |
|-------|----------|--------|
| id | yes | mesma empresa |
| active | yes | `true` = reativar; `false` = inativar |

**Authz**: ADMIN  

**Effects**:
- `active: false` — soft-inactivate (idempotente se já inativo)
- `active: true` — reativar somente se não houver outro ativo com mesmo `nameNormalized` na empresa

**Errors**: not found; forbidden; duplicate name on reactivate.

## Leitura

Listagem/get feitos em Server Components / loaders com Prisma filtrando `companyId` (+ `active` conforme query). Sem action obrigatória para read.
