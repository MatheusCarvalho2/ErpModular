# UI Routes: Produtos, Clientes e Vínculos

**Feature**: `005-cadastro-produtos`  
**Date**: 2026-07-14

## Produtos

| Path | Permission | Purpose |
|------|------------|---------|
| `/app/produtos` | `products:list` | Lista ativos; filtro inativos se `products:setActive` |
| `/app/produtos/novo` | `products:create` | Formulário criar |
| `/app/produtos/[id]/editar` | `products:update` | Editar; ações inativar/reativar se `setActive` |

## Clientes

| Path | Permission | Purpose |
|------|------------|---------|
| `/app/clientes` | `clients:list` | Lista ativos; busca por identificador de vínculo (`?identifier=` ou campo de busca) |
| `/app/clientes/novo` | `clients:create` | Criar; UI de conflito de telefone + confirmar vínculo entre pessoas |
| `/app/clientes/[id]` | `clients:list` | Detalhe: dados + vínculos ativos; form de novo vínculo se `clientProducts:create` |
| `/app/clientes/[id]/editar` | `clients:update` | Editar nome/telefone (mesmo fluxo de link se telefone colidir) |

## Nav

| Item | Href | Visibility |
|------|------|------------|
| Produtos | `/app/produtos` | autenticado com `products:list` (i18n `nav.products`) |
| Clientes | `/app/clientes` | autenticado com `clients:list` (i18n `nav.clients`) |

## Guards

| Condition | Result |
|-----------|--------|
| Não autenticado | redirect `/login` |
| Sem permissão de list | deny / redirect `/app` |
| Sem permissão de create/update | páginas de escrita redirecionam; actions retornam forbidden |
| `id` de outra empresa | not found / deny |
| Busca identifier | retorna cliente(s) da **própria** empresa cujo vínculo (ativo) corresponde; inclui cliente inativo se o vínculo ativo ainda existir |

## Lista produtos / clientes

| Aspect | Behavior |
|--------|----------|
| Default | só `active: true` |
| Empty | empty state + CTA se tiver create |
| Inativos | filtro/toggle para quem tem `setActive` |
| Clientes vinculados por telefone | indicação discreta de associação (opcional UX); ambos listáveis |
