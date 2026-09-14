# Avaliação, diário HTML e slides editáveis

## Preparar o projeto

Execute na raiz do clone. Requisitos: Bash para setup; Node.js 20+ e npm para slides
e testes. PptxGenJS e Ajv estão declarados em `package.json`, com versões resolvidas
em `package-lock.json`. Não é necessário LibreOffice para gerar PPTX.

```bash
bash preparar.sh "Nome do Projeto"
```

O setup preserva arquivos existentes, inclusive assets personalizados. Cria
`.docs/materiais-consulta/index.md`, `AULAS/registros-docentes/`, memórias genéricas
iniciais, índice/síntese e CSS/JS funcionais. Não faz Git init/add/commit/push.
Os templates por aula permanecem em `_templates/` até a aula ser definida.
Se um setup antigo deixou CSS placeholder, compare com `_templates/assets/` e
substitua somente com autorização; repetir setup não sobrescreve esse arquivo.

Cadastre documentos oficiais na biblioteca privada, com autor, versão/data,
caminho/URL verificada, tema/indicador, seção/página e restrições de uso. Agentes
priorizam Plano de Curso e normas institucionais, depois documentação primária,
depois complementos. Referências ausentes/conflitantes exigem consulta ao professor.

## Rubrica e feedback

```text
@[agente-orquestrador] Prepare a avaliação da atividade da aula 03 consultando
as referências oficiais da biblioteca. Pergunte-me critérios, escala, níveis,
pesos e formato de feedback que faltarem. Crie a rubrica como rascunho para
minha aprovação, sem inventar evidências ou resultados.
```

Use `_templates/rubrica-atividade-template.md` em
`AULAS/aula-03/rubrica-atividade.md`. Para várias atividades, use sufixos de ID.
Não há escala, nota, peso ou critério pedagógico escolhido pelo sistema. O professor
aprova os descritores, a composição e as preferências de devolutiva. A tabela pode
ter quantas linhas/colunas forem necessárias. Evidência esperada é planejamento;
evidência observada precisa de fonte real. Ausência de evidência é pendência.

## Diário HTML privado

```text
@[agente-diario-de-classe] Prepare o relatório HTML da aula 03 com os fatos
que forneci e a rubrica aprovada. Deixe pendentes os campos sem evidência.
Confirme comigo tom, extensão e estrutura do feedback antes de redigir.
```

Modelo: `_templates/relatorio-docente-template.html`.
Destino: `AULAS/registros-docentes/aula-03/relatorio.html`.
Assets relativos: `../../assets/relatorio.css` e `../../assets/relatorio.js`.
Para preparar manualmente uma aula nova (execute apenas se os destinos não existirem):

```bash
mkdir -p AULAS/aula-03 AULAS/registros-docentes/aula-03
cp -n _templates/rubrica-atividade-template.md AULAS/aula-03/rubrica-atividade.md
cp -n _templates/relatorio-docente-template.html AULAS/registros-docentes/aula-03/relatorio.html
cp -n _templates/slides-fonte-template.json AULAS/aula-03/slides.json
```

O HTML abre localmente. Possui os cinco campos de diário, configuração da avaliação
e rastreabilidade privada das evidências. Todos são `textarea` rotulados e editáveis.
Cada botão copia somente `value`, incluindo quebras de linha, sem HTML ou rótulo;
status por campo anuncia sucesso/falha. Sem Clipboard API/permissão, o campo fica
selecionado para Ctrl+C, Command+C ou menu de cópia do dispositivo. Sem JavaScript,
a seleção/cópia manual continua disponível.

**Persistência local e auditável.** As edições na aba continuam temporárias até a exportação.
Use a barra “Salvar e recuperar” do HTML ou os comandos abaixo. O JSON fica em
`AULAS/registros-docentes/aula-03/relatorio.json`, fora do Git e dos pacotes para alunos.

```bash
npm run relatorio -- gerar --aula aula-03 --config AULAS/registros-docentes/diario-config.json --valores /tmp/opencode/valores.json
npm run relatorio -- exportar --origem AULAS/registros-docentes/aula-03/relatorio.html --destino AULAS/registros-docentes/aula-03/relatorio.json
npm run relatorio -- importar --origem AULAS/registros-docentes/aula-03/relatorio.json --destino AULAS/registros-docentes/aula-03/relatorio.html
npm run relatorio -- validar --origem AULAS/registros-docentes/aula-03/relatorio.html
```

O agente diário escreve `valores.json` a partir do relato livre e da consulta à aula,
rubrica e registro anterior. Redige os campos possíveis; registra perguntas em
`pendencias` (lista de textos), sem inventar resultados. O gerador apenas valida e
renderiza. Sem redação ele falha; para um formulário vazio deliberado use `--modelo`.
A interface prioriza os textos para copiar/editar, com apoio e histórico recolhidos.

Slides v1 e v2 recebem uma capa automática antes do conteúdo/PBL. Na raiz da fonte,
use `title` e, se fornecidos, `subtitle`, `disciplina`, `professor`, `data`.
O tema tem capa escura, conteúdo claro e código em destaque; PPTX mantém texto/formas
editáveis. Blocos excedentes passam para continuação; um bloco grande demais é
recusado com orientação de divisão, sem encolher a fonte.

O salvamento automático no navegador é opcional, desativado por padrão, válido apenas
nesta máquina/navegador; os dados devem ser apagados em computadores compartilhados. A configuração
por sistema define campos, obrigatoriedade e limites confirmados; valores acima do limite
geram aviso, sem truncamento.
Impressão com JavaScript inclui valores atuais completos, mesmo textos longos.
Ao preencher o arquivo via agente, escape `&`, `<` e `>` em valores HTML.
Campos, quantidade de grupos e rótulos podem ser adaptados; mantenha IDs únicos,
`data-copy` apontando ao campo e status com ID `status-<id-do-campo>`.

## Slides da mesma fonte

O exemplo JSON é técnico e genérico, não uma aula aprovada nem evidência de aprendizagem.
Depois de adaptar `AULAS/aula-03/slides.json`:

```bash
npm run slides -- AULAS/aula-03/slides.json AULAS/aula-03
```

Teste rápido sem configurar uma turma:

```bash
npm run slides -- _templates/slides-fonte-template.json /tmp/opencode/slides-exemplo
```

Saídas: `slides.html` offline com CSS/JS incorporados e `slides.pptx` 16:9.
O comando **substitui esses dois arquivos** na pasta de saída; mantenha suas edições
na fonte JSON. Valida antes de escrever e termina com código diferente de zero em erro.
Não use o arquivo de entrada como um dos destinos. Erros de I/O ainda podem deixar
uma saída parcial; corrija a causa e gere novamente antes de distribuir.

Contrato v2 em `_templates/slides.schema.v2.json` para PBL; o contrato v1 permanece para
exposição legada. Tipos explícitos:

| Tipo | Campos | HTML / PPTX |
|------|--------|-------------|
| `problema` | `contexto`, `questao` | Caixa de problema / forma e texto editáveis |
| `hipoteses` | `items` | Lista rotulada / texto com marcadores |
| `investigacao` | `texto` | Destaque / caixa de texto |
| `conceito` | `texto` ou `items` | Parágrafo ou lista / caixa de texto |
| `aplicacao` | `modalidade`, `texto`, `codigo`/`demonstracao` quando prática | Prática operacional ou análise teórica |
| `sintese` | `texto` ou `items` | Fechamento / caixa de texto |

Campos desconhecidos, tipos inválidos, URLs inseguras e conteúdo excessivo são
rejeitados. O limite conservador de linhas exige dividir slides, não reduzir a fonte.
HTML usa botões, setas, Home/End, contador acessível e impressão de todos os slides.
No desktop, revise se cabe em uma tela; mobile/zoom pode rolar para manter legibilidade.

Texto, código e formas do PPTX são objetos nativos editáveis, não screenshots.
Não existe conversão de HTML arbitrário: HTML legado precisa de autoria/revisão
de uma fonte JSON. Não há suporte a imagens, tabelas complexas, animações, DOM ou CSS
arbitrário. Demos interativas executam apenas no navegador, nunca no PPTX; links
externos precisam de internet. Notas são públicas e aparecem como detalhes no HTML
e notas do apresentador no PPTX. Não coloque avaliações privadas nelas.
Fontes substitutas e quebras de linha podem variar entre PowerPoint/LibreOffice;
equivalência de conteúdo não significa identidade visual pixel a pixel.

## Aprovação, pacote e verificação

```bash
npm run aula:estado -- preparar --aula aula-03 --publicos slides.json,slides.html,slides.pptx,index.md,exercicios.html,rubrica-atividade.md
npm run aula:estado -- solicitar-revisao --aula aula-03
npm run aula:estado -- aprovar --aula aula-03 --rubrica rubrica-03-atividade-1-v1 --aprovadoPor "Docente" --aprovadoEm 2026-09-09 --fontes /tmp/opencode/fontes.json
npm run aula:estado -- marcar-aplicada --aula aula-03 --data 2026-09-09 --fonte "Registro do professor"
npm run pacote:alunos -- --aula aula-03 --saida /tmp/opencode/aula-03.zip
npm run verificar -- --aula aula-03 --modo distribuicao
npm run fontes -- --biblioteca .docs/materiais-consulta/index.md
```

Aprovação exige conteúdo em revisão, responsável, rubrica, fontes e hash atual. Qualquer
alteração posterior exige nova revisão antes de distribuir ou marcar como aplicado.
O pacote usa lista explícita, manifesto com hashes, exclui registros docentes e gabaritos
por padrão. **Nunca compacte `AULAS/` inteira.** O `.gitignore` protege o versionamento,
não filtra zip, impressão ou compartilhamento.

## Privacidade da distribuição

O repositório agora tem pipeline testável de pacotes, mas a regra continua fail-closed:
use arquivos públicos aprovados e inspecione o resultado. **Nunca compacte
`AULAS/` inteira.** Exclua sempre `AULAS/registros-docentes/`, `.docs/` (biblioteca
inclusive), `.memory/`, `.context/`, diário/síntese e feedbacks individuais de pacotes,
PDFs e HTMLs destinados a alunos. Gabaritos só com autorização explícita. Rubrica
pública contém critérios/descritores, nunca resultados, nomes ou evidências individuais.
O `.gitignore` protege o versionamento, não filtra zip, impressão ou compartilhamento.

## Verificação

```bash
npm test
npx playwright install chromium
npm run test:browser
npm run verificar -- --modo distribuicao
npm run demo:fluxo -- --saida /tmp/opencode/demo-fluxo
bash verificar-integridade.sh
npm audit --audit-level=high
```

Testes Node verificam schema, escapes, conteúdo/ordem/notas/links do OOXML, objetos
editáveis, falha sem sobrescrita, contratos de relatório/estado/pacote/fontes, demonstração
fictícia e setup idempotente em pasta temporária isolada.
Se LibreOffice estiver no PATH, abrem e reexportam PPTX, conferem conteúdo editável e
renderizam PDF; caso contrário esse teste é explicitamente ignorado. Testes Chromium
verificam cópia (API nativa, sucesso simulado e falha/ausência da API), seleção manual, mobile,
impressão, persistência/importação/salvamento-local, navegação e ausência de erros JS. Artefatos ficam em `/tmp/opencode/`.
O pacote fictício é gerado em diretório temporário e inspecionado entrada por entrada.
Ainda revise visualmente arquivos finais, inclusive no PowerPoint se for o destino.

### Segurança das dependências

Consulta ao npm registry em 2026-09-08: `pptxgenjs@4.0.1` ainda é o latest e
depende de `image-size@^1.2.1`; `image-size@2.0.2` (latest) e `1.2.1` (legacy)
continuam afetados por [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr)
e [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq).
Não execute `npm audit fix --force`: o downgrade sugerido para PptxGenJS 1.1.5
não preserva o contrato de API 4.x utilizado pelo gerador.

O `overrides` em `package.json` substitui essa dependência por
`npm:image-size-next@1.2.2`, versão exata do
[fork comunitário mantido](https://github.com/lcf2212dev/image-size-next).
A linha legacy 1.2.2 preserva a função CommonJS, buffers, caminhos e callbacks
da API 1.x; a linha latest 2.1.1 muda a API de arquivos e não foi adotada.
O código publicado da 1.2.2 foi conferido: entradas ICNS exigem tamanho mínimo
e progresso; caixas HEIF/JXL verificam limites e progresso, tratando tamanho
zero como fim do arquivo. É substituição real do parser, não supressão do audit.
A licença MIT e os créditos originais acompanham o pacote instalado; não há
vendoring nem patch em `node_modules`. O lock fixa o tarball e sua integridade.

`probe-image-size@7.4.0` foi considerado, mas precisaria de adaptação de API;
`fast-image-size@0.1.3` não tem publicação recente (última em 2016). O alias
compatível evita adapter próprio e troca do gerador. O fork escolhido é recente
(agosto de 2026), portanto sua manutenção e novos avisos devem ser acompanhados.

`npm ci` instala o alias e `npm audit` deve reportar zero vulnerabilidades.
`npm test` verifica a resolução efetiva a partir do PptxGenJS, API 1.x com
PNG/GIF/SVG e regressões ICNS/HEIF/JXL com tamanhos zero, pequenos e excessivos
em subprocessos terminados após 3 segundos se travarem. Os testes existentes
continuam verificando texto/formas PPTX editáveis. O schema permanece sem imagens;
estes testes não prometem suporte novo a imagens nem validação completa de formatos.
Reavalie/remova o override quando houver uma dependência upstream corrigida e
compatível, repetindo instalação limpa, audit e testes. Audit zero não substitui
revisão de segurança nem garante ausência de vulnerabilidades desconhecidas.
A CI executa instalação, auditoria de severidade alta, testes Node e Chromium,
verificação em modo distribuicao e `git diff --check` nas versões 20.x e 22.x.
O Dependabot propõe atualizações semanais de npm para revisão manual.

Verificação em 2026-09-08: `npm ci` concluído; `npm audit` com zero
vulnerabilidades; 9 testes Node e 3 testes Chromium aprovados, sem skips;
integridade com zero erros/avisos e `git diff --check` sem erros. LibreOffice
reabriu/reexportou o PPTX e gerou PDF; emitiu aviso de `javaldx`, sem falha dos
testes. Não houve revisão visual manual nem abertura no Microsoft PowerPoint.
