import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const temp = await mkdtemp('/tmp/opencode/agente-aulas-persistencia-');
await cp(join(root, '_templates/assets'), join(temp, 'AULAS/assets'), { recursive: true });
const report = join(temp, 'AULAS/registros-docentes/aula-01/relatorio.html');
await cp(join(root, '_templates/relatorio-docente-template.html'), report);

test('report saves, restores and keeps local data explicit and private', async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(pathToFileURL(report).href);
        assert.equal(await page.locator('#salvamento-local').isChecked(), false);
        assert.equal(await page.locator('#local-warning').isHidden(), true);
        assert.equal(await page.evaluate(() => window.localStorage.length), 0);

        await page.locator('#observacao-docente').fill('Texto editado para exportacao.');
        await page.waitForFunction(() => document.getElementById('relatorio-status').textContent.includes('ainda nao exportadas'));
        const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#exportar-json').click()]);
        assert.equal(download.suggestedFilename(), 'relatorio-aula-XX.json');
        const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
        assert.equal(exported.aulaId, 'aula-XX');
        assert.equal(exported.campos.find((field) => field.id === 'observacao-docente').valor, 'Texto editado para exportacao.');
        await page.waitForFunction(() => document.getElementById('relatorio-status').textContent.includes('Exportado em'));

        exported.campos.find((field) => field.id === 'feedback-individual').valor = 'Texto importado.';
        exported.campos.push({ id: 'feedback-aluno-demo-1', rotulo: 'Feedback do aluno demo 1', grupo: 'feedback', valor: 'Campo adicional.' });
        const upload = join(temp, 'relatorio-importacao.json');
        await writeFile(upload, JSON.stringify(exported));
        await page.locator('#importar-json').setInputFiles(upload);
        assert.equal(await page.locator('#feedback-individual').inputValue(), 'Texto importado.');
        assert.equal(await page.locator('#feedback-aluno-demo-1').inputValue(), 'Campo adicional.');
        assert.equal(await page.locator('[data-copy="feedback-aluno-demo-1"]').count(), 1);
        assert.equal(await page.locator('#status-feedback-aluno-demo-1').getAttribute('role'), 'status');

        await page.locator('#salvamento-local').check();
        assert.equal(await page.locator('#local-warning').isHidden(), false);
        await page.locator('#recuperacao').fill('Texto salvo localmente.');
        await page.waitForFunction(() => {
            const raw = window.localStorage.getItem('relatorio-docente:dados:aula-XX');
            return raw && JSON.parse(raw).campos.find((field) => field.id === 'recuperacao').valor === 'Texto salvo localmente.';
        });
        await page.locator('#salvamento-local').uncheck();
        await page.locator('#limpar-local').click();
        assert.equal(await page.evaluate(() => window.localStorage.length), 0);
        assert.equal(await page.locator('#salvamento-local').isChecked(), false);

        await page.emulateMedia({ media: 'print' });
        assert.equal(await page.locator('#persistencia').isHidden(), true);
        assert.deepEqual(errors, []);
    } finally {
        await browser.close();
    }
});
