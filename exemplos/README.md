# Exemplos Práticos de Uso dos Agentes

> Prompts reais que você pode copiar e colar no opencode para testar os agentes.

---

## Como Usar

1. Copie o prompt desejado
2. Cole no opencode (ou outro agente de IA)
3. O agente irá executar a tarefa automaticamente
4. Verifique o resultado e ajuste se necessário

---

## Índice de Exemplos

| Exemplo | Agente | Descrição |
|---------|--------|-----------|
| [Planejar Aula](#planejar-aula) | `agente-planejador-didatico` | Criar slides e demo de uma aula |
| [Gerar Exercícios](#gerar-exercícios) | `agente-gerador-de-exercicios` | Criar lista de exercícios com gabarito |
| [Revisar Material](#revisar-material) | `agente-revisor-de-material` | Auditar qualidade de um material |
| [Diário de Classe](#diário-de-classe) | `agente-diario-de-classe` | Gerar texto para diário de classe |
| [Registrar Feedback](#registrar-feedback) | `agente-gestor-de-memoria` | Documentar feedback de aula |
| [Setup Novo Projeto](#setup-novo-projeto) | `agente-setup-inicial` | Configurar nova turma |
| [Orquestrador](#orquestrador) | `agente-orquestrador` | Delegar tarefa complexa |

---

## Planejar Aula

### Prompt

```
@[agente-planejador-didatico] Criar aula 5 sobre Flexbox em CSS.
Contexto: turma de Desenvolvimento Web, já viu HTML básico e seletores CSS.
Incluir slides, demo e exercícios.
```

### O que o agente faz

1. Lê `perfil-turma.md` para entender o contexto
2. Lê `status-aulas.md` para verificar progresso
3. Cria pasta `AULAS/aula-05/`
4. Gera `slides.html` com conteúdo sobre Flexbox
5. Gera `demo/index.html` com exemplo interativo
6. Gera `exercicios.html` com 3 exercícios (básico, intermediário, desafio)
7. Gera `gabarito/exercicio-01.html` (e subsequentes)
8. Gera `index.md` com ementa da aula
9. Atualiza `status-aulas.md`

---

## Gerar Exercícios

### Prompt

```
@[agente-gerador-de-exercicios] Criar lista de exercícios para aula 3 sobre Tabelas HTML.
Progressão: 2 básicos, 2 intermediários, 1 desafio.
Contexto: produtos de uma loja online.
```

### O que o agente faz

1. Lê `perfil-turma.md` para contexto temático
2. Lê `status-aulas.md` para verificar se aula 3 já existe
3. Cria `AULAS/aula-03/exercicios.html`
4. Cria `AULAS/aula-03/gabarito/exercicio-01.html` (etc.)
5. Cada exercício tem: enunciado, dica, nível de dificuldade
6. Gabarito tem código funcional e identado

---

## Revisar Material

### Prompt

```
@[agente-revisor-de-material] Revisar os slides da aula 4 sobre CSS Box Model.
Verificar identação, uso de 100vh, progressão pedagógica e contexto temático.
```

### O que o agente faz

1. Lê `AULAS/aula-04/slides.html`
2. Verifica identação (4 espaços)
3. Verifica se slides cabem em 100vh
4. Verifica progressão pedagógica
5. Verifica presença do contexto temático
6. Gera relatório de revisão com problemas encontrados
7. Sugere correções

---

## Diário de Classe

### Prompt

```
@[agente-diario-de-classe] Gerar texto para a aula 3 aplicada ontem.
Atividades: criação de tabelas HTML com thead, tbody, tr, th, td.
Alunos tiveram dificuldade com colspan.
Indicadores avaliados: 2 e 4.
```

### O que o agente faz

1. Lê `feedback-aulas.md` para contexto
2. Lê `status-aulas.md` para confirmar que aula 3 foi aplicada
3. Lê `sintese_diario_classe.md` para mapeamento de indicadores
4. Gera textos para cada campo do Diário de Classe:
   - Atividades Desenvolvidas (Chamada)
   - Atividades Desenvolvidas (Notas/Indicadores)
   - Observação Docente (se aplicável)
5. Formata pronto para copiar e colar no Senac Solution

---

## Registrar Feedback

### Prompt

```
@[agente-gestor-de-memoria] Anotar feedback da aula de ontem:
- Turma estava entediada com CSS puro
- Pediram mais exercícios práticos
- A aula anterior (HTML) foi melhor recebida
```

### O que o agente faz

1. Interpreta o feedback do professor
2. Formata em registro profissional e datado
3. Adiciona em `feedback-aulas.md`
4. Sugere ação: "Considerar mais exercícios práticos nas próximas aulas de CSS"
5. Pode sugerir acionar `agente-planejador-didatico` para ajustar conteúdo

---

## Setup Novo Projeto

### Prompt

```
@[agente-setup-inicial] Configurar novo projeto para a disciplina de Banco de Dados.
Instituição: SENAC
Turma: 2º Semestre
Número de aulas: 20
Contexto temático: sistemas de gestão de estoque
```

### O que o agente faz

1. Pergunta informações faltantes (se houver)
2. Cria estrutura de pastas
3. Copia templates para `.memory/`
4. Preenche `perfil-turma.md` com dados coletados
5. Ajusta `status-aulas.md` para 20 aulas
6. Inicializa git (se desejado)
7. Confirma tudo com o professor

---

## Orquestrador

### Prompt

```
@[agente-orquestrador] Vou aplicar a aula 3 amanhã. Preciso:
1. Revisar os slides
2. Gerar exercícios extras
3. Depois da aula, registrar feedback
```

### O que o agente faz

1. Analisa o pedido e identifica 3 tarefas
2. Sequencia: revisão → exercícios → feedback (pós-aula)
3. Delega cada tarefa ao agente correto:
   - `@[agente-revisor-de-material]` — revisar slides
   - `@[agente-gerador-de-exercicios]` — gerar exercícios extras
   - `@[agente-gestor-de-memoria]` — registrar feedback (após aula)
4. Coordena a execução em ordem lógica
5. Informa ao professor o que foi feito

---

## Dicas

- **Seja específico**: Quanto mais detalhes no prompt, melhor o resultado
- **Use contexto**: Mencione temas, indicadores, dificuldades anteriors
- **Verifique sempre**: O agente gera propostas, não soluções finais
- **Itere**: Se o resultado não ficou bom, peça ajustes
