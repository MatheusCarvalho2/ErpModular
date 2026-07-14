# ErpModular

ERP modular (Next.js + Tailwind + Prisma) — login, shell, serviços, produtos, clientes e grupos de permissão.

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

| Grupo | E-mail | Senha | Empresa |
|-------|--------|-------|---------|
| Admin | `admin@demo.local` | `Admin123!` | Empresa Demo |
| Operadores | `membro@demo.local` | `Membro123!` | Empresa Demo |
| Admin (outra) | `admin@outra.local` | `Admin123!` | Outra Empresa |

O grupo **Operadores** nasce com CRUD de negócio completo (Serviços, Produtos, Clientes, Vínculos). Admin pode restringir no módulo Grupos de permissão.

### Fixtures Empresa Demo

| Tipo | Dados |
|------|--------|
| Serviços | **Troca de óleo** (ativo), **Alinhamento** (inativo) |
| Produtos | **Air fryer** (ativo) |
| Clientes | **Maria Demo** `(11) 98888-0001`, **José Demo** `(11) 98888-0002` |
| Vínculos | Maria → Air fryer `#1`, José → Air fryer `#2` |

Outra Empresa: serviço/produto próprios; sem clientes da Demo.

## Rotas

| Rota | Descrição |
|------|-----------|
| `/login` | Login |
| `/app` | Shell autenticado |
| `/app/servicos` | Serviços |
| `/app/produtos` | Catálogo de produtos |
| `/app/produtos/novo` | Cadastrar produto |
| `/app/clientes` | Clientes (+ busca por identificador) |
| `/app/clientes/novo` | Cadastrar cliente |
| `/app/clientes/[id]` | Detalhe + vínculos produto/identificador |
| `/app/grupos-permissao` | Grupos (Admin) |
| `/` | Redireciona para `/login` ou `/app` |

## Testes

```bash
npm run test:unit
npm run test:e2e
```

## Validação rápida

1. Login admin → Produtos → ver Air fryer; Clientes → Maria/José
2. Buscar identificador `2` → José Demo
3. Novo cliente com telefone de Maria → vincular pessoas
4. Vincular Air fryer com identificador novo no cliente
5. Login `admin@outra.local` → não vê Maria/José

Spec: `specs/005-cadastro-produtos/`.
