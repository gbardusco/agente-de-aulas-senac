# UC 14 — Desenvolvimento de Aplicações para Dispositivos IoT

## Material Didático — Índice Geral

| Aula | Data | Tema |
|------|------|------|
| [Aula 01](./aula-01/) | 14/07/2026 | O que é a Web e Estrutura HTML |
| [Aula 02](./aula-02/) | 15/07/2026 | Listas, Links, Imagens e Semântica HTML |
| [Aula 03](./aula-03/) | 16/07/2026 | Introdução ao CSS |
| — | 21–30/07 | *Recesso Acadêmico* |
| [Aula 04](./aula-04/) | 04/08/2026 | Revisão Ativa + CSS Layout (Flexbox) |
| [Aula 05](./aula-05/) | 05/08/2026 | Formulários HTML + Estilização CSS |
| [Aula 06](./aula-06/) | 06/08/2026 | Projeto Portfólio — Construção Guiada |
| [Aula 07](./aula-07/) | 11/08/2026 | JavaScript: Primeiros Passos |
| [Aula 08](./aula-08/) | 12/08/2026 | Condicionais e Manipulação do DOM |
| [Aula 09](./aula-09/) | 13/08/2026 | Eventos — Fazendo a Página Reagir |
| [Aula 10](./aula-10/) | 18/08/2026 | Funções Avançadas e Loops |
| [Aula 11](./aula-11/) | 19/08/2026 | Temporizadores e Atualização em Tempo Real |
| [Aula 12](./aula-12/) | 20/08/2026 | Construção da Interface do Dashboard IoT |
| [Aula 13](./aula-13/) | 25/08/2026 | Alertas Visuais e Lógica de Automação |
| [Aula 14](./aula-14/) | 26/08/2026 | Refinamento do Dashboard |
| [Aula 15](./aula-15/) | 27/08/2026 | Apresentações Finais e Encerramento |

## Estrutura de cada pasta

```
aula-XX/
├── index.md            # Visão geral da aula
├── slides.html         # Apresentação de slides
├── demo/
│   └── index.html      # HTML de demonstração (live coding)
├── exercicios.html     # Lista de exercícios
└── gabarito/
    ├── exercicio-01.html
    ├── exercicio-02.html
    └── exercicio-03.html
```

## Ferramentas necessárias

- **Editor de código:** VS Code ou Notepad++
- **Navegador:** Google Chrome (com DevTools)

## Sobre a Metodologia e o Material

Para garantir padronização e qualidade, o projeto foi estruturado em módulos práticos. O curso não ensina tecnologias de forma isolada; tudo tem um propósito focado em dois grandes entregáveis:

### 🎯 Projeto 1: Portfólio Pessoal (Aulas 01 a 06)
- Os alunos aprendem HTML semântico, links, listas, imagens e CSS Flexbox.
- O resultado é um **Portfólio Pessoal** responsivo entregue na Aula 06 como **1ª Avaliação**.

### 🎯 Projeto 2: Dashboard IoT (Aulas 07 a 15)
- Os alunos entram no mundo do **JavaScript**, aprendendo variáveis, condicionais, loops, temporizadores e manipulação do DOM.
- A aplicação é direta: criar um Painel IoT que lê sensores simulados, aplica cores de alerta (ex: Temp > 35°C), animações CSS e automações cruzadas.
- O material final inclui um [Checklist de Avaliação](./aula-14/checklist.html) e uma [Rubrica de Avaliação](./aula-15/rubrica.html).

### 🖥️ Sistema de Slides Customizado
Criamos um sistema de slides em HTML/CSS/JS puro (em `assets/`) para não depender de plataformas externas. Ele conta com:
- Navegação por botões na tela e teclado (setas).
- Barra de progresso interativa, blocos visuais padronizados (dicas, alertas) e destaque sintático de código.

> **💡 Dica Pedagógica:** Os alunos desta turma de IoT têm uma familiaridade maior com a lógica de programação de baixo nível. O JavaScript foi introduzido fazendo **paralelos diretos** com situações que eles já vivenciam com ESP32 e sensores, tornando o aprendizado de Front-End incrivelmente contextualizado e aplicável à realidade deles.
