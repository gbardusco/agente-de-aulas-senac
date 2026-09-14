# Demonstração fictícia completa

Fluxo sintético de ponta a ponta, sem dados reais. Todos os identificadores usam `DEMO`.

## Executar

```bash
npm ci
npm run demo:fluxo -- --saida /tmp/opencode/demo-fluxo
```

O comando copia a fixture para um diretório isolado e gera, para cada aula
(`aula-03` PBL prática e `aula-04` PBL teórica):

- Slides HTML e PPTX a partir de `slides.json`.
- Relatório docente privado a partir de configuração e valores fictícios.
- Estado de aprovação e aplicação fictícias.
- Pacote ZIP somente com arquivos públicos.
- Verificação unificada em modo `distribuicao`.
- Resumo em `resumo.json` no diretório de saída.

Os artefatos desse comando ficam na saída temporária indicada. Os exemplos públicos
de slides HTML/PPTX estão em `exemplos/slides-praticos/` e `exemplos/slides-teoricos/`.
Relatórios nominais e pacotes ZIP não são versionados.
