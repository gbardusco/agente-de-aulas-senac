# Comece em três ações

Você conversa com a IA, recebe materiais e revisa antes de usar.

**Instale uma vez:** [Node.js 20+ com npm](https://nodejs.org/en/download),
[Git](https://git-scm.com/downloads) (para clonar e, no Windows, usar Git Bash) e
[OpenCode](https://opencode.ai/docs/) ou outro assistente que leia e edite arquivos locais.
No assistente, conecte seu provedor de IA seguindo a [configuração de provedores](https://opencode.ai/docs/providers/).
Pode exigir conta, chave de API ou assinatura; cobranças dependem do provedor/modelo.
[Obsidian](https://obsidian.md/download) é opcional para navegar nas notas.

## 1. Obter e abrir a pasta

Baixe o ZIP pelo botão **Code → Download ZIP** no GitHub e extraia, ou clone:

```bash
git clone https://github.com/gbardusco/agente-de-aulas-senac.git meu-curso
cd meu-curso
```

Abra essa pasta no assistente e no terminal.
**Windows:** use **Git Bash** (não cole comandos Bash no PowerShell/CMD).
**Linux/macOS:** use o Terminal com Bash instalado.

## 2. Preparar

Na pasta que contém `preparar.sh`:

```bash
bash preparar.sh "Nome da Disciplina"
```

O comando verifica pré-requisitos, instala dependências e cria a estrutura,
preservando os materiais existentes. Requer internet para a instalação.
Se falhar, corrija a mensagem e execute novamente; só prossiga quando aparecer **Preparado**.

## 3. Conversar

Cole no chat com a pasta aberta:

```text
Leia .agents/AGENTS.md e .agents/agente-setup-inicial.md.
Ajude-me a cadastrar a turma, perguntando apenas o que faltar.
Disciplina: [nome]. Curso/período: [dados]. Quero criar a aula 1 sobre [tema],
com slides HTML e PPTX, exercícios e rubrica para minha revisão.
```

Os arquivos `.agents/` são contratos do workspace: não há promessa de registro
nativo automático no OpenCode. Peça sua leitura explicitamente em um novo chat.
O agente consulta as referências disponíveis e pergunta pelos dados ausentes.

Depois da aula:

```text
Leia .agents/AGENTS.md e .agents/agente-diario-de-classe.md.
Apliquei a aula 1. Meu relato: [conte livremente o que aconteceu].
Consulte aula, rubrica e registros. Redija os campos possíveis, sem inventar fatos,
gere o JSON validado e o relatório HTML. Separe perguntas específicas dos textos para copiar.
```

Materiais ficam em `AULAS/aula-01/`; relatório privado em
`AULAS/registros-docentes/aula-01/relatorio.html`. No relatório, revise/copie os textos
e use **Salvar e recuperar → Exportar JSON** para guardar edições.

**Demonstração opcional**, com dados fictícios e pasta de saída nova:

```bash
npm run demo:fluxo -- --saida ../demo-curso
```

Mais comandos: [avaliação e exportação](exemplos/avaliacao-e-exportacao.md).
