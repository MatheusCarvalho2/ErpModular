# Feature Specification: Cadastro de Serviços

**Feature Branch**: `003-cadastro-servicos`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "vamos começar pelo cadastro de serviços, vai ter um modulo onde poderá cadastrar o serviço e nele contém alguns dados, Nome do serviço*, Valor cobrado, Tempo gasto, descrição*, Descrição especifica do produto"

<!--
  CONSTITUTION (see `.specify/memory/constitution.md`):
  - Automated tests for critical paths whenever possible
  - Seed fixtures when needed for develop/demo/test (idempotent, documented)
  - All user-facing copy via i18n; active locale pt-BR only for now
  Reflect these in User Scenarios, Requirements, and Assumptions as applicable.
-->

## Clarifications

### Session 2026-07-14

- Q: Quem pode gerenciar serviços? → A: Criar/editar restrito a administradores; listar disponível a qualquer usuário autenticado da empresa
- Q: Remoção ou inativação de serviços nesta versão? → A: Soft-inactivate — marcar inativo; oculto da lista padrão; administrador pode reativar
- Q: Como exprimir “Tempo gasto”? → A: Horas e minutos (ex.: 1h 30min)
- Q: Nome do serviço deve ser único na empresa? → A: Único entre serviços ativos da mesma empresa (inativos podem reutilizar o nome)
- Q: Como comparar nomes duplicados? → A: Sem distinção de maiúsculas/minúsculas e sem distinção de acentos (ex.: “Cafe” = “Café”)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar um novo serviço (Priority: P1)

Um administrador autenticado acessa o módulo de Serviços, abre o formulário de cadastro e registra um serviço informando pelo menos o nome e a descrição. Campos opcionais (valor cobrado, tempo gasto e descrição específica do produto) podem ser preenchidos no mesmo fluxo.

**Why this priority**: Sem a capacidade de criar serviços, o módulo não entrega valor e os demais fluxos (consulta/edição) não têm dados.

**Independent Test**: Autenticar como administrador, abrir o cadastro de serviços, preencher campos obrigatórios (e opcionalmente os demais), salvar e confirmar que o serviço passa a existir na lista da empresa.

**Acceptance Scenarios**:

1. **Given** o administrador está autenticado na área interna do ERP, **When** acessa o módulo de Serviços pela navegação, **Then** vê a área do módulo (lista ou estado vazio) e pode iniciar um novo cadastro.
2. **Given** o administrador está no formulário de novo serviço, **When** preenche Nome do serviço e Descrição e salva, **Then** o serviço é persistido no contexto da empresa do usuário e uma confirmação de sucesso é exibida.
3. **Given** o administrador está no formulário de novo serviço, **When** preenche também Valor cobrado, Tempo gasto (horas e minutos) e Descrição específica do produto além dos obrigatórios e salva, **Then** todos esses dados ficam associados ao serviço criado.
4. **Given** o administrador está no formulário de novo serviço, **When** tenta salvar sem Nome do serviço ou sem Descrição, **Then** o sistema impede o salvamento e indica claramente quais campos obrigatórios estão faltando.
5. **Given** o usuário não está autenticado, **When** tenta acessar o módulo de Serviços, **Then** é direcionado para o login e nenhum dado de serviço é exposto.
6. **Given** o usuário autenticado não é administrador, **When** tenta iniciar um novo cadastro de serviço (pela interface ou tentativa direta), **Then** a ação é negada e nenhum serviço é criado.
7. **Given** já existe um serviço ativo com determinado nome na empresa, **When** o administrador tenta cadastrar outro serviço ativo com o mesmo nome (incluindo variação só de maiúsculas/minúsculas ou de acentos, ex.: “Café” vs “cafe”), **Then** o sistema impede o salvamento e informa que o nome já está em uso.
8. **Given** existe apenas um serviço inativo com determinado nome na empresa, **When** o administrador cadastra um novo serviço ativo com esse mesmo nome, **Then** o cadastro é aceito.

---

### User Story 2 - Consultar serviços cadastrados (Priority: P1)

Após existir pelo menos um serviço, o usuário autenticado consulta a lista de serviços da sua empresa para localizar nome, valor, tempo e demais informações cadastradas.

**Why this priority**: Cadastro sem consulta não fecha o ciclo operacional mínimo do módulo.

**Independent Test**: Com serviços já existentes para a empresa, abrir o módulo e verificar que a listagem exibe os dados cadastrados e o estado vazio quando não há registros.

**Acceptance Scenarios**:

1. **Given** a empresa do usuário possui um ou mais serviços ativos, **When** o usuário abre o módulo de Serviços, **Then** vê uma listagem com pelo menos nome, valor cobrado (quando houver) e tempo gasto (quando houver) de cada serviço ativo.
2. **Given** a empresa do usuário não possui serviços ativos (nenhum cadastrado ou apenas inativos), **When** o usuário abre o módulo de Serviços na visão padrão, **Then** vê um estado vazio claro; se for administrador, há caminho para cadastrar um serviço.
3. **Given** existem serviços de outras empresas no sistema, **When** o usuário consulta a listagem, **Then** vê apenas os serviços ativos da própria empresa.
4. **Given** existe um serviço inativo na empresa, **When** qualquer usuário autenticado consulta a listagem padrão, **Then** esse serviço não aparece na lista padrão.

---

### User Story 3 - Editar um serviço existente (Priority: P2)

Um administrador abre um serviço já cadastrado, altera um ou mais campos (incluindo opcionais) e salva as mudanças.

**Why this priority**: Correção de preço, tempo ou textos é frequente após o primeiro cadastro; sem edição o módulo fica incompleto para o dia a dia.

**Independent Test**: Partindo de um serviço existente, autenticar como administrador, alterar campos, salvar e confirmar que a listagem e o detalhe refletem os novos valores.

**Acceptance Scenarios**:

1. **Given** existe um serviço da empresa do administrador, **When** o administrador abre a edição e altera campos válidos (obrigatórios permanecem preenchidos), **Then** as alterações são persistidas e refletidas na consulta.
2. **Given** o administrador está editando um serviço, **When** remove Nome do serviço ou Descrição e tenta salvar, **Then** o sistema impede o salvamento e indica os campos obrigatórios.
3. **Given** um serviço pertence a outra empresa, **When** o administrador tenta abri-lo para edição (diretamente ou por manipulação de identificador), **Then** o acesso é negado e o serviço não é alterado.
4. **Given** o usuário autenticado não é administrador, **When** tenta editar um serviço da própria empresa, **Then** a edição é negada e o serviço permanece inalterado.
5. **Given** já existe outro serviço ativo com o nome X na empresa, **When** o administrador edita um serviço ativo (ou reativa um inativo) para passar a usar o nome X, **Then** o sistema impede a operação e informa que o nome já está em uso.

---

### User Story 4 - Inativar e reativar serviço (Priority: P2)

Um administrador marca um serviço como inativo para retirá-lo da listagem padrão sem apagar o registro, e pode reativá-lo quando necessário.

**Why this priority**: Catálogos de ERP precisam deixar de oferecer itens sem perder histórico; exclusão física permanente aumenta risco de perda irreparável.

**Independent Test**: Inativar um serviço ativo e confirmar ausência na lista padrão; reativar e confirmar retorno à lista; negação da ação para não-admin.

**Acceptance Scenarios**:

1. **Given** existe um serviço ativo da empresa, **When** o administrador o inativa, **Then** o registro permanece no sistema, deixa de aparecer na listagem padrão e a ação é confirmada ao administrador.
2. **Given** existe um serviço inativo da empresa, **When** o administrador o reativa, **Then** o serviço volta a aparecer na listagem padrão como ativo.
3. **Given** o usuário autenticado não é administrador, **When** tenta inativar ou reativar um serviço, **Then** a ação é negada e o status do serviço não muda.
4. **Given** o administrador precisa localizar um serviço inativo para reativar, **When** usa o meio previsto para ver inativos (filtro ou visão de inativos), **Then** consegue localizar o serviço inativo da própria empresa e reativá-lo.

---

### Edge Cases

- Valor cobrado informado como zero: permitido (serviço sem cobrança ou cortesia); valor negativo: rejeitado com mensagem clara.
- Tempo gasto informado como zero (0h 0min): permitido; horas negativas, minutos negativos ou minutos ≥ 60: rejeitados.
- Nome do serviço duplicado entre dois serviços ativos da mesma empresa (comparação sem distinção de maiúsculas/minúsculas e sem distinção de acentos): rejeitado na criação, edição ou reativação.
- Nome igual ao de um serviço inativo (sem outro ativo com o mesmo nome): permitido.
- Campos de texto muito longos: o sistema impõe limites razoáveis e informa o usuário se o limite for excedido.
- Perda de sessão durante o preenchimento: ao tentar salvar, o usuário é direcionado ao login sem persistir dados incompletos de forma parcial silenciosa.
- Tentativa de salvar apenas com espaços em branco em campos obrigatórios: tratada como campo vazio (inválido).
- Serviço já inativo: nova tentativa de inativar não altera o estado de forma inconsistente (permanece inativo).
- Serviço já ativo: nova tentativa de reativar não altera o estado de forma inconsistente (permanece ativo).
- Exclusão permanente (hard delete) não está disponível nesta versão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar um módulo de Serviços acessível a partir da área autenticada (navegação do shell).
- **FR-002**: O sistema MUST permitir que um administrador da empresa cadastre um serviço com os campos: Nome do serviço (obrigatório), Valor cobrado (opcional), Tempo gasto (opcional), Descrição (obrigatória) e Descrição específica do produto (opcional).
- **FR-003**: O sistema MUST validar campos obrigatórios antes de persistir (criação ou edição) e comunicar falhas de forma compreensível em pt-BR.
- **FR-004**: O sistema MUST rejeitar valor cobrado negativo e MUST rejeitar Tempo gasto inválido (horas negativas, minutos negativos ou minutos fora do intervalo 0–59).
- **FR-005**: O sistema MUST exigir que o Nome do serviço seja único entre os serviços ativos da mesma empresa, comparando nomes sem distinção de maiúsculas/minúsculas e sem distinção de acentos (ex.: “Cafe” e “Café” colidem); nomes de serviços inativos NÃO bloqueiam reutilização do mesmo nome por um serviço ativo.
- **FR-006**: O sistema MUST listar, na visão padrão, apenas os serviços ativos da empresa vinculada a qualquer usuário autenticado dessa empresa, incluindo estado vazio quando não houver serviços ativos.
- **FR-007**: O sistema MUST permitir que um administrador edite os dados de um serviço pertencente à empresa do usuário (ativos ou, quando acessíveis via visão de inativos, também inativos).
- **FR-008**: O sistema MUST restringir consulta e alteração de serviços ao contexto da empresa do usuário; serviços de outras empresas MUST NOT ser visíveis nem editáveis.
- **FR-009**: O sistema MUST restringir criação, edição, inativação e reativação de serviços a usuários com papel de administrador; usuários autenticados não administradores MUST poder listar serviços ativos, mas MUST NOT criar, editar, inativar nem reativar.
- **FR-010**: O sistema MUST permitir que um administrador inactive um serviço (soft-inactivate), ocultando-o da listagem padrão sem apagar o registro, e MUST permitir reativá-lo, respeitando a unicidade de nome entre ativos.
- **FR-011**: O sistema MUST disponibilizar ao administrador um meio de localizar serviços inativos da própria empresa para reativação (filtro ou visão de inativos).
- **FR-012**: Textos de interface do módulo (rótulos, botões, erros, estados vazios, navegação) MUST passar pela camada de i18n, com locale ativo `pt-BR`.
- **FR-013**: Caminhos críticos (criar como admin, rejeitar obrigatoriedade, rejeitar nome duplicado entre ativos, listar ativos para autenticado, editar como admin, inativar/reativar como admin, negar write a não-admin, isolamento por empresa) MUST ter cobertura automatizada sempre que possível; se algum for impraticável, a exceção e o checklist manual MUST constar em plan/tasks.

### Key Entities

- **Serviço**: Oferta cadastrada da empresa, com nome, valor cobrado (quando informado), tempo gasto em horas e minutos (quando informado), descrição geral, descrição específica do produto/serviço entregue, e status ativo/inativo. Novos serviços nascem ativos. Inativação é lógica (registro preservado).
- **Empresa**: Contexto de isolamento dos serviços (reutilizado do presetup de login/shell); cada serviço pertence a uma única empresa.
- **Usuário autenticado**: Operador com sessão válida e vínculo a no máximo uma empresa; pode listar serviços ativos dessa empresa.
- **Administrador**: Usuário autenticado com papel de administrador na empresa; além de listar, pode criar, editar, inativar e reativar serviços da empresa.
## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador consegue cadastrar um serviço válido (obrigatórios preenchidos) em menos de 2 minutos a partir da abertura do módulo.
- **SC-002**: Em 100% das tentativas de salvar sem Nome ou sem Descrição, ou com nome já usado por outro serviço ativo da empresa, o sistema bloqueia a gravação e exibe indicação clara.
- **SC-003**: Após cadastrar, o serviço aparece na listagem da empresa em consulta imediata (sem necessidade de reautenticar), inclusive para usuários autenticados não administradores.
- **SC-004**: Usuários de empresas distintas não visualizam nem alteram os serviços uns dos outros em cenários verificáveis de isolamento.
- **SC-005**: Em 100% das tentativas, usuários autenticados não administradores são impedidos de criar, editar, inativar ou reativar serviços.
- **SC-006**: Após inativar, o serviço deixa de aparecer na listagem padrão em consulta imediata; após reativar, volta a aparecer na listagem padrão.
- **SC-007**: Pelo menos 90% dos administradores de teste completam criar → localizar na lista → editar um campo opcional sem assistência externa.

## Assumptions

- Valor cobrado e Tempo gasto são opcionais porque não foram marcados como obrigatórios na descrição; Nome do serviço e Descrição são obrigatórios (marcados com *).
- “Descrição” é o texto geral obrigatório do serviço; “Descrição específica do produto” é um texto complementar opcional (detalhamento voltado ao produto/entrega), distinto da descrição geral.
- Valor cobrado é um montante em moeda do negócio (real brasileiro como referência de apresentação); formato de exibição segue convenção local pt-BR.
- Tempo gasto é uma duração em horas e minutos (exibição tipicamente “Xh Ymin” em pt-BR); quando informado, minutos MUST estar entre 0 e 59 e o total MUST ser não negativo.
- O módulo cobre criar, listar, editar, inativar e reativar nesta versão; exclusão permanente (hard delete) fica fora de escopo.
- Categorias, pacotes, composição de serviços, vínculo com pedidos/OS e regras fiscais ficam fora de escopo.
- Reutiliza autenticação, shell e vínculo usuário→empresa já existentes no presetup (`001-erp-login-shell`); não há cadastro público de serviços.
- Existe (ou será introduzido nesta feature) um papel de administrador distinguível de usuário autenticado comum, usado para autorizar create/edit/inativar/reativar de serviços.
- Seed pode incluir um ou mais serviços de demonstração na Empresa Demo e pelo menos um usuário administrador e um não administrador para testar permissões, de forma idempotente e documentada em pt-BR (Constitution II).
- Critical paths will have automated tests unless an exception is documented (Constitution I).
- User-facing copy uses i18n with pt-BR as the only required locale for now (Constitution III).
- Unicidade de nome: obrigatória apenas entre serviços ativos da mesma empresa; comparação ignora maiúsculas/minúsculas e acentos; serviços inativos não competem por unicidade com um novo/reativado ativo.
