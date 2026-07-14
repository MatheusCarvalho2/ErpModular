# Quickstart: Validar Login + Shell

**Feature**: `001-erp-login-shell`  
**Date**: 2026-07-14

## Prerequisites

- Node.js LTS instalado
- SQLite via Prisma (padrão local) **ou** PostgreSQL (`docker compose up -d db` + provider `postgresql`)
- Variáveis de ambiente: `DATABASE_URL`, `AUTH_SECRET` (ou `NEXTAUTH_SECRET`)

## Setup (após implementação)

```bash
# na raiz do app Next.js
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abrir `http://localhost:3000` (ou porta configurada).

## Credenciais seed (exemplo — ajustar na implementação)

| Campo | Valor |
|-------|--------|
| E-mail | `admin@demo.local` |
| Senha | `Admin123!` |
| Empresa | Empresa Demo |

## Cenários de validação

### 1. Login sucesso → shell

1. Ir a `/login`.
2. Confirmar layout: formulário à esquerda, imagem à direita (desktop).
3. Entrar com credenciais seed.
4. **Esperado**: redirect `/app`, header + sidebar com “Início”, boas-vindas; sem seletor de empresa.

### 2. Login inválido

1. Em `/login`, senha errada.
2. **Esperado**: permanece em login; mensagem de erro amigável.

### 3. Rota protegida

1. Sessão limpa / logout.
2. Acessar `/app` diretamente.
3. **Esperado**: redirect `/login`.

### 4. Logout

1. Autenticado em `/app`, clicar “Sair” no header.
2. **Esperado**: volta `/login`; `/app` novamente redireciona ao login.

### 5. Sessão persistente

1. Login ok → fechar aba/navegador → reabrir `/app`.
2. **Esperado**: ainda autenticado (dentro da janela de 7 dias).

## Contratos relacionados

- [contracts/auth-api.md](./contracts/auth-api.md)
- [contracts/ui-routes.md](./contracts/ui-routes.md)
- [data-model.md](./data-model.md)

## Fora deste quickstart

- Cadastro público, MFA, OAuth, módulos ERP, vínculo multiempresa por usuário.
