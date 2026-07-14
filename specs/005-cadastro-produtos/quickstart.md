# Quickstart: Validar Cadastro de Produtos e Vínculo com Cliente

**Feature**: `005-cadastro-produtos`  
**Date**: 2026-07-14

## Prerequisites

- Node.js LTS
- Dependências instaladas; migrate + seed após implementação desta feature
- Variáveis: `DATABASE_URL`, `AUTH_SECRET` (ver `.env.example`)

## Setup

```bash
npm install
cp .env.example .env   # se ainda não existir
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abrir `http://localhost:3000`.

## Credenciais seed (pt-BR)

| Papel | E-mail | Senha | Uso |
|-------|--------|-------|-----|
| Administrador | `admin@demo.local` | `Admin123!` | Full access (produtos, clientes, vínculos) |
| Operador / membro | `membro@demo.local` | `Membro123!` | Conforme grants Operadores (full business após re-seed) |
| Admin outra empresa | `admin@outra.local` | `Admin123!` | Isolamento tenant |

Fixtures de domínio esperadas: produto **Air fryer**, clientes demo, vínculos com identificadores — ver [data-model.md](./data-model.md).

## Cenários de validação manual

### 1. Produto no catálogo

1. Login admin → sidebar **Produtos** → `/app/produtos`.
2. Novo produto “Air fryer” (se ainda não existir no seed, criar “Liquidificador”).
3. **Esperado**: aparece na lista; tentar nome duplicado case/acento → rejeitado.

### 2. Cliente + telefone

1. **Clientes** → novo: Nome + Telefone → salvar.
2. Sem nome ou telefone → erro.
3. Segundo cliente com **mesmo nome**, telefone diferente → aceito.

### 3. Telefone duplicado + vínculo entre pessoas

1. Novo cliente com telefone já usado por cliente ativo → bloqueio + indicação do existente.
2. Confirmar **vincular pessoas** → ambos cadastrados, mesmo telefone, associados.
3. Cada um pode ter seus próprios equipamentos.

### 4. Vincular produto com identificador

1. Abrir cliente → vincular produto do catálogo + identificador `1` (série/obs opcionais).
2. Repetir em outro cliente com `2` e `3` (mesmo produto catálogo).
3. Tentar outro vínculo com `1` ou `Café-1` vs `cafe-1` → rejeitado.
4. Buscar identificador `2` na lista de clientes → acha o cliente certo.

### 5. Inativações

1. Inativar vínculo → some da visão padrão; identifier liberado.
2. Inativar cliente com vínculos → cliente some da lista padrão; busca por identifier ainda encontra; vínculos não cascateiam.
3. Inativar produto → some do select; vínculos antigos permanecem no histórico do cliente.

### 6. Permissões e tenant

1. Grupo sem `products:create` / `clients:create` / `clientProducts:create` → ações negadas.
2. Login `admin@outra.local` → não vê produtos/clientes/vínculos da Empresa Demo.

## Testes automatizados

```bash
npm run test:unit
npm run test:e2e
```

Cobrir no mínimo: create product; create client; PHONE_IN_USE + link pessoas; create ClientProduct + duplicate identifier; search identifier; authz; tenant. Contratos: [product-actions.md](./contracts/product-actions.md), [client-actions.md](./contracts/client-actions.md), [client-product-actions.md](./contracts/client-product-actions.md), [ui-routes.md](./contracts/ui-routes.md).

## Fora de escopo neste quickstart

- Hard delete, OS, etiquetas, composição Serviço↔Produto, CRM fiscal completo, multi-locale.
