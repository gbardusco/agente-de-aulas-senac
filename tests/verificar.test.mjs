import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aprovarEstado, prepararEstado, solicitarRevisao } from '../scripts/aula-estado.mjs';
import { gerarRelatorio } from '../scripts/relatorio-docente.mjs';
import { generateSlides } from '../scripts/gerar-slides.mjs';
import { registrar, resolverWikilink, verificarAula } from '../scripts/verificar.mjs';

const RAIZ_REPO = resolve(fileURLToPath(new URL('../', import.meta.url)));
const AGORA = '2026-09-09T10:00:00-03:00';
const FONTES = [{ id: 'fonte-plano-ficticio', titulo: 'Plano ficticio', tipo: 'oficial', situacaoLeitura: 'consultado', dataConsulta: '2026-09-09' }];
const CONFIG = join(RAIZ_REPO, '_templates/diario-sistema-template.json');

async function escreverBiblioteca(raiz) {
    const pasta = join(raiz, '.docs', 'materiais-consulta');
    await mkdir(pasta, { recursive: true });
    await writeFile(join(raiz, '.docs', 'plano-ficticio.md'), '# Plano ficticio');
    const indice = join(pasta, 'index.md');
    await writeFile(indice, [
        '# Biblioteca ficticia',
        '',
        '| ID | Titulo | Tipo | Autor ou orgao | Versao / data | Caminho local ou URL verificada | Tema / indicador | Secao / paginas | Situacao de leitura | Aplicabilidade | Data da consulta | Restricoes de uso |',
        '|----|--------|------|----------------|---------------|--------------------------------|------------------|-----------------|---------------------|----------------|-----------------|-------------------|',
        '| fonte-plano-ficticio | Plano ficticio | oficial | Orgao ficticio | 2026-01 | .docs/plano-ficticio.md | Indicador ficticio | Secao 1 | consultado | Aula 03 | 2026-09-09 | Uso interno |'
    ].join('\n'));
    return indice;
}

async function aprovar(raiz, publicos) {
    await prepararEstado({ raiz, aulaId: 'aula-03', publicos, agora: AGORA });
    await solicitarRevisao({ raiz, aulaId: 'aula-03', agora: AGORA });
    await aprovarEstado({
        raiz,
        aulaId: 'aula-03',
        rubricaId: 'rubrica-03-avaliacao-1-v1',
        aprovadoPor: 'Professor',
        aprovadoEm: '2026-09-09',
        fontes: FONTES,
        agora: AGORA
    });
}

test('wikilinks usam alias, caminho relativo e ignoram URLs', () => {
    const mapa = new Map([['status-aulas', ['.memory/status-aulas.md']]]);
    assert.equal(resolverWikilink(mapa, 'x.md', 'status-aulas').arquivo, '.memory/status-aulas.md');
    assert.equal(resolverWikilink(mapa, '.agents/a.md', 'https://example.com').ignorado, true);
    assert.equal(resolverWikilink(new Map(), 'x.md', 'status-aulas').turma, true);
    assert.equal(resolverWikilink(mapa, '.agents/a.md', '../AULAS/x').candidato, '../AULAS/x');
});

test('severidade separa bloqueio de revisao humana', () => {
    const relatorio = { erros: [], avisos: [] };
    registrar(relatorio, 'desenvolvimento', 'Pendente.', true);
    registrar(relatorio, 'distribuicao', 'Pendente.', true);
    assert.equal(relatorio.avisos.length, 1);
    assert.equal(relatorio.erros.length, 1);
});

test('aula completa e aprovada passa na verificacao de distribuicao', async () => {
    const raiz = await mkdtemp('/tmp/opencode/verificar-teste-');
    try {
        const aula = join(raiz, 'AULAS', 'aula-03');
        await mkdir(aula, { recursive: true });
        await cp(join(RAIZ_REPO, '_templates/slides-fonte-template.json'), join(aula, 'slides.json'));
        await generateSlides(join(aula, 'slides.json'), aula);
        await writeFile(join(aula, 'index.md'), '# Aula 03');
        await gerarRelatorio({
            raiz,
            aulaId: 'aula-03',
            configPath: CONFIG,
            atualizadoEm: AGORA,
            valores: {
                campos: [
                    { id: 'atividades-chamada', valor: 'Aula aplicada.' },
                    { id: 'feedback-individual', valor: 'Feedback observado.' },
                    { id: 'atividades-indicadores', valor: 'Indicador trabalhado.' },
                    { id: 'observacao-docente', valor: 'Observacao registrada.' },
                    { id: 'recuperacao', valor: 'Nenhuma acao necessaria.' }
                ]
            }
        });
        await aprovar(raiz, ['slides.json', 'slides.html', 'slides.pptx', 'index.md']);
        const biblioteca = await escreverBiblioteca(raiz);
        const resultado = await verificarAula({ raiz, aulaId: 'aula-03', biblioteca, modo: 'distribuicao' });
        assert.deepEqual(resultado.erros, []);
        assert.deepEqual(resultado.avisos, []);
    } finally {
        await rm(raiz, { recursive: true, force: true });
    }
});

test('placeholder em arquivo aprovado bloqueia distribuicao', async () => {
    const raiz = await mkdtemp('/tmp/opencode/verificar-teste-');
    try {
        const aula = join(raiz, 'AULAS', 'aula-03');
        await mkdir(aula, { recursive: true });
        await writeFile(join(aula, 'index.md'), '# Aula [preencher]');
        await aprovar(raiz, ['index.md']);
        const biblioteca = await escreverBiblioteca(raiz);
        const resultado = await verificarAula({ raiz, aulaId: 'aula-03', biblioteca, modo: 'distribuicao' });
        assert.ok(resultado.erros.some((erro) => erro.mensagem.includes('Placeholder')));
    } finally {
        await rm(raiz, { recursive: true, force: true });
    }
});
