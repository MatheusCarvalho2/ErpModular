# Research: Backoffice da Plataforma

**Feature**: `007-backoffice-plataforma`  
**Date**: 2026-07-14

## R1 — Identidade do super admin (operador de plataforma)

**Decision**: Campo `User.isPlatformOperator Boolean @default(false)`. Operadores de plataforma **não** possuem `Membership`. Usuários clientes têm `isPlatformOperator = false` e exatamente um `Membership`.

**Rationale**: Spec/clarificações: ferramenta externa do dono, distinta do Admin da empresa; seed já separa credenciais. Evita acoplar plataforma ao modelo multiempresa/grupos.

**Alternatives considered**:
- Tabela `PlatformOperator` 1:1 com User — indirection sem ganho na v1.
- Reusar grupo Admin de uma “empresa sistema” — mistura tenancy com plataforma e polui dashboard/contagens.
- Membership opcional + flag — ambíguo no fluxo ERP atual (`authorize` exige membership).

## R2 — Entrada/login dedicados (clarificação B)

**Decision**:
- Rotas sob `/backoffice/*` (login em `/backoffice/login`).
- Segundo Credentials provider Auth.js (`id: "platform"`) usado só pelo formulário do backoffice.
- JWT/session: `sessionKind: "platform" | "erp"`.
- Middleware: `/backoffice` (exceto login) exige sessão `platform`; `/app` exige `erp`; usuário `erp` em `/backoffice` → deny/redirect; operador em `/login` ERP → não obtém console plataforma.

**Rationale**: Clarificação explícita (entrada dedicada). Um único Auth.js mantém Principle V vs. second cookie stack.

**Alternatives considered**:
- Mesmo `/login` com redirect por papel — rejeitado pelo usuário (opção A).
- Segundo app/deploy — fora do escopo.

## R3 — `authorize` ERP vs plataforma

**Decision**:
- Provider **erp** (`credentials`): user ativo, `!isPlatformOperator`, membership existe, **company.active**, senha ok → `sessionKind: "erp"` + authz company.
- Provider **platform**: user ativo, `isPlatformOperator`, senha ok → `sessionKind: "platform"` (sem companyId).
- Em ambos: usuário inativo → falha de autenticação.

**Rationale**: Hoje `authorize` rejeita ausência de membership; operadores plataforma quebrariam o login único. Providers separados isolam invariantes.

**Alternatives considered**:
- Um provider com branch — mais frágil e mistura erros.
- Soft-link operador a company fictícia — rejeitado (R1).

## R4 — Active em Company e User

**Decision**: `Company.active` e `User.active` (default `true`). Soft-status espelhando domínio (Service/Product). Inativar empresa bloqueia login ERP de todos os memberships; inativar usuário bloqueia só aquele login. Reativação idempotente. Impedir inativar o último `isPlatformOperator` ativo (FR-008).

**Rationale**: Spec US3; padrão já usado no ERP para soft-inactivate.

**Alternatives considered**:
- Hard delete — destrutivo e conflita com histórico/módulo.
- Só inativar User — não cobre “empresa deixou de assinar”.

## R5 — Senha temporária + troca obrigatória

**Decision**: `User.mustChangePassword Boolean @default(false)`. Ação de plataforma define nova senha (hash) + `mustChangePassword = true`. No ERP: após login bem-sucedido com a flag, redirecionar para `/change-password` até concluir; bloquear `/app/*` enquanto pendente. Criação inicial de usuário **não** força troca (senha definida pelo operador); só o **reset** força (clarificação C).

**Rationale**: Clarificação C; sem e-mail, operador comunica a senha temporária off-band.

**Alternatives considered**:
- Sempre forçar troca na criação — não pedido.
- OTP/magic link — depende de e-mail (fora do escopo).

## R6 — Criação de empresa + usuário Admin

**Decision**: Ao criar empresa: gerar `slug` único a partir do nome (normalizado + sufixo se colisão); `active = true`; chamar `ensureCompanyPermissionPresets`. Ao criar usuário: hash senha; membership na empresa no grupo `systemKey = ADMIN`; unicidade de e-mail global. Nome de empresa único entre **ativas** (assumptions).

**Rationale**: Clarificação A (sempre Admin); presets já existem no codebase.

**Alternatives considered**:
- Escolher grupo na UI — rejeitado.
- Sem slug — quebra modelo atual (`Company.slug` unique).

## R7 — Dashboard / contagens

**Decision**: Queries agregadas no servidor:
- Empresas: total / `active=true` / `active=false`.
- Usuários clientes: `isPlatformOperator = false` com mesmos cortes de active.
- Por empresa: count de `Membership` (usuários daquela empresa).
Operadores de plataforma **não** entram nos totais de usuários clientes.

**Rationale**: Clarificações Q2 + pedido de usuários por cliente.

**Alternatives considered**:
- Incluir operadores no total geral — rejeitado.
- Analytics temporal / export — fora do escopo.

## R8 — Authz e invalidação de sessão

**Decision**:
- `requirePlatformOperator()`: sessão `sessionKind === "platform"` + releitura DB (`isPlatformOperator && active`).
- ERP `requireSession`: falha se user/company inativos; se `mustChangePassword`, resposta que pages/middleware tratam com redirect `/change-password`.
- Inativação: efeito na **próxima** navegação/request (já documentado na spec); sem revogação de JWT store.

**Rationale**: Alinha edge cases da spec e padrão atual de reload authz em Server Actions.

**Alternatives considered**:
- JWT blacklist — overkill v1.
- Socket push logout — fora do escopo.

## R9 — i18n e testes

**Decision**: Namespace `backoffice.*` (+ `auth.changePassword.*`) em `messages/pt-BR.ts`. Seed: `platform@erpmodular.local` (ou similar) + fixtures ativo/inativo documentados. E2E: `loginPlatformAs`; specs dedicados; workers=1 permanece.

**Rationale**: Constitution I–III.

**Alternatives considered**:
- Hard-coded strings no login backoffice — viola gate III (login ERP legado não é desculpa para nova superfície).
