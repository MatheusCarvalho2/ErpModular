# Contract: Auth & Session

**Feature**: `001-erp-login-shell`  
**Date**: 2026-07-14  
**Style**: HTTP route handlers / Auth.js endpoints (App Router)

## Endpoints

### POST `/api/auth/callback/credentials` (ou fluxo Auth.js equivalente)

Autentica com e-mail e senha (gerenciado pelo Auth.js Credentials).

**Input** (form / JSON conforme provider):

| Field | Required | Notes |
|-------|----------|--------|
| email | yes | identificador único |
| password | yes | plaintext apenas em trânsito (HTTPS em prod) |
| csrfToken | yes | exigido pelo Auth.js |

**Success**: sessão criada (cookie HTTP-only), redirect para `/app` (home interna).

**Failure**: redirect de volta a `/login` com erro genérico (ex. `CredentialsSignin`); UI mostra mensagem amigável em pt-BR.

### POST `/api/auth/signout` (Auth.js)

Encerra sessão.

**Success**: cookie removido/invalidado; redirect `/login`.

### GET `/api/auth/session`

Retorna sessão atual (usado por client/server).

**Authenticated response (shape lógica)**:

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "companyId": "string",
    "companyName": "string"
  },
  "expires": "ISO-8601"
}
```

**Unauthenticated**: `{ "user": null }` ou 401 conforme cliente Auth.js.

## Route protection (comportamental)

| Path pattern | Anônimo | Autenticado |
|--------------|---------|-------------|
| `/login` | 200 formulário | 302 → `/app` |
| `/app`, `/app/*` | 302 → `/login` | 200 shell |
| `/` | 302 → `/login` ou `/app` conforme sessão | — |

## Non-goals (este contrato)

- Signup / register
- Password reset
- MFA
- Company switcher / multi-membership
- OAuth providers
