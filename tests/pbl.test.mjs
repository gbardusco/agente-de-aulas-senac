import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { generateSlides, validateDeck } from '../scripts/gerar-slides.mjs';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const pratica = join(root, '_templates/slides-fonte-template.json');
const teorica = join(root, '_templates/slides-fonte-teorica-template.json');
const decode = (text) => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

async function textosPptx(file) {
    const zip = await JSZip.loadAsync(await readFile(file));
    const names = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort((a, b) => Number(a.match(/slide(\d+)/)[1]) - Number(b.match(/slide(\d+)/)[1]));
    const texts = [];
    for (const name of names) {
        const xml = await zip.file(name).async('string');
        assert.match(xml, /<p:sp>/, 'native editable shapes');
        assert.doesNotMatch(xml, /<p:pic>/, 'no slide screenshots');
        texts.push([...xml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map((match) => decode(match[1])).join('\n'));
    }
    return texts;
}

test('PBL pratico e teorico geram HTML e PPTX equivalentes e editaveis', async () => {
    const temp = await mkdtemp('/tmp/opencode/pbl-teste-');
    try {
        for (const [fonte, rotulos] of [[pratica, ['Problema', 'Conceito', 'Aplicacao pratica', 'Sintese']], [teorica, ['Problema', 'Hipoteses', 'Investigacao', 'Conceito', 'Aplicacao analitica', 'Sintese']]]) {
            const saida = join(temp, String(rotulos.length));
            const deck = await generateSlides(fonte, saida);
            assert.equal(deck.version, 2);
            const html = await readFile(join(saida, 'slides.html'), 'utf8');
            const textos = await textosPptx(join(saida, 'slides.pptx'));
            assert.equal(textos.length, deck.slides.length);
            for (const rotulo of rotulos) {
                assert.ok(html.includes(rotulo), `HTML sem ${rotulo}`);
                assert.ok(textos.some((texto) => texto.includes(rotulo)), `PPTX sem ${rotulo}`);
            }
            assert.ok(!html.includes('<pre><code></pre>'));
        }
        const teoricaHtml = await readFile(join(temp, '6/slides.html'), 'utf8');
        assert.ok(!teoricaHtml.includes('Demo externa'));
    } finally {
        await rm(temp, { recursive: true, force: true });
    }
});

test('PBL rejeita arco incompleto, ordem errada e modalidade incoerente', () => {
    const base = {
        version: 2,
        title: 'PBL',
        pedagogia: { abordagem: 'pbl', modalidadeAplicacao: 'pratica', problemaId: 'problema-03-demo-1', objetivos: ['Aprender'], fontes: ['fonte-x'] },
        slides: [
            { title: 'Problema', blocks: [{ type: 'problema', contexto: 'C', questao: 'Q?' }] },
            { title: 'Conceito', blocks: [{ type: 'conceito', texto: 'T' }] },
            { title: 'Aplicacao', blocks: [{ type: 'aplicacao', modalidade: 'pratica', texto: 'Faca.', codigo: 'x' }] },
            { title: 'Sintese', blocks: [{ type: 'sintese', texto: 'Fim.' }] }
        ]
    };
    assert.equal(validateDeck(base).version, 2);
    const semSintese = { ...base, slides: base.slides.slice(0, 3) };
    assert.throws(() => validateDeck(semSintese), /incompleto/);
    const ordemErrada = { ...base, slides: [base.slides[1], base.slides[0], base.slides[2], base.slides[3]] };
    assert.throws(() => validateDeck(ordemErrada), /ordem/);
    const analiticaComCodigo = {
        ...base,
        pedagogia: { ...base.pedagogia, modalidadeAplicacao: 'analitica' },
        slides: [base.slides[0], base.slides[1], { title: 'Aplicacao', blocks: [{ type: 'aplicacao', modalidade: 'analitica', texto: 'Analise.', codigo: 'x' }] }, base.slides[3]]
    };
    assert.throws(() => validateDeck(analiticaComCodigo), /Fonte invalida/);
    const praticaSemArtefato = {
        ...base,
        slides: [base.slides[0], base.slides[1], { title: 'Aplicacao', blocks: [{ type: 'aplicacao', modalidade: 'pratica', texto: 'Faca.' }] }, base.slides[3]]
    };
    assert.throws(() => validateDeck(praticaSemArtefato), /Fonte invalida|codigo ou demonstracao/);
});

test('exposicao legada v1 continua valida', () => {
    const legado = {
        version: 1,
        title: 'Legado',
        slides: [{ title: 'Conceito', blocks: [{ type: 'text', text: 'Contexto e conceito em exposicao.' }] }]
    };
    assert.equal(validateDeck(legado).version, 1);
});
