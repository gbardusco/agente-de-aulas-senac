---
aliases: [Templates, Modelos]
tags: [template]
created: 2026-07-21
updated: 2026-07-31
---

# Templates Reutilizáveis

> Templates para criar uma nova turma em novos projetos.

---

## Como Usar

A maioria dos templates de memória é copiada **automaticamente** pelo `./setup.sh` ao criar uma nova turma. Use esta lista quando precisar:

1. **Copie** o template desejado para o local correto (ou rode `./setup.sh` para a cópia automática)
2. **Renomeie** removendo `-template` do nome
3. **Preencha** os campos marcados com `TODO` ou `(preencher)`
4. **Verifique** se os agentes conseguem ler o arquivo novo

---

## Templates Disponíveis

### Memória do Projeto (`.memory/`)

| Template | Copiar para | Uso |
|----------|-------------|-----|
| `perfil-turma-template.md` | `.memory/perfil-turma.md` | Perfil da turma, ritmo, contexto temático |
| `decisoes-template.md` | `.memory/decisoes.md` | Registro de decisões pedagógicas/técnicas |
| `feedback-aulas-template.md` | `.memory/feedback-aulas.md` | Feedback do professor após cada aula |
| `status-aulas-template.md` | `.memory/status-aulas.md` | Progresso das aulas (criada → revisada → aplicada) |
| `feedback-aluno-template.md` | `.memory/feedback-aluno.md` | Feedback individual por aluno |

### Material Didático (`AULAS/`)

| Template | Copiar para | Uso |
|----------|-------------|-----|
| `aula-index-template.md` | `AULAS/aula-XX/index.md` | Ementa de uma aula |
| `sintese-diario-classe-template.md` | `AULAS/sintese_diario_classe.md` | Mapeamento de indicadores por aula |

### Referência

| Template | Copiar para | Uso |
|----------|-------------|-----|
| `glossario-template.md` | `.memory/glossario.md` | Definições de termos técnicos e pedagógicos |

---

## Checklist de Novo Projeto

O trabalho braçal de cópia já é feito pelo `./setup.sh`. Restam as decisões pedagógicas:

- [ ] Rodar `./setup.sh "Nome do Projeto"` — copia os templates de memória e monta a estrutura
- [ ] Preencher o perfil da turma (`.memory/perfil-turma.md`)
- [ ] Ajustar número de aulas em `status-aulas.md` se necessário
- [ ] Manter `.memory/padroes-tecnicos.md` (reutilizável)
- [ ] Verificar `.agents/AGENTS.md` — caminhos estão corretos?
- [ ] Criar `.docs/` com novos documentos oficiais
- [ ] Abrir no Obsidian e verificar graph view
- [ ] **NÃO** fazer commit dos arquivos `.memory/` (exceto `padroes-tecnicos.md` e `index.md`)
- [ ] Criar repositório **privado** se quiser versionar o material da turma
