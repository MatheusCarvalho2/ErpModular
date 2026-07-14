# Quickstart: Validar Grupos de Permissão

**Feature**: `004-grupos-permissao`  
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

| Grupo | E-mail | Senha | Uso |
|-------|--------|-------|-----|
| Admin | `admin@demo.local` | `Admin123!` | Gestão de grupos; acesso total |
| Operadores | `membro@demo.local` | `Membro123!` | Default não-Admin; CRUD de negócio completo até restringir |

Ver [data-model.md](./data-model.md). Detalhes de rotas/ações: [contracts/ui-routes.md](./contracts/ui-routes.md), [contracts/permission-group-actions.md](./contracts/permission-group-actions.md).

## Cenários de validação manual

### 1. Presets existem

1. Login como Admin → sidebar **Grupos de permissão**.
2. **Esperado**: grupos **Admin** e **Operadores**; Operadores com todas as permissões de Serviços ligadas.

### 2. Personalizar Operadores

1. Editar Operadores; desmarcar `services:create` (ou equivalente na UI); salvar.
2. Logout; login como `membro@demo.local`.
3. Tentar criar serviço → **negado**; listar pode continuar permitido se `services:list` ativo.
4. Relogar Admin; religar create se quiser restaurar default.

### 3. Criar grupo personalizado + vincular

1. Novo grupo “Só leitura”; só listagem de serviços; salvar.
2. Atribuir `membro@demo.local` a esse grupo.
3. Como membro: lista ok; create/edit/inativar negados.

### 4. Excluir grupo → volta a Operadores

1. Admin exclui “Só leitura”.
2. **Esperado**: membro volta ao grupo Operadores; permissões = as de Operadores atuais.

### 5. Proteção de Admin

1. Como Operadores (ou grupo personalizado), tentar gerir grupos / rebaixar Admin → negado.
2. Como Admin, tentar remover o único Admin da empresa → bloqueado.

### 6. Isolamento

1. Login `admin@outra.local`.
2. **Esperado**: não vê grupos/usuários da Empresa Demo.

## Testes automatizados

```bash
npm run test:e2e
npm run test:unit   # se houver helpers de catálogo
```

Cobrir no mínimo: presets + default Operadores full business; restringir permissão e deny; criar/vincular/excluir→Operadores; last Admin; isolamento; regressão Serviços alinhada a `requirePermission`.

## Fora de escopo neste quickstart

- Convite/criação de novos usuários (além do vínculo a grupo).
- Soft-delete de grupos; multi-grupo por usuário; outros locales.
