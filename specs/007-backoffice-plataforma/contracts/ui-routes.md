# UI Routes: Backoffice da Plataforma

**Feature**: `007-backoffice-plataforma`

## Platform (ferramenta externa)

| Path | Audience | Purpose |
|------|----------|---------|
| `/backoffice/login` | Anônimo / platform | Login dedicado (provider `platform`) |
| `/backoffice` | Platform operator | Dashboard (totais + usuários por empresa) |
| `/backoffice/empresas` | Platform operator | Lista empresas (filtro status / busca nome) |
| `/backoffice/empresas/nova` | Platform operator | Criar empresa |
| `/backoffice/empresas/[id]` | Platform operator | Detalhe / editar / inativar-reativar |
| `/backoffice/usuarios` | Platform operator | Lista usuários clientes (busca e-mail/nome/empresa/status) |
| `/backoffice/usuarios/novo` | Platform operator | Criar usuário (empresa + Admin + senha inicial) |
| `/backoffice/usuarios/[id]` | Platform operator | Detalhe / editar / inativar-reativar / reset senha |

### Shell plataforma

| Aspect | Behavior |
|--------|----------|
| Layout | Próprio (não reutiliza Sidebar/Header do ERP tenant) |
| Nav | Dashboard, Empresas, Usuários, Sair |
| i18n | `backoffice.nav.*`, etc. |

### Guards (plataforma)

| Condition | Result |
|-----------|--------|
| Não autenticado em rota interna `/backoffice/*` | redirect `/backoffice/login` |
| Sessão `sessionKind=erp` em `/backoffice/*` | deny → logout ou redirect login plataforma |
| Sessão `platform` ok | render |
| Autenticado platform em `/backoffice/login` | redirect `/backoffice` |
| Usuário empresa no formulário platform | credenciais rejeitadas (sem vazar dados) |

## ERP (impacto)

| Path | Change |
|------|--------|
| `/login` | Inalterado como entrada das empresas; se user/company inativos → erro de auth; operadores plataforma **não** autenticam aqui com sucesso |
| `/app/*` | Middleware/layout: sessão `erp`; se `mustChangePassword` → redirect `/change-password` |
| `/change-password` | Nova: só sessão `erp` com `mustChangePassword=true`; após sucesso → `/app` |

### Guards (ERP adicionais)

| Condition | Result |
|-----------|--------|
| User ou Company `active=false` | login falha / sessão recusada na próxima request |
| `mustChangePassword` e path ≠ `/change-password` | redirect troca de senha |
| Tentativa de `/backoffice` com sessão erp | sem acesso ao console |

## Middleware matcher (alvo)

Estender além de `/app` e `/login` para incluir `/backoffice/:path*`, `/change-password`.
