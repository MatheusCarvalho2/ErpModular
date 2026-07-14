# Feature Specification: Testes Automatizados e Seed de Desenvolvimento

**Feature Branch**: `002-automated-tests-seed`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "crie uma spec que vou rodar antes de plan, para criar teste automatizado e também para alimentar o seed do banco para conseguir testar"

## Clarifications

### Session 2026-07-14

- Q: Regras de projeto (testes, seed, i18n)? → A: Adotada Constitution v1.0.0 — testes automatizados sempre que possível; seed quando necessário (idempotente e documentado); toda cópia voltada ao usuário via i18n; locale ativo apenas pt-BR.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Popular o banco com dados de teste reutilizáveis (Priority: P1)

Um desenvolvedor ou QA prepara o ambiente local e popula o banco com um conjunto conhecido de empresas, usuários e vínculos, suficiente para exercitar login feliz, falhas e cenários de borda do presetup de autenticação e shell — sem cadastrar dados manualmente.

**Why this priority**: Sem dados previsíveis e documentados, testes manuais e automatizados ficam frágeis ou impossíveis de repetir.

**Independent Test**: Executar o procedimento de seed documentado e confirmar que as credenciais e entidades previstas existem e permitem login/acesso conforme cada perfil de fixture.

**Acceptance Scenarios**:

1. **Given** o banco está migrado e vazio (ou sem os registros de seed), **When** o procedimento de seed é executado, **Then** o sistema cria (ou atualiza de forma idempotente) o conjunto mínimo de fixtures documentado, sem exigir passos manuais no UI.
2. **Given** o seed foi aplicado, **When** alguém usa as credenciais do usuário admin de demonstração, **Then** consegue autenticar e entrar na área interna no contexto da empresa demo.
3. **Given** o seed foi aplicado, **When** alguém consulta a documentação do seed, **Then** encontra e-mail, senha e propósito de cada fixture (admin feliz, cenários de falha/borda quando existirem).
4. **Given** o seed já foi aplicado uma vez, **When** o seed é executado novamente, **Then** não duplica empresas/usuários/vínculos e deixa o estado consistente com o conjunto documentado.

---

### User Story 2 - Validar automaticamente os fluxos críticos de login e shell (Priority: P1)

Um desenvolvedor ou o pipeline de qualidade executa uma suíte automatizada que percorre os fluxos críticos já definidos no presetup (login com sucesso, login inválido, proteção de área interna, logout e presença do shell), usando as fixtures do seed.

**Why this priority**: É o valor principal da feature: reduzir regressões no ponto de entrada do ERP sem dependência de checklist manual a cada mudança.

**Independent Test**: Com ambiente preparado e seed aplicado, rodar a suíte e observar pass/fail claro para cada fluxo crítico coberto.

**Acceptance Scenarios**:

1. **Given** o ambiente de teste está disponível e o seed aplicado, **When** a suíte automatizada é executada por um único comando documentado, **Then** ela reporta sucesso ou falha de forma explícita para cada cenário crítico.
2. **Given** as fixtures do seed, **When** o cenário de login com credenciais válidas roda, **Then** o resultado confirma entrada na área interna com shell (header e barra lateral) visível.
3. **Given** credenciais inválidas (ou fixture destinada a falha), **When** o cenário de login inválido roda, **Then** o resultado confirma que o usuário permanece no login com feedback de erro.
4. **Given** ausência de sessão autenticada, **When** o cenário de acesso à área interna roda, **Then** o resultado confirma redirecionamento para o login.
5. **Given** sessão autenticada via fixture de seed, **When** o cenário de logout roda, **Then** o resultado confirma retorno ao login e bloqueio de conteúdo interno.

---

### User Story 3 - Textos da interface via i18n (pt-BR) (Priority: P1)

O produto passa a exibir textos voltados ao usuário (login, erros, shell, boas-vindas) através de um mecanismo de internacionalização, com o idioma ativo limitado ao português do Brasil. Desenvolvedores não adicionam novas strings hard-coded nessas superfícies.

**Why this priority**: Regra de constituição do projeto; a suíte e o seed precisam validar a UI já sob o modelo de mensagens centralizado.

**Independent Test**: Abrir login e área autenticada e confirmar que os textos principais aparecem em pt-BR e que a origem das mensagens é o catálogo/pacote de traduções (não literais soltos no componente, para as superfícies cobertas).

**Acceptance Scenarios**:

1. **Given** a aplicação no locale padrão, **When** o usuário vê a tela de login e o shell, **Then** os textos principais estão em português (pt-BR).
2. **Given** as superfícies do presetup (login, erros de autenticação, header, sidebar, boas-vindas), **When** um revisor ou teste inspeciona a origem das mensagens, **Then** elas são resolvidas via mecanismo de i18n (sem novas strings de UI hard-coded nessas superfícies).
3. **Given** somente pt-BR está no escopo, **When** a aplicação sobe, **Then** não há exigência de seletor de idioma nem de locale alternativo funcional.

---

### User Story 4 - Preparar ambiente de teste de ponta a ponta com um fluxo único (Priority: P2)

Um desenvolvedor novo no projeto (ou CI) segue um fluxo documentado “preparar → popular → testar” e consegue obter o mesmo resultado em máquinas diferentes.

**Why this priority**: Amplifica o valor das stories P1, mas depende do seed, da suíte e do i18n já existirem.

**Independent Test**: Seguir apenas o guia de quickstart da feature e verificar que seed + suíte passam sem conhecimento prévio do código.

**Acceptance Scenarios**:

1. **Given** um repositório clonado com dependências instaladas, **When** o desenvolvedor segue os passos documentados de preparação do banco e seed, **Then** obtém um ambiente utilizável para login manual e para a suíte automatizada.
2. **Given** o ambiente preparado, **When** a suíte automatizada é executada, **Then** os testes usam as mesmas fixtures documentadas (sem inventar credenciais ad hoc não versionadas).
3. **Given** a documentação da feature, **When** alguém precisa recriar o estado de teste, **Then** encontra o comando de seed, as credenciais e o comando da suíte em um único lugar de referência (README ou quickstart da feature).

---

### Edge Cases

- Seed executado com banco ainda sem migrações: o fluxo documentado indica a ordem correta (migrar antes de popular) e falha de forma compreensível se a ordem for invertida.
- Credenciais de seed alteradas localmente e depois o seed reexecutado: o seed restaura as senhas/dados documentados das fixtures gerenciadas.
- Fixture de usuário sem vínculo de empresa (se incluída): login/autenticação não concede área interna utilizável e o comportamento esperado fica coberto por cenário de teste (ou documentado como validação manual se fora da suíte P1).
- Suíte rodando sem seed prévio: falha de forma clara por ausência de dados esperados, não por erro obscuro sem mensagem.
- Execução repetida da suíte no mesmo ambiente: resultados estáveis (sem dependência de estado residual de sessão/navegação de uma execução anterior que cause flaky).
- Porta/serviço da aplicação indisponível no momento do teste: a suíte falha com indicação de ambiente não disponível, não como “bug de produto” ambíguo.
- Chave de mensagem i18n ausente: a UI não deve exibir identificadores crus de chave ao usuário final; comportamento de fallback deve permanecer compreensível em pt-BR ou falhar de forma detectável no desenvolvimento/teste.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer um procedimento de seed que popula o banco com um conjunto documentado e reutilizável de dados de desenvolvimento/teste.
- **FR-002**: O seed MUST ser idempotente: reexecutar não cria duplicatas indesejadas das fixtures gerenciadas e deixa o estado alinhado à documentação.
- **FR-003**: O seed MUST incluir pelo menos um usuário admin de demonstração vinculado a uma empresa demo, com credenciais documentadas, capaz de concluir o fluxo feliz de login até o shell.
- **FR-004**: O seed MUST incluir dados suficientes para exercitar o modelo multiempresa no nível de dados (pelo menos duas empresas distintas), mesmo que o login do presetup não ofereça troca de empresa.
- **FR-005**: O seed MUST incluir pelo menos um usuário adequado a um cenário de falha ou borda útil para teste (ex.: usuário sem vínculo de empresa, ou segundo usuário válido em outra empresa), com propósito documentado.
- **FR-006**: Todas as credenciais e propósitos das fixtures de seed MUST estar documentados em português (pt-BR) de forma acessível no projeto.
- **FR-007**: O projeto MUST fornecer uma suíte de testes automatizados que cubra os fluxos críticos do presetup de login e shell: login válido, login inválido, redirecionamento de área interna sem sessão, logout e verificação de shell (header + barra lateral) após login.
- **FR-008**: A suíte MUST consumir as fixtures do seed (credenciais/dados conhecidos), sem depender de cadastro manual via interface.
- **FR-009**: Deve existir um único comando documentado para executar a suíte automatizada após o ambiente estar preparado.
- **FR-010**: Cada cenário crítico da suíte MUST produzir resultado pass/fail interpretável (sucesso explícito ou falha com falha localizável ao fluxo testado).
- **FR-011**: A documentação MUST descrever o fluxo “migrar → seed → (opcional) subir app → rodar testes” de ponta a ponta.
- **FR-012**: A suíte MUST ser projetada para execução local estável; resultados não podem depender de timing flaky sob condições normais de máquina de desenvolvimento.
- **FR-013**: Alterações nesta feature NÃO DEVEM mudar o comportamento de negócio do login/shell além do necessário para tornar o sistema testável e internacionalizado (ex.: dados de seed, origem das mensagens); regressões de produto ficam cobertas pelos próprios testes.
- **FR-014**: Textos voltados ao usuário nas superfícies do presetup (login, erros de autenticação, header, sidebar, conteúdo inicial) MUST ser fornecidos via mecanismo de i18n.
- **FR-015**: O único locale obrigatório no escopo desta feature é `pt-BR`; o sistema MUST NÃO exigir seletor de idioma nem locale alternativo funcional.
- **FR-016**: Novas strings de UI nessas superfícies MUST NÃO ser introducidas como literais hard-coded fora do catálogo/pacote de i18n.

### Key Entities

- **Fixture de seed**: Registro intencional de Empresa, Usuário e/ou Vínculo criado pelo seed para suporte a desenvolvimento e testes; possui propósito documentado e credenciais quando aplicável.
- **Conjunto de seed**: Coleção versionada e idempotente das fixtures; fonte da verdade para credenciais de demo/teste.
- **Cenário automatizado**: Verificação repetível de um fluxo crítico (login, proteção de rota, logout, shell); consome fixtures e reporta pass/fail.
- **Suíte de testes**: Conjunto dos cenários automatizados executável por comando único documentado.
- **Mensagem i18n**: Texto voltado ao usuário identificado por chave e resolvido para o locale ativo (`pt-BR`); fonte das cópias de UI do presetup.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em ambiente limpo, um desenvolvedor completa migração + seed e obtém login manual com a fixture admin em menos de 5 minutos seguindo apenas a documentação.
- **SC-002**: 100% das fixtures documentadas do seed existem e comportam-se conforme o propósito descrito após uma execução (e após uma reexecução idempotente).
- **SC-003**: A suíte automatizada cobre 100% dos fluxos críticos listados em FR-007 e todos passam em ambiente preparado com seed.
- **SC-004**: Um desenvolvedor consegue iniciar a suíte com um único comando documentado, sem passos ad hoc não documentados.
- **SC-005**: Em 3 execuções consecutivas da suíte no mesmo ambiente preparado, o resultado é estável (sem falhas intermitentes atribuíveis a estado residual).
- **SC-006**: Um novo desenvolvedor, seguindo apenas o quickstart/README da feature, prepara o ambiente e obtém suíte verde na primeira tentativa em condições normais.
- **SC-007**: Credenciais e propósitos de cada fixture de seed estão localizáveis em documentação do repositório sem inspecionar código-fonte.
- **SC-008**: Em revisão das superfícies do presetup, 100% dos textos principais voltados ao usuário estão em pt-BR e rastreados ao mecanismo de i18n (sem literais de UI soltos nas superfícies cobertas).

## Assumptions

- O escopo dos testes automatizados desta feature é o presetup já especificado em `001-erp-login-shell` (login, shell, proteção de rotas e logout); módulos futuros de ERP ficam fora.
- O seed atual mínimo (empresa demo + admin) será mantido e enriquecido, não substituído por um modelo incompatível; credenciais públicas de demo existentes podem ser preservadas ou alinhadas na documentação se mudarem.
- Idioma da documentação e mensagens voltadas ao time permanece pt-BR.
- Integração obrigatória com CI (GitHub Actions etc.) não é exigência P1 desta feature; a suíte deve ser executável localmente e estar pronta para ser acoplada a CI em passo futuro.
- Testes unitários isolados de helpers são opcionais; o entregável obrigatório é a cobertura automatizada dos fluxos críticos de ponta a ponta descritos acima.
- Não faz parte do escopo: cadastro público, recuperação de senha, MFA, autorização por papéis além do necessário nas fixtures, expansão de UI de produto, nem locales além de pt-BR.
- Ambiente de teste usa o mesmo modelo de dados do desenvolvimento local (empresa, usuário, membership/sessão) já adotado pelo presetup.
- “Alimentar o seed” significa enriquecer e documentar fixtures suficientes para os cenários; não significa inventar dados de domínio de negócio (financeiro, estoque etc.).
- Esta feature adota a Constitution ErpModular v1.0.0 (testes, seed quando necessário, i18n com pt-BR).
