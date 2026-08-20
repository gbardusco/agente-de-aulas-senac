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

### Sequência pedagógica dos slides
Todo conceito novo deve ser apresentado em 3 passos:

1. **Situação-problema contextualizada** — abrir com um problema do mundo real, de fácil entendimento e ligado ao contexto temático da turma (ex: "Como mostrar o cardápio de forma organizada?").
2. **Formalização do conceito** — a partir da situação-problema, definir formalmente o conceito da aula.
3. **Exemplo na prática** — resolver a situação-problema do passo 1 com um exemplo prático (idealmente com `.two-columns` + `.preview-box`).

Nunca partir direto do código: primeiro o problema, depois o conceito, por fim a aplicação.

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
1. **Todo conteúdo deve caber em 100vh** — sem scroll.
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

## Navegação

- Ver também: [[decisoes|Decisões]] · [[perfil-turma|Perfil]]
- Voltar para [[Home|Índice Principal]]
