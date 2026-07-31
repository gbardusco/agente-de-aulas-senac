---
aliases: [Índice, Início, Dashboard]
tags: [moc, index]
created: 2026-07-21
updated: 2026-07-31
---

# Home

> **Mapa de Conteudo (MOC)** principal deste vault.  
> Navegue usando os links abaixo ou a barra lateral do Obsidian.

---

## Sobre Este Repositorio

Esta e a **instalacao padrao** reutilizavel para criar material didatico para qualquer Unidade Curricular.  
Para usar, copie os arquivos para um novo projeto e preencha o perfil da turma em `.memory/perfil-turma.md`.

---

## Dashboard de Progresso

| Metrica | Valor |
|---------|-------|
| Total de aulas | *(ver status-aulas.md)* |
| Aulas aplicadas | *(ver status-aulas.md)* |
| Aulas pendentes | *(ver status-aulas.md)* |

> Para dados atualizados, consulte [[status-aulas|`.memory/status-aulas.md`]].

---

## Navegacao

### Configuracao e Regras
- [[AGENTS|Regras do Projeto]] — regras globais para agentes de IA
- [[padroes-tecnicos|Padroes Tecnicos]] — templates CSS, convencoes de codigo

### Agentes de IA
- [[Agentes|Indice de Agentes]] — visao geral de todos os agentes disponiveis
- [[planejador-didatico|Planejador Didatico]] — cria e ajusta conteudo
- [[revisor-de-material|Revisor de Material]] — audita qualidade
- [[diario-de-classe|Diario de Classe]] — gera textos para diario de classe
- [[gerador-de-exercicios|Gerador de Exercicios]] — cria listas e gabaritos
- [[gestor-de-memoria|Gestor de Memoria]] — documenta feedbacks e decisoes
- [[setup-inicial|Setup Inicial]] — configura novo projeto
- [[checklist-pos-aula|Checklist Pos-Aula]] — verifica registros apos cada aula
- [[exportador|Exportador]] — gera materiais para compartilhamento

### Para Comecar um Novo Projeto
- `_templates/perfil-turma-template.md` — copie para `.memory/perfil-turma.md`
- `_templates/README.md` — checklist completo de setup

---

## Como Usar

### No Obsidian
Abra a pasta do projeto como vault no Obsidian.

### Com Agentes de IA (opencode, etc.)
Os agentes leem `.agents/AGENTS.md` automaticamente. As memorias ficam em `.memory/`.

### Reutilizacao
1. Copie todo este repositorio para um novo diretorio
2. Copie `_templates/perfil-turma-template.md` para `.memory/perfil-turma.md`
3. Preencha os dados da nova turma
4. Os agentes se adaptam automaticamente ao perfil definido
