# Feature Specification: Cadastro de Produtos e Vínculo com Cliente

**Feature Branch**: `005-cadastro-produtos`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "certo, agora teremos os produtos, por exemplo, supondo que o serviço seja \"reparo de airfrayer\" neste caso deve ser possível cadastrar a airfrayer no sistema, e entao eu vou cadastrar o cliente e neel consigo vincular a airfrayer cadastrada e colocar um identificador — vou dar um exemplo de caso de uso, chegou 3 pessoas para cadastrar airfrayer, eu cadastro os 3 clientes, em cada um eu vinculo airfrayer ai ao vincular vai aparecer identificador, ai vou colocar um número no qual consigo identificar qual airfrayer é de cada cliente"

<!--
  CONSTITUTION (see `.specify/memory/constitution.md`):
  - Automated tests for critical paths whenever possible
  - Seed fixtures when needed for develop/demo/test (idempotent, documented)
  - All user-facing copy via i18n; active locale pt-BR only for now
  Reflect these in User Scenarios, Requirements, and Assumptions as applicable.
-->

## Clarifications

### Session 2026-07-14

- Q: O que acontece com vínculos ativos ao inativar um cliente? → A: Inativar cliente mantém vínculos ativos no histórico; cliente some da lista padrão; busca por identificador ainda encontra
- Q: Como comparar identificadores para unicidade? → A: Normalizar como nome de produto (ignora maiúsculas/minúsculas e acentos); "A1" = "a1"
- Q: Dados extras no vínculo além de produto + identificador? → A: Incluir observação e número de série do fabricante, ambos opcionais
- Q: Unicidade do nome do cliente e campos obrigatórios? → A: Nomes podem repetir; Telefone é campo obrigatório no cliente
- Q: Unicidade do telefone? → A: Único entre clientes ativos; se tentar cadastrar com telefone já existente, deve ser possível vincular as 2 pessoas (ambos os clientes passam a coexistir com o mesmo telefone associados entre si)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar produto no catálogo (Priority: P1)

Um usuário autorizado cadastra um produto no catálogo da empresa (ex.: “Air fryer”) para que esse tipo de equipamento possa ser vinculado a clientes depois.

**Why this priority**: Sem o catálogo de produtos, não há o que vincular aos clientes; é a base do módulo.

**Independent Test**: Autenticar com permissão de criar produtos, abrir o módulo de Produtos, cadastrar um produto com nome válido e confirmar que aparece na listagem da empresa.

**Acceptance Scenarios**:

1. **Given** o usuário autenticado tem permissão de criar produtos, **When** acessa o módulo de Produtos pela navegação, **Then** vê a área do módulo (lista ou estado vazio) e pode iniciar um novo cadastro.
2. **Given** o usuário está no formulário de novo produto, **When** informa o Nome do produto (obrigatório) e salva, **Then** o produto é persistido no contexto da empresa e uma confirmação de sucesso é exibida.
3. **Given** o usuário está no formulário de novo produto, **When** tenta salvar sem Nome (ou só com espaços), **Then** o sistema impede o salvamento e indica o campo obrigatório.
4. **Given** já existe um produto ativo com determinado nome na empresa, **When** alguém tenta cadastrar outro produto ativo com o mesmo nome (incluindo variação só de maiúsculas/minúsculas ou de acentos), **Then** o sistema impede o salvamento e informa que o nome já está em uso.
5. **Given** o usuário autenticado não tem permissão de criar produtos, **When** tenta cadastrar um produto, **Then** a ação é negada e nenhum produto é criado.
6. **Given** o usuário não está autenticado, **When** tenta acessar o módulo de Produtos, **Then** é direcionado para o login e nenhum dado de produto é exposto.

---

### User Story 2 - Consultar produtos do catálogo (Priority: P1)

Após existir pelo menos um produto, o usuário autenticado com permissão de listar consulta os produtos ativos da sua empresa para usá-los no vínculo com clientes.

**Why this priority**: Cadastro sem consulta não fecha o ciclo mínimo nem alimenta o fluxo de vínculo.

**Independent Test**: Com produtos já existentes, abrir o módulo e verificar listagem dos ativos da empresa e estado vazio quando não houver ativos.

**Acceptance Scenarios**:

1. **Given** a empresa possui um ou mais produtos ativos, **When** o usuário com permissão de listar abre o módulo de Produtos, **Then** vê a listagem com pelo menos o nome de cada produto ativo.
2. **Given** a empresa não possui produtos ativos, **When** o usuário abre a visão padrão, **Then** vê um estado vazio claro; se tiver permissão de criar, há caminho para cadastrar.
3. **Given** existem produtos de outras empresas, **When** o usuário consulta a listagem, **Then** vê apenas os produtos ativos da própria empresa.
4. **Given** existe um produto inativo na empresa, **When** o usuário consulta a listagem padrão, **Then** esse produto não aparece na lista padrão.

---

### User Story 3 - Cadastrar cliente (Priority: P1)

Um usuário autorizado cadastra o cliente (ex.: as três pessoas que chegaram com air fryer) para poder vincular equipamentos em seguida.

**Why this priority**: O caso de uso principal começa pelo cadastro do cliente; sem cliente não há vínculo com identificador.

**Independent Test**: Com permissão de criar clientes, cadastrar um cliente com nome e telefone válidos e confirmar que ele existe na empresa e pode ser aberto para vínculo.

**Acceptance Scenarios**:

1. **Given** o usuário tem permissão de criar clientes, **When** acessa o módulo de Clientes e inicia um novo cadastro informando Nome do cliente e Telefone, **Then** o cliente é persistido na empresa e uma confirmação de sucesso é exibida.
2. **Given** o usuário está no formulário de novo cliente, **When** tenta salvar sem Nome ou sem Telefone (ou só com espaços nesses campos), **Then** o sistema impede o salvamento e indica o(s) campo(s) obrigatório(s).
3. **Given** já existe um cliente com determinado nome na empresa, **When** o usuário cadastra outro cliente com o mesmo nome e um telefone ainda livre entre ativos, **Then** o cadastro é aceito (nomes duplicados são permitidos).
4. **Given** já existe um cliente ativo com determinado telefone, **When** o usuário tenta cadastrar outro cliente com o mesmo telefone sem confirmar vínculo entre pessoas, **Then** o sistema impede o salvamento simples, informa o conflito e apresenta o cliente já existente.
5. **Given** já existe um cliente ativo com determinado telefone, **When** o usuário confirma vincular a nova pessoa ao cliente existente, **Then** o novo cliente é criado com o mesmo telefone, as duas pessoas ficam associadas entre si, e cada uma pode receber vínculos de produto independentemente.
6. **Given** existem clientes de outras empresas, **When** o usuário lista clientes, **Then** vê apenas os da própria empresa.
7. **Given** o usuário não tem permissão de criar clientes, **When** tenta cadastrar, **Then** a ação é negada.

---

### User Story 4 - Vincular produto ao cliente com identificador (Priority: P1)

No cadastro/detalhe do cliente, o operador vincula um produto já cadastrado no catálogo (ex.: Air fryer) e informa um identificador (número ou código) que distingue aquele equipamento daquele cliente dos demais da empresa — por exemplo, três clientes com air fryer, cada um com identificador distinto (1, 2 e 3). Opcionalmente, pode informar número de série do fabricante e uma observação.

**Why this priority**: Este é o valor de negócio descrito no caso de uso; catálogo e cliente existem para viabilizar este vínculo.

**Independent Test**: Com produto “Air fryer” e três clientes cadastrados, vincular o mesmo produto a cada cliente com identificadores distintos e confirmar que cada vínculo fica associado ao cliente correto e pesquisável pelo identificador.

**Acceptance Scenarios**:

1. **Given** existem o produto “Air fryer” ativo e um cliente da empresa, **When** o usuário autorizado abre o cliente e vincula o produto informando um identificador válido, **Then** o vínculo é salvo e passa a aparecer no cliente com o produto e o identificador.
2. **Given** o usuário está vinculando um produto com identificador válido, **When** também informa número de série e/ou observação e salva, **Then** esses dados opcionais ficam associados ao vínculo e são exibidos no detalhe do cliente.
3. **Given** três clientes da empresa e o produto “Air fryer” ativo, **When** o usuário vincula “Air fryer” a cada um com identificadores “1”, “2” e “3”, **Then** cada cliente exibe apenas o próprio vínculo e os três identificadores coexistem na empresa sem conflito entre si.
4. **Given** já existe um vínculo ativo na empresa com o identificador “1”, **When** o usuário tenta criar outro vínculo (mesmo ou outro cliente, mesmo ou outro produto) com o identificador “1”, **Then** o sistema impede o salvamento e informa que o identificador já está em uso na empresa.
5. **Given** já existe um vínculo ativo com identificador “Cafe-1”, **When** o usuário tenta vincular com “cafe-1” ou “Café-1”, **Then** o sistema trata como o mesmo identificador, impede o salvamento e informa o conflito.
6. **Given** o usuário está vinculando um produto, **When** não escolhe um produto do catálogo ou não informa o identificador, **Then** o sistema impede o salvamento e indica o que falta.
7. **Given** o usuário tenta vincular um produto inativo ou de outra empresa, **When** salva, **Then** a operação é rejeitada (produto inativo não está disponível na seleção padrão; produto de outra empresa não é acessível).
8. **Given** um cliente já possui um ou mais produtos vinculados, **When** o usuário adiciona outro vínculo com outro identificador, **Then** o cliente passa a exibir todos os vínculos ativos.
9. **Given** o usuário autorizado precisa achar de quem é a air fryer com identificador “2”, **When** busca pelo identificador na empresa, **Then** localiza o cliente e o produto vinculados a esse identificador.

---

### User Story 5 - Editar produto, cliente e vínculo; inativar quando necessário (Priority: P2)

Usuários autorizados corrigem dados do catálogo, do cliente ou do identificador de um vínculo, e podem inativar (soft) produto, cliente ou vínculo sem apagar histórico operacional.

**Why this priority**: Erros de digitação e equipamentos que saem de circulação são comuns; exclusão permanente aumenta risco.

**Independent Test**: Editar nome de produto, nome de cliente e identificador de um vínculo; inativar um vínculo e confirmar que deixa de aparecer na visão padrão do cliente, podendo ser reativado.

**Acceptance Scenarios**:

1. **Given** um produto ativo da empresa, **When** o usuário autorizado edita o nome com valor válido e único entre ativos, **Then** a alteração é persistida e refletida na consulta e nas seleções de vínculo.
2. **Given** um cliente da empresa, **When** o usuário autorizado edita o nome e/ou o telefone (obrigatórios permanecem preenchidos; telefone novo livre entre ativos ou fluxo de vínculo entre pessoas se colidir) e salva, **Then** a alteração é refletida na listagem e no detalhe.
3. **Given** um vínculo ativo, **When** o usuário autorizado altera o identificador para um valor ainda livre na empresa e/ou edita número de série ou observação, **Then** as alterações são persistidas; se o identificador mudar, o antigo fica livre (respeitando unicidade normalizada entre ativos).
4. **Given** um vínculo ativo, **When** o usuário autorizado o inativa, **Then** o registro permanece, deixa de aparecer na visão padrão do cliente e o identificador deixa de bloquear novos vínculos (pode ser reutilizado).
5. **Given** um produto ativo com vínculos existentes, **When** o usuário autorizado inativa o produto, **Then** o produto some da listagem/seleção padrão; vínculos já existentes permanecem consultáveis no histórico do cliente, mas novos vínculos com esse produto não são oferecidos na seleção padrão.
6. **Given** o usuário sem permissão de escrita no recurso correspondente, **When** tenta editar ou inativar, **Then** a ação é negada.
7. **Given** um cliente ativo com um ou mais vínculos ativos, **When** o usuário autorizado inativa o cliente, **Then** o cliente deixa de aparecer na listagem padrão, os vínculos permanecem ativos e consultáveis no histórico daquele cliente, e a busca por identificador ainda localiza o vínculo e o cliente associado.

---

### Edge Cases

- Nome de produto duplicado entre dois produtos ativos da mesma empresa (ignora maiúsculas/minúsculas e acentos): rejeitado.
- Nome igual ao de um produto inativo (sem outro ativo com o mesmo nome): permitido.
- Identificador de vínculo duplicado entre vínculos ativos da mesma empresa (comparação sem distinção de maiúsculas/minúsculas e sem distinção de acentos, após trim): rejeitado; após inativar o vínculo, o identificador pode ser reutilizado.
- Identificador só com espaços: tratado como vazio (inválido).
- Identificadores que diferem só por zeros à esquerda (ex.: “1” vs “01”) são distintos; a normalização não remove zeros à esquerda.
- Número de série e observação vazios ou omitidos: permitidos; só espaços em observação/série: tratados como ausentes (sem valor).
- Número de série do fabricante NÃO precisa ser único na empresa nesta versão (o identificador operacional é a chave de unicidade).
- Mesmo produto do catálogo vinculado a vários clientes: permitido (três air fryers do mesmo tipo).
- Cliente sem vínculos: permitido; visão do cliente mostra estado vazio de equipamentos/produtos vinculados.
- Produto do catálogo sem nenhum vínculo: permitido.
- Campos de texto muito longos: o sistema impõe limites razoáveis e informa se o limite for excedido.
- Perda de sessão ao salvar: usuário é direcionado ao login sem persistir dados incompletos de forma parcial silenciosa.
- Exclusão permanente (hard delete) de produto, cliente ou vínculo não está disponível nesta versão.
- Isolamento multiempresa: produtos, clientes e vínculos de uma empresa nunca aparecem para outra.
- Inativar cliente com vínculos ativos: permitido; vínculos NÃO são inativados em cascata; identificadores desses vínculos continuam ocupados enquanto o vínculo estiver ativo; busca por identificador continua encontrando o cliente inativo e o vínculo.
- Nomes de cliente iguais na mesma empresa: permitidos.
- Cadastro/edição de cliente sem telefone ou com telefone só espaços: rejeitado.
- Telefone igual ao de outro cliente ativo, sem confirmação de vínculo entre pessoas: rejeitado com indicação do cliente existente.
- Telefone igual ao de outro cliente ativo, com confirmação de vínculo entre pessoas: permitido; os dois clientes ativos compartilham o telefone e ficam associados.
- Telefone igual apenas ao de cliente inativo (e não compartilhado por outro ativo): permitido sem vínculo entre pessoas.
- Clientes associados pelo telefone: cada um mantém seus próprios vínculos cliente–produto e identificadores.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar um módulo de Produtos (catálogo) acessível a partir da área autenticada (navegação do shell), no contexto da empresa do usuário.
- **FR-002**: O sistema MUST permitir cadastrar um produto do catálogo com Nome do produto (obrigatório) e Descrição (opcional).
- **FR-003**: O sistema MUST exigir que o Nome do produto seja único entre os produtos ativos da mesma empresa, comparando sem distinção de maiúsculas/minúsculas e sem distinção de acentos; nomes de produtos inativos NÃO bloqueiam reutilização por um produto ativo.
- **FR-004**: O sistema MUST listar, na visão padrão, apenas os produtos ativos da empresa do usuário; MUST disponibilizar meio de localizar produtos inativos para reativação a quem tiver permissão.
- **FR-005**: O sistema MUST permitir editar e inativar/reativar produtos do catálogo (soft-inactivate), sem hard delete nesta versão.
- **FR-006**: O sistema MUST disponibilizar um módulo de Clientes acessível na área autenticada, no contexto da empresa do usuário.
- **FR-007**: O sistema MUST permitir cadastrar um cliente com Nome do cliente (obrigatório) e Telefone (obrigatório); e-mail e demais dados de contato MAY permanecer opcionais nesta versão. Nomes de cliente MAY repetir na mesma empresa.
- **FR-007a**: O Telefone MUST ser único entre clientes **ativos** da mesma empresa por padrão. Comparação de telefone MUST normalizar formatação comum (ex.: considerar equivalência após reduzir a dígitos) para evitar falsos “livres” por máscara.
- **FR-007b**: Se o operador tentar criar (ou alterar telefone para) um cliente ativo cujo telefone já pertence a outro cliente ativo, o sistema MUST impedir o salvamento silencioso/duplicado e MUST oferecer fluxo explícito para **vincular as duas pessoas**: ao confirmar, o novo (ou editado) cliente é persistido com o mesmo telefone, ambos permanecem clientes distintos associados entre si, e cada um MUST poder receber vínculos cliente–produto de forma independente. Sem essa confirmação, a operação MUST ser recusada.
- **FR-008**: O sistema MUST listar e isolar clientes por empresa; MUST permitir editar e inativar/reativar clientes (soft), sem hard delete nesta versão. Inativar um cliente MUST NOT inativar automaticamente seus vínculos: vínculos ativos permanecem no histórico do cliente; o cliente some da listagem padrão; a busca por identificador MUST continuar localizando vínculos de clientes inativos.
- **FR-009**: No contexto do cliente, o sistema MUST permitir vincular um produto ativo do catálogo da mesma empresa, exigindo um Identificador obrigatório informado pelo operador, e MUST permitir informar opcionalmente Número de série do fabricante e Observação no mesmo vínculo.
- **FR-010**: O Identificador MUST ser único entre os vínculos ativos da mesma empresa (independente do cliente ou do produto), de forma que o operador consiga distinguir qual equipamento é de qual cliente (ex.: “1”, “2”, “3”). A comparação de unicidade MUST ignorar maiúsculas/minúsculas e acentos (ex.: “A1” = “a1”; “Cafe-1” = “Café-1”), após remover espaços nas pontas; zeros à esquerda NÃO são normalizados (“1” ≠ “01”).
- **FR-011**: O mesmo produto do catálogo MUST poder ser vinculado a vários clientes (e ao mesmo cliente mais de uma vez), desde que cada vínculo ativo tenha identificador distinto.
- **FR-012**: O sistema MUST permitir consultar os vínculos ativos de um cliente (produto + identificador) e MUST permitir localizar, na empresa, o cliente/produto a partir do identificador.
- **FR-013**: O sistema MUST permitir editar o identificador (respeitando unicidade entre ativos), o número de série e a observação, e inativar/reativar o vínculo (soft); ao inativar, o identificador fica liberado para reuso.
- **FR-014**: Criação, edição, inativação e reativação de produtos, clientes e vínculos MUST respeitar as permissões de CRUD dos grupos (Admin / Operadores / personalizados) definidas na feature de grupos de permissão; listagem MUST exigir a permissão de leitura correspondente.
- **FR-015**: Textos de interface dos módulos de Produtos e Clientes (rótulos, botões, erros, estados vazios, navegação) MUST passar pela camada de i18n, com locale ativo `pt-BR`.
- **FR-016**: Caminhos críticos (criar produto; criar cliente; bloquear telefone duplicado entre ativos sem vínculo; confirmar vínculo entre pessoas com telefone compartilhado; vincular produto com identificador; rejeitar identificador duplicado entre ativos; buscar por identificador; isolamento por empresa; negar ações sem permissão) MUST ter cobertura automatizada sempre que possível; se algum for impraticável, a exceção e o checklist manual MUST constar em plan/tasks.

### Key Entities

- **Produto (catálogo)**: Tipo de equipamento/item cadastrado pela empresa (ex.: “Air fryer”), com nome, descrição opcional e status ativo/inativo. Não representa a unidade física de um cliente; serve de base para vínculos.
- **Cliente**: Pessoa ou organização atendida pela empresa, com nome obrigatório (podendo repetir na empresa), telefone obrigatório (único entre ativos salvo associação explícita), demais contatos opcionais, status ativo/inativo, isolado por empresa. Pode estar associado a outro(s) cliente(s) da mesma empresa quando compartilham telefone via vínculo entre pessoas.
- **Vínculo entre pessoas (clientes)**: Associação explícita entre dois ou mais clientes ativos da mesma empresa que compartilham o mesmo telefone, criada quando o operador confirma o conflito de telefone no cadastro/edição. Não substitui o vínculo cliente–produto.
- **Vínculo cliente–produto**: Associação entre um cliente e um produto do catálogo, com Identificador (código/número operacional definido pelo operador) único entre vínculos ativos da empresa — unicidade comparada sem distinção de maiúsculas/minúsculas e acentos —, Número de série do fabricante (opcional), Observação (opcional) e status ativo/inativo. Representa a unidade/equipamento daquele cliente. O número de série do fabricante não é chave de unicidade nesta versão.
- **Empresa**: Contexto de isolamento de produtos, clientes e vínculos (reutilizado do login/shell).
- **Usuário autenticado / grupo de permissão**: Opera com permissões de CRUD por recurso (produtos, clientes, vínculos) conforme Admin, Operadores ou grupos personalizados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário autorizado cadastra um produto válido no catálogo em menos de 2 minutos a partir da abertura do módulo.
- **SC-002**: Um usuário autorizado cadastra um cliente e vincula um produto com identificador em menos de 3 minutos (produto já existente no catálogo).
- **SC-003**: No cenário de três clientes com o mesmo produto do catálogo e identificadores distintos, 100% dos vínculos ficam associados ao cliente correto e cada identificador localiza apenas o vínculo correspondente.
- **SC-004**: Em 100% das tentativas de salvar vínculo com identificador já usado por outro vínculo ativo da empresa, o sistema bloqueia e informa o conflito.
- **SC-004a**: Em 100% das tentativas de cadastrar cliente com telefone já usado por outro ativo sem confirmar vínculo entre pessoas, o sistema bloqueia e apresenta o conflito; com confirmação de vínculo, ambas as pessoas ficam cadastradas e associadas com o telefone compartilhado.
- **SC-005**: Usuários de empresas distintas não visualizam nem alteram produtos, clientes ou vínculos uns dos outros em cenários verificáveis de isolamento.
- **SC-006**: Em 100% das tentativas sem permissão, criação/edição/inativação de produto, cliente ou vínculo é negada.
- **SC-007**: Pelo menos 90% dos operadores de teste completam o fluxo cadastrar cliente → vincular produto → informar identificador sem assistência externa.

## Assumptions

- “Produto” nesta feature é o **catálogo** (tipo de item/equipamento, ex.: Air fryer), não a unidade física; a unidade física é o **vínculo** cliente–produto com identificador.
- O cadastro mínimo de **Cliente** entra no escopo porque o caso de uso de vínculo depende dele; campos obrigatórios: Nome e Telefone. Nomes podem repetir na mesma empresa. Telefone é único entre clientes ativos, exceto quando o operador confirma **vínculo entre pessoas** (compartilhamento intencional do telefone). Módulo rico de CRM (documentos fiscais, múltiplos endereços, histórico comercial completo) fica fora desta versão.
- Identificador é livre (texto/número informado pelo operador), único entre vínculos **ativos** da mesma empresa; não é gerado automaticamente nesta versão. Unicidade compara identificadores sem distinção de maiúsculas/minúsculas e acentos (após trim); “1” e “01” permanecem distintos.
- Número de série do fabricante e Observação no vínculo são opcionais; série do fabricante não exige unicidade nesta versão.
- Descrição do produto é opcional; Nome é obrigatório (espelhando o padrão de cadastros enxutos do ERP).
- Soft-inactivate para produto, cliente e vínculo; hard delete fora de escopo. Inativar cliente não cascateia para vínculos (vínculos e identificadores ativos permanecem até inativação explícita do vínculo).
- Composição formal Serviço ↔ Produto (ex.: “reparo de air fryer” amarrado automaticamente ao catálogo) fica **fora de escopo** nesta versão; o exemplo de serviço é apenas contexto de domínio.
- Ordens de serviço, check-in de equipamento na oficina e etiquetas impressas ficam fora de escopo; nesta versão basta cadastrar, vincular e localizar pelo identificador.
- Reutiliza autenticação, shell, isolamento por empresa e modelo de grupos/permissões já especificados (`001`, `004`); permissões de Produtos e Clientes entram no catálogo de recursos CRUD.
- Unicidade de nome de produto: mesmos critérios de serviços (ativos, case/acento-insensitive).
- Seed pode incluir produto(s) de demonstração (ex.: Air fryer), cliente(s) e vínculo(s) com identificador na Empresa Demo, de forma idempotente e documentada em pt-BR (Constitution II).
- Critical paths will have automated tests unless an exception is documented (Constitution I).
- User-facing copy uses i18n with pt-BR as the only required locale for now (Constitution III).
