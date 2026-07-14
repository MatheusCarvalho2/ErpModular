# Quickstart: Validar Backoffice da Plataforma

**Feature**: `007-backoffice-plataforma`  
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

- ERP: `http://localhost:3000/login`
- Backoffice: `http://localhost:3000/backoffice/login`

## Credenciais seed (pt-BR)

| Papel | E-mail | Senha | Uso |
|-------|--------|-------|-----|
| Super admin plataforma | `platform@erpmodular.local` | (documentar no seed/README) | `/backoffice/login` |
| Admin empresa Demo | `admin@demo.local` | `Admin123!` | ERP; **não** acessa backoffice |
| Operadores Demo | `membro@demo.local` | `Membro123!` | ERP; deny backoffice |

Fixtures adicionais (ativo/inativo) conforme [data-model.md](./data-model.md). Rotas/ações: [contracts/ui-routes.md](./contracts/ui-routes.md), [contracts/platform-auth.md](./contracts/platform-auth.md), [contracts/platform-actions.md](./contracts/platform-actions.md).

## Cenários de validação manual

### 1. Entrada dedicada

1. Abrir `/backoffice/login`; autenticar como platform.
2. **Esperado**: dashboard em `/backoffice`.
3. Em outra sessão, `/login` como `admin@demo.local` → `/app` (não backoffice).
4. Tentar `/backoffice` como admin demo → sem acesso ao console.

### 2. Criar empresa + usuário Admin

1. No backoffice: nova empresa “Cliente Teste”.
2. Novo usuário vinculado a ela (e-mail único + senha).
3. Logout plataforma; login ERP com esse usuário.
4. **Esperado**: entra no ERP da empresa; pode abrir gestão de grupos (Admin).

### 3. Inativar

1. Inativar o usuário criado → login ERP falha.
2. Reativar usuário; inativar a **empresa** → login ERP falha.
3. Reativar empresa → login volta.

### 4. Reset senha temporária

1. Como platform, reset senha do usuário cliente.
2. Login ERP com senha temporária → obrigado a trocar em `/change-password`.
3. Após troca → `/app` utilizável com a nova senha.

### 5. Dashboard

1. Conferir totais de empresas e usuários clientes (sem contar `platform@…`).
2. Conferir contagem de usuários por empresa.
3. Criar/inativar e revisitar → números coerentes.

## Automated tests

```bash
npx playwright test tests/e2e/backoffice
```

(or files `backoffice-*.spec.ts` conforme tasks). Esperado: login dedicado, deny tenant, create, setActive, reset+change-password, dashboard counts.

## Constitution checklist

- [ ] Caminhos críticos cobertos por E2E (ou exceção documentada)
- [ ] Seed idempotente + credenciais pt-BR
- [ ] Strings do backoffice via i18n `pt-BR`
