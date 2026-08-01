---
name: markdown-authoring
description: Convenções de autoria em Markdown para documentação de aulas e materiais didáticos.
tags: [skill, markdown, authoring, documentacao]
version: "1.0"
agents: [agente-planejador-didatico, agente-revisor-de-material, agente-diario-de-classe, agente-exportador]
created: 2026-08-01
---

# Skill: Markdown Authoring

## Convenções

- Use **wikilinks** `[[nome-do-arquivo|.caminho/arquivo.md]]` para referenciar arquivos do projeto.
- Todos os arquivos markdown devem ter **YAML frontmatter** com no mínimo `title`, `tags` e `created`.
- Use heading hierarchy correta: `#` → `##` → `###` → `####`. Não pule níveis.
- Listas use hífen (`-`) para itens não ordenados e números para ordenados.
- Código inline usa crases simples: `` `código` ``.
- Blocos de código usam crases triplas com linguagem: `` ```python ````.

## Estrutura de Frontmatter

```yaml
---
title: Título do Documento
description: Breve descrição do conteúdo
tags: [tag1, tag2, tag3]
created: 2026-08-01
updated: 2026-08-01
version: "1.0"
---
```

## Regras

1. Todo documento deve ter um título (`#`) no primeiro nível de heading.
2. Use negrito (`**texto**`) para termos importantes, itálico (`*texto*`) para ênfase leve.
3. Tabelas usem a sintaxe padrão do Markdown com pipes.
4. Não use HTML inline em arquivos markdown a menos que seja necessário para o layout (ex: slides).
5. Arquivos de memória (`.memory/`) seguem o formato específico definido em `AGENTS.md`.