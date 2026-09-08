---
aliases: [Padrões Técnicos, Padrões, CSS]
tags: [memory, padroes, css, codigo]
created: 2026-07-14
updated: 2026-07-31
version: "2.0"
---

# Padrões Técnicos — Materiais Didáticos

## Versão

| Campo | Valor |
|-------|-------|
| Versão | 2.0 |
| Última atualização | 2026-07-31 |
| Histórico | 1.0 (2026-07-14) — versão inicial · 2.0 (2026-07-31) — agentes setup/exportador/checklist, rubrica de revisão, templates expandidos |

## Estrutura de pastas

```
NOME-DO-PROJETO/
├── .agents/          # Agentes de IA para apoio ao projeto
├── .docs/            # Documentos oficiais (plano de curso, calendário)
├── .memory/          # Memória persistente do projeto (esta pasta)
├── 00-MOC/           # Mapas de Conteúdo (Obsidian)
├── _templates/       # Templates reutilizáveis
└── AULAS/
    ├── assets/       # CSS e JS compartilhados (slides + exercícios)
    ├── index.md      # Índice geral das aulas
    ├── sintese_diario_classe.md
    └── aula-XX/
        ├── index.md
        ├── slides.html
        ├── exercicios.html
        ├── demo/
        │   └── index.html (+ estilos e scripts quando necessário)
        └── gabarito/
            ├── exercicio-01.html
            ├── exercicio-02.html
            └── ...
```

## Slides (`slides.html`)

Para novas entregas HTML + PPTX, use `slides.json` conforme `_templates/slides.schema.v2.json`
para PBL; o schema v1 permanece apenas para exposição legada. Execute
`npm run slides -- <fonte> <saida>`. Texto/formas editáveis via PptxGenJS,
sem conversão arbitrária de HTML. Os exemplos HTML abaixo continuam como referência
visual; a fonte estruturada é autoritativa para ambos os formatos. Veja
`exemplos/avaliacao-e-exportacao.md` para comandos, tipos e limites.

Assets funcionais estão em `_templates/assets/` e são copiados pelo setup sem
sobrescrever os existentes. Relatório privado: `AULAS/registros-docentes/aula-XX/relatorio.html`,
com CSS/JS `../../assets/relatorio.*`. Rubrica pública: `AULAS/aula-XX/rubrica-atividade.md`.
Biblioteca privada: `.docs/materiais-consulta/index.md`. Nunca incluir registros docentes
ou biblioteca em pacotes para alunos.

### Estrutura base
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aula XX — Título</title>
    <link rel="stylesheet" href="../assets/slides.css">
</head>
<body>
<div class="presentation">
    <div class="progress-bar"><div class="progress-fill"></div></div>
    <span class="lesson-badge">UC · AULA XX</span>

    <!-- Slides aqui -->

    <div class="slide-counter">1 / N</div>
    <div class="nav-arrows">
        <button class="nav-prev">←</button>
        <button class="nav-next">→</button>
    </div>
</div>
<script src="../assets/slides.js"></script>
</body>
</html>
```

### Tipos de slide
- `.title-slide` — slide de abertura com título e data
- `.section-slide` — divisor de seção (ex: "Parte 2")
- Slide normal — conteúdo com `.slide-content`

### Arco PBL condicional dos slides
Aulas novas usam PBL sempre que o tema permitir um problema contextualizado:

1. **Problema contextualizado** — situação realista e pergunta orientadora.
2. **Conceito teórico** — formalização necessária para enfrentar o problema.
3. **Aplicação condicional** — prática operacional ou análise teórica, conforme a modalidade.
4. **Síntese** — transferência, reflexão e fechamento.

Hipóteses e investigação são recomendadas entre problema e conceito. Modalidade analítica
não recebe tarefa operacional forçada. Exposição legada v1 só com justificativa registrada.

### Blocos visuais disponíveis
- `.two-columns` — layout lado a lado (código + preview)
- `.preview-box` + `.preview-label` — preview de resultado do navegador
- `.tip-box` — dica (💡)
- `.warning-box` — aviso (⚠️)
- `.info-box` — informação complementar
- `.comparison` > `.before` + `.after` — comparação Antes/Depois
- `<pre data-lang="HTML">` — bloco de código com destaque

### Destaque de código (dentro de `<pre>`)
- `<span class="tag">` — tags HTML (azul)
- `<span class="attr">` — atributos (laranja)
- `<span class="value">` — valores (verde)
- `<span class="comment">` — comentários (cinza)
- `<span class="keyword">` — palavras-chave JS (roxo)
- `<span class="property">` — propriedades CSS/JSON

### ⚠️ Regras críticas
1. **Em apresentação desktop, conteúdo deve caber em 100vh**. Em mobile/zoom, permita rolagem para acessibilidade, nunca corte conteúdo.
2. **Identação exemplar** em todo código exibido.
3. Se o slide ficou grande, **divida em dois** — nunca comprima.
4. `font-size: 14px` no `<pre>` pode ser usado para tabelas grandes, mas sem sacrificar identação.

## Atividades complementares (opcionais)

A **lista de exercícios é sempre obrigatória** em toda aula. Além dela, o planejador pode propor — **de forma opcional e contextual** — outras estratégias didáticas para enriquecer a aula.

Catálogo disponível (ver skill [[atividades-complementares|`.skills/atividades-complementares.md`]]):

| Estratégia | Quando usar | Esforço |
|------------|-------------|---------|
| Seminário | Tema amplo para aprofundamento em grupos | Alto |
| Pesquisa guiada | Conceito com fontes oficiais | Médio |
| Aula invertida | Teoria assimilável antes da aula | Médio |
| Estudo de caso | Situação-problema real do tema | Médio |
| Gamificação / quiz | Revisão rápida ou fixação | Baixo |
| Debate orientado | Temas com trade-offs | Baixo |
| Trabalho em grupo / mini-projeto | Combinação de conceitos em solução maior | Alto |
| Mapa mental / síntese visual | Consolidar conceitos | Baixo |
| Ensino por pares | Revisão entre colegas | Baixo |
| Prática guiada estendida | Ritmo lento ou feedback de dificuldade | Médio |

**Critérios de decisão:** tema da aula, perfil da turma, feedback real, tempo disponível e infraestrutura. Se propor, justificar e registrar na ementa (`index.md`); se não houver necessidade, não inserir. Atividades complementares **não substituem** exercícios nem demo.

## Exercícios (`exercicios.html`)

### CSS compartilhado
```html
<link rel="stylesheet" href="../assets/exercicios.css">
```

### Classes de dificuldade
- `<span class="difficulty easy">Básico</span>`
- `<span class="difficulty medium">Intermediário</span>`
- `<span class="difficulty challenge">Desafio</span>`

### Estrutura de um card
```html
<div class="exercise-card">
    <div class="card-header">
        <div class="number">1</div>
        <span class="card-title">Título do Exercício</span>
        <span class="difficulty easy">Básico</span>
    </div>
    <div class="description">
        <p>Enunciado...</p>
        <div class="hints">
            <strong>💡 Dica:</strong> Texto da dica.
        </div>
    </div>
</div>
```

### Divisor de seção (antes dos desafios)
```html
<div class="section-divider">⭐ Desafios</div>
```

## Convenções de código

### HTML
- Identação com **4 espaços**.
- Tags sempre em minúsculo.
- Atributos entre aspas duplas.
- `alt` obrigatório em `<img>`.
- Estrutura semântica: `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`.

### CSS
- Arquivo externo vinculado via `<link>`.
- Variáveis CSS com `:root` (quando aplicável).
- Flexbox para layout.
- Media Queries para responsividade.

### JavaScript
- `let` e `const` (nunca `var`).
- `document.getElementById()` para manipulação do DOM.
- `addEventListener()` para eventos.
- `setInterval()` para temporizadores.
- `fetch()` para APIs (quando aplicável).

> **Nota:** O momento exato de introduzir cada conceito depende do plano de aula da turma. Consulte [[perfil-turma|`.memory/perfil-turma.md`]] para a estrutura do curso e [[status-aulas|`.memory/status-aulas.md`]] para o progresso atual.

## Operação por aula

- Relatórios privados usam JSON canônico em `AULAS/registros-docentes/aula-XX/relatorio.json`.
- Estados usam `AULAS/aula-XX/aula-estado.json`, com hash do conteúdo público aprovado.
- Pacotes usam manifesto com hashes e lista explícita.
- Comandos:
  - `npm run relatorio -- gerar|exportar|importar|validar ...`
  - `npm run aula:estado -- preparar|solicitar-revisao|aprovar|marcar-aplicada|avaliar|marcar-revisao ...`
  - `npm run pacote:alunos -- --aula aula-XX ...`
  - `npm run verificar -- --aula aula-XX --modo distribuicao`
  - `npm run demo:fluxo -- --saida /tmp/opencode/demo`
- Verificação técnica não aprova pedagogia. Testes não gravam dados reais.

## Navegação

- Ver também: [[decisoes|`.memory/decisoes.md`]] · [[perfil-turma|Perfil]]
- Voltar para [[Home|Índice Principal]]
