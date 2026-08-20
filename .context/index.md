---
title: Índice de Contexto Agentico
description: Registro de todas as entradas de contexto geradas pelos agentes durante a execução de tarefas.
tags: [context, index]
created: 2026-08-01
updated: 2026-08-01
---

# Índice de Contexto Agentico

Este arquivo registra todas as entradas de contexto geradas pelos agentes. Cada entrada documenta o que foi feito, o que foi descoberto e o que fica pendente para os próximos agentes.

## Entradas

<!-- ENTRIES -->

---

## Como ler

- **Agente:** qual agente gerou esta entrada
- **Ação:** o que foi feito (criou, revisou, atualizou, registrou)
- **Alvo:** qual arquivo ou aula foi afetado
- **Estado:** o resultado da ação
- **Pendente:** o que precisa ser feito em seguida

## Como registrar

Ao final de cada tarefa, todo agente deve criar uma entrada neste diretório seguindo o template em `.context/agente-template.md`. A entrada deve ser adicionada a este índice.