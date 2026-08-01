---
name: code-formatting
description: Padrões de formatação e identação para código exibido nos materiais didáticos.
tags: [skill, codigo, formatacao, padronizacao]
version: "1.0"
agents: [agente-planejador-didatico, agente-revisor-de-material, agente-gerador-de-exercicios]
created: 2026-08-01
---

# Skill: Code Formatting

## Regras de Identação

- Identação com **4 espaços**. Nunca use tabs.
- Cada nível de indentação adiciona 4 espaços.
- Linhas não devem exceder **80 caracteres**. Quebre linhas longas de forma legível.

## Formatação de Código

- Todo bloco de código deve estar dentro de tags `<pre><code>` ou em blocos de markdown com linguagem especificada.
- Código deve ser **funcional e testado** antes de ser incluído nos materiais.
- Comentários devem explicar o **porquê**, não o **o quê** (o código já mostra o quê).
- Nomes de variáveis e funções devem seguir a convenção da linguagem (ex: `camelCase` em JavaScript, `snake_case` em Python).

## Tags em Blocos de Código

Use as seguintes classes nos blocos de código HTML:

| Classe | Uso |
|--------|-----|
| `.tag` | Nomes de tags HTML (`<div>`, `<span>`, etc.) |
| `.attr` | Atributos HTML (`class`, `id`, `href`, etc.) |
| `.value` | Valores de atributos (`"container"`, `"#main"`, etc.) |
| `.comment` | Comentários de código |

## Regras Invioláveis

1. Identação perfeita com 4 espaços em todo código exibido.
2. Tags minúsculas, aspas duplas em atributos HTML.
3. Código duplicado entre slides é proibido — use classes CSS reutilizáveis.
4. Nunca use atalhos de formatação que comprometam a legibilidade.
5. Todo código deve ser verificável (funcional e sem erros).