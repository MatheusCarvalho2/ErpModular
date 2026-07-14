# Contract: UI Routes & Layouts

**Feature**: `001-erp-login-shell`  
**Date**: 2026-07-14

## Public: Login

| Item | Contract |
|------|----------|
| Route | `/login` |
| Layout desktop | 50/50: formulário **esquerda**, imagem **direita** |
| Fields | e-mail, senha, botão “Entrar” |
| Language | pt-BR |
| Errors | mensagem genérica sob o formulário; validação client de campos vazios/e-mail inválido |
| Narrow viewport | formulário utilizável; imagem reorganizada ou oculta |

## Authenticated shell

| Item | Contract |
|------|----------|
| Route group | `(app)` sob prefixo `/app` |
| Chrome | Header superior + Sidebar esquerda + main content |
| Header | nome do sistema, nome/e-mail do usuário, ação “Sair” |
| Sidebar | item “Início” → `/app` (navegável) |
| Home | `/app` — boas-vindas simples; sem módulos de negócio |
| Company UI | sem seletor de empresa; contexto implícito da membership |

## Visual acceptance

- Desktop: login claramente duas metades (form left / image right).
- Pós-login: header + sidebar visíveis; “Início” presente.
