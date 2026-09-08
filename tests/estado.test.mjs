import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { aprovarEstado, avaliarEstado, marcarAplicada, marcarRevisao, prepararEstado, solicitarRevisao } from '../scripts/aula-estado.mjs';

const AGORA = '2026-09-09T10:00:00-03:00';
const FONTES = [{ id: 'fonte-plano-ficticio', titulo: 'Plano ficticio', tipo: 'oficial', situacaoLeitura: 'consultado', dataConsulta: '2026-09-09' }];

async function prepararAula() {
    const raiz = await mkdtemp('/tmp/opencode/estado-teste-');
    const aula = join(raiz, 'AULAS', 'aula-03');
    await mkdir(aula, { recursive: true });
    await writeFile(join(aula, 'slides.json'), '{"version":1}');
    await writeFile(join(aula, 'index.md'), '# Aula');
    return raiz;
}

test('fluxo de aprovacao exige revisao, responsavel e conteudo inalterado', async () => {
    const raiz = await prepararAula();
    try {
        const preparado = await prepararEstado({ raiz, aulaId: 'aula-03', publicos: ['slides.json', 'index.md'], agora: AGORA });
        assert.equal(preparado.estado.estado, 'rascunho');
        await assert.rejects(aprovarEstado({
            raiz,
            aulaId: 'aula-03',
            rubricaId: 'rubrica-03-avaliacao-1-v1',
            aprovadoPor: 'Professor',
            aprovadoEm: '2026-09-09',
            fontes: FONTES,
            agora: AGORA
        }), /Apenas conteudo em revisao/);
        await solicitarRevisao({ raiz, aulaId: 'aula-03', agora: AGORA });
        await assert.rejects(aprovarEstado({
            raiz,
            aulaId: 'aula-03',
            rubricaId: 'rubrica-03-avaliacao-1-v1',
            aprovadoPor: '',
            aprovadoEm: '2026-09-09',
            fontes: FONTES,
            agora: AGORA
        }), /responsavel/);
        const aprovado = await aprovarEstado({
            raiz,
            aulaId: 'aula-03',
            rubricaId: 'rubrica-03-avaliacao-1-v1',
            aprovadoPor: 'Professor',
            aprovadoEm: '2026-09-09',
            fontes: FONTES,
            agora: AGORA
        });
        assert.equal(aprovado.estado.estado, 'aprovado');
        assert.deepEqual((await avaliarEstado({ raiz, aulaId: 'aula-03' })).atualizado, true);
        await assert.rejects(marcarAplicada({ raiz, aulaId: 'aula-03', data: '', fonte: 'x', agora: AGORA }), /data e fonte/);
        const aplicada = await marcarAplicada({ raiz, aulaId: 'aula-03', data: '2026-09-10', fonte: 'Registro do professor', agora: AGORA });
        assert.equal(aplicada.estado.estado, 'aplicado');
        assert.equal(JSON.parse(await readFile(join(raiz, 'AULAS', 'aula-03', 'aula-estado.json'), 'utf8')).historico.length, 4);
    } finally {
        await rm(raiz, { recursive: true, force: true });
    }
});

test('alteracao apos aprovacao exige nova revisao antes de aplicar', async () => {
    const raiz = await prepararAula();
    try {
        await prepararEstado({ raiz, aulaId: 'aula-03', publicos: ['slides.json'], agora: AGORA });
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
        await writeFile(join(raiz, 'AULAS', 'aula-03', 'slides.json'), '{"version":2}');
        const avaliacao = await avaliarEstado({ raiz, aulaId: 'aula-03' });
        assert.equal(avaliacao.atualizado, false);
        assert.equal(avaliacao.revisaoRecomendada, true);
        await assert.rejects(marcarAplicada({ raiz, aulaId: 'aula-03', data: '2026-09-10', fonte: 'Registro', agora: AGORA }), /alterado apos/);
        const revisao = await marcarRevisao({ raiz, aulaId: 'aula-03', motivo: 'Slide corrigido.', agora: AGORA });
        assert.equal(revisao.estado.estado, 'revisao-necessaria');
        await assert.rejects(marcarRevisao({ raiz, aulaId: 'aula-03', motivo: 'x', agora: AGORA }), /aprovado ou aplicado/);
    } finally {
        await rm(raiz, { recursive: true, force: true });
    }
});

test('estado extrai a pedagogia PBL da fonte de slides', async () => {
    const raiz = await mkdtemp('/tmp/opencode/estado-teste-');
    try {
        const aula = join(raiz, 'AULAS', 'aula-03');
        await mkdir(aula, { recursive: true });
        await writeFile(join(aula, 'slides.json'), JSON.stringify({
            version: 2,
            title: 'PBL',
            pedagogia: {
                abordagem: 'pbl',
                modalidadeAplicacao: 'analitica',
                problemaId: 'problema-03-demo-1',
                objetivos: ['Comparar'],
                fontes: ['fonte-x']
            },
            slides: []
        }));
        const preparado = await prepararEstado({ raiz, aulaId: 'aula-03', publicos: ['slides.json'], agora: AGORA });
        assert.equal(preparado.estado.pedagogia.modalidadeAplicacao, 'analitica');
        assert.equal(preparado.estado.pedagogia.problemaId, 'problema-03-demo-1');
        assert.deepEqual((await avaliarEstado({ raiz, aulaId: 'aula-03' })).pedagogia.objetivos, ['Comparar']);
    } finally {
        await rm(raiz, { recursive: true, force: true });
    }
});
