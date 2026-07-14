# Feature Specification: ERP Login e Shell do Sistema

**Feature Branch**: `001-erp-login-shell`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "preciso iniciar um projeto em next.js + tailwind + prisma, e a ideia é fazer um ERP, então faça o presetup referente a login, especificando a tela de login, será simples — metade da tela referente a login campos etc e metade da tela referente a uma imagem, após o login entrar em uma tela do sistema, como não tem nada ainda, ter uma barra lateral de navegação e um header em cima"

## Clarifications

### Session 2026-07-14

- Q: Qual identificador de login usar? → A: Somente e-mail + senha
- Q: Como a sessão deve persistir? → A: Persiste após fechar o navegador, com expiração por tempo (sem opção “Lembrar-me”)
- Q: O que a barra lateral mostra no presetup? → A: Itens placeholder mínimos (ex.: “Início”) clicáveis dentro do shell
- Q: Em desktop, qual lado fica o formulário de login? → A: Formulário à esquerda, imagem à direita
- Q: O sistema precisa de multiempresas no login? → A: Sim, o sistema comporta multiempresas; neste momento um usuário não pode se cadastrar/vincular a múltiplas empresas (um usuário → no máximo uma empresa)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Autenticar e entrar no sistema (Priority: P1)

Um usuário autorizado abre o sistema, informa suas credenciais na tela de login e, após sucesso, é direcionado para a área interna do ERP.

**Why this priority**: Sem autenticação funcional, o restante do shell e qualquer módulo futuro não tem ponto de entrada seguro.

**Independent Test**: Pode ser testado preenchendo credenciais válidas na tela de login e confirmando o redirecionamento para a área autenticada.

**Acceptance Scenarios**:

1. **Given** o usuário não está autenticado e acessa a aplicação, **When** a tela de login é exibida, **Then** a área de credenciais ocupa aproximadamente a metade esquerda da tela e a metade direita exibe uma imagem institucional/visual.
2. **Given** o usuário está na tela de login, **When** informa e-mail e senha válidos e confirma, **Then** é redirecionado para a área interna do sistema (shell com header e barra lateral) no contexto da sua única empresa vinculada.
3. **Given** o usuário está na tela de login, **When** informa credenciais inválidas e confirma, **Then** permanece na tela de login e vê uma mensagem de erro clara, sem revelar detalhes técnicos internos.
4. **Given** o usuário já está autenticado, **When** tenta acessar a tela de login, **Then** é redirecionado para a área interna do sistema.
5. **Given** o usuário autenticado possui vínculo com uma empresa, **When** entra na área interna, **Then** não há seletor de troca de empresa neste presetup.

---

### User Story 2 - Usar o shell interno (header + barra lateral) (Priority: P1)

Após o login, o usuário vê a estrutura básica do ERP: um header superior e uma barra lateral de navegação, mesmo sem módulos de negócio ainda disponíveis.

**Why this priority**: O shell é a base visual e de navegação do ERP; todos os módulos futuros dependem desse layout.

**Independent Test**: Após autenticar, verificar presença do header e da barra lateral, e que a área de conteúdo está disponível (mesmo que vazia ou com mensagem de boas-vindas).

**Acceptance Scenarios**:

1. **Given** o usuário autenticou com sucesso, **When** a área interna carrega, **Then** o layout exibe um header no topo e uma barra lateral de navegação à esquerda (ou equivalente lateral fixo).
2. **Given** o usuário está na área interna, **When** observa o header, **Then** consegue identificar contexto da sessão (ex.: nome do produto/sistema e indicação do usuário logado).
3. **Given** o usuário está na área interna e ainda não há módulos de negócio, **When** observa a barra lateral, **Then** vê pelo menos o item placeholder “Início” (ou equivalente) e consegue selecioná-lo sem quebrar o layout.
4. **Given** o usuário está na área interna, **When** observa a área principal de conteúdo, **Then** vê uma tela inicial simples (ex.: mensagem de boas-vindas) sem erros de layout.

---

### User Story 3 - Proteger rotas e encerrar sessão (Priority: P2)

O usuário autenticado pode sair do sistema; usuários não autenticados não acessam a área interna.

**Why this priority**: Essencial para segurança básica, mas depende do login e do shell já funcionarem.

**Independent Test**: Tentar acessar a área interna sem login (deve ir para login) e, após logado, usar a ação de sair e confirmar retorno à tela de login.

**Acceptance Scenarios**:

1. **Given** o usuário não está autenticado, **When** tenta acessar qualquer tela da área interna, **Then** é redirecionado para a tela de login.
2. **Given** o usuário está autenticado na área interna, **When** solicita sair (logout) pelo header, **Then** a sessão é encerrada e ele retorna à tela de login.
3. **Given** o usuário acabou de sair, **When** usa o botão voltar do navegador para uma página interna, **Then** continua impedido de ver conteúdo autenticado e é direcionado ao login.

---

### Edge Cases

- Campos de login vazios: o sistema impede o envio ou exibe validação pedindo preenchimento antes de autenticar.
- E-mail malformado: o sistema exibe feedback de validação sem tentar autenticar como sucesso.
- Sessão expirada enquanto o usuário está na área interna: ao tentar navegar ou recarregar, o usuário é redirecionado ao login com mensagem amigável.
- Após fechar e reabrir o navegador com sessão ainda válida: o usuário permanece autenticado e acessa a área interna sem novo login.
- Imagem da metade visual da tela de login indisponível: o layout permanece utilizável (área de formulário funcional; lado visual com fallback simples).
- Viewport estreito (mobile/tablet): o layout de login permanece utilizável (formulário acessível; imagem pode reorganizar/ocultar sem bloquear o acesso).
- Múltiplas tentativas de login falhas seguidas: o sistema continua exibindo erro de forma clara (rate limiting avançado fica fora do escopo deste presetup).
- Usuário sem vínculo de empresa: não consegue concluir entrada na área interna e recebe feedback indicando indisponibilidade de acesso organizacional.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir uma tela de login acessível a usuários não autenticados como ponto de entrada da aplicação.
- **FR-002**: A tela de login MUST usar layout em duas metades em desktop: formulário de autenticação à esquerda e imagem visual/institucional à direita.
- **FR-003**: O formulário de login MUST incluir campos para e-mail e senha, além de uma ação explícita de entrar; o e-mail é o único identificador de autenticação neste presetup.
- **FR-004**: O sistema MUST autenticar o usuário com credenciais válidas e rejeitar credenciais inválidas com mensagem compreensível.
- **FR-005**: Após autenticação bem-sucedida, o sistema MUST redirecionar o usuário para a área interna do ERP.
- **FR-006**: A área interna MUST apresentar um header superior e uma barra lateral de navegação, formando o shell base do sistema.
- **FR-007**: O header MUST permitir identificar o sistema e o usuário autenticado, e MUST oferecer ação de logout.
- **FR-008**: A barra lateral MUST exibir itens placeholder mínimos navegáveis (pelo menos “Início” ou equivalente) e permanecer preparada para receber módulos futuros.
- **FR-009**: A área principal do shell MUST exibir um conteúdo inicial simples (boas-vindas ou estado vazio) enquanto não houver módulos de negócio.
- **FR-010**: O sistema MUST impedir acesso à área interna por usuários não autenticados, redirecionando-os para o login.
- **FR-011**: O sistema MUST manter a sessão autenticada entre navegações internas e após o fechamento do navegador, até logout explícito ou expiração por tempo; não há opção “Lembrar-me” no formulário.
- **FR-012**: O layout MUST permanecer utilizável em desktop como prioridade; em telas menores, o login e o shell não podem ficar inutilizáveis.
- **FR-013**: O sistema MUST comportar múltiplas empresas (modelo multiempresa).
- **FR-014**: Neste presetup, um usuário MUST estar vinculado a no máximo uma empresa; o usuário NÃO PODE se cadastrar ou vincular a múltiplas empresas.
- **FR-015**: A tela de login MUST NÃO exigir seleção de empresa; após autenticação válida, o usuário entra no contexto da sua única empresa vinculada.

### Key Entities

- **Usuário**: Pessoa autorizada a acessar o ERP; possui e-mail único (identificador de login), senha e dados básicos de exibição (ex.: nome); neste presetup vincula-se a no máximo uma empresa.
- **Empresa**: Organização/contexto operacional do ERP; o sistema comporta múltiplas empresas; usuários distintos podem pertencer a empresas distintas.
- **Sessão**: Representa o estado autenticado do usuário após login bem-sucedido; persiste após fechar o navegador e termina no logout ou na expiração por tempo; inclui o contexto da empresa vinculada.
- **Área autenticada (Shell)**: Estrutura visual composta por header, barra lateral e área de conteúdo; ponto de partida para módulos futuros do ERP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário com credenciais válidas completa o login e chega à área interna em menos de 30 segundos em condições normais de uso.
- **SC-002**: Em 100% dos testes com credenciais inválidas, o usuário permanece no login e recebe feedback de erro compreensível.
- **SC-003**: Em 100% dos acessos à área interna sem autenticação, o usuário é redirecionado para a tela de login.
- **SC-004**: Após login, 100% das visualizações da área interna exibem header e barra lateral sem quebras de layout nas resoluções desktop alvo.
- **SC-005**: Usuários conseguem localizar e executar logout no header em menos de 10 segundos sem treinamento prévio.
- **SC-006**: A tela de login é reconhecida como layout de duas metades (formulário à esquerda + imagem à direita) por revisores em avaliação visual em desktop.
- **SC-007**: Após login, a barra lateral exibe pelo menos um item placeholder navegável (ex.: “Início”) em 100% das visualizações da área interna.
- **SC-008**: Em 100% dos logins bem-sucedidos neste presetup, o usuário entra sem seletor de empresa e permanece no contexto de uma única empresa vinculada.

## Assumptions

- Este presetup inicia o projeto ERP; a stack pretendida de implementação (Next.js, Tailwind e Prisma) será usada na fase de planejamento/implementação, sem alterar os requisitos de negócio desta especificação.
- Autenticação inicial será somente por e-mail e senha; não há login por nome de usuário nem SSO/OAuth neste presetup.
- Sessão é persistente (sobrevive ao fechar o navegador) com expiração por tempo; default assumido de 7 dias até renovação/logout (ajustável no planejamento técnico).
- Não haverá checkbox “Lembrar-me” no formulário de login neste presetup.
- Haverá pelo menos um usuário de teste inicial para validar o fluxo (pode ser seed/admin criado no setup).
- Cadastro público (self-signup), recuperação de senha, MFA e papéis/permissões granulares ficam fora do escopo deste presetup.
- O sistema é multiempresa; neste presetup um usuário não pode se cadastrar/vincular a múltiplas empresas (máximo uma empresa por usuário). Troca de empresa e membership multiempresa ficam para features futuras.
- Não há seletor de empresa na tela de login neste presetup.
- Módulos de negócio do ERP (financeiro, estoque, RH etc.) não fazem parte desta feature; a barra lateral terá apenas placeholders mínimos (ex.: “Início”).
- Idioma da interface neste presetup será português (pt-BR).
- Desktop é o contexto principal do ERP; responsividade mínima em telas menores é suficiente para não bloquear o uso.
- A imagem do lado visual do login pode ser um asset estático placeholder até haver branding definitivo; em desktop fica à direita do formulário.
