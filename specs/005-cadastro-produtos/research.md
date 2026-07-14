# Research: Cadastro de Produtos e Vínculo com Cliente

**Feature**: `005-cadastro-produtos`  
**Date**: 2026-07-14

## R1 — Espelhar padrão Serviços para Produtos e Clientes

**Decision**: Mesma fatia arquitetural de `003`: rotas App Router sob `/app/...`, Server Actions com `requirePermission`, Prisma scoped por `companyId`, soft `active`, listagem padrão só ativos, filtro de inativos para quem pode `setActive`.

**Rationale**: Consistência operacional e reuso de authz/seed/E2E já estabelecidos; Principle V.

**Alternatives considered**:
- API REST pública — desnecessária sem clientes externos.
- Módulo genérico “CRUD builder” — over-abstraction para duas entidades.

## R2 — Modelo Product (catálogo)

**Decision**: `Product` com `companyId`, `name`, `nameNormalized`, `description?`, `active`, timestamps. Unicidade de nome entre ativos via `nameNormalized` (mesmo algoritmo de serviços: NFD + strip diacríticos + lower + trim), enforceable em action/transação (sem unique parcial no DB).

**Rationale**: Spec: catálogo ≠ unidade física; FR-002/003 alinhados a Serviços.

**Alternatives considered**:
- Product como SKU com preço/estoque — fora do caso de uso (equipamento de oficina).
- Unique DB `(companyId, nameNormalized)` — impede reuso após inativar.

## R3 — Modelo Client + telefone

**Decision**:
- `Client`: `name` (obrigatório, **sem** unicidade), `phone` (display), `phoneNormalized` (só dígitos), `active`, `companyId`, opcional `personGroupId` (FK lógico / string cuid de grupo).
- Unicidade: no máximo um “conjunto” de clientes ativos por `phoneNormalized` na empresa; clientes sem grupo compartilhado não podem colidir.
- Normalização: remover não-dígitos; comparação por `phoneNormalized`.

**Rationale**: FR-007 / clarificação Q4–Q5; nomes iguais comuns; telefone é a chave operacional de contato.

**Alternatives considered**:
- Telefone sem normalização — falsos “livres” por máscara `(11) 9…` vs `119…`.
- Unique DB rígido sem exceção — contradiz vínculo entre pessoas.

## R4 — Vínculo entre pessoas (telefone compartilhado)

**Decision**: Campo `personGroupId` (nullable) em `Client`. Fluxo:
1. Criar com telefone livre → `personGroupId = null` (ou grupo single implícito null).
2. Conflito com cliente ativo X → action retorna `{ ok: false, code: "PHONE_IN_USE", existingClientId, existingName }` (mensagens i18n).
3. `createClient({ ..., linkToPersonId })` ou `confirmPersonLink: true` + id existente → gera/reusa `personGroupId`, atribui aos dois (e a qualquer membro já no grupo de X), permite mesmo `phoneNormalized`.

Editar telefone para um já usado: mesmo fluxo (bloquear ou confirmar vínculo).

**Rationale**: Atende “deve ser possível vincular as 2 pessoas” sem fundir cadastros; cada pessoa mantém vínculos de produto próprios.

**Alternatives considered**:
- Tabela N:N `ClientAssociation` — mais flexível, mais superfície; grupo por telefone cobre o caso.
- Segundo nome só como “contato” no mesmo Client — rejeitado: precisam ser duas pessoas cadastráveis com equipamentos distintos.
- Sempre permitir telefone duplicado — perde o aviso de conflito pedido (unicidade como padrão).

## R5 — ClientProduct (unidade física / vínculo)

**Decision**: Modelo `ClientProduct` (nome de domínio: vínculo cliente–produto):
- `companyId`, `clientId`, `productId`, `identifier`, `identifierNormalized`, `serialNumber?`, `notes?`, `active`
- Unicidade: entre `active: true` na empresa, `identifierNormalized` único (app-level)
- `identifierNormalized` = mesmo helper de nome (trim, NFD, strip accents, lower); **não** strip zeros à esquerda (“1” ≠ “01”)
- Produto inativo: não listar em select de novo vínculo; vínculos existentes permanecem
- Cliente inativo: vínculos permanecem ativos; busca por identifier ainda encontra

**Rationale**: Clarificações Q1–Q3; FR-009–013.

**Alternatives considered**:
- Gerar identifier automatico — fora do escopo (operador informa).
- Unique DB always on identifier — bloqueia reuso após inativar vínculo.

## R6 — Permissões (catálogo 004)

**Decision**: Estender `lib/permissions/catalog.ts`:

| Resource | Keys |
|----------|------|
| `products` | `products:list`, `products:create`, `products:update`, `products:setActive` |
| `clients` | `clients:list`, `clients:create`, `clients:update`, `clients:setActive` |
| `clientProducts` | `clientProducts:list`, `clientProducts:create`, `clientProducts:update`, `clientProducts:setActive` |

Operadores nasce com full business keys via `businessPermissionKeys()`; re-seed sincroniza Operadores (`resetOperadoresToFullBusiness`). Admin implícito full access.

**Rationale**: FR-014 pede CRUD por produtos, clientes e vínculos.

**Alternatives considered**:
- Só `clients:update` para vínculos — menos granular e desalinhado à matriz de grupos.
- Um único recurso “cadastros” — perde controle fino da UI de grupos.

## R7 — UI / rotas

**Decision**:
- `/app/produtos`, `/novo`, `/[id]/editar` — espelho serviços
- `/app/clientes`, `/novo`, `/[id]` (detalhe + vínculos), `/[id]/editar`
- Busca por identificador: query na lista de clientes `?identifier=` ou campo na lista que resolve para o cliente dono do vínculo ativo (e inativo de cliente inativo ainda encontrável)
- Sidebar: Produtos + Clientes (i18n)

**Rationale**: Caso de uso “vincular no cliente”; busca pelo número da oficina.

**Alternatives considered**:
- Módulo separado `/app/equipamentos` — redundante com detalhe do cliente.
- Vincular só na criação do cliente — insuficiente para cliente já existente.

## R8 — i18n, seed, testes

**Decision**:
- i18n: prefixes `products.*`, `clients.*`, `clientProducts.*`, `nav.products`, `nav.clients`, `permissionGroups.resource.*`
- Seed: Product “Air fryer”; Client A/B com telefones distintos; opcional par vinculado pelo mesmo telefone; ClientProduct com identifiers `1`,`2`; segunda empresa sem vazamento
- Unit: `normalizeText`, `normalizePhoneDigits`
- E2E: create product; create client; phone conflict + person link; link product+identifier; duplicate identifier reject; search identifier; authz deny; tenant isolation

**Rationale**: Constitution I–III; espelha `tests/e2e/servicos-*.spec.ts`.

**Alternatives considered**:
- Só manual — falha gate I.
- Adiar person-link E2E — alto risco de regressão no fluxo diferencial da feature.
