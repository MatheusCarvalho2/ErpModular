# Feature Specification: Ordens de Serviço

**Feature Branch**: `006-ordens-servico`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "legal agora tenho os serviços padroes, os produtos padroes e os clientes, agora preciso juntar tudo — entao supondo, serviço de reparo de eletrodomestico, para o cliente José Demo no produto airfrayer logo vem tudo pré preenchido, ai eu posso mudar o valor cobrado dele etc... posso colocar descrição do serviço prestado, e além de tudo tenho que poder colocar o status, sendo Recebido, Orçando, Aguardando, Fazendo, Pronto — este é o status dessa base, e o status padrao, mas eles podem ser modificados pelo admin"

<!--
  CONSTITUTION (see `.specify/memory/constitution.md`):
  - Automated tests for critical paths whenever possible
  - Seed fixtures when needed for develop/demo/test (idempotent, documented)
  - All user-facing copy via i18n; active locale pt-BR only for now
  Reflect these in User Scenarios, Requirements, and Assumptions as applicable.
-->

## Clarifications

### Session 2026-07-14

- Q: Depois de salvar a ordem, serviço/cliente/equipamento podem ser alterados? → A: Fixos por padrão; admin (ou permissão especial) pode corrigir os vínculos. Valor cobrado, descrição do serviço prestado e status continuam editáveis para quem tiver permissão de editar ordem.
- Q: O mesmo equipamento pode ter mais de uma ordem aberta ao mesmo tempo? → A: Sim — várias ordens no mesmo equipamento, inclusive em paralelo.
- Q: Ordens em status “Pronto”/conclusão ainda são editáveis? → A: Na configuração de status, o admin define papéis **finalizado** e **cancelado** (além do operacional). Enquanto a ordem estiver em status finalizado ou cancelado: operador só lê; admin (ou permissão especial) ainda pode editar valor, descrição, status e vínculos (se tiver correção de vínculos).
- Q: Vários status podem ter o mesmo papel? → A: Sim — vários status ativos podem ser finalizado e vários cancelado na mesma empresa.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir ordem de serviço com pré-preenchimento (Priority: P1)

Um operador autenticado cria uma ordem de serviço escolhendo um serviço padrão (ex.: reparo de eletrodoméstico), um cliente (ex.: José Demo) e um produto/equipamento já vinculado a esse cliente (ex.: air fryer). O sistema pré-preenche dados derivados do serviço (em especial o valor cobrado sugerido) e permite ajustar o valor, informar a descrição do serviço prestado e definir o status inicial.

**Why this priority**: Este é o fluxo central que “junta” serviços, clientes e produtos; sem ele o ERP não passa do cadastro isolado ao atendimento operacional.

**Independent Test**: Com serviço, cliente e vínculo cliente–produto já existentes no seed/demo, autenticar com permissão de criar ordens, abrir o módulo, selecionar os três, conferir pré-preenchimento, ajustar valor/descrição/status e salvar; a ordem aparece na listagem da empresa.

**Acceptance Scenarios**:

1. **Given** o usuário autenticado tem permissão de criar ordens e existem serviço ativo, cliente ativo e pelo menos um vínculo cliente–produto ativo na empresa, **When** acessa o módulo de Ordens de Serviço pela navegação, **Then** vê a área do módulo (lista ou estado vazio) e pode iniciar uma nova ordem.
2. **Given** o usuário está no formulário de nova ordem, **When** seleciona o serviço “Reparo de eletrodoméstico”, o cliente “José Demo” e o equipamento/produto vinculado (air fryer), **Then** o valor cobrado sugerido (e demais campos derivados do serviço, quando existirem) vem pré-preenchido a partir do cadastro do serviço.
3. **Given** o formulário já pré-preencheu o valor a partir do serviço, **When** o operador altera o valor cobrado desta ordem e informa a descrição do serviço prestado e salva, **Then** a ordem é persistida com o valor ajustado e a descrição informada, sem alterar o cadastro padrão do serviço.
4. **Given** o usuário está criando uma ordem, **When** não seleciona serviço, cliente ou produto/equipamento vinculado (quando a seleção de equipamento é aplicável) ou tenta salvar sem status, **Then** o sistema impede o salvamento e indica o que falta.
5. **Given** o usuário cria uma ordem sem escolher status explicitamente, **When** salva, **Then** a ordem recebe o status padrão inicial da empresa (na base: Recebido, ou o equivalente configurado como padrão inicial).
6. **Given** o usuário não está autenticado, **When** tenta acessar o módulo, **Then** é direcionado ao login e nenhum dado de ordem é exposto.
7. **Given** o usuário autenticado não tem permissão de criar ordens, **When** tenta criar, **Then** a ação é negada e nenhuma ordem é criada.
8. **Given** existem dados de outras empresas, **When** o usuário cria ou lista ordens, **Then** só opera no contexto da própria empresa.

---

### User Story 2 - Consultar e atualizar status da ordem (Priority: P1)

Após existir pelo menos uma ordem, o operador consulta a listagem/detalhe e altera o status ao longo do atendimento (ex.: de Recebido para Orçando, depois Aguardando, Fazendo e Pronto), podendo também ajustar valor cobrado e descrição do serviço prestado enquanto a ordem estiver em status **operacional**. Serviço, cliente e equipamento permanecem fixos para o operador comum; apenas administrador (ou permissão especial de correção) pode alterar esses vínculos. Se a ordem estiver em status com papel **finalizado** ou **cancelado**, o operador apenas consulta; administrador (ou permissão especial de edição pós-encerramento) ainda pode alterar.

**Why this priority**: Sem consulta e avanço de status, a ordem aberta não acompanha o dia a dia da oficina/atendimento.

**Independent Test**: Com ordens existentes, listar, abrir detalhe, mudar status entre os ativos da empresa, editar valor/descrição e confirmar persistência na listagem; como não-admin, confirmar que vínculos não são editáveis; como admin, corrigir um vínculo e salvar; colocar ordem em Pronto (finalizado) e confirmar que operador não edita e admin ainda edita.

**Acceptance Scenarios**:

1. **Given** a empresa possui uma ou mais ordens, **When** o usuário com permissão de listar abre o módulo, **Then** vê listagem com pelo menos cliente, serviço, produto/equipamento (quando houver), valor cobrado e status de cada ordem da própria empresa.
2. **Given** uma ordem em status operacional, **When** o usuário autorizado altera o status para outro status ativo da empresa (ex.: Orçando → Fazendo → Pronto), **Then** o novo status é persistido e refletido na listagem/detalhe.
3. **Given** uma ordem em status operacional, **When** o usuário autorizado altera valor cobrado e/ou descrição do serviço prestado e salva, **Then** as alterações ficam só naquela ordem.
4. **Given** uma ordem existente e um operador com permissão de editar ordem mas sem permissão de corrigir vínculos, **When** tenta alterar serviço, cliente ou equipamento, **Then** a ação é negada e os vínculos permanecem iguais.
5. **Given** uma ordem em status operacional e um administrador (ou usuário com permissão especial de correção de vínculos), **When** corrige serviço, cliente e/ou equipamento para outros registros válidos e ativos da empresa e salva, **Then** os novos vínculos são persistidos e as regras de seleção (serviço/cliente/equipamento ativos e equipamento do cliente) continuam valendo.
6. **Given** uma ordem cujo status atual tem papel finalizado ou cancelado, **When** um operador (não admin / sem permissão especial pós-encerramento) tenta alterar valor, descrição, status ou vínculos, **Then** a ação é negada e a ordem permanece somente leitura para ele.
7. **Given** uma ordem cujo status atual tem papel finalizado ou cancelado, **When** um administrador (ou usuário com permissão especial pós-encerramento) altera valor, descrição e/ou status (incluindo reabrir para um status operacional) e salva, **Then** as alterações são persistidas; correção de vínculos permanece sujeita à permissão de correção de vínculos.
8. **Given** a empresa não possui ordens, **When** o usuário abre a visão padrão, **Then** vê estado vazio claro; se tiver permissão de criar, há caminho para abrir uma ordem.
9. **Given** o usuário sem permissão de editar, **When** tenta alterar status ou dados da ordem, **Then** a ação é negada.

---

### User Story 3 - Administrar catálogo de status (Priority: P2)

Um administrador gerencia os status usados pelas ordens da empresa. A instalação/base nasce com os status padrão Recebido, Orçando, Aguardando, Fazendo e Pronto (incluindo qual é o padrão inicial ao criar ordem). Além de nome e ordem, cada status tem um **papel**: operacional, finalizado ou cancelado. O admin pode renomear, reordenar, adicionar novos status, definir o papel, marcar o padrão inicial e inativar status — sem apagar o histórico das ordens que já usaram aquele status.

**Why this priority**: O fluxo operacional depende dos status padrão, mas cada empresa pode precisar adaptar a nomenclatura/etapas e marcar o que encerra ou cancela o atendimento.

**Independent Test**: Como administrador, listar os status seedados (Pronto como finalizado), marcar/criar um status cancelado, renomear, alterar padrão inicial e confirmar que ordens em finalizado/cancelado ficam somente leitura para operador.

**Acceptance Scenarios**:

1. **Given** uma empresa recém-preparada (seed/migração da feature), **When** o administrador abre a configuração de status de ordem, **Then** vê pelo menos Recebido, Orçando, Aguardando, Fazendo e Pronto ativos, com Recebido como padrão inicial e Pronto com papel finalizado.
2. **Given** o administrador está na configuração de status, **When** renomeia “Fazendo” para outro rótulo válido e salva, **Then** a listagem de status e as ordens que usam esse status exibem o novo nome.
3. **Given** o administrador, **When** adiciona um novo status ativo com nome válido e único entre status ativos da empresa, define a ordem de exibição e um papel (operacional, finalizado ou cancelado), **Then** o status passa a poder ser escolhido ao criar/editar ordens e o papel passa a reger o comportamento de edição da ordem.
4. **Given** o administrador, **When** define (ou altera) um ou mais status existentes para papel cancelado (ex.: cria “Cancelado” e “Não autorizado” ambos cancelado), **Then** ordens colocadas em qualquer desses status passam a ser somente leitura para operadores.
5. **Given** o administrador, **When** marca dois status distintos como finalizado (ex.: Pronto e Entregue), **Then** ambos funcionam como encerramento (somente leitura para operador nas ordens nesses status).
6. **Given** o administrador, **When** define outro status ativo como padrão inicial, **Then** novas ordens sem escolha explícita de status recebem esse padrão; o padrão inicial MUST ser um status com papel operacional.
7. **Given** um status ativo que ainda é o padrão inicial, **When** o administrador tenta inativá-lo sem apontar outro padrão, **Then** o sistema impede a inativação ou exige escolher outro padrão operacional antes.
8. **Given** um status em uso por pelo menos uma ordem, **When** o administrador o inativa, **Then** o status deixa de ser oferecido para novas seleções, mas as ordens existentes continuam exibindo aquele status (histórico preservado); reativação o devolve às seleções.
9. **Given** um usuário que não é administrador (nem tem permissão equivalente de gerenciar status), **When** tenta criar/editar/inativar status, **Then** a ação é negada.
10. **Given** já existe um status ativo com determinado nome na empresa, **When** o admin tenta cadastrar outro com o mesmo nome (ignorando maiúsculas/minúsculas e acentos), **Then** o sistema impede e informa o conflito.

---

### User Story 4 - Filtrar/acompanhar ordens por status (Priority: P3)

O operador localiza rapidamente ordens em determinado estágio (ex.: só “Fazendo” ou só “Pronto”) para organizar o trabalho do dia.

**Why this priority**: Acelera o uso diário, mas a listagem geral e a mudança de status já entregam o MVP.

**Independent Test**: Com ordens em status distintos, aplicar filtro por um status e confirmar que só aquelas aparecem; limpar filtro e ver todas novamente.

**Acceptance Scenarios**:

1. **Given** existem ordens em status diferentes na empresa, **When** o usuário filtra por “Pronto”, **Then** a listagem mostra apenas ordens nesse status.
2. **Given** um filtro de status ativo, **When** o usuário remove o filtro, **Then** a listagem volta a mostrar as ordens da visão padrão (todas as da empresa permitidas pela listagem).

---

### Edge Cases

- Cliente sem nenhum vínculo cliente–produto ativo: a ordem não pode ser salva sem equipamento; o sistema indica que é necessário vincular um produto ao cliente antes (ou oferece caminho claro). Se o cliente tiver vínculos, só vínculos ativos daquele cliente (e da mesma empresa) aparecem na seleção.
- Mesmo equipamento com várias ordens (incluindo várias “em andamento” ao mesmo tempo): permitido; não há bloqueio por unicidade de ordem ativa por equipamento.
- Serviço inativo ou de outra empresa: não aparece na seleção padrão; não pode ser usado em nova ordem.
- Cliente inativo: não aparece na seleção padrão para nova ordem; ordens já existentes do cliente permanecem consultáveis.
- Vínculo cliente–produto inativado após a ordem existir: a ordem permanece consultável com os dados do equipamento no momento do atendimento (histórico); novos usos desse vínculo inativo não são oferecidos.
- Alterar o valor padrão no cadastro do serviço depois de criar a ordem: não recalcula automaticamente ordens já salvas.
- Valor cobrado negativo ou inválido: rejeitado; valor zero pode ser permitido (cortesia/garantia) — tratado como válido nesta versão.
- Descrição do serviço prestado vazia: permitida nesta versão (opcional); só espaços tratados como vazia.
- Transição de status: qualquer status ativo da empresa pode ser escolhido (sem obrigatoriedade de sequência rígida Recebido→…→Pronto nesta versão), inclusive de operacional para finalizado/cancelado e (por admin) de volta.
- Ordem em status finalizado ou cancelado: operador não edita; admin/permissão especial pós-encerramento ainda edita.
- Inativar o último status ativo da empresa: impedido — a empresa deve manter ao menos um status ativo e um padrão inicial.
- Isolamento multiempresa: ordens e catálogo de status de uma empresa nunca aparecem para outra.
- Soft-inactivate para status; hard delete de ordem/status fora de escopo nesta versão (status usa soft-inactivate; ordem permanece como registro operacional). Cancelamento de atendimento MUST usar status com papel **cancelado** (configurado pelo admin), não hard delete.
- Campos de texto muito longos: limites razoáveis com feedback ao usuário.
- Perda de sessão ao salvar: redireciona ao login sem persistir parcialmente de forma silenciosa.
- Dois operadores editando a mesma ordem: última gravação válida vence nesta versão (sem bloqueio otimista elaborado), desde que ambas sejam autorizadas.
- Operador sem permissão de correção de vínculos tenta mudar serviço/cliente/equipamento de ordem existente: negado; valor/descrição/status seguem editáveis se tiver permissão de editar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar um módulo de Ordens de Serviço na área autenticada (navegação do shell), no contexto da empresa do usuário.
- **FR-002**: O sistema MUST permitir criar uma ordem associando obrigatoriamente: um serviço ativo da empresa, um cliente ativo da empresa e um vínculo cliente–produto ativo daquele cliente (equipamento), além de um status ativo da empresa.
- **FR-002a**: O sistema MUST permitir múltiplas ordens para o mesmo equipamento (vínculo cliente–produto), inclusive em paralelo (sem limite de “uma ordem ativa por equipamento” nesta versão).
- **FR-003**: Ao selecionar o serviço, o sistema MUST pré-preencher o valor cobrado sugerido a partir do valor cadastrado no serviço (quando houver); o operador MUST poder alterar esse valor na ordem sem modificar o serviço padrão.
- **FR-004**: O sistema MUST permitir informar Descrição do serviço prestado na ordem (texto livre, opcional nesta versão).
- **FR-005**: O sistema MUST permitir consultar a listagem de ordens da empresa com dados suficientes para identificar cliente, serviço, equipamento, valor e status.
- **FR-006**: O sistema MUST permitir editar valor cobrado, descrição do serviço prestado e status de uma ordem existente em status com papel **operacional**, respeitando permissões de editar ordem.
- **FR-006a**: Serviço, cliente e equipamento de uma ordem existente MUST permanecer imutáveis para usuários sem permissão de correção de vínculos. Administradores (ou usuários com permissão especial equivalente) MUST poder corrigir serviço, cliente e/ou equipamento para outros registros válidos e ativos da mesma empresa (equipamento MUST pertencer ao cliente selecionado), sem exigir recriação da ordem — inclusive quando a ordem estiver finalizada/cancelada, se tiverem também a permissão de edição pós-encerramento.
- **FR-006b**: Quando o status atual da ordem tem papel **finalizado** ou **cancelado**, usuários operadores (sem permissão especial pós-encerramento) MUST ter apenas leitura; administradores (ou permissão especial pós-encerramento) MUST ainda poder editar valor, descrição e status (incluindo reabrir para status operacional).
- **FR-007**: O sistema MUST manter um catálogo de status de ordem por empresa, com os status base/padrão ao provisionar a empresa: Recebido, Orçando, Aguardando, Fazendo e Pronto; um deles MUST ser o padrão inicial (Recebido na base, papel operacional). Cada status MUST ter exatamente um papel: operacional, finalizado ou cancelado. Na base, Pronto MUST nascer com papel finalizado; os demais quatro MUST nascer com papel operacional.
- **FR-008**: Administradores (ou usuários com permissão equivalente de gerenciar status) MUST poder criar, renomear, reordenar, definir papel (operacional | finalizado | cancelado), definir o padrão inicial e inativar/reativar status da empresa; nomes de status ativos MUST ser únicos na empresa (comparação sem distinção de maiúsculas/minúsculas e acentos, após trim). Vários status ativos MAY compartilhar o mesmo papel (vários finalizado e/ou vários cancelado).
- **FR-008a**: O padrão inicial MUST ser um status ativo com papel operacional. O sistema MUST impedir definir como padrão inicial um status finalizado ou cancelado.
- **FR-009**: Status inativos MUST NOT ser oferecidos em novas seleções; ordens que já referenciam um status inativado MUST continuar exibindo esse status no histórico.
- **FR-010**: O sistema MUST impedir inativar o status padrão inicial sem antes definir outro status ativo como padrão; MUST manter ao menos um status ativo por empresa.
- **FR-011**: Novas ordens sem escolha explícita de status MUST receber o status padrão inicial da empresa.
- **FR-012**: O sistema MUST permitir filtrar a listagem de ordens por status.
- **FR-013**: Criação, listagem, edição de ordens e gestão de status MUST respeitar autenticação, isolamento por empresa e permissões dos grupos (Admin / Operadores / personalizados); gestão do catálogo de status MUST ser restrita a administrador ou permissão equivalente dedicada; edição pós-encerramento (ordem em finalizado/cancelado) e correção de vínculos MUST ser restritas a administrador ou permissões especiais equivalentes.
- **FR-014**: Textos de interface do módulo (rótulos, botões, erros, estados vazios, nomes exibidos dos status padrão via i18n quando forem cópia de produto, navegação) MUST passar pela camada de i18n, com locale ativo `pt-BR`. Status personalizados criados pelo admin são dados da empresa (não exigem chave i18n por nome).
- **FR-015**: Caminhos críticos (criar ordem com pré-preenchimento e ajuste de valor; alterar status; somente leitura em finalizado/cancelado para operador; admin editar pós-encerramento; listar/filtrar; isolamento por empresa; negar sem permissão; admin gerenciar status incluindo papel e padrão inicial; preservar histórico ao inativar status) MUST ter cobertura automatizada sempre que possível; se algum for impraticável, a exceção e o checklist manual MUST constar em plan/tasks.

### Key Entities

- **Ordem de Serviço**: Registro operacional que une um serviço padrão, um cliente e um equipamento (vínculo cliente–produto) da empresa, com valor cobrado (podendo divergir do serviço), descrição do serviço prestado, status atual e metadados de auditoria simples (quem/quando criou/atualizou, na medida do já adotado no ERP). Isolada por empresa.
- **Status de ordem**: Etapa configurável do fluxo de atendimento da empresa (ex.: Recebido, Orçando, Aguardando, Fazendo, Pronto), com nome, ordem de exibição, flag de padrão inicial, papel (operacional | finalizado | cancelado) e ativo/inativo. Papel finalizado ou cancelado torna a ordem somente leitura para operadores. Vários status da empresa MAY ter o mesmo papel.
- **Serviço (reutilizado)**: Catálogo de serviço padrão da feature `003`; fornece valor sugerido e contexto do tipo de trabalho.
- **Cliente (reutilizado)**: Cadastro da feature `005`.
- **Vínculo cliente–produto / equipamento (reutilizado)**: Unidade física do cliente (produto do catálogo + identificador) da feature `005`.
- **Empresa / Usuário / Grupo de permissão**: Contexto e autorização já estabelecidos nas features anteriores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um operador autorizado abre uma ordem válida (serviço + cliente + equipamento) com pré-preenchimento do valor em menos de 2 minutos, partindo de dados já cadastrados.
- **SC-002**: Em 100% das criações com serviço que possui valor cadastrado, o valor sugerido aparece pré-preenchido antes do salvamento (podendo ser alterado).
- **SC-003**: Um operador autorizado conclui a mudança de status de uma ordem (ex.: Recebido → Pronto, passando pelos intermediários desejados) em menos de 1 minuto por atualização.
- **SC-004**: Usuários de empresas distintas não visualizam nem alteram ordens ou status uns dos outros em cenários verificáveis de isolamento.
- **SC-005**: Em 100% das tentativas sem permissão, criação/edição de ordem ou gestão de status é negada.
- **SC-006**: Após o seed/provisionamento, 100% das empresas de demo/teste possuem os cinco status base ativos, Pronto com papel finalizado, e um padrão inicial operacional utilizável em nova ordem.
- **SC-007**: Pelo menos 90% dos operadores de teste completam o fluxo selecionar serviço → cliente → equipamento → ajustar valor → salvar sem assistência externa.
- **SC-008**: Administrador renomeia ou adiciona um status e, em seguida, esse status fica disponível (ou deixa de ficar, se inativado) nas novas seleções em menos de 3 minutos.

## Assumptions

- O “produto” na ordem é o **vínculo cliente–produto** (equipamento daquele cliente com identificador), não apenas o item do catálogo — alinhado ao caso “José Demo + air fryer”.
- Um equipamento MAY ter várias ordens simultâneas; não há restrição de “apenas uma ordem não final por equipamento”.
- Pré-preenchimento mínimo obrigatório nesta versão: **valor cobrado** a partir do serviço. Outros campos do serviço (descrição, tempo, descrição específica do produto) MAY ser exibidos como referência/leitura; a **descrição do serviço prestado** na ordem é campo próprio da ordem (o que foi feito neste atendimento), opcional.
- Status padrão da base: Recebido, Orçando, Aguardando, Fazendo (papel operacional) e Pronto (papel finalizado); padrão inicial = Recebido. Admin configura papéis finalizado e cancelado; vários status MAY compartilhar o mesmo papel. Catálogo editável (CRUD soft) por empresa.
- Não há máquina de estados rígida (qualquer status ativo é selecionável) nesta versão; o papel do status atual define se operadores ainda editam a ordem.
- Soft-inactivate para status; hard delete de ordem/status fora de escopo. Cancelamento operacional = mover a ordem para status com papel cancelado.
- Após criar a ordem: em status operacional, valor/descrição/status editáveis por quem edita ordem; vínculos só por admin/correção. Em finalizado/cancelado: operador só lê; admin/pós-encerramento ainda edita.
- Permissões: listar/criar/editar ordens via CRUD nos grupos; gestão de status, correção de vínculos e edição pós-encerramento restritas a Admin (ou permissões especiais equivalentes).
- Valor zero permitido; negativo não.
- Reutiliza autenticação, shell, isolamento multiempresa, serviços (`003`), produtos/clientes/vínculos (`005`) e grupos/permissões (`004`).
- Seed da feature MUST incluir, de forma idempotente e documentada em pt-BR: os cinco status na Empresa Demo com papéis corretos (Pronto = finalizado), e ao menos uma ordem de demonstração usando serviço/cliente/equipamento já seedados (ex.: José Demo + air fryer + serviço de reparo), para develop/demo/test (Constitution II).
- Critical paths will have automated tests unless an exception is documented (Constitution I).
- User-facing copy uses i18n with pt-BR as the only required locale for now (Constitution III).
- Composição automática serviço↔produto no cadastro de serviço continua fora desta feature; a junção ocorre na ordem.
- Pagamentos, NF-e, agenda/agendamento e impressão de OS/etiqueta ficam fora desta versão.
