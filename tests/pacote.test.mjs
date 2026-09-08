import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import JSZip from 'jszip';
import { aprovarEstado, prepararEstado, solicitarRevisao } from '../scripts/aula-estado.mjs';
import { arquivoPermitido, empacotarAula } from '../scripts/pacote-alunos.mjs';

const AGORA = '2026-09-09T10:00:00-03:00';
const FONTES = [{ id: 'fonte-plano-ficticio', titulo: 'Plano ficticio', tipo: 'oficial', situacaoLeitura: 'consultado', dataConsulta: '2026-09-09' }];

async function escreverAula(raiz, arquivos) {
    for (const [caminho, conteudo] of Object.entries(arquivos)) {
        const destino = join(raiz, 'AULAS', 'aula-03', caminho);
        await mkdir(join(destino, '..'), { recursive: true });
        await writeFile(destino, conteudo);
    }
}

async function aprovarAula(raiz, publicos) {
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

async function entradas(zipPath) {
    const zip = await JSZip.loadAsync(await readFile(zipPath));
    return Object.keys(zip.files).filter((nome) => !nome.endsWith('/')).sort();
}

test('pacote contem somente arquivos publicos aprovados e manifesto verificavel', async () => {
    const raiz = await mkdtemp('/tmp/opencode/pacote-teste-');
    try {
        await escreverAula(raiz, {
            'slides.html': '<h1>Aula</h1>',
            'index.md': '# Aula',
            'rubrica-atividade.md': '# Rubrica',
            'gabarito/exercicio-01.html': '<p>Resposta</p>',
            'registros-docentes/relatorio.html': '<p>Privado</p>'
        });
        await aprovarAula(raiz, ['slides.html', 'index.md', 'rubrica-atividade.md']);
        const resultado = await empacotarAula({ raiz, aulaId: 'aula-03', destino: join(raiz, 'pacote.zip'), geradoEm: AGORA });
        assert.deepEqual(await entradas(resultado.caminhoSaida), [
            'aula-03/index.md',
            'aula-03/manifesto.json',
            'aula-03/rubrica-atividade.md',
            'aula-03/slides.html'
        ]);
        assert.equal(resultado.manifesto.gabaritoIncluido, false);
        assert.ok(resultado.manifesto.arquivos.every((arquivo) => arquivo.tamanho > 0));
    } finally {
        await rm(raiz, { recursive: true, force: true });
    }
});

test('pacote falha fechado para aula nao aprovada, desatualizada ou com caminho proibido', async () => {
    const raiz = await mkdtemp('/tmp/opencode/pacote-teste-');
    try {
        await escreverAula(raiz, { 'slides.html': '<h1>Aula</h1>' });
        await prepararEstado({ raiz, aulaId: 'aula-03', publicos: ['slides.html'], agora: AGORA });
        await assert.rejects(empacotarAula({ raiz, aulaId: 'aula-03', destino: join(raiz, 'a.zip') }), /nao esta aprovada/);
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
        await writeFile(join(raiz, 'AULAS', 'aula-03', 'slides.html'), '<h1>Alterada</h1>');
        await assert.rejects(empacotarAula({ raiz, aulaId: 'aula-03', destino: join(raiz, 'b.zip') }), /mudou apos/);
        assert.equal(arquivoPermitido('../fora.zip'), false);
        assert.equal(arquivoPermitido('slides.json'), true);
        assert.equal(arquivoPermitido('registros-docentes/relatorio.html'), false);
        assert.equal(arquivoPermitido('gabarito/exercicio.html'), false);
        assert.equal(arquivoPermitido('slides.html', false), true);
    } finally {
        await rm(raiz, { recursive: true, force: true });
    }
});

test('gabarito entra somente com autorizacao explicita', async () => {
    const raiz = await mkdtemp('/tmp/opencode/pacote-teste-');
    try {
        await escreverAula(raiz, { 'slides.html': '<h1>Aula</h1>', 'gabarito/exercicio-01.html': '<p>Resposta</p>' });
        await aprovarAula(raiz, ['slides.html', 'gabarito/exercicio-01.html']);
        await assert.rejects(empacotarAula({ raiz, aulaId: 'aula-03', destino: join(raiz, 'a.zip') }), /recusado/);
        const resultado = await empacotarAula({ raiz, aulaId: 'aula-03', destino: join(raiz, 'b.zip'), incluirGabarito: true, geradoEm: AGORA });
        assert.ok((await entradas(resultado.caminhoSaida)).includes('aula-03/gabarito/exercicio-01.html'));
        assert.equal(resultado.manifesto.gabaritoIncluido, true);
    } finally {
        await rm(raiz, { recursive: true, force: true });
    }
});
