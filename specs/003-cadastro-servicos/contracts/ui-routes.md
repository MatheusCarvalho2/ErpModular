# Contract: UI Routes — Serviços

**Feature**: `003-cadastro-servicos`  
**Date**: 2026-07-14

## Navegação (shell)

| Item | Contract |
|------|----------|
| Sidebar | Item **Serviços** (i18n) → `/app/servicos` além de **Início** → `/app` |
| Auth | Rotas sob `/app/servicos/**` exigem sessão (middleware existente) |

## Lista — `/app/servicos`

| Item | Contract |
|------|----------|
| Audiência | Qualquer usuário autenticado da empresa |
| Conteúdo padrão | Serviços `active` da `companyId` da sessão: nome, valor (se houver), tempo (se houver) |
| Empty state | Mensagem i18n; se ADMIN, CTA para `/app/servicos/novo` |
| Filtro inativos | Visível só para ADMIN; ex.: `?status=inactive` lista inativos da empresa |
| Ações ADMIN | Criar; editar; inativar (ativos); reativar (inativos) |
| Ações MEMBER | Sem botões/links de create/edit/inativar/reativar |

## Novo — `/app/servicos/novo`

| Item | Contract |
|------|----------|
| Audiência | ADMIN; MEMBER → redirect ou erro amigável sem criar |
| Campos | Nome*, Valor (opcional), Tempo horas+min (opcional), Descrição*, Descrição específica do produto (opcional) |
| Sucesso | Persistência + redirect para lista (ou detalhe/edição) com feedback |
| Erros | Obrigatórios; valor/tempo inválidos; nome duplicado (ativos, case/acento-insensitive) |

## Editar — `/app/servicos/[id]/editar`

| Item | Contract |
|------|----------|
| Audiência | ADMIN; serviço MUST pertencer à empresa da sessão |
| Cross-company / id inválido | 404 ou negado; sem vazar dados |
| MEMBER | Negado |
| Campos | Mesmos do create; pode alterar status via ação dedicada se não no form |
| Unicidade | Mesma regra na troca de nome / reativação |

## Idioma

Todas as labels, botões, erros e empty states destas rotas via i18n pt-BR.
