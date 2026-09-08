import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { validarBiblioteca, verificarCitacoes } from '../scripts/fontes.mjs';

const CABECALHO = '| ID | Titulo | Tipo | Autor ou orgao | Versao / data | Caminho local ou URL verificada | Tema / indicador | Secao / paginas | Situacao de leitura | Aplicabilidade | Data da consulta | Restricoes de uso |';
const SEPARADOR = '|----|--------|------|----------------|---------------|--------------------------------|------------------|-----------------|---------------------|----------------|-----------------|-------------------|';

async function escreverIndice(raiz, linhas) {
    const pasta = join(raiz, '.docs', 'materiais-consulta');
    await mkdir(pasta, { recursive: true });
    const indice = join(pasta, 'index.md');
    await writeFile(indice, ['# Biblioteca', '', CABECALHO, SEPARADOR, ...linhas].join('\n'));
    return indice;
}

test('biblioteca valida arquivos locais, URLs e situacao de leitura', async () => {
    const raiz = await mkdtemp('/tmp/opencode/fontes-teste-');
    try {
        await mkdir(join(raiz, '.docs'), { recursive: true });
        await writeFile(join(raiz, '.docs', 'plano.md'), '# Plano');
        const indice = await escreverIndice(raiz, [
            '| fonte-plano | Plano | oficial | Orgao | 2026 | .docs/plano.md | Tema | Secao | consultado | Aula | 2026-09-09 | Interno |',
            '| fonte-manual | Manual | manual | Orgao | 2026 | https://example.com/manual | Tema | Secao | parcial | Aula | 2026-09-09 | Interno |'
        ]);
        const resultado = await validarBiblioteca({ raiz, biblioteca: indice });
        assert.deepEqual(resultado.erros, []);
        assert.deepEqual(resultado.avisos, []);
        assert.deepEqual(verificarCitacoes([{ id: 'fonte-plano' }], resultado.registros), { erros: [], avisos: [] });
    } finally {
        await rm(raiz, { recursive: true, force: true });
    }
});

test('biblioteca rejeita duplicados, arquivos ausentes e citacoes sem leitura', async () => {
    const raiz = await mkdtemp('/tmp/opencode/fontes-teste-');
    try {
        const indice = await escreverIndice(raiz, [
            '| fonte-x | Titulo | oficial | Orgao | 2026 | .docs/ausente.md | Tema | Secao | consultado | Aula | 2026-09-09 | Interno |',
            '| fonte-x | Titulo | oficial | Orgao | 2026 | https://example.com | Tema | Secao | nao-lido | Aula | 2026-09-09 | Interno |'
        ]);
        const resultado = await validarBiblioteca({ raiz, biblioteca: indice });
        assert.ok(resultado.erros.some((erro) => erro.includes('duplicado')));
        assert.ok(resultado.erros.some((erro) => erro.includes('ausente')));
        const citacoes = verificarCitacoes([{ id: 'fonte-ausente' }, { id: 'fonte-x' }], resultado.registros);
        assert.ok(citacoes.erros.some((erro) => erro.includes('fora do catalogo')));
        assert.ok(citacoes.avisos.some((aviso) => aviso.includes('sem leitura')));
    } finally {
        await rm(raiz, { recursive: true, force: true });
    }
});
