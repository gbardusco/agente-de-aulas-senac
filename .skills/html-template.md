---
name: html-template
description: Padrões e templates HTML para slides, exercícios e demonstrações do material didático.
tags: [skill, html, template, estrutura]
version: "1.0"
agents: [agente-planejador-didatico, agente-revisor-de-material, agente-exportador]
created: 2026-08-01
---

# Skill: HTML Template

## Estrutura Base de Slides

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Título do Slide</title>
  <link rel="stylesheet" href="../assets/slides.css">
</head>
<body>
  <div class="slide">
    <h1>Título do Slide</h1>
    <div class="content">
      <!-- conteúdo -->
    </div>
  </div>
</body>
</html>
```

## Estrutura Base de Exercícios

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exercício X — Título</title>
  <link rel="stylesheet" href="../assets/slides.css">
</head>
<body>
  <div class="exercise">
    <h1>Enunciado</h1>
    <div class="task">
      <!-- tarefa -->
    </div>
    <div class="hints">
      <!-- dicas (opcional) -->
    </div>
  </div>
</body>
</html>
```

## Estrutura Base de Demo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo — Tópico</title>
  <link rel="stylesheet" href="../assets/slides.css">
</head>
<body>
  <div class="demo">
    <h1>Demonstrando: Tópico</h1>
    <div class="preview-box">
      <!-- código ou resultado -->
    </div>
    <pre><code class="language-python"><!-- código --></code></pre>
  </div>
</body>
</html>
```

## Regras

1. Todos os HTMLs devem ter `lang="pt-BR"` no elemento `<html>`.
2. Todos os HTMLs devem referenciar `assets/slides.css` para estilos consistentes.
3. Slides devem usar a classe `.slide` no container principal.
4. Exercícios devem usar a classe `.exercise` e conter uma `.task` e opcionalmente uma `.hints`.
5. Demos devem usar a classe `.demo` e conter um `.preview-box` para o resultado visual.
6. Nunca use IDs em elementos de conteúdo — use apenas classes.