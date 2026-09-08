# Onboarding — Primeiros passos para professores

Guia para sair do zero até a sua primeira aula gerada em cerca de 15 minutos.
Não é preciso saber programar: basta copiar e colar os comandos e prompts.

> [!warning] Única regra inegociável
> Este repositório é **público**. Nunca faça commit de dados de alunos
> (`AULAS/`, `.docs/`, perfil da turma, feedbacks). Detalhes em [Privacidade](README.md#privacidade).

---

## 1. O que é isso?

Um kit que combina **Obsidian** (para organizar o material) com **agentes de IA**
(para criar slides, exercícios, rubricas e textos de diário de classe).
Você descreve a aula; os agentes geram propostas que **você revisa e aprova**.

## 2. O que você precisa

| Ferramenta | Para quê | Obrigatória? |
|------------|----------|--------------|
| Git + terminal | Baixar e versionar o projeto | Sim |
| Node.js 20+ (`node --version`) | Gerar slides e rodar verificações | Sim |
| Obsidian | Navegar no material como wiki | Recomendado |
| opencode (ou outro harness de IA) | Conversar com os agentes via `@[nome]` | Sim |

## 3. Roteiro de 15 minutos

### Passo 1 — Baixar (2 min)

```bash
git clone https://github.com/gbardusco/agente-de-aulas-senac.git ~/meu-novo-curso
cd ~/meu-novo-curso
```

### Passo 2 — Montar a estrutura (2 min)

```bash
./setup.sh "Nome da Disciplina"
```

O script copia todos os modelos e monta as pastas. Ele **não** apaga nada que já existe
e **não** faz commit sozinho.

### Passo 3 — Ver o fluxo funcionando, sem dados reais (5 min)

Antes de cadastrar sua turma, rode a demonstração fictícia. Ela cria duas aulas
sintéticas (uma prática e uma teórica) numa pasta temporária isolada:

```bash
npm ci
npm run demo:fluxo -- --saida /tmp/opencode/demo-fluxo
```

Abra `/tmp/opencode/demo-fluxo` e veja: `slides.html`, `slides.pptx`, exercícios,
rubrica, relatório docente e o pacote ZIP para alunos. Nada disso vai para o Git.

### Passo 4 — Cadastrar sua turma (3 min)

1. Edite `.memory/perfil-turma.md` (instituição, período, contexto temático).
2. Ajuste o número de aulas em `.memory/status-aulas.md`.
3. (Opcional) Abra a pasta no Obsidian e navegue por `00-MOC/Home.md`.

### Passo 5 — Gerar sua primeira aula (3 min)

No opencode, cole este prompt e adapte o tema:

```
@[agente-orquestrador] Criar a aula 1 sobre [tema].
Turma: [curso/período]. Incluir slides, demo e exercícios.
```

O orquestrador delega ao planejador, que gera tudo em `AULAS/aula-01/`.
Depois peça a revisão:

```
@[agente-revisor-de-material] Revisar o material da aula 1.
```

**Você aprova tudo antes de usar.** O agente propõe; o professor decide.

## 4. Glossário mínimo

| Termo | Significado |
|-------|-------------|
| Vault | A pasta do projeto aberta no Obsidian |
| MOC (`00-MOC/`) | Mapas de conteúdo: índices navegáveis do vault |
| Agente (`@[nome]`) | Especialista de IA que você invoca no chat |
| Template (`_templates/`) | Modelo copiado para criar arquivos novos |
| Memória (`.memory/`) | Contexto persistente da turma (privado, não sobe ao Git) |
| Checkpoint de memória | Resumo automático que o agente emite ao concluir tarefas |
| Rubrica | Critérios e níveis de avaliação aprovados por você |

## 5. Para onde ir depois

| Objetivo | Onde |
|----------|------|
| Prompts prontos por agente | [exemplos/](exemplos/README.md) |
| Avaliação, diário e exportação | [exemplos/avaliacao-e-exportacao.md](exemplos/avaliacao-e-exportacao.md) |
| Ver o fluxo encadeado dos agentes | [Cenário de Uso Guiado](README.md#cenário-de-uso-guiado) |
| Checklist de nova turma | [README — Checklist](README.md#checklist-ao-criar-nova-turma) |
| Regras que os agentes seguem | [.agents/AGENTS.md](.agents/AGENTS.md) |

## 6. Problemas comuns

- **`./setup.sh: permissão negada`** → rode `chmod +x setup.sh` e tente de novo.
- **`npm: comando não encontrado`** → instale o Node.js 20+ e rode `npm ci` na raiz.
- **Onde ficam meus arquivos?** → material da turma em `AULAS/`; registros privados em `AULAS/registros-docentes/`; tudo isso é ignorado pelo Git.
- **O agente inventou um dado?** → não aprove: peça correção citando a fonte (Plano de Curso, perfil da turma). Agentes nunca devem inventar evidências ou resultados de alunos.
- **Posso commitar?** → sim, **depois** de ler a [seção de Privacidade](README.md#privacidade). Na dúvida, crie um repositório **privado** para a turma.
