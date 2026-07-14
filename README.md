# ErpModular

ERP modular (Next.js + Tailwind + Prisma) — presetup de login e shell do sistema.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Auth.js (NextAuth v5) — e-mail + senha, sessão JWT ~7 dias
- Prisma — SQLite local por padrão (`prisma/dev.db`)
- Docker Compose opcional para PostgreSQL (`docker-compose.yml`)

## Setup

```bash
npm install
cp .env.example .env   # se ainda não tiver .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Credenciais seed

| Campo  | Valor              |
|--------|--------------------|
| E-mail | `admin@demo.local` |
| Senha  | `Admin123!`        |
| Empresa| Empresa Demo       |

## Rotas

| Rota     | Descrição                                      |
|----------|------------------------------------------------|
| `/login` | Login split (form à esquerda / imagem à direita)|
| `/app`   | Shell autenticado (header + sidebar “Início”)  |
| `/`      | Redireciona para `/login` ou `/app`            |

## Validação rápida

1. Login com seed → chega em `/app` com header, sidebar e boas-vindas
2. Senha errada → permanece no login com erro
3. Acessar `/app` sem sessão → redirect `/login`
4. Clicar **Sair** → volta ao login; `/app` exige autenticação

Spec e plano: `specs/001-erp-login-shell/`.
