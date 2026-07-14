# UI Routes: Grupos de Permissão

**Feature**: `004-grupos-permissao`

## Routes

| Path | Audience | Purpose |
|------|----------|---------|
| `/app/grupos-permissao` | Admin | Lista grupos da empresa (Admin, Operadores, personalizados) |
| `/app/grupos-permissao/novo` | Admin | Criar grupo personalizado + matriz de permissões |
| `/app/grupos-permissao/[id]/editar` | Admin | Editar nome (só personalizado), permissões (Operadores/personalizado), ver usuários do grupo / reatribuir |

## Lista

| Aspect | Behavior |
|--------|----------|
| Empty | Não aplica para presets; sempre ≥2 grupos após ensurePresets |
| Badges | Indicar “Sistema” para Admin/Operadores; personalizado sem badge ou “Personalizado” |
| Ações | Editar; Excluir só personalizado (com feedback de reassociação a Operadores) |
| Nav | Item sidebar só para `isAdmin`; i18n `nav.permissionGroups` |

## Novo / Editar

| Aspect | Behavior |
|--------|----------|
| Admin | Somente leitura / mensagem “acesso total”; sem matriz editável; sem excluir |
| Operadores | Nome fixo de sistema; matriz CRUD de negócio editável |
| Personalizado | Nome + matriz; exclusão disponível |
| Matriz | Recursos × ações (criar, listar, editar, inativar) a partir do catálogo |
| Vínculo usuários | Selecionar memberships da empresa e atribuir a este grupo; bloquear remoção do último Admin |

## Guards

| Condition | Result |
|-----------|--------|
| Não autenticado | redirect `/login` |
| Autenticado não-Admin | redirect `/app` (ou lista serviços) + sem mutações |
| `id` de outra empresa | deny / not found |

## Impacto Serviços (rotas existentes)

| Route | Gate atualizado |
|-------|-----------------|
| `/app/servicos` | CTAs Novo/Editar/Inativar se `requirePermission` correspondente; lista se `services:list` |
| `/app/servicos/novo` | `services:create` |
| `/app/servicos/[id]/editar` | `services:update` |
