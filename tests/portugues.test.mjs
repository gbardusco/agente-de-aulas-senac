import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { generateSlides } from '../scripts/gerar-slides.mjs';
import { gerarRelatorio, importarRelatorio } from '../scripts/relatorio-docente.mjs';

test('acentuação das fontes permanece no HTML, PPTX, rubrica e diário', async () => {
    const root = await mkdtemp(join(tmpdir(), 'portugues-'));
    const fixture = new URL('../exemplos/fluxo-completo-ficticio/aula-04/', import.meta.url);
    try {
        await generateSlides(fileURLToPath(new URL('slides.json', fixture)), root);
        const html = await readFile(join(root, 'slides.html'), 'utf8');
        const pptx = await JSZip.loadAsync(await readFile(join(root, 'slides.pptx')));
        const xml = (await Promise.all(Object.keys(pptx.files)
            .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
            .map((name) => pptx.file(name).async('string')))).join('\n');
        for (const texto of ['Interpretação de texto normativo', 'Hipóteses iniciais', 'Investigação orientada', 'Aplicação analítica', 'Síntese']) {
            assert.ok(html.includes(texto), `HTML perdeu acentuação: ${texto}`);
            assert.ok(xml.includes(texto), `PPTX perdeu acentuação: ${texto}`);
        }
        const rubrica = await readFile(new URL('rubrica-final.md', fixture), 'utf8');
        assert.match(rubrica, /Critério/);
        assert.match(rubrica, /Evidência esperada/);
        const frase = 'Análise da situação: hipóteses, critérios e ações de recuperação.';
        const relatorio = await gerarRelatorio({ raiz: root, aulaId: 'aula-04',
            valores: { campos: [{ id: 'atividades-chamada', valor: frase }] }
        });
        await importarRelatorio({ origemJson: relatorio.jsonPath, destinoHtml: relatorio.htmlPath });
        assert.ok((await readFile(relatorio.htmlPath, 'utf8')).includes(frase));
        assert.equal(JSON.parse(await readFile(relatorio.jsonPath, 'utf8')).campos.find((campo) => campo.id === 'atividades-chamada').valor, frase);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
