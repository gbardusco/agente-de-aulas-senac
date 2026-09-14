# Material Didático — Agentes de IA

Repositório base para criação de material didático com apoio de agentes de IA.  
Funciona como **Vault do Obsidian** e como **workspace para agentes** (opencode, harness, etc).

> [!warning] Atenção: repositório público
> Este repositório manipula **dados sensíveis de alunos** (perfis, feedbacks, decisões). Leia a seção [Privacidade](#privacidade) antes do seu **primeiro commit**.

> 🚀 **Comece em três ações:** obter/abrir a pasta, preparar e conversar. [Guia rápido e instalações](ONBOARDING.md).

---

## Como Usar

### 1. Copie este repositório

```bash
git clone https://github.com/gbardusco/agente-de-aulas-senac.git ~/meu-novo-curso
cd ~/meu-novo-curso
```

### 2. Prepare a pasta

Com Node.js 20+ e npm instalados, rode no Terminal (Linux/macOS) ou Git Bash (Windows). O comando verifica pré-requisitos, instala dependências e prepara a estrutura:

```bash
bash preparar.sh "Nome do Projeto"
```

O script cria os arquivos de memória (`.memory/perfil-turma.md`, `decisoes.md`, `feedback-aulas.md`, `status-aulas.md`, `feedback-aluno.md`), o índice de aulas, a síntese do diário de classe e os assets CSS/JS funcionais. Também prepara a biblioteca privada `.docs/materiais-consulta/index.md` e `AULAS/registros-docentes/`. Preserva arquivos existentes e não inicializa Git nem faz commit.

### 3. Converse com o assistente

Abra a pasta no OpenCode ou outro assistente com acesso aos arquivos. Configure seu provedor de IA (pode haver cobrança; veja [onboarding](ONBOARDING.md)). Cole:

```text
Leia .agents/AGENTS.md e .agents/agente-setup-inicial.md.
Ajude-me a cadastrar a turma e criar a primeira aula sobre [tema].
```

`.agents/` contém contratos genéricos, não agentes registrados nativamente no OpenCode.
Nos prompts abaixo, `@[nome]` indica o papel: peça a leitura do arquivo correspondente.
Obsidian é opcional; abra a pasta como vault e navegue por `00-MOC/Home.md`.

| Agente | Uso |
|--------|-----|
| `@[agente-orquestrador]` | Analisar tarefa e delegar ao agente correto |
| `@[agente-planejador-didatico]` | Criar/ajustar conteúdo de aulas |
| `@[agente-revisor-de-material]` | Revisar qualidade e consistência |
| `@[agente-diario-de-classe]` | Gerar textos para diário de classe |
| `@[agente-gerador-de-exercicios]` | Criar exercícios e gabaritos |
| `@[agente-gestor-de-memoria]` | Documentar feedbacks e decisões |
| `@[agente-setup-inicial]` | Configurar novo projeto a partir dos templates |
| `@[agente-checklist-pos-aula]` | Verificar registros após cada aula |
| `@[agente-exportador]` | Gerar materiais para compartilhamento/impressão |

---

## Cenário de Uso Guiado

Veja como os agentes trabalham **em cadeia** — um prepara, outro revisa, outro registra — para preparar uma aula do início ao fim.

### Passo 1 — Orquestre

Peça o plano completo ao orquestrador. Ele identifica a tarefa e delega ao agente certo:

```
@[agente-orquestrador] Vou aplicar amanhã a aula 3 sobre Tabelas HTML. Preciso preparar todo o material.
```

O orquestrador aciona `@[agente-planejador-didatico]`, que lê o perfil da turma e gera slides, demo e exercícios em `AULAS/aula-03/`.

### Passo 2 — Acompanhe o checkpoint de memória

Ao terminar, o agente emite um bloco `MEMORY-CHECKPOINT`. O agente que coordena a tarefa deve aplicar as entradas e confirmar os arquivos atualizados; o bloco sozinho não executa gravações:

```
<!-- MEMORY-CHECKPOINT -->
- arquivo: status-aulas.md
  acao: atualizar
  entrada: |
    | Aula 03 | Criada | 2026-08-20 |
<!-- /MEMORY-CHECKPOINT -->
```

Além disso, cada agente registra uma entrada em `.context/` (contexto agentico) descrevendo o que fez, o que descobriu e o que fica pendente.

### Passo 3 — Encadeie a próxima tarefa

O contexto registrado no passo 2 já está disponível. Gere exercícios a partir dele:

```
@[agente-gerador-de-exercicios] A aula 3 foi criada (consulte .context/). Gere exercícios extras cobrindo apenas os conceitos já ensinados.
```

O gerador lê o contexto e o material existente para não repetir conteúdo nem pedir coisas que a aula ainda não viu.

### Passo 4 — Revise

Antes de aplicar, valide a qualidade:

```
@[agente-revisor-de-material] Revise os slides e exercícios da aula 3: identação, progressão pedagógica e contexto temático.
```

### Passo 5 — Feche o ciclo pós-aula

Depois de aplicar a aula, feche o ciclo:

```
@[agente-checklist-pos-aula] Apliquei a aula 3 hoje.
```

O checklist confere se tudo foi registrado e, se necessário, aciona o `@[agente-diario-de-classe]` para a documentação formal.

> 💡 Quer mais prompts prontos para cada agente? Veja os **exemplos práticos** em [`exemplos/`](exemplos/README.md).

---

## Novidades

- **Avaliação configurável:** rubrica de atividade com critérios, escala, descritores/pesos e formato de feedback aprovados pelo professor, sem evidências ou resultados inventados.
- **Diário HTML privado:** `AULAS/registros-docentes/aula-XX/relatorio.html`, campos editáveis, cópia de texto puro por campo, status acessível, seleção manual em caso de falha, mobile e impressão. Os textos podem ser exportados/importados em JSON; o salvamento local é opcional e desativado por padrão.
- **Slides HTML + PPTX editável:** fonte JSON validada, renderização HTML navegável e PowerPoint com texto/formas nativos via PptxGenJS. Instale Node.js 20+ e execute `npm ci`, depois `npm run slides -- <slides.json> <pasta-de-saida>`.
- **Guia completo:** [avaliação, referências oficiais, comandos, testes e limitações](exemplos/avaliacao-e-exportacao.md).

- **Contexto agentico** — cada agente registra uma entrada em `.context/` após executar tarefas (Regra 7 do `AGENTS.md`), permitindo que qualquer agente ou harness posterior acesse o histórico de trabalho. Veja o fluxo completo no [cenário de uso guiado](#cenário-de-uso-guiado).
- **Checkpoint de memória** — agentes emitem blocos `MEMORY-CHECKPOINT` ao final de cada tarefa; o agente coordenador aplica as entradas nos arquivos.
- **Skills** — capacidades reutilizáveis (CSS layout, markdown authoring, accessibility check, code formatting, HTML templates, atividades complementares) definidas em `.skills/` e adotadas pelos agentes.

---

## Operação auditável

```bash
npm ci
npm run relatorio -- gerar --aula aula-03 --valores AULAS/registros-docentes/aula-03/redacao.json
npm run aula:estado -- preparar --aula aula-03 --publicos slides.html,index.md
npm run pacote:alunos -- --aula aula-03 --saida /tmp/opencode/aula-03.zip
npm run verificar -- --aula aula-03 --modo distribuicao
npm run demo:fluxo -- --saida /tmp/opencode/demo-fluxo
```

Aprovação, pacote e aplicação exigem validação explícita do professor. A verificação técnica não substitui a aprovação pedagógica.

`redacao.json` é escrito pelo agente diário a partir do relato livre, aula, rubrica e registro anterior.
O gerador valida e renderiza; não chama IA nem produz frases automáticas. Sem texto, recusa a geração.
Para criar deliberadamente um formulário vazio: `npm run relatorio -- gerar --aula aula-03 --modelo`.
Textos finais aparecem primeiro; pendências, evidências e histórico têm espaços próprios.
Slides v1/v2 recebem capa automática com `title` e `subtitle` opcional; `disciplina`, `professor` e `data` só aparecem quando fornecidos.

---

## Estrutura

```
├── .agents/              # Agentes de IA (genéricos)
│   ├── AGENTS.md         # Regras globais
│   └── agente-*.md       # Agentes especializados
├── .context/             # Contexto agentico (gerado dinamicamente)
│   ├── index.md          # ✅ Índice (rastreado)
│   ├── agente-template.md  # ✅ Template (rastreado)
│   └── agente-*.md       # ❌ Entradas geradas (NÃO sobem)
├── .docs/                # ❌ Documentos oficiais (NÃO sobe)
├── .memory/              # Memória do projeto
│   ├── padroes-tecnicos.md  # ✅ Reutilizável (sobe ao GitHub)
│   ├── index.md          # ✅ Índice genérico (sobe ao GitHub)
│   └── (perfil-turma.md)    # ❌ Criado por você (NÃO sobe)
├── .skills/              # Skills compartilhadas entre projetos
│   ├── css-layout.md
│   ├── markdown-authoring.md
│   ├── accessibility-check.md
│   ├── code-formatting.md
│   ├── html-template.md
│   └── atividades-complementares.md
├── 00-MOC/               # ✅ Mapas de Conteúdo genéricos
├── _templates/           # ✅ Templates para novas turmas
│   ├── *.md              # Templates de memória e material
│   ├── *.json            # Schemas, fontes e configurações
│   └── *.html            # Templates HTML (slides, exercícios, demo)
├── exemplos/             # ✅ Prompts e demonstração fictícia
├── scripts/              # ✅ Pipeline, relatórios, aprovação, pacote e verificação
├── tests/                # ✅ Testes Node e de navegador
├── .github/              # ✅ CI e Dependabot
├── AULAS/                # ❌ Material didático (NÃO sobe)
├── saidas/               # ❌ Pacotes e demonstrações locais (NÃO sobem)
├── setup.sh              # ✅ Script de setup automatizado
├── verificar-integridade.sh  # ✅ Script de verificação
└── .obsidian/            # Config do Obsidian (gitignored)
```

---

## Privacidade

Este repositório é **público**. NÃO faça commit de dados sensíveis.

Pacotes para alunos devem excluir explicitamente `AULAS/registros-docentes/`, `.docs/`,
`.memory/`, `.context/`, diário/síntese e feedbacks individuais. Nunca compacte `AULAS/`
inteira: use lista de arquivos públicos revisados. `.gitignore` não filtra exportações.
Rubricas públicas contêm somente critérios/descritores, não resultados individuais.

### O que NUNCA deve subir ao GitHub

| Arquivo/Pasta | Por quê |
|---------------|---------|
| `.memory/perfil-turma.md` | Nome da instituição, turma, horários, observações sobre alunos |
| `.memory/decisoes.md` | Decisões internas do projeto pedagógico |
| `.memory/feedback-aulas.md` | Feedback do professor, possíveis menções a alunos |
| `.memory/feedback-aluno.md` | Feedback individual com dados de alunos |
| `.memory/status-aulas.md` | Status interno das aulas |
| `.context/agente-*.md` | Entradas de contexto geradas (podem citar dados da turma) |
| `.docs/` | Documentos oficiais da instituição (PDFs, planilhas) |
| `AULAS/` | Material didático com conteúdo específico da turma |

### O que PODE subir ao GitHub

| Arquivo/Pasta | Por quê |
|---------------|---------|
| `.agents/*.md` | Agentes genéricos, sem dados de turma |
| `.skills/*.md` | Skills compartilhadas entre projetos |
| `.context/index.md` | Índice de contexto genérico |
| `.context/agente-template.md` | Template de contexto genérico |
| `.memory/padroes-tecnicos.md` | Padrões de código reutilizáveis |
| `.memory/index.md` | Índice genérico |
| `00-MOC/*.md` | Mapas de conteúdo genéricos |
| `_templates/*` | Templates para novas turmas |
| `exemplos/` | Exemplos práticos e prompts genéricos |
| `.gitignore` | Configuração de ignore |
| `README.md` | Este arquivo |
| `setup.sh` | Script de setup automatizado |
| `verificar-integridade.sh` | Script de verificação |

### Como funciona na prática

O `.gitignore` já está configurado para bloquear os arquivos sensíveis.  
Se você precisa versionar o material específico de uma turma, crie um **repositório privado** para ela.

---

## Checklist ao Criar Nova Turma

A parte braçal (copiar templates, montar pastas) já é feita pelo `./setup.sh`. Este checklist foca no que é **decisão pedagógica sua**:

- [ ] Rodar `bash preparar.sh "Nome do Projeto"` — verifica, instala dependências e monta a estrutura
- [ ] Preencher `.memory/perfil-turma.md` (instituição, período, contexto temático)
- [ ] Ajustar número de aulas em `.memory/status-aulas.md` se necessário
- [ ] Manter `.memory/padroes-tecnicos.md` (reutilizável)
- [ ] Verificar `.agents/AGENTS.md` — caminhos estão corretos?
- [ ] Criar `.docs/` com documentos oficiais
- [ ] Abrir no Obsidian e verificar graph view
- [ ] **NÃO** fazer commit dos arquivos `.memory/` (exceto `padroes-tecnicos.md` e `index.md`)
- [ ] Criar repositório **privado** se quiser versionar o material da turma
