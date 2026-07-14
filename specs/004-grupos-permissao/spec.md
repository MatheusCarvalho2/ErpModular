# Feature Specification: Grupos de Permissão

**Feature Branch**: `004-grupos-permissao`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "preciso criar agora um grupo de permissão, basicamente teremos o admin e operadores, o admin tem todos acessos os operadores podem ter todos também (menos de remover admin) e ai os usuários podem criar grupos personalizados ou personaliazr o grupo que vem default no sistema (operadores) neste caso as permissoes consistem nos cruds dos itens etc..."

<!--
  CONSTITUTION (see `.specify/memory/constitution.md`):
  - Automated tests for critical paths whenever possible
  - Seed fixtures when needed for develop/demo/test (idempotent, documented)
  - All user-facing copy via i18n; active locale pt-BR only for now
  Reflect these in User Scenarios, Requirements, and Assumptions as applicable.
-->

## Clarifications

### Session 2026-07-14

- Q: Quais permissões o grupo Operadores nasce com (empresa nova / seed)? → A: CRUD de negócio completo (teto máximo de não-Admin) já ligado; sem privilégios de remoção/alteração de Admin
- Q: Como tratar exclusão de grupo personalizado / vínculo default de não-Admins? → A: Criar o grupo **Operadores** como default do sistema; vincular todos os usuários não-Admin a Operadores; ao excluir grupo personalizado com membros, reassociar esses usuários ao grupo Operadores

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Grupos padrão Admin e Operadores (Priority: P1)

Ao provisionar a empresa, o sistema já disponibiliza dois grupos de permissão: **Admin** (acesso total) e **Operadores** (grupo padrão customizável). Administradores da empresa podem ver esses grupos e entender o que cada um pode fazer.

**Why this priority**: Sem os grupos padrão e a distinção Admin vs Operadores, não há base para autorizar ações nos módulos (ex.: CRUDs) nem para personalização posterior.

**Independent Test**: Com empresa e usuários seed, autenticar como admin, abrir a área de grupos de permissão e confirmar existência de Admin e Operadores com comportamentos distintos (Admin com tudo; Operadores sem privilégios de remoção/alteração de Admin).

**Acceptance Scenarios**:

1. **Given** uma empresa existe no sistema, **When** um administrador abre a gestão de grupos de permissão, **Then** vê pelo menos os grupos padrão **Admin** e **Operadores**.
2. **Given** uma empresa acabou de ser provisionada (ou no seed), **When** o administrador inspeciona o grupo Operadores sem ter customizado nada, **Then** todas as permissões de CRUD de negócio dos módulos disponíveis estão habilitadas, e nenhuma permissão exclusiva de remoção/alteração de Admin está presente.
3. **Given** um usuário pertence ao grupo Admin, **When** executa ações protegidas dos módulos disponíveis (criar, ler, atualizar, remover/inativar conforme o domínio), **Then** todas essas ações são permitidas.
4. **Given** um usuário pertence ao grupo Operadores (ou a um grupo personalizado), **When** tenta remover, rebaixar ou exclusivizar o último administrador / alterar o vínculo de Admin de forma que a empresa fique sem Admin, **Then** a ação é negada.
5. **Given** o grupo Admin existe, **When** alguém tenta excluí-lo ou reduzir seu conjunto de permissões para menos do que “acesso total”, **Then** o sistema impede a alteração.

---

### User Story 2 - Personalizar o grupo Operadores (Priority: P1)

Um administrador ajusta as permissões do grupo padrão **Operadores** (habilitar/desabilitar ações de CRUD por recurso/módulo), respeitando o teto: Operadores podem chegar a ter as mesmas permissões de negócio que o Admin, **exceto** privilégios de remoção/alteração de Admin.

**Why this priority**: É o fluxo principal pedido — o default do sistema deve ser customizável sem precisar criar um grupo novo.

**Independent Test**: Como admin, alterar permissões do grupo Operadores (ex.: retirar criação de um item e manter listagem), salvar, e validar com um usuário desse grupo que as ações permitem/negam conforme a configuração.

**Acceptance Scenarios**:

1. **Given** o administrador está editando o grupo Operadores, **When** marca ou desmarca permissões de CRUD por recurso disponível, **Then** a configuração é salva e passa a valer para usuários desse grupo.
2. **Given** o grupo Operadores está sendo editado, **When** o administrador tenta atribuir uma permissão exclusiva de gestão de Admin (ex.: remover Admin / gerir grupo Admin), **Then** essa opção não está disponível ou a atribuição é rejeitada.
3. **Given** um usuário do grupo Operadores, **When** tenta uma ação cujo CRUD correspondente está desabilitado no grupo, **Then** a ação é negada e nada é alterado.
4. **Given** um usuário do grupo Operadores, **When** tenta uma ação cujo CRUD correspondente está habilitado, **Then** a ação é permitida (no escopo da empresa do usuário).

---

### User Story 3 - Criar e gerenciar grupos personalizados (Priority: P2)

Um administrador cria grupos além de Admin e Operadores, define permissões de CRUD por recurso e associa usuários da empresa a esses grupos.

**Why this priority**: Amplia o modelo além do default, mas depende dos grupos padrão e do catálogo de permissões já existirem.

**Independent Test**: Criar um grupo “Só leitura”, conceder apenas listagem de um recurso, vincular um usuário, e confirmar que esse usuário lista mas não cria/edita/remove.

**Acceptance Scenarios**:

1. **Given** o administrador está na gestão de grupos, **When** cria um grupo personalizado com nome válido e conjunto de permissões compatível com o teto de não-Admin, **Then** o grupo é persistido na empresa e aparece na listagem.
2. **Given** um grupo personalizado existe, **When** o administrador edita nome e/ou permissões e salva, **Then** as alterações passam a valer para os usuários vinculados.
3. **Given** um grupo personalizado existe com usuários vinculados, **When** o administrador o exclui, **Then** esses usuários são reassociados automaticamente ao grupo **Operadores** (default do sistema) e o grupo personalizado deixa de existir; Admin e Operadores padrão MUST NOT ser excluíveis.
4. **Given** o administrador tenta criar um grupo com nome já usado na mesma empresa, **When** salva, **Then** o sistema impede e informa conflito de nome.
5. **Given** um usuário autenticado sem permissão de gerir grupos, **When** tenta criar ou editar grupos, **Then** a ação é negada.

---

### User Story 4 - Vincular usuários a grupos (Priority: P2)

Um administrador atribui cada usuário da empresa a um grupo de permissão; a autorização das ações do ERP passa a refletir o grupo do usuário.

**Why this priority**: Grupos só entregam valor quando usuários efetivamente usam as permissões configuradas.

**Independent Test**: Trocar o grupo de um usuário de Operadores para um grupo restrito e confirmar mudança imediata de autorização nas ações de CRUD.

**Acceptance Scenarios**:

1. **Given** existem usuários e grupos na empresa, **When** o administrador atribui um usuário a um grupo, **Then** o vínculo fica salvo e as permissões efetivas passam a ser as desse grupo.
2. **Given** um usuário não-Admin é criado ou provisionado sem grupo personalizado, **When** o vínculo é estabelecido, **Then** ele fica no grupo **Operadores** (default do sistema), salvo atribuição explícita a outro grupo não-Admin.
3. **Given** um usuário está no grupo Admin, **When** o administrador tenta removê-lo do Admin de forma que a empresa fique sem nenhum Admin, **Then** a operação é bloqueada.
4. **Given** um operador (não Admin), **When** tenta alterar o grupo de um Admin ou remover um Admin, **Then** a ação é negada.
5. **Given** um usuário da empresa, **When** está autenticado após mudança de grupo, **Then** na próxima ação protegida as novas permissões são aplicadas (sem exigir configuração manual extra).

---

### Edge Cases

- Tentativa de excluir ou “esvaziar” o grupo Admin: bloqueada.
- Tentativa de deixar a empresa sem nenhum usuário no grupo Admin: bloqueada.
- Grupo Operadores com todas as permissões de negócio habilitadas: permitido (e é o estado inicial); permissões exclusivas de Admin continuam inacessíveis.
- Usuário sem grupo atribuído: não deve ocorrer em fluxos normais — todo não-Admin MUST pertencer a Operadores (ou a um grupo personalizado); Admin MUST pertencer ao grupo Admin; seed e migration migram MEMBER → Operadores.
- Nome de grupo vazio ou só espaços: salvamento impedido com feedback claro.
- Permissão referenciada a um recurso/módulo ainda não existente na empresa: não aparece no catálogo até o módulo existir; remoção futura de módulo não quebra a gestão (permissões órfãs ignoradas ou limpas de forma segura).
- Isolamento multiempresa: grupos e vínculos de uma empresa nunca afetam outra.
- Usuário tenta burlar a UI e chamar ação direta sem permissão: servidor/regra de negócio nega da mesma forma.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar, por empresa, os grupos padrão **Admin** e **Operadores**.
- **FR-002**: O grupo **Admin** MUST conceder acesso total às ações disponíveis na empresa e MUST NOT poder ser excluído nem ter seu conjunto de permissões reduzido abaixo de “acesso total”.
- **FR-003**: O grupo **Operadores** MUST ser customizável por quem tem permissão de gerir grupos: permissões de CRUD por recurso/módulo podem ser ligadas ou desligadas. No provisionamento da empresa (e no seed), Operadores MUST nascer com **todas** as permissões de CRUD de negócio dos módulos disponíveis já habilitadas, sem privilégios exclusivos de remoção/alteração de Admin.
- **FR-004**: Usuários não-Admin (Operadores ou grupos personalizados) MUST poder receber qualquer combinação de permissões de negócio (CRUD dos itens/módulos), MAS MUST NOT receber privilégios de remoção/alteração de Admin (inclui: remover Admin, rebaixar o último Admin, gerir o grupo Admin como se fosse personalizável).
- **FR-005**: Administradores MUST poder criar grupos personalizados na empresa, com nome e conjunto de permissões dentro do teto de não-Admin.
- **FR-006**: Administradores MUST poder editar grupos personalizados e o grupo Operadores (nome do personalizado e permissões; Operadores pode ter nome fixo de sistema se desejado, mas permissões editáveis).
- **FR-007**: Administradores MUST poder excluir grupos personalizados; ao excluir, usuários vinculados MUST ser reassociados automaticamente ao grupo **Operadores**. Admin e Operadores (presets) MUST NOT ser excluíveis.
- **FR-008**: O catálogo de permissões MUST ser expresso em termos de ações de CRUD (ou equivalentes do domínio, ex.: criar, listar/ver, editar, inativar/remover) por recurso/módulo disponível no produto.
- **FR-009**: Cada usuário da empresa MUST estar vinculado a exatamente um grupo de permissão daquela empresa; a autorização efetiva das ações MUST derivar desse grupo. **Operadores** MUST ser o grupo default do sistema para não-Admins: em provisionamento, seed e migration, todo usuário não-Admin MUST ser vinculado a Operadores (salvo atribuição posterior a grupo personalizado).
- **FR-010**: O sistema MUST impedir que operadores ou grupos personalizados removam ou alterem Admin de forma indevida (FR-004), inclusive tentativas fora da UI.
- **FR-011**: Grupos, permissões e vínculos MUST ser isolados por empresa (multiempresas).
- **FR-012**: A gestão de grupos e a atribuição de usuários a grupos MUST ser restrita a quem pertence ao grupo Admin (ou equivalente com acesso total de administração).
- **FR-013**: Textos de interface da funcionalidade (labels, erros, vazios, ações) MUST passar pela camada i18n com locale obrigatório `pt-BR`.
- **FR-014**: Seed MUST incluir fixtures previsíveis: grupos Admin e Operadores; pelo menos um usuário Admin e um usuário Operadores com credenciais documentadas em pt-BR, de forma idempotente; o usuário Operadores do seed MUST refletir o default de FR-003 (CRUD de negócio completo habilitado); memberships MEMBER existentes MUST migrar para Operadores.
- **FR-015**: Caminhos críticos (existência dos defaults, personalizar Operadores, criar grupo, atribuir usuário, reassociar a Operadores ao excluir grupo, negar remoção de Admin por não-Admin, negar ação sem permissão de CRUD, isolamento por empresa) MUST ter cobertura automatizada sempre que possível; se algum for impraticável, a exceção e o checklist manual MUST constar em plan/tasks.

### Key Entities

- **Grupo de permissão**: Conjunto nomeado de permissões no escopo de uma empresa; inclui presets Admin e Operadores e grupos personalizados.
- **Permissão**: Capacidade atômica de executar uma ação de CRUD (ou equivalente) sobre um recurso/módulo (ex.: serviços — criar, listar, editar, inativar).
- **Vínculo usuário–grupo**: Associação de um usuário da empresa a exatamente um grupo; determina as permissões efetivas na sessão/uso.
- **Admin (preset)**: Grupo de sistema com acesso total; imutável em permissões e indelével.
- **Operadores (preset)**: Grupo de sistema default, customizável em permissões de negócio; no nascimento (empresa nova/seed) já possui o teto máximo de CRUD de negócio; sem privilégios de remoção/alteração de Admin.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador configura (ou restaura) as permissões do grupo Operadores em menos de 3 minutos para o conjunto de recursos disponíveis no produto.
- **SC-002**: Um administrador cria um grupo personalizado, define permissões e vincula um usuário em menos de 5 minutos.
- **SC-003**: Em 100% dos casos de teste automatizados dos caminhos críticos, tentativa de não-Admin remover/rebaixar Admin é negada sem alterar o vínculo.
- **SC-004**: Em 100% dos casos em que uma permissão de CRUD está desabilitada no grupo do usuário, a ação correspondente é negada (UI e regra de negócio).
- **SC-005**: Um avaliador consegue distinguir Admin (tudo) de Operadores (subset configurável) sem documentação técnica, só pela interface e pelo comportamento das ações.
- **SC-006**: Grupos e usuários de uma empresa nunca influenciam autorização de outra empresa nos cenários de isolamento verificados.

## Assumptions

- “Usuários podem criar/personalizar grupos” significa **administradores da empresa** (grupo Admin), não qualquer operador sem permissão de gestão.
- O modelo de autorização por grupos **substitui/generaliza** o papel binário anterior (ex.: ADMIN vs MEMBER): Admin ≈ acesso total; Operadores ≈ o antigo “membro” evolui para grupo com permissões configuráveis. O default de Operadores **não** replica o MEMBER só-leitura: nasce com CRUD de negócio completo (exceto gestão de Admin).
- Cada usuário tem **um** grupo por empresa (alinhado ao modelo atual de um usuário ↔ no máximo uma empresa).
- Permissões cobrem os **módulos/recursos já existentes** no produto no momento da implementação (ex.: serviços e demais cadastros disponíveis), com estrutura preparada para novos módulos sem redesenhar o conceito. Novos módulos, ao entrarem no catálogo, entram habilitados no Operadores padrão da empresa (mantendo o teto máximo de negócio), salvo decisão futura em contrário.
- “Remover admin” inclui: excluir usuário Admin, tirar do grupo Admin, ou qualquer ação que elimine o último Admin da empresa; não-Admin nunca pode fazê-lo.
- Exclusão de grupos personalizados: usuários vinculados são **reassociados automaticamente ao grupo Operadores** (default do sistema); Admin e Operadores não são excluíveis.
- Grupos padrão Admin e Operadores não podem ser excluídos; Operadores pode ter permissões zeradas de negócio (só negação) se o admin assim configurar.
- **Operadores** é o grupo default do sistema para não-Admins; todo não-Admin nasce/migra vinculado a Operadores.
- Gestão de usuários (convite, criação de conta) fora da atribuição a grupos permanece fora do escopo, salvo o mínimo necessário para vincular grupo.
- Critical paths terão testes automatizados (Constituição I); seed documentado (II); i18n pt-BR (III).
