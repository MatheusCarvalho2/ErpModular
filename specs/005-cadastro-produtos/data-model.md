# Data Model: Cadastro de Produtos e Vínculo com Cliente

**Feature**: `005-cadastro-produtos`  
**Date**: 2026-07-14

## Entities (reused)

### Company / User / Membership / PermissionGroup / PermissionGrant / Service

Inalterados funcionalmente. Catálogo de permissões ganha recursos `products`, `clients`, `clientProducts` (ver research R6). `Company` ganha relações para os novos modelos.

## Entities (new)

### Product (Produto — catálogo)

| Field | Type | Rules |
|-------|------|--------|
| id | cuid | PK |
| companyId | FK → Company | required; tenant |
| name | string | required, trim, 1–120 |
| nameNormalized | string | required; derivado de `name` |
| description | string? | opcional, trim, ≤ 2000 |
| active | boolean | default `true` |
| createdAt / updatedAt | datetime | auto |

**Indexes**: `@@index([companyId, active])`

**Uniqueness (app)**: para `active === true`, (`companyId`, `nameNormalized`) único.

**Normalization (`nameNormalized`)**: trim → NFD → remover diacríticos → lowercase. Ex.: `"Air Fryer"` → `"air fryer"`.

---

### Client (Cliente)

| Field | Type | Rules |
|-------|------|--------|
| id | cuid | PK |
| companyId | FK → Company | required |
| name | string | required, trim, 1–120; **não** único |
| phone | string | required, trim, display (1–40) |
| phoneNormalized | string | required; só dígitos derivados de `phone` |
| personGroupId | string? | nullable; cuid compartilhado entre pessoas vinculadas pelo telefone |
| active | boolean | default `true` |
| createdAt / updatedAt | datetime | auto |

**Indexes**: `@@index([companyId, active])`, `@@index([companyId, phoneNormalized])`, `@@index([companyId, personGroupId])`

**Phone uniqueness (app)**:
- Se **não** houver outro `Client` ativo na empresa com mesmo `phoneNormalized` → permitido (`personGroupId` null).
- Se houver e o operador **não** confirmar vínculo → rejeitar.
- Se houver e confirmar vínculo com cliente existente E → todos no grupo passam a compartilhar o mesmo `personGroupId` (criar novo cuid se E ainda não tiver) e o novo cliente usa o mesmo `phoneNormalized`.
- Telefone só em cliente **inativo**: pode reutilizar sem vínculo entre pessoas.

**Normalization (`phoneNormalized`)**: manter apenas dígitos (`0-9`). Ex.: `(11) 98888-7777` → `11988887777`.

---

### ClientProduct (Vínculo cliente–produto / unidade)

| Field | Type | Rules |
|-------|------|--------|
| id | cuid | PK |
| companyId | FK → Company | required; denormalizado para unicidade/tenant queries |
| clientId | FK → Client | required; mesma empresa |
| productId | FK → Product | required; mesma empresa |
| identifier | string | required, trim, 1–60 (display) |
| identifierNormalized | string | required; derivado de `identifier` |
| serialNumber | string? | opcional, trim, ≤ 120 |
| notes | string? | opcional, trim, ≤ 2000 |
| active | boolean | default `true` |
| createdAt / updatedAt | datetime | auto |

**Indexes**: `@@index([companyId, active])`, `@@index([clientId, active])`, `@@index([companyId, identifierNormalized])`

**Uniqueness (app)**: para `active === true`, (`companyId`, `identifierNormalized`) único. Após inativar, identifier pode ser reutilizado.

**Normalization (`identifierNormalized`)**: mesmo algoritmo de `nameNormalized` (case/acento-insensitive). **Não** remover zeros à esquerda: `"1"` ≠ `"01"`.

**Integrity**:
- `product` da seleção de novo vínculo: `active === true` e mesma `companyId`.
- Inativar product: não remove `ClientProduct`; só some do select padrão.
- Inativar client: **não** altera `ClientProduct.active`; busca por identifier continua encontrando.

## Relationships

```text
Company 1 ─── * Product
Company 1 ─── * Client
Company 1 ─── * ClientProduct

Client 1 ─── * ClientProduct * ─── 1 Product

Client ⋯ personGroupId ⋯ Client   (0..n clientes ativos no mesmo grupo / telefone compartilhado)
```

Auditoria de quem criou: fora de escopo.

## Validation rules

| Rule | Behavior |
|------|----------|
| Product name obrigatório | rejeitar vazio/whitespace |
| Product name único (ativos) | conflito → erro i18n |
| Client name + phone obrigatórios | rejeitar vazios |
| Phone digitos após normalize | rejeitar se `phoneNormalized` vazio |
| Phone conflito sem link | erro + payload do cliente existente |
| Phone conflito com link | criar/associar `personGroupId` |
| ClientProduct: product + identifier | obrigatórios |
| Identifier único (ativos) | conflito case/acento-insensitive |
| serial/notes | opcionais; whitespace → null |
| Tenant | queries/mutations sempre `companyId` da sessão |
| Authz | `products:*` / `clients:*` / `clientProducts:*` |

## State transitions

### Product / Client / ClientProduct

```text
[novo] --create--> [active]
[active] --inactivate--> [inactive]
[inactive] --reactivate (+ regras de unicidade)--> [active]
[*] --edit--> [* com campos atualizados]
```

Hard delete: **não suportado**.

### Person link (telefone)

```text
[client A, phone P, group=null]
  + create B with phone P + confirmLink(A)
  --> A.personGroupId = G, B.personGroupId = G (mesmo P)
```

## Seed fixtures (esperado)

| Fixture | Purpose |
|---------|---------|
| Product ativo “Air fryer” (Empresa Demo) | catálogo + select de vínculo |
| Product inativo opcional | filtro/reativação |
| Client “Maria Demo” + telefone único | create/vínculo feliz |
| Client “José Demo” + outro telefone | segundo cliente |
| (opcional) par vinculado mesmo telefone | E2E person link |
| ClientProduct Maria↔Air fryer identifier `1` | busca/lista |
| ClientProduct José↔Air fryer identifier `2` | cenário 3 pessoas / isolamento de ids |
| Empresa Outra sem esses registros | tenant E2E |
| Operadores com full business keys após re-seed | permissões novos recursos |

Credenciais existentes (`admin@demo.local`, `membro@demo.local`, `admin@outra.local`) reutilizadas — documentar no README/quickstart se novas fixtures forem adicionadas.
