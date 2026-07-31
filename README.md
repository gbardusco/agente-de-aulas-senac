# Material Didático — Agentes de IA

Repositório base para criação de material didático com apoio de agentes de IA.  
Funciona como **Vault do Obsidian** e como **workspace para agentes** (opencode, harness, etc).

---

## ⚠️ Privacidade

Este repositório é **público**. NÃO faça commit de dados sensíveis.

### O que NUNCA deve subir ao GitHub

| Arquivo/Pasta | Por quê |
|---------------|---------|
| `.memory/perfil-turma.md` | Nome da instituição, turma, horários, observações sobre alunos |
| `.memory/decisoes.md` | Decisões internas do projeto pedagógico |
| `.memory/feedback-aulas.md` | Feedback do professor, possíveis menções a alunos |
| `.memory/feedback-aluno.md` | Feedback individual com dados de alunos |
| `.memory/status-aulas.md` | Status interno das aulas |
| `.docs/` | Documentos oficiais da instituição (PDFs, planilhas) |
| `AULAS/` | Material didático com conteúdo específico da turma |

### O que PODE subir ao GitHub

| Arquivo/Pasta | Por quê |
|---------------|---------|
| `.agents/*.md` | Agentes genéricos, sem dados de turma |
| `.memory/padroes-tecnicos.md` | Padrões de código reutilizáveis |
| `.memory/index.md` | Índice genérico |
| `00-MOC/*.md` | Mapas de conteúdo genéricos |
| `_templates/*` | Templates para novas turmas |
| `.gitignore` | Configuração de ignore |
| `README.md` | Este arquivo |

### Como funciona na prática

O `.gitignore` já está configurado para bloquear os arquivos sensíveis.  
Se você precisa versionar o material específico de uma turma, crie um **repositório privado** para ela.

---

## Como Usar

### 1. Copie este repositório

```bash
git clone https://github.com/gbardusco/agente-de-aulas-senac.git ~/meu-novo-curso
cd ~/meu-novo-curso
rm -rf .git && git init
```

Ou execute o script de setup automatizado:

```bash
./setup.sh "Nome do Projeto"
```

### 2. Configure a turma

```bash
cp _templates/perfil-turma-template.md .memory/perfil-turma.md
```

Edite `.memory/perfil-turma.md` com os dados da nova turma.

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

## Estrutura

```
├── .agents/              # Agentes de IA (genéricos)
│   ├── AGENTS.md         # Regras globais
│   └── agente-*.md       # Agentes especializados
├── .memory/              # Memória do projeto
│   ├── padroes-tecnicos.md  # ✅ Reutilizável (sobe ao GitHub)
│   └── (perfil-turma.md)    # ❌ Criado por você (NÃO sobe)
├── .docs/                # ❌ Documentos oficiais (NÃO sobe)
├── 00-MOC/               # ✅ Mapas de Conteúdo genéricos
├── _templates/           # ✅ Templates para novas turmas
│   ├── *.md              # Templates de memória e material
│   └── *.html            # Templates HTML (slides, exercícios, demo)
├── AULAS/                # ❌ Material didático (NÃO sobe)
├── setup.sh              # ✅ Script de setup automatizado
├── verificar-integridade.sh  # ✅ Script de verificação
└── .obsidian/            # Config do Obsidian (gitignored)
```

---

## Checklist ao Criar Nova Turma

- [ ] Copiar `_templates/perfil-turma-template.md` → `.memory/perfil-turma.md`
- [ ] Preencher dados da turma (instituição, período, temas, etc.)
- [ ] Copiar `_templates/decisoes-template.md` → `.memory/decisoes.md`
- [ ] Copiar `_templates/feedback-aulas-template.md` → `.memory/feedback-aulas.md`
- [ ] Copiar `_templates/status-aulas-template.md` → `.memory/status-aulas.md`
- [ ] Copiar `_templates/feedback-aluno-template.md` → `.memory/feedback-aluno.md`
- [ ] Copiar `_templates/sintese-diario-classe-template.md` → `AULAS/sintese_diario_classe.md`
- [ ] Ajustar número de aulas em `status-aulas.md` se necessário
- [ ] Manter `.memory/padroes-tecnicos.md` (reutilizável)
- [ ] Verificar `.agents/AGENTS.md` — caminhos estão corretos?
- [ ] Criar `.docs/` com documentos oficiais
- [ ] Criar `AULAS/` com estrutura de pastas
- [ ] Abrir no Obsidian e verificar graph view
- [ ] **NÃO** fazer commit dos arquivos `.memory/` (exceto `padroes-tecnicos.md` e `index.md`)
- [ ] Criar repositório **privado** se quiser versionar o material da turma
