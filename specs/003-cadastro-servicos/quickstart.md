# Quickstart: Validar Cadastro de Serviços

**Feature**: `003-cadastro-servicos`  
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
| Administrador | `admin@demo.local` | `Admin123!` | Criar / editar / inativar / reativar |
| Membro | `membro@demo.local` | *(definir na implementação; documentar no README)* | Listar; write deve falhar |

Serviços demo da Empresa Demo devem existir após o seed (pelo menos um ativo). Ver [data-model.md](./data-model.md).

## Cenários de validação manual

### 1. Nav + lista (admin)

1. Login como admin → `/app`.
2. Sidebar: **Serviços** → `/app/servicos`.
3. **Esperado**: lista de ativos (ou empty + CTA novo); item de navegação presente.

### 2. Criar serviço válido

1. `/app/servicos/novo`, preencher Nome + Descrição (opcionais à vontade).
2. Salvar.
3. **Esperado**: aparece na lista padrão; tempo exibido como horas+minutos quando informado; valor em formato pt-BR.

### 3. Validação obrigatórios e unicidade

1. Tentar salvar sem Nome ou Descrição → erro claro.
2. Criar “Café”; tentar outro ativo “cafe” / “Café” → rejeitado.
3. Inativar “Café”; criar novo “Café” ativo → aceito.

### 4. MEMBER não escreve

1. Logout; login como membro.
2. Abrir `/app/servicos` → vê lista ativos.
3. Tentar `/app/servicos/novo` ou editar → negado; nenhum registro criado/alterado.

### 5. Inativar / reativar (admin)

1. Inativar um ativo → some da lista padrão.
2. Filtro/visão inativos → aparece; reativar → volta à lista padrão.

### 6. Isolamento (se seed tiver 2ª empresa)

1. Login usuário da empresa B.
2. **Esperado**: não vê serviços da Empresa Demo.

## Testes automatizados

```bash
npx playwright test
# ou script npm definido na implementação (ex.: npm run test:e2e)
```

Cobrir no mínimo: create+list (admin), deny MEMBER, unicidade case/acento, inativar/reativar. Detalhes de ações: [contracts/service-actions.md](./contracts/service-actions.md). Rotas: [contracts/ui-routes.md](./contracts/ui-routes.md).

## Fora de escopo neste quickstart

- Hard delete, categorias, pedidos/OS, fiscal, multi-locale.
