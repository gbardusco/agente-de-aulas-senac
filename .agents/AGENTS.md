---
aliases: [Regras, Regras do Projeto]
tags: [agents, config, rules]
created: 2026-07-14
updated: 2026-07-31
version: "2.1"
---

# Regras do Projeto — Material Didático

## Contexto

Este workspace contém material didático para uma Unidade Curricular. As informações específicas da turma (curso, período, perfil dos alunos, temas e estrutura do curso) estão em [[perfil-turma|`.memory/perfil-turma.md`]]. **Consulte esse arquivo** para entender o contexto antes de agir.

## Regra 1 — Consultar a memória antes de agir

Antes de criar, editar ou sugerir qualquer alteração neste projeto, **leia os seguintes arquivos**:

- [[status-aulas|`.memory/status-aulas.md`]] — estado atual de cada aula (criada, revisada, aplicada).
- [[decisoes|`.memory/decisoes.md`]] — decisões pedagógicas e técnicas já tomadas. **Não contradiga decisões registradas** sem pedir confirmação ao professor.
- [[feedback-aulas|`.memory/feedback-aulas.md`]] — feedback real do professor após cada aula aplicada.
- [[perfil-turma|`.memory/perfil-turma.md`]] — perfil da turma, ritmo e observações.
- [[padroes-tecnicos|`.memory/padroes-tecnicos.md`]] — padrões de código, CSS e convenções do projeto.

### Se um arquivo de memória não existir

Se qualquer arquivo listado acima não existir, **não prossiga**. Em vez disso:

1. Verifique se há um template correspondente em `_templates/`.
2. Se houver, **crie o arquivo a partir do template**.
3. Se não houver, **avise o professor** que o arquivo está faltando e aguarde instruções.

## Regra 2 — Atualizar a memória após agir

Após qualquer alteração significativa no material, **atualize os arquivos de memória relevantes**:

- Adicionou/alterou uma aula? → Atualize [[status-aulas|`status-aulas.md`]].
- Tomou uma decisão de design? → Registre em [[decisoes|`decisoes.md`]] com data e justificativa.
- Recebeu feedback do professor? → Registre em [[feedback-aulas|`feedback-aulas.md`]].
- Mudou algo na turma? → Atualize [[perfil-turma|`perfil-turma.md`]].

### Regra 2b — Checkpoint de memória obrigatório

Ao final de cada tarefa, **todo agente deve emitir um bloco MEMORY-CHECKPOINT** declarando quais arquivos de memória devem ser atualizados. O formato é:

```
<!-- MEMORY-CHECKPOINT -->
- arquivo: status-aulas.md
  acao: atualizar
  entrada: |
    | Aula 05 | Criada | 2026-08-01 |
- arquivo: decisoes.md
  acao: adicionar
  entrada: |
    - DEC-005 (2026-08-01): descrição da decisão
<!-- /MEMORY-CHECKPOINT -->
```

O orquestrador (ou qualquer harness) processa esses blocos e atualiza os arquivos de memória automaticamente. Não é necessário invocar `@[agente-gestor-de-memoria]` explicitamente para isso.

## Regra 3 — Padrões de código são invioláveis

- Todo código exibido aos alunos deve ter **identação perfeita com 4 espaços**.
- Slides devem **caber em uma tela** (100vh). Se não cabe, divida em dois slides.
- Exercícios exigem **produção autônoma** — nunca réplica da demo.
- **Contexto temático** da turma deve estar presente em todo conteúdo — consulte [[perfil-turma|`perfil-turma.md`]] para os temas.
- **Sequência pedagógica** — slides de conceito seguem: situação-problema contextualizada (mundo real, fácil entendimento) → formalização do conceito → exemplo na prática.
- **Atividades complementares** (seminário, pesquisa, aula invertida, etc.) são **opcionais e contextuais** — a lista de exercícios é o único item obrigatório por aula.
- Consulte [[padroes-tecnicos|`padroes-tecnicos.md`]] para templates e classes CSS.

### Regra 3b — Skills adotáveis

Cada agente adota skills relevantes listadas em seu frontmatter (`skills:`). Skills são definições reutilizáveis de capacidades (CSS layout, markdown authoring, accessibility check, code formatting, HTML templates) armazenadas em `.skills/`. Ao adotar uma skill, o agente deve seguir suas instruções.

Skills disponíveis estão em `.skills/` e são compartilhadas entre todos os projetos.

## Regra 4 — Agentes especializados

Ao receber um prompt que mencione `@[agente-...]`, leia o arquivo do agente e **assuma o papel descrito nele**. Os agentes disponíveis estão em [[Agentes|`.agents/`]]:

| Agente | Quando usar |
|--------|-------------|
| `@[agente-orquestrador]` | Analisar tarefa e delegar ao agente correto |
| `@[agente-planejador-didatico]` | Planejar, criar ou ajustar conteúdo de aulas |
| `@[agente-diario-de-classe]` | Redigir textos para o Diário de Classe |
| `@[agente-revisor-de-material]` | Revisar qualidade, acessibilidade e consistência dos materiais |
| `@[agente-gerador-de-exercicios]` | Criar listas de exercícios com progressão e gabaritos |
| `@[agente-gestor-de-memoria]` | Arquivar feedbacks rápidos, organizar decisões e atualizar status |
| `@[agente-setup-inicial]` | Configurar um novo projeto a partir dos templates |
| `@[agente-checklist-pos-aula]` | Verificar se tudo foi registrado após cada aula |
| `@[agente-exportador]` | Gerar materiais para compartilhamento/impressão |

### Fallback: agente orquestrador

**Se nenhum agente específico for invocado**, acione o [[orquestrador|`agente-orquestrador`]] para que ele analise a tarefa e delegue ao(s) agente(s) correto(s). O orquestrador é o ponto de entrada padrão para qualquer pedido que não especifique um agente.

## Regra 5 — Documentos de referência

- `.docs/` — Plano de Curso oficial e calendário acadêmico.
- [[Aulas|`AULAS/index.md`]] — Índice geral das aulas.
- [[sintese-diario-classe|`AULAS/sintese_diario_classe.md`]] — Mapeamento de indicadores por aula.

## Regra 6 — Conflitos e resolução

Se uma nova informação contradiz uma decisão registrada em `decisoes.md`:

1. **Não apague** a decisão antiga.
2. **Registre** a nova decisão como `DEC-XXX` com status `superseded`.
3. **Referencie** a decisão que está sendo substituída (ex: "Substitui DEC-002").
4. **Avise o professor** sobre o conflito antes de tomar qualquer ação.

## Regra 7 — Contexto agentico

Após concluir uma tarefa, todo agente deve registrar um **contexto** em `.context/` descrevendo o que foi feito, o que foi descoberto e o que fica pendente. Isso permite que qualquer agente ou harness posterior acesse o histórico de trabalho sem precisar re-executar tarefas.

### Formato do contexto

Cada entrada é um arquivo em `.context/` seguindo o template `.context/agente-template.md`. O índice de todas as entradas está em `.context/index.md`.

### Obrigatoriedade

O registro de contexto é obrigatório após cada tarefa concluída. Não é opcional.

## Estrutura do projeto

```
NOME-DO-PROJETO/
├── .agents/           # Agentes e regras (este arquivo)
│   ├── AGENTS.md      # ← Regras globais (lidas automaticamente)
│   └── agente-*.md    # Agentes especializados
├── .context/           # Contexto agentico (gitignored)
│   ├── index.md
│   └── agente-*.md
├── .docs/             # Documentos oficiais
├── .memory/           # Memória persistente do projeto
│   ├── decisoes.md
│   ├── feedback-aulas.md
│   ├── status-aulas.md
│   ├── perfil-turma.md
│   ├── padroes-tecnicos.md
│   └── index.md
├── .skills/            # Skills compartilhadas entre projetos
│   ├── css-layout.md
│   ├── markdown-authoring.md
│   ├── accessibility-check.md
│   ├── code-formatting.md
│   ├── html-template.md
│   └── atividades-complementares.md
├── 00-MOC/            # Mapas de Conteúdo (Obsidian)
│   ├── Home.md
│   ├── Agentes.md
│   ├── Aulas.md
│   └── Memoria.md
├── _templates/        # Templates reutilizáveis
│   ├── perfil-turma-template.md
│   ├── decisoes-template.md
│   ├── feedback-aulas-template.md
│   ├── status-aulas-template.md
│   ├── feedback-aluno-template.md
│   ├── glossario-template.md
│   ├── aula-index-template.md
│   ├── sintese-diario-classe-template.md
│   ├── slides-template.html
│   ├── exercicios-template.html
│   ├── demo-template.html
│   └── README.md
└── AULAS/             # Material didático
    ├── assets/        # CSS e JS compartilhados
    ├── index.md       # Índice geral
    └── aula-XX/       # Uma pasta por aula
```
