# Regras do Projeto — Material Didático

## Contexto

Este workspace contém material didático para uma Unidade Curricular do Senac SP. As informações específicas da turma (curso, período, perfil dos alunos, temas e estrutura do curso) estão em `.memory/perfil-turma.md`. **Consulte esse arquivo** para entender o contexto antes de agir.

## Regra 1 — Consultar a memória antes de agir

Antes de criar, editar ou sugerir qualquer alteração neste projeto, **leia os seguintes arquivos**:

- `.memory/status-aulas.md` — estado atual de cada aula (criada, revisada, aplicada).
- `.memory/decisoes.md` — decisões pedagógicas e técnicas já tomadas. **Não contradiga decisões registradas** sem pedir confirmação ao professor.
- `.memory/feedback-aulas.md` — feedback real do professor após cada aula aplicada.
- `.memory/perfil-turma.md` — perfil da turma, ritmo e observações.
- `.memory/padroes-tecnicos.md` — padrões de código, CSS e convenções do projeto.

## Regra 2 — Atualizar a memória após agir

Após qualquer alteração significativa no material, **atualize os arquivos de memória relevantes**:

- Adicionou/alterou uma aula? → Atualize `status-aulas.md`.
- Tomou uma decisão de design? → Registre em `decisoes.md` com data e justificativa.
- Recebeu feedback do professor? → Registre em `feedback-aulas.md`.
- Mudou algo na turma? → Atualize `perfil-turma.md`.

## Regra 3 — Padrões de código são invioláveis

- Todo código exibido aos alunos deve ter **identação perfeita com 4 espaços**.
- Slides devem **caber em uma tela** (100vh). Se não cabe, divida em dois slides.
- Exercícios exigem **produção autônoma** — nunca réplica da demo.
- **Contexto temático** da turma deve estar presente em todo conteúdo — consulte `.memory/perfil-turma.md` para os temas.
- Consulte `.memory/padroes-tecnicos.md` para templates e classes CSS.

## Regra 4 — Agentes especializados

Ao receber um prompt que mencione `@[agente-...]`, leia o arquivo do agente e **assuma o papel descrito nele**. Os agentes disponíveis estão em `.agents/`:

| Agente | Quando usar |
|--------|-------------|
| `agente-planejador-didatico.md` | Planejar, criar ou ajustar conteúdo de aulas |
| `agente-diario-de-classe.md` | Redigir textos para o Diário de Classe (Senac Solution) |
| `agente-revisor-de-material.md` | Revisar qualidade, acessibilidade e consistência dos materiais |
| `agente-gerador-de-exercicios.md` | Criar listas de exercícios com progressão e gabaritos |
| `agente-gestor-de-memoria.md` | Arquivar feedbacks rápidos, organizar decisões e atualizar status |

## Regra 5 — Documentos de referência

- `.docs/uc14 - iot.pdf` — Plano de Curso oficial com indicadores da UC14.
- `.docs/calendario_de_aulas.xlsx` — Calendário acadêmico com datas.
- `AULAS/index.md` — Índice geral das 15 aulas.
- `AULAS/sintese_diario_classe.md` — Mapeamento de indicadores por aula.

## Estrutura do projeto

```
UC14/
├── .agents/           # Agentes e regras (este arquivo)
│   ├── AGENTS.md      # ← Regras globais (lidas automaticamente)
│   └── agente-*.md    # Agentes especializados
├── .docs/             # Documentos oficiais
│   ├── index.md       # Índice dos documentos
│   ├── uc14 - iot.pdf
│   └── calendario_de_aulas.xlsx
├── .memory/           # Memória persistente do projeto
│   ├── index.md
│   ├── decisoes.md
│   ├── feedback-aulas.md
│   ├── status-aulas.md
│   ├── perfil-turma.md
│   └── padroes-tecnicos.md
└── AULAS/             # Material didático
    ├── assets/        # CSS e JS compartilhados
    ├── index.md       # Índice geral
    └── aula-XX/       # Uma pasta por aula
```
