---
aliases: [Contribuir, Como Contribuir]
tags: [contributing, docs]
created: 2026-07-31
---

# Como Contribuir

> Diretrizes para professores e desenvolvedores que querem melhorar este projeto.

---

## Visão Geral

Este é um repositório base para criação de material didático com agentes de IA. Qualquer professor ou desenvolvedor pode contribuir com melhorias, novos agentes ou correções.

---

## Tipos de Contribuição

### 🐛 Correções de Bug
- Erros de digitação
- Links quebrados
- Inconsistências entre arquivos
- Problemas nos scripts

### ✨ Funcionalidades Novas
- Novos agentes especializados
- Templates novos
- Melhorias nos scripts
- Novos exemplos de uso

### 📝 Documentação
- Correções de redação
- Adição de exemplos
- Melhoria de explicações
- Tradução (se aplicável)

### 🎨 Design
- Melhorias de UX nos templates HTML
- Novos layouts para slides
- Acessibilidade

---

## Antes de Contribuir

1. **Leia o [README.md](README.md)** para entender o projeto
2. **Verifique a [estrutura](README.md#estrutura)** para saber onde colocar arquivos
3. **Rode `./verificar-integridade.sh`** para garantir que tudo está ok
4. **Consulte os agentes existentes** em `.agents/` para seguir o padrão

---

## Como Contribuir

### 1. Fork e Clone

```bash
git clone https://github.com/SEU-USER/agente-de-aulas-senac.git
cd agente-de-aulas-senac
```

### 2. Crie uma Branch

```bash
git checkout -b feat/nome-da-contribuicao
```

Use um dos prefixos:
- `feat/` — nova funcionalidade
- `fix/` — correção de bug
- `docs/` — documentação
- `refactor/` — refatoração sem mudar funcionalidade

### 3. Faça suas Alterações

- Siga o padrão dos arquivos existentes
- Mantenha a consistência de formatação
- Atualize a documentação se necessário

### 4. Teste

```bash
./verificar-integridade.sh
```

### 5. Commit

```bash
git add .
git commit -m "feat: descrição da contribuição"
```

Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — nova funcionalidade
- `fix:` — correção
- `docs:` — documentação
- `refactor:` — refatoração
- `style:` — formatação
- `test:` — testes

### 6. Pull Request

1. Push para seu fork
2. Abra um Pull Request neste repositório
3. Descreva o que mudou e por quê
4. Agarde revisão

---

## Padrões para Agentes

Se for criar um novo agente, siga o padrão:

```markdown
---
name: nome-do-agente
description: Descrição curta do agente.
mode: all
tags: [agent, categoria]
created: YYYY-MM-DD
version: "1.0"
---

# Agente: Nome do Agente

> **Ativação:** Mencionado via `@[agente-nome]`  
> **Escopo:** O que o agente faz.

---

## 1. Papel
## 2. Antes de agir
## 3. O que você gera
## 4. Ao receber um pedido
## 5. Regras
```

---

## Padrões para Templates

Se for criar um novo template:

1. Nomeie com `-template` no final
2. Use frontmatter YAML com aliases e tags
3. Marque campos para preenchimento com `TODO` ou `(preencher)`
4. Adicione no `_templates/README.md`

---

## Padrões para Scripts

Se for criar ou modificar scripts:

1. Use `set -e` para sair em caso de erro
2. Adicione cores para output (verde/amarelo/vermelho)
3. Documente o uso no início do arquivo
4. Torne executável: `chmod +x script.sh`

---

## Código de Conduta

- Seja respeitoso
- Foque no improvement do projeto
- Documente suas decisões
- Não inclua dados sensíveis

---

## Dúvidas?

Abra uma [Issue](https://github.com/gbardusco/agente-de-aulas-senac/issues) com sua pergunta ou sugestão.
