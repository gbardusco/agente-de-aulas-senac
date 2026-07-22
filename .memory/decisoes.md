# Registro de Decisões

Cada decisão relevante do projeto é registrada aqui com data e justificativa.

---

### DEC-001 · 14/07/2026
**Tema:** Estrutura geral do curso  
**Decisão:** Dividir as 15 aulas em dois módulos baseados em projetos: Portfólio Pessoal (HTML/CSS, aulas 01–06) e Dashboard IoT (JavaScript, aulas 07–15).  
**Justificativa:** Alunos de IoT precisam de aplicação prática imediata. Projetos tangíveis mantêm o engajamento e cobrem os indicadores da UC.

---

### DEC-002 · 14/07/2026 (REVISADA POR DEC-008)
**Tema:** GitHub excluído do escopo  
**Decisão:** Não incluir Git/GitHub no conteúdo das aulas.  
**Justificativa:** Primeiro contato dos alunos com programação web + carga horária limitada. *(Atualização: alunos pediram introdução básica; ver DEC-008).*

---

### DEC-003 · 14/07/2026
**Tema:** Sistema de slides próprio  
**Decisão:** Criar um sistema de slides em HTML/CSS/JS puro (`assets/slides.css` + `assets/slides.js`) em vez de usar PowerPoint ou Google Slides.  
**Justificativa:** O próprio material de aula serve como exemplo de código. O professor pode editar diretamente no VS Code, mantendo coerência com o ambiente que os alunos usam.

---

### DEC-004 · 14/07/2026
**Tema:** Indicadores faltantes (Mobile e Banco de Dados)  
**Decisão:** Incorporar CSS Responsivo na Aula 05, manifest.json (PWA) na Aula 12, e consumo de API via `fetch()` na Aula 14.  
**Justificativa:** O outro professor da UC14 terá apenas mais 2 dias de aula. Para não deixar indicadores descobertos, o conteúdo de mobile e integração com dados remotos foi absorvido por estas aulas, sem sobrecarregar o cronograma.

---

### DEC-005 · 14/07/2026
**Tema:** Metodologia de exercícios  
**Decisão:** Exercícios devem exigir produção autônoma (nunca réplica do código da demo). Progressão: Básico → Intermediário → Desafio.  
**Justificativa:** O professor valoriza que os alunos pratiquem de forma independente, pensando por conta própria em vez de copiar código.

---

### DEC-006 · 15/07/2026
**Tema:** Expansão de conteúdo por aula  
**Decisão:** Expandir a Aula 02 como teste — adicionar Tabelas HTML ao conteúdo e aumentar de 3 para 6 exercícios.  
**Justificativa:** Feedback do professor após a Aula 01: "eles conseguem absorver mais conteúdo e produzir mais atividades dentro do período de tempo da aula." Se confirmado na Aula 02, o padrão será aplicado às demais.

---

### DEC-007 · 15/07/2026
**Tema:** Boas práticas de código nos slides  
**Decisão:** Todo código exibido nos slides deve ter identação perfeita, mesmo que isso exija dividir o conteúdo em mais slides.  
**Justificativa:** Alunos aprendendo HTML pela primeira vez vão replicar exatamente o que veem na tela. Código mal identado, mesmo que "caiba" na tela, ensina o hábito errado.

---

### DEC-008 · 15/07/2026
**Tema:** Inclusão de Git/GitHub (Fluxo Básico)  
**Decisão:** Incluir uma introdução básica ao fluxo de commit do Git/GitHub em uma das próximas aulas (possivelmente na Aula 06, durante a entrega do Portfólio, ou no início do Módulo 2).  
**Justificativa:** Feedback direto da turma após a Aula 02, demonstrando interesse e necessidade de aprender a versionar código. Substitui a DEC-002.

---

### DEC-009 · 21/07/2026
**Tema:** Desacoplamento dos agentes do contexto de turma  
**Decisão:** Tornar os agentes genéricos (reutilizáveis entre turmas/UCs) e centralizar todas as informações específicas da turma em `.memory/perfil-turma.md`. O agente `agente-planejador-didatico-iot.md` foi renomeado para `agente-planejador-didatico.md`.  
**Justificativa:** Pedido do professor para poder reaproveitar os agentes em outras turmas sem reescrever. Os dados de turma (temas IoT, módulos, ritmo) já estavam parcialmente em `perfil-turma.md`; a mudança elimina a duplicação e cria uma arquitetura de 3 camadas: comportamento (agentes) × perfil (memória) × ambiente (regras).
