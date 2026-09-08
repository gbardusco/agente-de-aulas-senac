import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, cp, mkdir, access, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { generateSlides, validateDeck, blockText, demoNotice } from '../scripts/gerar-slides.mjs';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const source = join(root, '_templates/slides-fonte-template.json');
const deck = JSON.parse(await readFile(source, 'utf8'));
const temp = await mkdtemp('/tmp/opencode/agente-aulas-test-');
const decode = (text) => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
async function slideTexts(file) {
    const zip = await JSZip.loadAsync(await readFile(file));
    const names = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort((a, b) => Number(a.match(/slide(\d+)/)[1]) - Number(b.match(/slide(\d+)/)[1]));
    const texts = [];
    for (const name of names) {
        const xml = await zip.file(name).async('string');
        assert.match(xml, /<p:sp>/, 'native editable shapes');
        assert.doesNotMatch(xml, /<p:pic>/, 'no slide screenshots');
        // Office may split indentation and content into separate runs in one paragraph.
        texts.push([...xml.matchAll(/<a:p>([\s\S]*?)<\/a:p>/g)].map((paragraph) =>
            [...paragraph[1].matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>|<a:br\s*\/>/g)]
                .map((match) => match[1] === undefined ? '\n' : decode(match[1])).join('')
        ).join('\n'));
    }
    return { zip, texts };
}

test('schema rejects invalid types, unsupported fields, unsafe URLs and overflow', () => {
    assert.equal(validateDeck(deck), deck);
    for (const invalid of [
        { ...deck, version: 3 }, { ...deck, slides: [] }, { ...deck, extra: true },
        { ...deck, slides: [{ title: 'X', blocks: [{ type: 'image', text: 'X' }] }] },
        { ...deck, slides: [{ title: 'X', blocks: [{ type: 'text', text: 10 }] }] },
        { ...deck, slides: [{ title: 'X', blocks: [{ type: 'demo', text: 'X', url: 'javascript:alert(1)' }] }] },
        { ...deck, slides: [{ title: 'X', blocks: [{ type: 'demo', text: 'X', url: 'https://user:secret@example.org' }] }] },
        { ...deck, slides: [{ title: 'X', blocks: [{ type: 'text', text: '   ' }] }] },
        { ...deck, slides: [{ title: 'X\nY', blocks: [{ type: 'text', text: 'X' }] }] },
        { ...deck, slides: [{ title: 'X', blocks: [{ type: 'text', text: 'X\u0000Y' }] }] },
        { ...deck, slides: [{ title: 'X', blocks: [{ type: 'bullets', items: [' '] }] }] },
        { ...deck, slides: [{ title: 'X', blocks: Array.from({ length: 4 }, () => ({ type: 'text', text: 'x'.repeat(600) })) }] }
    ]) assert.throws(() => validateDeck(invalid));
});

test('HTML and native PPTX preserve content, order, notes and demo limitations', async () => {
    const output = join(temp, 'generated');
    await generateSlides(source, output);
    const html = await readFile(join(output, 'slides.html'), 'utf8');
    const { zip, texts } = await slideTexts(join(output, 'slides.pptx'));
    assert.equal(texts.length, deck.slides.length);
    assert.match(html, /lang="pt-BR"/);
    for (const [index, slide] of deck.slides.entries()) {
        assert.ok(texts[index].includes(slide.title));
        assert.ok(html.includes(slide.title));
        for (const block of slide.blocks) {
            for (const line of blockText(block).split('\n')) {
                assert.ok(texts[index].includes(line), `PPTX missing ${line}`);
                assert.ok(decode(html).includes(line.replace(/^- /, '')), `HTML missing ${line}`);
            }
        }
        if (slide.notes) {
            assert.ok(html.includes(slide.notes));
            const notes = await zip.file(`ppt/notesSlides/notesSlide${index + 1}.xml`).async('string');
            assert.ok(decode(notes).includes(slide.notes));
        }
    }
    assert.ok(html.includes(demoNotice));
    const rels = await zip.file('ppt/slides/_rels/slide3.xml.rels').async('string');
    assert.ok(rels.includes(deck.slides[2].blocks[0].demonstracao.url));
    console.log(`Artefatos de teste: ${output}`);
});

test('invalid input cannot overwrite existing outputs; HTML content is escaped', async () => {
    const output = join(temp, 'invalid');
    await mkdir(output);
    await writeFile(join(output, 'slides.html'), 'preservar');
    const invalid = join(temp, 'invalid.json');
    await writeFile(invalid, JSON.stringify({ version: 1 }));
    await assert.rejects(generateSlides(invalid, output), /Fonte invalida/);
    assert.equal(await readFile(join(output, 'slides.html'), 'utf8'), 'preservar');
    await assert.rejects(generateSlides(join(output, 'slides.html'), output), /fonte nao pode/);
    await assert.rejects(access(join(output, 'slides.pptx')));
    const malicious = join(temp, 'escape.json');
    await writeFile(malicious, JSON.stringify({ version: 1, title: 'Test', slides: [{ title: 'Texto', blocks: [{ type: 'code', text: '</script><script>alert("x")</script>' }] }] }));
    await generateSlides(malicious, output);
    const html = await readFile(join(output, 'slides.html'), 'utf8');
    assert.ok(html.includes('&lt;/script&gt;&lt;script&gt;alert(&quot;x&quot;)'));
    assert.equal((html.match(/<script>/g) || []).length, 1);
    const cli = spawnSync(process.execPath, [join(root, 'scripts/gerar-slides.mjs'), invalid, output], { encoding: 'utf8' });
    assert.equal(cli.status, 1);
    assert.match(cli.stderr, /Fonte invalida/);
});

test('setup is idempotent, preserves existing content, prepares private library and functional assets without Git', async () => {
    const workspace = join(temp, 'setup com espacos');
    await mkdir(workspace);
    await cp(join(root, '_templates'), join(workspace, '_templates'), { recursive: true });
    await cp(join(root, 'setup.sh'), join(workspace, 'setup.sh'));
    const run = () => execFileSync('bash', ['setup.sh', 'Teste sem dados pessoais'], { cwd: workspace, encoding: 'utf8' });
    run();
    for (const asset of ['slides.css', 'slides.js', 'exercicios.css', 'relatorio.css', 'relatorio.js']) {
        assert.equal(await readFile(join(workspace, 'AULAS/assets', asset), 'utf8'), await readFile(join(root, '_templates/assets', asset), 'utf8'));
    }
    const preserved = ['.memory/perfil-turma.md', '.memory/feedback-aulas.md', 'AULAS/index.md', 'AULAS/sintese_diario_classe.md', 'AULAS/assets/slides.css', '.docs/materiais-consulta/index.md'];
    for (const file of preserved) await writeFile(join(workspace, file), `Personalizado: ${file}`);
    async function snapshot(directory) {
        const result = {};
        for (const entry of await readdir(directory, { withFileTypes: true })) {
            const path = join(directory, entry.name);
            result[entry.name] = entry.isDirectory() ? await snapshot(path) : await readFile(path, 'utf8');
        }
        return result;
    }
    const before = await snapshot(workspace);
    run();
    assert.deepEqual(await snapshot(workspace), before);
    await access(join(workspace, 'AULAS/registros-docentes'));
    await assert.rejects(access(join(workspace, '.git')));
    const ignores = spawnSync('git', ['check-ignore', '--no-index', '.docs/materiais-consulta/index.md', 'AULAS/registros-docentes/aula-01/relatorio.html'], { cwd: root, encoding: 'utf8' });
    assert.equal(ignores.status, 0);
    assert.equal(ignores.stdout.trim().split('\n').length, 2);
});

test('LibreOffice opens and re-exports the PPTX with editable content', async (t) => {
    if (spawnSync('libreoffice', ['--version']).status !== 0) { t.skip('LibreOffice indisponivel'); return; }
    const output = join(temp, 'libreoffice-input');
    await generateSlides(source, output);
    const converted = join(temp, 'libreoffice-output');
    await mkdir(converted);
    const profile = pathToFileURL(join(temp, 'lo-profile')).href;
    execFileSync('libreoffice', [`-env:UserInstallation=${profile}`, '--headless', '--convert-to', 'pptx', '--outdir', converted, join(output, 'slides.pptx')], { timeout: 90000, encoding: 'utf8' });
    const { texts } = await slideTexts(join(converted, 'slides.pptx'));
    assert.equal(texts.length, deck.slides.length);
    for (const [index, slide] of deck.slides.entries()) {
        assert.ok(texts[index].includes(slide.title));
        for (const block of slide.blocks) {
            for (const line of blockText(block).split('\n')) assert.ok(texts[index].includes(line), `Roundtrip missing ${line}`);
        }
    }
    execFileSync('libreoffice', [`-env:UserInstallation=${profile}`, '--headless', '--convert-to', 'pdf', '--outdir', converted, join(output, 'slides.pptx')], { timeout: 90000, encoding: 'utf8' });
    assert.equal((await readFile(join(converted, 'slides.pdf'))).subarray(0, 4).toString(), '%PDF');
    console.log(`PPTX reaberto e PDF renderizado: ${converted}`);
});
