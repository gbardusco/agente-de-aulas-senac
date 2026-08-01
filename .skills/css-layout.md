---
name: css-layout
description: Padrões e convenções de layout CSS para slides e materiais didáticos.
tags: [skill, css, layout, visual]
version: "1.0"
agents: [agente-planejador-didatico, agente-revisor-de-material, agente-exportador]
created: 2026-08-01
---

# Skill: CSS Layout

## Convenções

- Toda classe CSS deve usar **notação kebab-case** (ex: `.slide-container`, `.code-block`).
- Slides usam **100vh** de altura. Nenhum slide pode exceder a altura da viewport.
- O sistema de slides customizado em `assets/slides.css` é a fonte de verdade para estilos de apresentação.
- Classes de utilidade seguem o padrão `.tag`, `.attr`, `.value`, `.comment` para blocos de código.

## Estrutura de Slide

```html
<div class="slide">
  <h1>Título do Slide</h1>
  <div class="content">
    <!-- conteúdo -->
  </div>
</div>
```

## Regras de Layout

1. Cada slide deve caber em uma tela sem scroll.
2. Se o conteúdo não cabe, divida em dois slides.
3. Use `display: flex` ou `display: grid` para posicionamento.
4. Evite `position: absolute` exceto para elementos decorativos.
5. Fontes devem ter tamanho mínimo de `1rem` para corpo e `1.5rem` para títulos.

## Verificação

Ao revisar slides, confirme:
- Nenhum slide excede 100vh
- Todas as classes CSS estão definidas em `assets/slides.css`
- Não há classes duplicadas com propriedades conflitantes