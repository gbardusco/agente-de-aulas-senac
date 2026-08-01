---
title: Roadmap de Melhorias
description: Lista completa de melhorias identificadas na análise do projeto, organizadas por prioridade.
tags: [roadmap, melhorias, planejamento]
created: 2026-08-01
updated: 2026-08-01
version: "1.0"
---

# Roadmap de Melhorias

Este documento registra todas as melhorias identificadas na análise do projeto. Cada item tem um número de referência (CRIT-XXX para críticos, IMP-XXX para importantes) e um status.

---

## Críticos

### CRIT-001 — Adicionar `skills:` ao frontmatter de todos os 9 agentes

**Problema:** AGENTS.md Regra 3b exige que agentes declarem `skills:` no frontmatter, mas nenhum agente implementa isso. O sistema de skills está efetivamente inoperante.

**Arquivos afetados:** Todos os `.agents/agente-*.md`

**Ação:** Adicionar `skills:` ao frontmatter de cada agente, listando as skills que ele adota conforme seus tags e escopo. Exemplo:

```yaml
---
name: planejador-didatico
skills: [css-layout, markdown-authoring, code-formatting]
---
```

**Mapeamento sugerido:**

| Agente | Skills |
|--------|--------|
| agente-orquestrador | (nenhum — é coordenador) |
| agente-planejador-didatico | css-layout, markdown-authoring, code-formatting, html-template |
| agente-revisor-de-material | css-layout, accessibility-check, code-formatting, markdown-authoring |
| agente-diario-de-classe | markdown-authoring |
| agente-gerador-de-exercicios | html-template, code-formatting, css-layout |
| agente-gestor-de-memoria | markdown-authoring |
| agente-setup-inicial | (nenhum — é setup) |
| agente-checklist-pos-aula | markdown-authoring |
| agente-exportador | css-layout, html-template, accessibility-check |

---

### CRIT-002 — Corrigir `.gitignore` para rastrear templates `.context/`

**Problema:** O diretório `.context/` inteiro está gitignored, incluindo `agente-template.md` e `index.md`. Esses templates são referenciados por AGENTS.md Regra 7, mas não estão disponíveis em novos clones do projeto.

**Ação:** Modificar `.gitignore` para gitignore apenas os arquivos gerados dinamicamente (`.context/agente-*.md`), mantendo `agente-template.md` e `index.md` rastreados. Usar padrão:

```gitignore
# Contexto agentico (gerado dinamicamente pelos agentes)
.context/agente-*.md
```

---

### CRIT-003 — Completar `agente-gestor-de-memoria.md`

**Problema:** O agente gestor-de-memoria está incompleto — falta a seção "Antes de agir", falta "Checkpoint de memória" (Regra 2b), e a seção "Brain dump" não segue o padrão "Ao receber um pedido" com passos numerados como os outros agentes.

**Ação:** Adicionar:
1. Seção "Antes de agir" com leitura dos arquivos de memória
2. Seção "Ao receber um pedido" com passos numerados
3. Seção "Checkpoint de memória" com formato MEMORY-CHECKPOINT
4. Seção "Regras"

---

### CRIT-004 — Preencher template MEMORY-CHECKPOINT vazio em `agente-exportador.md`

**Problema:** O checkpoint de memória do exportador tem um template vazio sem exemplo de formato.

**Ação:** Adicionar exemplo concreto ao template, como nos outros agentes.

---

### CRIT-005 — Adicionar frontmatter YAML aos templates `aula-index-template.md` e `sintese-diario-classe-template.md`

**Problema:** Esses dois templates não têm frontmatter YAML, quebrando o padrão definido em CONTRIBUTING.md.

**Ação:** Adicionar frontmatter com `title`, `tags`, `created` a ambos os templates.

---

### CRIT-006 — Corrigir `verificar-integridade.sh` para validar wikilinks de verdade

**Problema:** A seção "Verificação de Wikilinks" apenas conta wikilinks, não verifica se os alvos existem como arquivos.

**Ação:** Implementar verificação real: extrair alvos de wikilinks `[[...]]`, resolver caminhos, e verificar se os arquivos existem.

---

### CRIT-007 — Corrigir `setup.sh` para criar arquivos de asset em `AULAS/assets/`

**Problema:** O script cria `AULAS/assets/` mas não popula os arquivos CSS/JS que agents e templates referenciam (`slides.css`, `exercicios.css`).

**Ação:** Adicionar comandos para criar arquivos placeholder ou copiar de `_templates/` para `AULAS/assets/`.

---

### CRIT-008 — Corrigir `setup.sh` para copiar templates `.context/` para novos projetos

**Problema:** O setup não copia os templates `.context/` para novos projetos, tornando o sistema de contexto agentico inoperante em novos clones.

**Ação:** Adicionar cópia de `.context/index.md` e `.context/agente-template.md` para o novo projeto (como arquivos rastreados, não gitignored).

---

## Importantes

### IMP-001 — Documentar `exemplos/` no README.md e AGENTS.md

**Problema:** O diretório `exemplos/` existe com exemplos práticos mas não é referenciado em nenhum lugar da documentação.

**Ação:** Adicionar `exemplos/` aos diagramas de estrutura em README.md e AGENTS.md.

---

### IMP-002 — Criar template ou guia para `.docs/`

**Problema:** O README menciona "Crie `.docs/` com documentos oficiais" mas não há template ou guia de conteúdo.

**Ação:** Criar um template `.docs/template.md` ou adicionar orientações no README.

---

### IMP-003 — Resolver destino órfão de `glossario-template.md`

**Problema:** `_templates/README.md` referencia `glossario-template.md` → `.memory/glossario.md`, mas nenhum agente usa isso e não está no checklist de nova turma.

**Ação:** Ou remover o template, ou adicionar uso em um agente, ou incluir no checklist.

---

### IMP-004 — Padronizar estrutura de seções em todos os agentes

**Problema:** Apenas 5 de 9 agentes têm a seção "Antes de agir". Apenas 7 de 9 têm "Checkpoint de memória". O `setup-inicial` tem estrutura diferente dos demais.

**Ação:** Revisar todos os agentes para ter a mesma estrutura de seções: Papel → Antes de agir → O que você gera → Ao receber um pedido → Regras → Checkpoint de memória.

---

### IMP-005 — Adicionar `version` ao frontmatter de `agente-setup-inicial.md`

**Problema:** Todos os outros 8 agentes têm `version: "1.0"` no frontmatter. Este não tem.

**Ação:** Adicionar `version: "1.0"` ao frontmatter.

---

### IMP-006 — Corrigir README.md "Novidades" para refletir implementação real

**Problema:** A seção "Novidades" referencia recursos que não estão totalmente implementados nos agentes (contexto agentico automático, skills no frontmatter).

**Ação:** Atualizar a seção após implementar as correções dos críticos.

---

### IMP-007 — Atualizar `.memory/index.md` para referenciar `sintese_diario_classe.md`

**Problema:** AGENTS.md Regra 5 referencia `AULAS/sintese_diario_classe.md` mas `.memory/index.md` não lista este arquivo.

**Ação:** Adicionar entrada para `sintese_diario_classe.md` em `.memory/index.md`.

---

### IMP-008 — Consolidar checklists duplicados entre `README.md` e `_templates/README.md`

**Problema:** Ambos os arquivos contêm checklists quase idênticos para criar nova turma, criando risco de divergência.

**Ação:** Manter o checklist em um único lugar e referenciá-lo no outro, ou unificar.

---

### IMP-009 — Adicionar validação de frontmatter de agentes em `verificar-integridade.sh`

**Problema:** O script não verifica se agentes têm `version`, `skills:`, ou estrutura de seções consistente.

**Ação:** Adicionar verificações para frontmatter dos agentes.

---

### IMP-010 — Adicionar validação de consistência de templates em `verificar-integridade.sh`

**Problema:** O script não verifica se templates em `_templates/` são referenciados corretamente em `setup.sh`, `README.md` e `_templates/README.md`.

**Ação:** Adicionar verificação de consistência entre essas referências.

---

### IMP-011 — Remover criação desnecessária de `_templates` em `setup.sh`

**Problema:** `setup.sh` cria `_templates/` com `mkdir -p`, mas este diretório já existe no repo.

**Ação:** Remover a linha desnecessária do script.

---

### IMP-012 — Adicionar skills para context agentico e memory checkpoint

**Problema:** Não há skills para as novas funcionalidades (Regra 7 — contexto agentico, Regra 2b — memory checkpoint).

**Ação:** Criar `.skills/context-recording.md` e `.skills/memory-checkpoint.md` como skills rastreáveis.

---

### IMP-013 — Adicionar validação de mapeamento agent-to-skill

**Problema:** Não há mecanismo para verificar se os nomes de agentes em `.skills/*.md` correspondem a arquivos de agente reais.

**Ação:** Adicionar verificação em `verificar-integridade.sh`.

---

### IMP-014 — Documentar `exemplos/` na arquitetura do projeto

**Problema:** O diretório `exemplos/` está fora da arquitetura documentada.

**Ação:** Adicionar `exemplos/` aos diagramas de estrutura em README.md e AGENTS.md.

---

### IMP-015 — Adicionar exemplo de `skills:` no frontmatter em AGENTS.md

**Problema:** AGENTS.md Regra 3b menciona `skills:` mas não mostra um exemplo de como deve ficar.

**Ação:** Adicionar exemplo concreto de frontmatter com `skills:` na Regra 3b.

---

## Status Atual

| ID | Descrição | Status |
|----|-----------|--------|
| CRIT-001 | Adicionar `skills:` ao frontmatter de todos os agentes | ⏳ Pendente |
| CRIT-002 | Corrigir `.gitignore` para templates `.context/` | ⏳ Pendente |
| CRIT-003 | Completar `agente-gestor-de-memoria.md` | ⏳ Pendente |
| CRIT-004 | Preencher template MEMORY-CHECKPOINT vazio em exportador | ⏳ Pendente |
| CRIT-005 | Adicionar frontmatter aos templates `aula-index` e `sintese-diario-classe` | ⏳ Pendente |
| CRIT-006 | Corrigir `verificar-integridade.sh` para validar wikilinks | ⏳ Pendente |
| CRIT-007 | Corrigir `setup.sh` para criar assets em `AULAS/assets/` | ⏳ Pendente |
| CRIT-008 | Corrigir `setup.sh` para copiar templates `.context/` | ⏳ Pendente |
| IMP-001 | Documentar `exemplos/` no README e AGENTS.md | ⏳ Pendente |
| IMP-002 | Criar template/guia para `.docs/` | ⏳ Pendente |
| IMP-003 | Resolver destino órfão de `glossario-template.md` | ⏳ Pendente |
| IMP-004 | Padronizar estrutura de seções em todos os agentes | ⏳ Pendente |
| IMP-005 | Adicionar `version` ao `agente-setup-inicial.md` | ⏳ Pendente |
| IMP-006 | Corrigir README.md "Novidades" | ⏳ Pendente |
| IMP-007 | Atualizar `.memory/index.md` | ⏳ Pendente |
| IMP-008 | Consolidar checklists duplicados | ⏳ Pendente |
| IMP-009 | Adicionar validação de frontmatter em `verificar-integridade.sh` | ⏳ Pendente |
| IMP-010 | Adicionar validação de consistência de templates | ⏳ Pendente |
| IMP-011 | Remover criação desnecessária de `_templates` em `setup.sh` | ⏳ Pendente |
| IMP-012 | Adicionar skills para context e memory checkpoint | ⏳ Pendente |
| IMP-013 | Adicionar validação de mapeamento agent-to-skill | ⏳ Pendente |
| IMP-014 | Documentar `exemplos/` na arquitetura | ⏳ Pendente |
| IMP-015 | Adicionar exemplo de `skills:` em AGENTS.md | ⏳ Pendente |