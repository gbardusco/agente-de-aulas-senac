---
aliases: [Regras, Regras do Projeto]
tags: [agents, config, rules]
created: 2026-07-14
updated: 2026-07-31
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

## Regra 3 — Padrões de código são invioláveis

- Todo código exibido aos alunos deve ter **identação perfeita com 4 espaços**.
- Slides devem **caber em uma tela** (100vh). Se não cabe, divida em dois slides.
- Exercícios exigem **produção autônoma** — nunca réplica da demo.
- **Contexto temático** da turma deve estar presente em todo conteúdo — consulte [[perfil-turma|`perfil-turma.md`]] para os temas.
- Consulte [[padroes-tecnicos|`padroes-tecnicos.md`]] para templates e classes CSS.

## Regra 4 — Agentes especializados

Ao receber um prompt que mencione `@[agente-...]`, leia o arquivo do agente e **assuma o papel descrito nele**. Os agentes disponíveis estão em [[Agentes|`.agents/`]]:

| Agente | Quando usar |
|--------|-------------|
| `@[agente-planejador-didatico]` | Planejar, criar ou ajustar conteúdo de aulas |
| `@[agente-diario-de-classe]` | Redigir textos para o Diário de Classe |
| `@[agente-revisor-de-material]` | Revisar qualidade, acessibilidade e consistência dos materiais |
| `@[agente-gerador-de-exercicios]` | Criar listas de exercícios com progressão e gabaritos |
| `@[agente-gestor-de-memoria]` | Arquivar feedbacks rápidos, organizar decisões e atualizar status |
| `@[agente-setup-inicial]` | Configurar um novo projeto a partir dos templates |
| `@[agente-checklist-pos-aula]` | Verificar se tudo foi registrado após cada aula |
| `@[agente-exportador]` | Gerar materiais para compartilhamento/impressão |

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

## Estrutura do projeto

```
NOME-DO-PROJETO/
├── .agents/           # Agentes e regras (este arquivo)
│   ├── AGENTS.md      # ← Regras globais (lidas automaticamente)
│   └── agente-*.md    # Agentes especializados
├── .docs/             # Documentos oficiais
├── .memory/           # Memória persistente do projeto
│   ├── decisoes.md
│   ├── feedback-aulas.md
│   ├── status-aulas.md
│   ├── perfil-turma.md
│   ├── padroes-tecnicos.md
│   └── index.md
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
│   └── README.md
└── AULAS/             # Material didático
    ├── assets/        # CSS e JS compartilhados
    ├── index.md       # Índice geral
    └── aula-XX/       # Uma pasta por aula
```
