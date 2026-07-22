# Padrões Técnicos — Materiais Didáticos

## Estrutura de pastas

```
UC14/
├── .agents/          # Agentes de IA para apoio ao projeto
├── .docs/            # Documentos oficiais (plano de curso, calendário)
├── .memory/          # Memória persistente do projeto (esta pasta)
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
    <span class="lesson-badge">UC14 · AULA XX</span>

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

### HTML ensinado aos alunos
- Identação com **4 espaços**.
- Tags sempre em minúsculo.
- Atributos entre aspas duplas.
- `alt` obrigatório em `<img>`.
- Estrutura semântica: `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`.

### CSS ensinado aos alunos
- Arquivo externo vinculado via `<link>`.
- Variáveis CSS com `:root` (a partir da Aula 03).
- Flexbox para layout (a partir da Aula 04).
- Media Queries para responsividade (a partir da Aula 05).

### JavaScript ensinado aos alunos
- `let` e `const` (nunca `var`).
- `document.getElementById()` para manipulação do DOM.
- `addEventListener()` para eventos (a partir da Aula 09).
- `setInterval()` para temporizadores (a partir da Aula 11).
- `fetch()` para APIs (Aula 14 apenas).
