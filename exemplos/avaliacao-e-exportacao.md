# Avaliacao, diario HTML e slides editaveis

## Preparar o projeto

Execute na raiz do clone. Requisitos: Bash para setup; Node.js 20+ e npm para slides
e testes. PptxGenJS e Ajv estao declarados em `package.json`, com versoes resolvidas
em `package-lock.json`. Nao e necessario LibreOffice para gerar PPTX.

```bash
./setup.sh "Nome do Projeto"
npm ci
```

O setup preserva arquivos existentes, inclusive assets personalizados. Cria
`.docs/materiais-consulta/index.md`, `AULAS/registros-docentes/`, memorias genericas
iniciais, indice/sintese e CSS/JS funcionais. Nao faz Git init/add/commit/push.
Os templates por aula permanecem em `_templates/` ate a aula ser definida.
Se um setup antigo deixou CSS placeholder, compare com `_templates/assets/` e
substitua somente com autorizacao; repetir setup nao sobrescreve esse arquivo.

Cadastre documentos oficiais na biblioteca privada, com autor, versao/data,
caminho/URL verificada, tema/indicador, secao/pagina e restricoes de uso. Agentes
priorizam Plano de Curso e normas institucionais, depois documentacao primaria,
depois complementos. Referencias ausentes/conflitantes exigem consulta ao professor.

## Rubrica e feedback

```text
@[agente-orquestrador] Prepare a avaliacao da atividade da aula 03 consultando
as referencias oficiais da biblioteca. Pergunte-me criterios, escala, niveis,
pesos e formato de feedback que faltarem. Crie a rubrica como rascunho para
minha aprovacao, sem inventar evidencias ou resultados.
```

Use `_templates/rubrica-atividade-template.md` em
`AULAS/aula-03/rubrica-atividade.md`. Para varias atividades, use sufixos de ID.
Nao ha escala, nota, peso ou criterio pedagogico escolhido pelo sistema. O professor
aprova os descritores, a composicao e as preferencias de devolutiva. A tabela pode
ter quantas linhas/colunas forem necessarias. Evidencia esperada e planejamento;
evidencia observada precisa de fonte real. Ausencia de evidencia e pendencia.

## Diario HTML privado

```text
@[agente-diario-de-classe] Prepare o relatorio HTML da aula 03 com os fatos
que forneci e a rubrica aprovada. Deixe pendentes os campos sem evidencia.
Confirme comigo tom, extensao e estrutura do feedback antes de redigir.
```

Modelo: `_templates/relatorio-docente-template.html`.
Destino: `AULAS/registros-docentes/aula-03/relatorio.html`.
Assets relativos: `../../assets/relatorio.css` e `../../assets/relatorio.js`.
Para preparar manualmente uma aula nova (execute apenas se os destinos nao existirem):

```bash
mkdir -p AULAS/aula-03 AULAS/registros-docentes/aula-03
cp -n _templates/rubrica-atividade-template.md AULAS/aula-03/rubrica-atividade.md
cp -n _templates/relatorio-docente-template.html AULAS/registros-docentes/aula-03/relatorio.html
cp -n _templates/slides-fonte-template.json AULAS/aula-03/slides.json
```

O HTML abre localmente. Possui os cinco campos de diario, configuracao da avaliacao
e rastreabilidade privada das evidencias. Todos sao `textarea` rotulados e editaveis.
Cada botao copia somente `value`, incluindo quebras de linha, sem HTML ou rotulo;
status por campo anuncia sucesso/falha. Sem Clipboard API/permissao, o campo fica
selecionado para Ctrl+C, Command+C ou menu de copia do dispositivo. Sem JavaScript,
a selecao/copia manual continua disponivel.

**Persistencia local e auditavel.** As edicoes na aba continuam temporarias ate exportacao.
Use a barra “Salvar e recuperar” do HTML ou os comandos abaixo. O JSON fica em
`AULAS/registros-docentes/aula-03/relatorio.json`, fora do Git e dos pacotes para alunos.

```bash
npm run relatorio -- gerar --aula aula-03 --config AULAS/registros-docentes/diario-config.json --valores /tmp/opencode/valores.json
npm run relatorio -- exportar --origem AULAS/registros-docentes/aula-03/relatorio.html --destino AULAS/registros-docentes/aula-03/relatorio.json
npm run relatorio -- importar --origem AULAS/registros-docentes/aula-03/relatorio.json --destino AULAS/registros-docentes/aula-03/relatorio.html
npm run relatorio -- validar --origem AULAS/registros-docentes/aula-03/relatorio.html
```

O salvamento automatico no navegador e opcional, desativado por padrao, valido apenas
nesta maquina/navegador e deve ser apagado em computadores compartilhados. A configuracao
por sistema define campos, obrigatoriedade e limites confirmados; valores acima do limite
geram aviso, sem truncamento.
Impressao com JavaScript inclui valores atuais completos, mesmo textos longos.
Ao preencher o arquivo via agente, escape `&`, `<` e `>` em valores HTML.
Campos, quantidade de grupos e rotulos podem ser adaptados; mantenha IDs unicos,
`data-copy` apontando ao campo e status com ID `status-<id-do-campo>`.

## Slides da mesma fonte

O exemplo JSON e tecnico e generico, nao aula aprovada nem evidencia de aprendizagem.
Depois de adaptar `AULAS/aula-03/slides.json`:

```bash
npm run slides -- AULAS/aula-03/slides.json AULAS/aula-03
```

Teste rapido sem configurar uma turma:

```bash
npm run slides -- _templates/slides-fonte-template.json /tmp/opencode/slides-exemplo
```

Saidas: `slides.html` offline com CSS/JS incorporados e `slides.pptx` 16:9.
O comando **substitui esses dois arquivos** na pasta de saida; mantenha suas edicoes
na fonte JSON. Valida antes de escrever e termina com codigo diferente de zero em erro.
Nao use o arquivo de entrada como um dos destinos. Erros de I/O ainda podem deixar
uma saida parcial; corrija a causa e gere novamente antes de distribuir.

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

Campos desconhecidos, tipos invalidos, URLs inseguras e conteudo excessivo sao
rejeitados. O limite conservador de linhas exige dividir slides, nao reduzir a fonte.
HTML usa botoes, setas, Home/End, contador acessivel e impressao de todos os slides.
No desktop, revise se cabe em uma tela; mobile/zoom pode rolar para manter legibilidade.

Texto, codigo e formas do PPTX sao objetos nativos editaveis, nao screenshots.
Nao existe conversao de HTML arbitrario: HTML legado precisa de autoria/revisao
de uma fonte JSON. Nao ha suporte a imagens, tabelas complexas, animacoes, DOM ou CSS
arbitrario. Demos interativas executam apenas no navegador, nunca no PPTX; links
externos precisam de internet. Notas sao publicas e aparecem como detalhes no HTML
e notas do apresentador no PPTX. Nao coloque avaliacoes privadas nelas.
Fontes substitutas e quebras de linha podem variar entre PowerPoint/LibreOffice;
equivalencia de conteudo nao significa identidade visual pixel a pixel.

## Aprovacao, pacote e verificacao

```bash
npm run aula:estado -- preparar --aula aula-03 --publicos slides.json,slides.html,slides.pptx,index.md,exercicios.html,rubrica-atividade.md
npm run aula:estado -- solicitar-revisao --aula aula-03
npm run aula:estado -- aprovar --aula aula-03 --rubrica rubrica-03-atividade-1-v1 --aprovadoPor "Docente" --aprovadoEm 2026-09-09 --fontes /tmp/opencode/fontes.json
npm run aula:estado -- marcar-aplicada --aula aula-03 --data 2026-09-09 --fonte "Registro do professor"
npm run pacote:alunos -- --aula aula-03 --saida /tmp/opencode/aula-03.zip
npm run verificar -- --aula aula-03 --modo distribuicao
npm run fontes -- --biblioteca .docs/materiais-consulta/index.md
```

Aprovacao exige conteudo em revisao, responsavel, rubrica, fontes e hash atual. Qualquer
alteracao posterior exige nova revisao antes de distribuir ou marcar como aplicado.
O pacote usa lista explicita, manifesto com hashes, exclui registros docentes e gabaritos
por padrao. **Nunca compacte `AULAS/` inteira.** O `.gitignore` protege o versionamento,
nao filtra zip, impressao ou compartilhamento.

## Privacidade da distribuicao

O repositorio agora tem pipeline testavel de pacotes, mas a regra continua fail-closed:
use arquivos publicos aprovados e inspecione o resultado. **Nunca compacte
`AULAS/` inteira.** Exclua sempre `AULAS/registros-docentes/`, `.docs/` (biblioteca
inclusive), `.memory/`, `.context/`, diario/sintese e feedbacks individuais de pacotes,
PDFs e HTMLs destinados a alunos. Gabaritos so com autorizacao explicita. Rubrica
publica contem criterios/descritores, nunca resultados, nomes ou evidencias individuais.
O `.gitignore` protege o versionamento, nao filtra zip, impressao ou compartilhamento.

## Verificacao

```bash
npm test
npx playwright install chromium
npm run test:browser
npm run verificar -- --modo distribuicao
npm run demo:fluxo -- --saida /tmp/opencode/demo-fluxo
bash verificar-integridade.sh
npm audit --audit-level=high
```

Testes Node verificam schema, escapes, conteudo/ordem/notas/links do OOXML, objetos
editaveis, falha sem sobrescrita, contratos de relatorio/estado/pacote/fontes, demonstracao
ficticia e setup idempotente em pasta temporaria isolada.
Se LibreOffice estiver no PATH, abrem e reexportam PPTX, conferem conteudo editavel e
renderizam PDF; caso contrario esse teste e explicitamente ignorado. Testes Chromium
verificam copia (API nativa, sucesso simulado e falha/ausencia da API), selecao manual, mobile,
impressao, persistencia/importacao/salvamento-local, navegação e ausencia de erros JS. Artefatos ficam em `/tmp/opencode/`.
O pacote ficticio e gerado em diretorio temporario e inspecionado entrada por entrada.
Ainda revise visualmente arquivos finais, inclusive no PowerPoint se for o destino.

### Seguranca das dependencias

Consulta ao npm registry em 2026-09-08: `pptxgenjs@4.0.1` ainda e o latest e
depende de `image-size@^1.2.1`; `image-size@2.0.2` (latest) e `1.2.1` (legacy)
continuam afetados por [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr)
e [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq).
Nao execute `npm audit fix --force`: o downgrade sugerido para PptxGenJS 1.1.5
nao preserva o contrato de API 4.x utilizado pelo gerador.

O `overrides` em `package.json` substitui essa dependencia por
`npm:image-size-next@1.2.2`, versao exata do
[fork comunitario mantido](https://github.com/lcf2212dev/image-size-next).
A linha legacy 1.2.2 preserva a funcao CommonJS, buffers, caminhos e callbacks
da API 1.x; a linha latest 2.1.1 muda a API de arquivos e nao foi adotada.
O codigo publicado da 1.2.2 foi conferido: entradas ICNS exigem tamanho minimo
e progresso; caixas HEIF/JXL verificam limites e progresso, tratando tamanho
zero como fim do arquivo. E substituicao real do parser, nao supressao do audit.
A licenca MIT e os creditos originais acompanham o pacote instalado; nao ha
vendoring nem patch em `node_modules`. O lock fixa o tarball e sua integridade.

`probe-image-size@7.4.0` foi considerado, mas precisaria de adaptacao de API;
`fast-image-size@0.1.3` nao tem publicacao recente (ultima em 2016). O alias
compativel evita adapter proprio e troca do gerador. O fork escolhido e recente
(agosto de 2026), portanto sua manutencao e novos avisos devem ser acompanhados.

`npm ci` instala o alias e `npm audit` deve reportar zero vulnerabilidades.
`npm test` verifica a resolucao efetiva a partir do PptxGenJS, API 1.x com
PNG/GIF/SVG e regressoes ICNS/HEIF/JXL com tamanhos zero, pequenos e excessivos
em subprocessos terminados apos 3 segundos se travarem. Os testes existentes
continuam verificando texto/formas PPTX editaveis. O schema permanece sem imagens;
estes testes nao prometem suporte novo a imagens nem validacao completa de formatos.
Reavalie/remova o override quando houver uma dependencia upstream corrigida e
compativel, repetindo instalacao limpa, audit e testes. Audit zero nao substitui
revisao de seguranca nem garante ausencia de vulnerabilidades desconhecidas.
A CI executa instalacao, auditoria de severidade alta, testes Node e Chromium,
verificacao em modo distribuicao e `git diff --check` nas versoes 20.x e 22.x.
O Dependabot propoe atualizacoes semanais de npm para revisao manual.

Verificacao em 2026-09-08: `npm ci` concluido; `npm audit` com zero
vulnerabilidades; 9 testes Node e 3 testes Chromium aprovados, sem skips;
integridade com zero erros/avisos e `git diff --check` sem erros. LibreOffice
reabriu/reexportou o PPTX e gerou PDF; emitiu aviso de `javaldx`, sem falha dos
testes. Nao houve revisao visual manual nem abertura no Microsoft PowerPoint.
