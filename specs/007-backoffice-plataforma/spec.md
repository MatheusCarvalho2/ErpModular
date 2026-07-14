# Feature Specification: Backoffice da Plataforma

**Feature Branch**: `007-backoffice-plataforma`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "crie uma branch para algumas tasks que subirão na mesma — preciso criar um backoffice pois atualmente não tem como eu liberar acesso para usuário, não tem como inativar contas entre outros queria que tivesse também um dashboard para ter um resumo de quantos clientes eu tenho (ou seja quantas empresas usam meu sistema etc...)"

<!--
  CONSTITUTION (see `.specify/memory/constitution.md`):
  - Automated tests for critical paths whenever possible
  - Seed fixtures when needed for develop/demo/test (idempotent, documented)
  - All user-facing copy via i18n; active locale pt-BR only for now
  Reflect these in User Scenarios, Requirements, and Assumptions as applicable.
-->

## Clarifications

### Session 2026-07-14

- Q: Quando o operador cria um usuário cliente no backoffice, a qual grupo de permissão da empresa ele deve ser vinculado? → A: Sempre no grupo Admin da empresa
- Q: No dashboard, os operadores da plataforma entram nas contagens de usuários? → A: Totais de clientes/usuários excluem operadores da plataforma; além disso, mostrar quantos usuários cada empresa cliente possui
- Q: O operador pode redefinir a senha de um usuário cliente já existente pelo backoffice? → A: Sim, com senha temporária que obriga troca no próximo login
- Q: Além de criar e inativar/reativar, o operador pode editar dados de empresa e usuário? → A: Sim — o dono/super admin da plataforma pode alterar todos os dados operacionais de empresas e usuários (incluindo e-mail); o backoffice é exclusivo para controle da plataforma (quais empresas usam/assinam o sistema)
- Q: Como posicionar o backoffice em relação ao ERP? → A: Ferramenta externa para o dono controlar quem são os usuários/clientes do ErpModular (não faz parte do uso operacional diário das empresas)
- Q: Como o super admin entra nessa ferramenta externa? → A: Entrada/URL dedicada só do backoffice (login separado da área das empresas)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acessar o backoffice da plataforma (Priority: P1)

O **super admin da plataforma** (dono do ErpModular) entra por uma **URL/entrada dedicada** da ferramenta externa de backoffice (login separado da área das empresas), para controlar quem são os usuários e quais empresas usam o sistema.

**Why this priority**: Sem um espaço protegido e distinto do shell das empresas, não há onde operar liberação de acesso nem ver o resumo de clientes.

**Independent Test**: Acessar a entrada dedicada do backoffice como super admin e confirmar login nessa superfície; tentar a mesma entrada com usuário de empresa (deve falhar) e confirmar que o login do ERP das empresas não abre o backoffice.

**Acceptance Scenarios**:

1. **Given** o super admin acessa a **entrada/URL dedicada** do backoffice, **When** informa credenciais válidas de plataforma, **Then** entra na ferramenta externa (não no shell operacional de uma empresa cliente).
2. **Given** um usuário vinculado apenas a uma empresa cliente (Admin ou Operadores), **When** tenta autenticar-se na entrada dedicada do backoffice ou acessar suas telas, **Then** o acesso é negado e ele não vê dados cross-empresa.
3. **Given** um visitante não autenticado, **When** tenta acessar telas internas do backoffice, **Then** é direcionado ao login **dedicado** do backoffice (não ao login do ERP das empresas).
4. **Given** um usuário cliente autentica-se no login do ERP das empresas, **When** a sessão é estabelecida, **Then** ele entra apenas no ERP da sua empresa e **MUST NOT** ser redirecionado ao backoffice.

---

### User Story 2 - Liberar acesso criando empresa e usuário (Priority: P1)

O operador (dono / **super admin da plataforma**) cria um novo cliente (empresa) e libera usuários vinculados, com credenciais iniciais; pode editar quaisquer dados operacionais de empresas e usuários; também pode redefinir senha via senha temporária com troca obrigatória. O backoffice existe para controle exclusivo do dono da plataforma sobre quais empresas usam/assinam o sistema.

**Why this priority**: É o bloqueio principal descrito: hoje não há como liberar acesso a novos usuários/empresas pelo produto.

**Independent Test**: Como operador, criar uma empresa e um usuário ativo vinculado a ela; em seguida, autenticar com esse usuário e confirmar entrada no ERP no contexto daquela empresa.

**Acceptance Scenarios**:

1. **Given** o operador está no backoffice, **When** cadastra uma nova empresa com dados mínimos válidos (ex.: nome), **Then** a empresa fica disponível como cliente da plataforma e aparece na listagem/gestão.
2. **Given** uma empresa existe, **When** o operador cria um usuário com e-mail único, nome e senha inicial, vinculando-o a essa empresa, **Then** o usuário fica apto a autenticar-se no ERP no contexto dessa empresa e **MUST** ser vinculado ao grupo de permissão **Admin** dessa empresa.
3. **Given** o operador tenta criar um usuário com e-mail já existente, **When** confirma, **Then** o sistema impede a criação e informa o conflito de forma clara.
4. **Given** o operador criou um usuário via backoffice, **When** o usuário entra no ERP, **Then** consegue operar a gestão interna da empresa (ex.: grupos de permissão) como Admin, sem precisar do backoffice da plataforma.
5. **Given** o operador lista usuários no backoffice, **When** filtra ou busca por empresa/e-mail, **Then** encontra o usuário criado e vê a empresa vinculada e o status (ativo/inativo).
6. **Given** um usuário cliente existente (ativo), **When** o operador redefine a senha no backoffice, **Then** o sistema define uma **senha temporária** e marca a conta para **troca obrigatória no próximo login**.
7. **Given** um usuário com senha temporária pendente de troca, **When** autentica com a senha temporária, **Then** é obrigado a definir uma nova senha antes de usar o ERP; após a troca, acessa normalmente.
8. **Given** uma empresa ou usuário existente, **When** o super admin da plataforma edita os dados cadastrais (ex.: nome da empresa, nome e e-mail do usuário) com valores válidos, **Then** as alterações são persistidas e passam a valer no ERP/backoffice.
9. **Given** o super admin tenta alterar o e-mail de um usuário para um e-mail já usado por outra conta, **When** confirma, **Then** o sistema impede e informa o conflito.

---

### User Story 3 - Inativar e reativar contas (Priority: P1)

O operador inativa usuários e/ou empresas clientes que não devem mais acessar o sistema, e pode reativá-los depois.

**Why this priority**: Em segundo lugar no pedido explícito do usuário (“não tem como inativar contas”); essencial para controle operacional e segurança.

**Independent Test**: Inativar um usuário ativo e confirmar que o login passa a ser negado; reativar e confirmar que o login volta a funcionar. Repetir o conceito para empresa (usuários da empresa deixa de entrar enquanto a empresa estiver inativa).

**Acceptance Scenarios**:

1. **Given** um usuário ativo da plataforma (cliente), **When** o operador o inativa no backoffice, **Then** novas autenticações desse usuário são rejeitadas com feedback compreensível, e sessões futuras não podem usar a área interna do ERP.
2. **Given** um usuário inativo, **When** o operador o reativa, **Then** o usuário volta a poder autenticar-se (desde que a empresa vinculada também esteja ativa).
3. **Given** uma empresa cliente ativa, **When** o operador a inativa, **Then** usuários vinculados a essa empresa não conseguem entrar no ERP enquanto a empresa permanecer inativa.
4. **Given** uma empresa inativa, **When** o operador a reativa, **Then** usuários ativos vinculados voltam a poder autenticar-se no ERP.
5. **Given** o operador inativa a própria conta de operador de plataforma (ou a última conta operadora ativa), **When** tenta concluir a ação, **Then** o sistema impede deixar a plataforma sem pelo menos um operador ativo (salvaguarda).

---

### User Story 4 - Dashboard resumo de clientes (Priority: P2)

O operador abre um dashboard no backoffice e vê um resumo quantitativo de quantos clientes (empresas) usam o sistema, totais de usuários clientes (sem operadores da plataforma) e quantos usuários cada empresa possui.

**Why this priority**: Pedido explícito de visão agregada; depende de já existir gestão de empresas/usuários para os números fazerem sentido.

**Independent Test**: Com N empresas e M usuários no seed/fixtures, abrir o dashboard e conferir que os totais batem com a realidade (ativos/inativos conforme definido).

**Acceptance Scenarios**:

1. **Given** o operador autenticado no backoffice, **When** abre o dashboard, **Then** vê pelo menos: total de empresas clientes, quantidade de empresas ativas e quantidade de empresas inativas.
2. **Given** o mesmo dashboard, **When** o operador visualiza o resumo de contas, **Then** vê totais de **usuários clientes** (geral, ativos e inativos) **excluindo** operadores da plataforma.
3. **Given** o mesmo dashboard, **When** o operador consulta o detalhe por cliente, **Then** vê, para cada empresa cliente, a quantidade de usuários vinculados a ela (usuários daquela empresa).
4. **Given** o operador cria uma nova empresa ativa, **When** volta ao dashboard, **Then** o total de empresas e o de ativas aumentam em 1.
5. **Given** o operador inativa uma empresa, **When** atualiza/revisita o dashboard, **Then** o contador de ativas diminui e o de inativas aumenta de forma coerente.
6. **Given** não há empresas cadastradas (além do permitido pelo ambiente), **When** o operador abre o dashboard, **Then** vê zeros ou empty state claro, sem erro.

---

### Edge Cases

- Tentativa de vincular o mesmo usuário a duas empresas: nesta versão o modelo permanece “um usuário → no máximo uma empresa”; o backoffice não permite segundo vínculo.
- E-mail malformado ou campos obrigatórios vazios na criação de empresa/usuário: validação impede persistência com feedback claro.
- Operador tenta inativar empresa/usuário já inativo (ou reativar já ativo): sistema trata de forma idempotente ou informa que não há mudança necessária, sem corromper dados.
- Busca/listagem vazia: empty state compreensível.
- Conflito de nome de empresa: nomes de empresa únicos entre clientes ativos; duplicata é impedida com feedback claro.
- Sessão de usuário inativado enquanto ainda “aberta”: ao renovar/navegar, o acesso ao ERP é bloqueado.
- Operador sem permissão de plataforma após mudança de papel: perde acesso ao backoffice nas próximas ações protegidas.
- Redefinição de senha de usuário inativo: só após reativação (ou rejeitada com feedback até reativar).
- Usuário cliente tenta a URL dedicada do backoffice com credenciais de empresa: autenticação/autorização falha sem vazamento de métricas ou listagens.
- Super admin tenta usar apenas o login do ERP das empresas para administrar a plataforma: não obtém o console de backoffice por esse caminho (deve usar a entrada dedicada).
- Usuário tenta usar o ERP sem concluir a troca da senha temporária: permanece bloqueado no fluxo de troca até definir nova senha válida.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar uma **ferramenta externa** de backoffice com **entrada/URL e login dedicados** (separados do login do ERP das empresas), acessível somente ao super admin / operadores da plataforma, para controlar usuários e empresas clientes do ErpModular.
- **FR-002**: Usuários de empresas clientes (incluindo administradores da empresa) MUST NOT acessar o backoffice da plataforma nem dados agregados cross-empresa.
- **FR-003**: O operador MUST poder cadastrar empresas clientes com dados mínimos (pelo menos nome), listá-las e **editar** seus dados cadastrais no backoffice.
- **FR-004**: O operador MUST poder criar usuários com e-mail único, dados básicos e senha inicial, vinculando cada usuário a exatamente uma empresa cliente e ao grupo de permissão **Admin** dessa empresa (sempre; sem escolha de outro grupo no backoffice nesta versão).
- **FR-005**: O operador MUST poder listar e localizar usuários e empresas no backoffice (busca ou filtro por atributos relevantes, ex.: nome, e-mail, status).
- **FR-006**: O operador MUST poder inativar e reativar usuários; usuário inativo MUST NOT autenticar-se com sucesso no ERP.
- **FR-007**: O operador MUST poder inativar e reativar empresas; com empresa inativa, usuários vinculados MUST NOT entrar no ERP.
- **FR-008**: O sistema MUST impedir que a plataforma fique sem pelo menos um operador ativo.
- **FR-009**: O backoffice MUST exibir um dashboard com resumo mensurável de clientes: totais de empresas (geral, ativas, inativas); totais de usuários **clientes** (geral, ativos, inativos) **excluindo** operadores da plataforma; e, por empresa cliente, a quantidade de usuários vinculados a ela.
- **FR-010**: Alterações de cadastro/status feitas no backoffice MUST refletir nos totais e nas contagens por empresa do dashboard após a operação (na mesma sessão de uso, sem procedimento manual externo).
- **FR-011**: O backoffice MUST permanecer utilizável em desktop como prioridade; em telas menores, as ações críticas (criar, inativar, ver totais) não podem ficar inacessíveis.
- **FR-012**: Todo texto de interface do backoffice voltado ao usuário MUST passar pela camada i18n do projeto, com locale obrigatório `pt-BR`.
- **FR-013**: Caminhos críticos (acesso restrito, criar/editar empresa/usuário, inativar/reativar, redefinição de senha com troca obrigatória, totais do dashboard) MUST ter cobertura automatizada, ou exceção documentada conforme a constituição.
- **FR-014**: O seed MUST incluir pelo menos um operador de plataforma e fixtures suficientes (empresas/usuários ativos e inativos) para demonstrar e testar o backoffice, com credenciais documentadas em pt-BR; reexecutar o seed MUST NOT duplicar esses fixtures.
- **FR-015**: O operador MUST poder redefinir a senha de um usuário cliente ativo; a redefinição MUST gerar **senha temporária** e MUST exigir que o usuário defina uma nova senha no próximo login antes de usar o ERP.
- **FR-016**: O operador (super admin da plataforma) MUST poder **editar** dados operacionais de usuários clientes no backoffice (incluindo nome e e-mail), sujeito a validação e unicidade de e-mail.

### Key Entities

- **Operador da plataforma (super admin)**: Dono/equipe do produto autorizada a usar o backoffice com controle total operacional sobre empresas clientes e usuários (criar, editar, inativar, reset de senha); não é o Admin interno de uma empresa cliente.
- **Empresa cliente**: Organização que usa o ErpModular; possui status ativo/inativo; é a unidade contada no resumo de “clientes”.
- **Usuário cliente**: Pessoa vinculada a no máximo uma empresa; possui status ativo/inativo; autentica-se no ERP da empresa quando usuário e empresa estão ativos; usuários criados pelo backoffice nascem no grupo **Admin** da empresa; pode ter flag de troca obrigatória de senha após redefinição temporária.
- **Resumo do dashboard**: Conjunto de indicadores agregados (contagens) de empresas e usuários clientes (sem operadores da plataforma), incluindo contagem de usuários por empresa cliente — visão do dono sobre a base do ErpModular.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um operador consegue cadastrar uma nova empresa e o primeiro usuário e validar o login desse usuário no ERP em menos de 5 minutos, em condições normais.
- **SC-002**: Em 100% das tentativas, usuários de empresa cliente não acessam o backoffice nem veem totais cross-empresa.
- **SC-003**: Em 100% dos casos de usuário inativado (com empresa ativa), novas tentativas de login no ERP falham com feedback compreensível.
- **SC-004**: Em 100% dos casos de empresa inativada, usuários vinculados não entram no ERP enquanto a inativação permanecer.
- **SC-005**: Em ambiente com fixtures conhecidas, 100% dos indicadores do dashboard (empresas; usuários clientes ativos/inativos excluindo operadores da plataforma; usuários por empresa) coincidem com as contagens reais dos cadastros.
- **SC-006**: Operadores localizam a ação de inativar/reativar usuário ou empresa e concluem a operação em menos de 1 minuto após encontrar o registro.
- **SC-007**: Após criar ou inativar uma empresa, o operador vê o dashboard atualizado de forma coerente na mesma sessão de uso, sem intervenção técnica.
- **SC-008**: Em 100% das redefinições de senha pelo backoffice, o usuário autenticado com a senha temporária é obrigado a trocar a senha antes de usar o ERP.
- **SC-009**: Em 100% dos acessos bem-sucedidos ao backoffice, a autenticação ocorre pela entrada dedicada; o login do ERP das empresas não concede acesso ao backoffice.

## Assumptions

- O backoffice é uma **ferramenta externa** (console do dono/super admin) para controlar quem são os usuários e quais empresas usam o ErpModular; não é módulo interno do ERP da empresa.
- Entrada ao backoffice é por **URL/login dedicados**, distintos do login usado pelas empresas no ERP.
- Convite self-service pela empresa (Admin da empresa convidar colegas) fica **fora do escopo** desta feature; a liberação inicial de acesso é feita pelo operador no backoffice.
- Envio de e-mail transacional (convite, reset por e-mail) fica fora do escopo; cadastro define senha inicial; redefinição no backoffice usa senha temporária com troca obrigatória no próximo login (sem e-mail).
- Mantém-se a regra vigente: um usuário cliente vincula-se a no máximo uma empresa.
- Nome de empresa cliente é único entre clientes (pelo menos entre ativos), para evitar confusão operacional no backoffice.
- Métricas do dashboard na v1: contagens de empresas e de usuários clientes (exclui operadores da plataforma), mais usuários por empresa cliente; não inclui faturamento, uso por módulo, gráficos temporais avançados nem exportação.
- Nesta versão, “controlar quais empresas assinaram” = cadastrar e ativar/inativar empresas clientes (sem cobrança, planos, gateways ou ciclo de fatura).
- Super admin pode criar, editar e alterar status de empresas e usuários no backoffice; impersonation e auditoria avançada ficam fora do escopo.
- Papel de operador da plataforma (super admin) é distinto do grupo Admin da empresa; um mesmo login não precisa operar os dois papéis nesta versão (seed separa operador de usuários demo de empresa).
- Todo usuário cliente criado pelo backoffice é vinculado ao grupo Admin da empresa; reatribuição para Operadores ou grupos personalizados fica a cargo da gestão interna da empresa (fora do backoffice nesta feature).
- Critical paths will have automated tests unless an exception is documented (Constitution I)
- If fixtures are required, seed will be extended/documented (Constitution II)
- User-facing copy uses i18n with pt-BR as the only required locale for now (Constitution III)
