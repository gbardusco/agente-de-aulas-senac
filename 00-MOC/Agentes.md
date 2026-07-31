---
aliases: [Agentes, Índice de Agentes]
tags: [moc, agents]
created: 2026-07-21
---

# 🤖 Agentes de IA

> Todos os agentes especializados disponíveis neste projeto.  
> Cada agente é ativado via `@[nome-do-agente]` em um prompt.

---

## Regras Globais

Os agentes seguem as regras definidas em [[AGENTS|Regras do Projeto]].  
Antes de agir, todo agente deve consultar a [[Memoria|Memória do Projeto]].

---

## Agentes Disponíveis

### [[planejador-didatico|Planejador Didático]]
| Campo | Valor |
|-------|-------|
| **Arquivo** | `.agents/agente-planejador-didatico.md` |
| **Ativação** | `@[agente-planejador-didatico]` |
| **Escopo** | Planejar, criar, expandir e ajustar conteúdo de aulas |
| **Gera** | Slides, demos, exercícios, gabaritos, ementas |

---

### [[revisor-de-material|Revisor de Material]]
| Campo | Valor |
|-------|-------|
| **Arquivo** | `.agents/agente-revisor-de-material.md` |
| **Ativação** | `@[agente-revisor-de-material]` |
| **Escopo** | Revisar qualidade, acessibilidade e consistência |
| **Foco** | Identação, 100vh, progressão pedagógica, contexto temático |

---

### [[diario-de-classe|Diário de Classe]]
| Campo | Valor |
|-------|-------|
| **Arquivo** | `.agents/agente-diario-de-classe.md` |
| **Ativação** | `@[agente-diario-de-classe]` |
| **Escopo** | Redigir textos para o Diário de Classe |
| **Campos** | Atividades, Feedback, Indicadores, Observação, Recuperação |

---

### [[gerador-de-exercicios|Gerador de Exercícios]]
| Campo | Valor |
|-------|-------|
| **Arquivo** | `.agents/agente-gerador-de-exercicios.md` |
| **Ativação** | `@[agente-gerador-de-exercicios]` |
| **Escopo** | Criar listas de exercícios e gabaritos |
| **Progressão** | Básico → Intermediário → Desafio |

---

### [[gestor-de-memoria|Gestor de Memória]]
| Campo | Valor |
|-------|-------|
| **Arquivo** | `.agents/agente-gestor-de-memoria.md` |
| **Ativação** | `@[agente-gestor-de-memoria]` |
| **Escopo** | Documentar feedbacks, decisões e status |
| **Arquivos** | `decisoes.md`, `feedback-aulas.md`, `status-aulas.md`, `perfil-turma.md` |

---

## Fluxo de Trabalho

```
Professor solicita algo
        │
        ▼
┌─ gestor-de-memoria ←─ (brain dump, feedback rápido)
│
├─ planejador-didatico ←─ (criar/ajustar conteúdo)
│       │
│       ▼
│   gerador-de-exercicios ←─ (listas e gabaritos)
│       │
│       ▼
│   revisor-de-material ←─ (auditar qualidade)
│
└─ diario-de-classe ←─ (gerar textos para diário de classe)
```

---

## Reutilização em Outros Projetos

Estes agentes são **genéricos por design**. Para adaptar a outra turma:

1. Copie `_templates/perfil-turma-template.md` para `.memory/perfil-turma.md`
2. Preencha os dados da nova turma
3. Os agentes se adaptam automaticamente ao perfil definido
