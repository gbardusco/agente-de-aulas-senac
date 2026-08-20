# Material Didático — Agentes de IA

Repositório base para criação de material didático com apoio de agentes de IA.  
Funciona como **Vault do Obsidian** e como **workspace para agentes** (opencode, harness, etc).

> [!warning] Atenção: repositório público
> Este repositório manipula **dados sensíveis de alunos** (perfis, feedbacks, decisões). Leia a seção [Privacidade](#privacidade) antes do seu **primeiro commit**.

---

## Como Usar

### 1. Copie este repositório

```bash
git clone https://github.com/gbardusco/agente-de-aulas-senac.git ~/meu-novo-curso
cd ~/meu-novo-curso
```

Se quiser começar com um histórico git novo (sem o histórico original):

```bash
rm -rf .git && git init
```

### 2. Configure a turma — automatizado

Rode o script de setup. Ele **copia todos os templates** e monta a estrutura completa de arquivos e pastas para você:

```bash
./setup.sh "Nome do Projeto"
```

O script cria os arquivos de memória (`.memory/perfil-turma.md`, `decisoes.md`, `feedback-aulas.md`, `status-aulas.md`, `feedback-aluno.md`), o índice de aulas, a síntese do diário de classe e os assets de apoio.

Depois é só cuidar das **decisões pedagógicas** — preencha `.memory/perfil-turma.md` com os dados da turma (instituição, período, contexto temático) e ajuste o número de aulas em `.memory/status-aulas.md`.

### 3. Abra no Obsidian

Abra a pasta como vault no Obsidian. Navegue pelo `00-MOC/Home.md`.

### 4. Use os agentes

No opencode, invoque os agentes via `@[nome-do-agente]`:

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

Ao terminar, o agente emite um bloco `MEMORY-CHECKPOINT`. O harness/orquestrador processa e atualiza a memória **automaticamente** — sem invocar o gestor de memória:

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

- **Contexto agentico** — cada agente registra uma entrada em `.context/` após executar tarefas (Regra 7 do `AGENTS.md`), permitindo que qualquer agente ou harness posterior acesse o histórico de trabalho. Veja o fluxo completo no [cenário de uso guiado](#cenário-de-uso-guiado).
- **Checkpoint de memória** — agentes emitem blocos `MEMORY-CHECKPOINT` ao final de cada tarefa; o orquestrador processa e atualiza a memória automaticamente, sem invocar o gestor de memória explicitamente.
- **Skills** — capacidades reutilizáveis (CSS layout, markdown authoring, accessibility check, code formatting, HTML templates, atividades complementares) definidas em `.skills/` e adotadas pelos agentes.

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
│   └── *.html            # Templates HTML (slides, exercícios, demo)
├── exemplos/             # ✅ Prompts prontos para testar os agentes
├── AULAS/                # ❌ Material didático (NÃO sobe)
├── setup.sh              # ✅ Script de setup automatizado
├── verificar-integridade.sh  # ✅ Script de verificação
└── .obsidian/            # Config do Obsidian (gitignored)
```

---

## Privacidade

Este repositório é **público**. NÃO faça commit de dados sensíveis.

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

- [ ] Rodar `./setup.sh "Nome do Projeto"` — copia templates e monta a estrutura
- [ ] Preencher `.memory/perfil-turma.md` (instituição, período, contexto temático)
- [ ] Ajustar número de aulas em `.memory/status-aulas.md` se necessário
- [ ] Manter `.memory/padroes-tecnicos.md` (reutilizável)
- [ ] Verificar `.agents/AGENTS.md` — caminhos estão corretos?
- [ ] Criar `.docs/` com documentos oficiais
- [ ] Abrir no Obsidian e verificar graph view
- [ ] **NÃO** fazer commit dos arquivos `.memory/` (exceto `padroes-tecnicos.md` e `index.md`)
- [ ] Criar repositório **privado** se quiser versionar o material da turma
