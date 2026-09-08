import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { generateSlides } from '../../scripts/gerar-slides.mjs';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const temp = await mkdtemp('/tmp/opencode/agente-aulas-browser-');
await mkdir(join(temp, 'AULAS/registros-docentes/aula-01'), { recursive: true });
await cp(join(root, '_templates/assets'), join(temp, 'AULAS/assets'), { recursive: true });
const report = join(temp, 'AULAS/registros-docentes/aula-01/relatorio.html');
await cp(join(root, '_templates/relatorio-docente-template.html'), report);
await generateSlides(join(root, '_templates/slides-fonte-template.json'), join(temp, 'AULAS/aula-01'));

test('report: text-only clipboard for each field, denied/unavailable fallback, mobile and print', async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(pathToFileURL(report).href);
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.locator('#observacao-docente').fill('Teste da Clipboard API nativa\nSomente texto.');
        await page.locator('[data-copy="observacao-docente"]').click();
        await page.waitForFunction(() => document.getElementById('status-observacao-docente').textContent === 'Texto copiado.');
        assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Teste da Clipboard API nativa\nSomente texto.');
        await page.evaluate(() => {
            window.copies = [];
            Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text) => { window.copies.push(text); } } });
        });
        const fields = await page.locator('textarea').evaluateAll((elements) => elements.map((field) => field.id));
        assert.equal(fields.length, 7);
        for (const id of fields) {
            assert.equal(await page.locator(`label[for="${id}"]`).count(), 1);
            assert.equal(await page.locator(`#status-${id}`).getAttribute('role'), 'status');
            const text = `Texto editado ${id}\n<strong>Somente texto & caracteres</strong>`;
            await page.locator(`#${id}`).fill(text);
            await page.locator(`[data-copy="${id}"]`).click();
            await page.waitForFunction((id) => document.getElementById(`status-${id}`).textContent === 'Texto copiado.', id);
            assert.equal(await page.evaluate(() => window.copies.at(-1)), text);
        }
        for (const mode of ['denied', 'unavailable']) {
            await page.evaluate((mode) => {
                Object.defineProperty(navigator, 'clipboard', { configurable: true, value: mode === 'unavailable' ? undefined : { writeText: async () => { throw new DOMException('Denied', 'NotAllowedError'); } } });
            }, mode);
            await page.locator('[data-copy="feedback-individual"]').click();
            await page.waitForFunction(() => document.getElementById('status-feedback-individual').textContent.includes('Texto selecionado'));
            const selected = await page.locator('#feedback-individual').evaluate((field) => ({ start: field.selectionStart, end: field.selectionEnd, length: field.value.length, focused: document.activeElement === field }));
            assert.deepEqual(selected, { start: 0, end: selected.length, length: selected.length, focused: true });
            assert.equal(await page.locator('[data-copy="feedback-individual"]').isEnabled(), true);
        }
        await page.setViewportSize({ width: 375, height: 812 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const button = await page.locator('[data-copy="recuperacao"]').boundingBox();
        assert.ok(button.height >= 44);
        const long = Array.from({ length: 80 }, (_, i) => `Linha ${i}: evidencia de teste, sem dados pessoais.`).join('\n');
        await page.locator('#recuperacao').fill(long);
        await page.emulateMedia({ media: 'print' });
        assert.equal(await page.locator('#recuperacao + .print-value').textContent(), long);
        assert.equal(await page.locator('#recuperacao').isVisible(), false);
        assert.equal(await page.locator('[data-copy="recuperacao"]').isVisible(), false);
        assert.equal(await page.locator('#recuperacao + .print-value').isVisible(), true);
        await page.pdf({ path: join(temp, 'relatorio.pdf'), format: 'A4' });
        assert.deepEqual(errors, []);
    } finally { await browser.close(); }
});

test('slides: offline assets, buttons, keyboard, boundaries, content, mobile and all-slide printing', async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        const requests = [];
        page.on('request', (request) => requests.push(request.url()));
        await page.goto(pathToFileURL(join(temp, 'AULAS/aula-01/slides.html')).href);
        assert.equal(requests.length, 1, 'HTML must be self-contained');
        const deck = JSON.parse(await readFile(join(root, '_templates/slides-fonte-template.json'), 'utf8'));
        assert.equal(await page.locator('.slide:visible').count(), 1);
        assert.equal(await page.locator('.nav-prev').isDisabled(), true);
        for (const [index, slide] of deck.slides.entries()) {
            assert.equal(await page.locator('.slide:visible h2').textContent(), slide.title);
            assert.equal(await page.locator('.slide-counter').textContent(), `${index + 1} / ${deck.slides.length}`);
            assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight), 'desktop content fits viewport');
            if (index < deck.slides.length - 1) await page.locator('.nav-next').click();
        }
        assert.equal(await page.locator('.nav-next').isDisabled(), true);
        assert.equal(await page.locator('.problem-box').count(), 1);
        assert.equal(await page.locator('.practice-box').count(), 1);
        await page.locator('body').click({ position: { x: 5, y: 100 } });
        await page.keyboard.press('Home');
        assert.equal(await page.locator('.slide-counter').textContent(), `1 / ${deck.slides.length}`);
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.locator('.slide-counter').textContent(), `2 / ${deck.slides.length}`);
        await page.keyboard.press('ArrowLeft');
        assert.equal(await page.locator('.slide-counter').textContent(), `1 / ${deck.slides.length}`);
        await page.keyboard.press('End');
        assert.equal(await page.locator('.slide-counter').textContent(), `${deck.slides.length} / ${deck.slides.length}`);
        for (const width of [375, 320]) {
            await page.setViewportSize({ width, height: 812 });
            for (let index = 0; index < deck.slides.length; index++) {
                await page.keyboard.press(index === 0 ? 'Home' : 'ArrowRight');
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            }
        }
        await page.emulateMedia({ media: 'print' });
        assert.equal(await page.locator('.slide:visible').count(), deck.slides.length);
        assert.equal(await page.locator('.nav-arrows').isVisible(), false);
        await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
        assert.equal(await page.locator('details p').isVisible(), true);
        assert.equal(await page.locator('details p').textContent(), deck.slides[1].notes);
        await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
        await page.pdf({ path: join(temp, 'slides.pdf'), format: 'A4', landscape: true });
        assert.deepEqual(errors, []);
        console.log(`PDFs de navegador: ${temp}`);
    } finally { await browser.close(); }
});

test('existing HTML templates load functional shared assets on desktop and mobile', async () => {
    await cp(join(root, '_templates/slides-template.html'), join(temp, 'AULAS/aula-01/modelo.html'));
    await cp(join(root, '_templates/exercicios-template.html'), join(temp, 'AULAS/aula-01/exercicios.html'));
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
        const failed = [];
        page.on('requestfailed', (request) => failed.push(request.url()));
        page.on('pageerror', (error) => failed.push(error.message));
        await page.goto(pathToFileURL(join(temp, 'AULAS/aula-01/modelo.html')).href);
        assert.equal(await page.locator('.slide:visible').count(), 1);
        await page.locator('.nav-next').click();
        assert.equal(await page.locator('.slide-counter').textContent(), '2 / 6');
        await page.setViewportSize({ width: 375, height: 812 });
        await page.locator('.nav-next').click();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.equal(await page.locator('.two-columns').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length), 1);
        await page.goto(pathToFileURL(join(temp, 'AULAS/aula-01/exercicios.html')).href);
        assert.equal(await page.locator('.exercise-card').count(), 3);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.equal(await page.locator('.exercise-card').first().evaluate((element) => getComputedStyle(element).backgroundColor), 'rgb(255, 255, 255)');
        await page.emulateMedia({ media: 'print' });
        assert.equal(await page.locator('.exercise-card:visible').count(), 3);
        assert.deepEqual(failed, []);
    } finally { await browser.close(); }
});
