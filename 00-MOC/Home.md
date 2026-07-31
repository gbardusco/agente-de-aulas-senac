---
aliases: [Índice, Início, Dashboard]
tags: [moc, index]
created: 2026-07-21
updated: 2026-07-31
---

# Home

> **Mapa de Conteúdo (MOC)** principal deste vault.  
> Navegue usando os links abaixo ou a barra lateral do Obsidian.

---

## Sobre Este Repositório

Esta é a **instalação padrão** reutilizável para criar material didático para qualquer Unidade Curricular.  
Para usar, copie os arquivos para um novo projeto e preencha o perfil da turma em `.memory/perfil-turma.md`.

---

## Dashboard de Progresso

| Métrica | Valor |
|---------|-------|
| Total de aulas | *(ver status-aulas.md)* |
| Aulas aplicadas | *(ver status-aulas.md)* |
| Aulas pendentes | *(ver status-aulas.md)* |

> Para dados atualizados, consulte [[status-aulas|`.memory/status-aulas.md`]].

---

## Navegação

### Configuração e Regras
- [[AGENTS|Regras do Projeto]] — regras globais para agentes de IA
- [[padroes-tecnicos|Padrões Técnicos]] — templates CSS, convenções de código

### Agentes de IA
- [[Agentes|Índice de Agentes]] — visão geral de todos os agentes disponíveis
- [[orquestrador|Orquestrador]] — analisa e delega tarefas
- [[planejador-didatico|Planejador Didático]] — cria e ajusta conteúdo
- [[revisor-de-material|Revisor de Material]] — audita qualidade
- [[diario-de-classe|Diário de Classe]] — gera textos para diário de classe
- [[gerador-de-exercicios|Gerador de Exercícios]] — cria listas e gabaritos
- [[gestor-de-memoria|Gestor de Memória]] — documenta feedbacks e decisões
- [[setup-inicial|Setup Inicial]] — configura novo projeto
- [[checklist-pos-aula|Checklist Pós-Aula]] — verifica registros após cada aula
- [[exportador|Exportador]] — gera materiais para compartilhamento

### Memória do Projeto
- [[Memoria|Índice de Memória]] — visão geral da memória persistente
- [[padroes-tecnicos|Padrões Técnicos]] — convenções de código e CSS

### Para Começar um Novo Projeto
- `_templates/perfil-turma-template.md` — copie para `.memory/perfil-turma.md`
- `_templates/README.md` — checklist completo de setup

---

## Como Usar

### No Obsidian
Abra a pasta do projeto como vault no Obsidian.

### Com Agentes de IA (opencode, etc.)
Os agentes leem `.agents/AGENTS.md` automaticamente. As memórias ficam em `.memory/`.

### Reutilização
1. Copie todo este repositório para um novo diretório
2. Copie `_templates/perfil-turma-template.md` para `.memory/perfil-turma.md`
3. Preencha os dados da nova turma
4. Os agentes se adaptam automaticamente ao perfil definido
