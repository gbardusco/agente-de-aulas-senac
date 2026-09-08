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
| `rubrica-atividade-template.md` | `AULAS/aula-XX/rubrica-atividade.md` | Avaliação configurada/aprovada pelo professor, sem resultados individuais |
| `relatorio-docente-template.html` | `AULAS/registros-docentes/aula-XX/relatorio.html` | Diário privado editável com cópia por campo |
| `slides-fonte-template.json` | `AULAS/aula-XX/slides.json` | Fonte única para HTML + PPTX editável |
| `slides.schema.json` | Manter em `_templates/` | Contrato v1 da exposição legada |
| `slides.schema.v2.json` | Manter em `_templates/` | Contrato v2 dos decks PBL |
| `slides-fonte-template.json` | `AULAS/aula-XX/slides.json` | Exemplo PBL prático |
| `slides-fonte-teorica-template.json` | `AULAS/aula-XX/slides.json` | Exemplo PBL teórico, sem tarefa operacional |
| `relatorio-docente.schema.json` | Manter em `_templates/` | Contrato do JSON persistente do relatório |
| `diario-sistema.schema.json` | Manter em `_templates/` | Contrato da configuração de campos do sistema |
| `diario-sistema-template.json` | `AULAS/registros-docentes/diario-config.json` | Campos, obrigatoriedade e limites confirmados |
| `aula-estado.schema.json` | Manter em `_templates/` | Contrato de aprovação e rastreabilidade |
| `pacote-manifest.schema.json` | Manter em `_templates/` | Contrato do manifesto do pacote para alunos |
| `slides-template.html` | `AULAS/aula-XX/slides.html` (somente HTML) | Modelo visual legado, não fonte de PPTX |
| `exercicios-template.html` | `AULAS/aula-XX/exercicios.html` | Lista de exercícios |
| `demo-template.html` | `AULAS/aula-XX/demo/index.html` | Demo de navegador |
| `assets/*` | `AULAS/assets/` | CSS/JS funcionais copiados pelo setup sem sobrescrever existentes |

Templates por aula são copiados quando a aula for criada, não pelo setup inicial.
Para HTML + PPTX, edite JSON e execute `npm run slides -- <fonte> <saida>` após `npm ci`.
Relatórios não entram em pacotes para alunos. Consulte o [guia](../exemplos/avaliacao-e-exportacao.md)
para configuração docente, caminhos, cópia, persistência, testes e limitações.

### Comandos por aula

| Comando | Uso |
|---------|-----|
| `npm run relatorio -- gerar --aula aula-XX` | Criar relatório privado e JSON persistente |
| `npm run aula:estado -- preparar --aula aula-XX --publicos ...` | Registrar rascunho e hash do conteúdo público |
| `npm run aula:estado -- aprovar --aula aula-XX ...` | Aprovar conteúdo somente com responsável, fontes e rubrica |
| `npm run pacote:alunos -- --aula aula-XX` | Gerar ZIP com lista explícita e manifesto |
| `npm run verificar -- --aula aula-XX --modo distribuicao` | Validar aula antes de distribuir |
| `npm run demo:fluxo -- --saida /tmp/opencode/demo` | Executar demonstração fictícia isolada |

### Referência

| Template | Copiar para | Uso |
|----------|-------------|-----|
| `glossario-template.md` | `.memory/glossario.md` | Definições de termos técnicos e pedagógicos |
| `materiais-consulta-index-template.md` | `.docs/materiais-consulta/index.md` | Catálogo privado criado pelo setup, com prioridade às fontes oficiais |

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
