---
name: accessibility-check
description: Diretrizes de acessibilidade para materiais didáticos digitais (HTML, slides, documentos).
tags: [skill, acessibilidade, ux, inclusao]
version: "1.0"
agents: [agente-revisor-de-material, agente-exportador]
created: 2026-08-01
---

# Skill: Accessibility Check

## Diretrizes

### Contraste
- Texto deve ter contraste mínimo de **4.5:1** contra o fundo (WCAG AA).
- Texto grande (18px+ ou 14px+ em negrito) exige contraste mínimo de **3:1**.

### Estrutura Semântica
- Hierarquia de headings respeitada: `h1` → `h2` → `h3` (sem pular níveis).
- Use elementos semânticos HTML5: `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Nunca use `<div>` ou `<span>` quando houver um elemento semântico adequado.

### Imagens
- Toda tag `<img>` deve ter atributo `alt` descritivo.
- Imagens decorativas usam `alt=""`.
- Imagens informativas descrevem o conteúdo no `alt`.

### Idioma
- O elemento `<html>` deve ter `lang="pt-BR"`.
- Trechos em outros idiomas devem usar o atributo `lang` correspondente.

### Navegação
- Todo conteúdo deve ser navegável por teclado.
- Links devem ter texto descritivo (evite "clique aqui").
- Foque indicadores visuais claros em elementos interativos.

## Checklist Rápido

- [ ] Contraste mínimo 4.5:1 em texto
- [ ] Heading hierarchy respeitada
- [ ] `lang="pt-BR"` no `<html>`
- [ ] Todas as `<img>` têm `alt`
- [ ] Elementos semânticos HTML5 usados corretamente
- [ ] Navegação por teclado funcional