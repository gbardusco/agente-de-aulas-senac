# Demonstracao ficticia completa

Fluxo sintético de ponta a ponta, sem dados reais. Todos os identificadores usam `DEMO`.

## Executar

```bash
npm ci
npm run demo:fluxo -- --saida /tmp/opencode/demo-fluxo
```

O comando copia a fixture para um diretorio isolado e gera, para cada aula
(`aula-03` PBL prática e `aula-04` PBL teórica):

- Slides HTML e PPTX a partir de `slides.json`.
- Relatorio docente privado a partir de configuracao e valores ficticios.
- Estado de aprovacao e aplicacao ficticias.
- Pacote ZIP somente com arquivos publicos.
- Verificacao unificada em modo distribuicao.
- Resumo em `resumo.json` no diretorio de saida.

Nenhum PPTX, ZIP ou relatorio nominal e versionado. Os artefatos ficam apenas na saida temporaria indicada.
