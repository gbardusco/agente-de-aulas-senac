import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import Ajv from 'ajv';
import pptxgen from 'pptxgenjs';

const schemaV1 = JSON.parse(await readFile(new URL('../_templates/slides.schema.json', import.meta.url), 'utf8'));
const schemaV2 = JSON.parse(await readFile(new URL('../_templates/slides.schema.v2.json', import.meta.url), 'utf8'));
const ajv = new Ajv({ allErrors: true });
const validateV1 = ajv.compile(schemaV1);
const validateV2 = ajv.compile(schemaV2);
const escape = (text) => text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const demoNotice = 'Demo externa: abrir no navegador. O PPTX nao executa HTML, CSS ou JavaScript.';
const ROTULOS = {
    problema: 'Problema',
    hipoteses: 'Hipoteses',
    investigacao: 'Investigacao',
    conceito: 'Conceito',
    sintese: 'Sintese'
};

export function textosDoBloco(block) {
    if (block.type === 'bullets' || block.type === 'hipoteses') return block.items;
    if (block.type === 'problema') return [block.contexto, block.questao];
    if (block.type === 'investigacao' || (block.type === 'conceito' && block.texto) || (block.type === 'sintese' && block.texto)) return [block.texto];
    if ((block.type === 'conceito' || block.type === 'sintese') && block.items) return block.items;
    if (block.type === 'aplicacao') {
        const partes = [block.texto];
        if (block.codigo) partes.push(block.codigo);
        if (block.demonstracao) partes.push(block.demonstracao.texto, block.demonstracao.url, demoNotice);
        return partes;
    }
    if (block.type === 'demo') return [block.text, block.url, demoNotice];
    return [block.text];
}

export function blockText(block) {
    if (block.type === 'bullets' || block.type === 'hipoteses' || ((block.type === 'conceito' || block.type === 'sintese') && block.items)) {
        const rotulo = ROTULOS[block.type] ? `${ROTULOS[block.type]}\n` : '';
        return `${rotulo}${block.items.map((item) => `- ${item}`).join('\n')}`;
    }
    if (block.type === 'demo') return `${block.text}\n${block.url}\n${demoNotice}`;
    if (block.type === 'problema') return `Problema\n${block.contexto}\n${block.questao}`;
    if (block.type === 'aplicacao') {
        const rotulo = block.modalidade === 'pratica' ? 'Aplicacao pratica' : 'Aplicacao analitica';
        return `${rotulo}\n${textosDoBloco(block).join('\n')}`;
    }
    if (ROTULOS[block.type]) return `${ROTULOS[block.type]}\n${block.texto}`;
    return block.text;
}

function segmentosBloco(block) {
    if (block.type === 'aplicacao' && block.codigo) {
        const segmentos = [{ texto: `${block.modalidade === 'pratica' ? 'Aplicacao pratica' : 'Aplicacao analitica'}\n${block.texto}`, mono: false, destaque: true }];
        segmentos.push({ texto: block.codigo, mono: true, destaque: true });
        if (block.demonstracao) segmentos.push({ texto: `${block.demonstracao.texto}\n${block.demonstracao.url}\n${demoNotice}`, mono: false, destaque: false, url: block.demonstracao.url });
        return segmentos;
    }
    if (block.type === 'aplicacao' && block.demonstracao) {
        return [
            { texto: `${block.modalidade === 'pratica' ? 'Aplicacao pratica' : 'Aplicacao analitica'}\n${block.texto}`, mono: false, destaque: true },
            { texto: `${block.demonstracao.texto}\n${block.demonstracao.url}\n${demoNotice}`, mono: false, destaque: false, url: block.demonstracao.url }
        ];
    }
    return [{
        texto: blockText(block),
        mono: block.type === 'code',
        destaque: ['code', 'callout', 'problema', 'aplicacao'].includes(block.type),
        ...(block.type === 'demo' ? { url: block.url } : {})
    }];
}

// A conservative line budget keeps native PPTX text legible without shrinking it.
function blockLines(block) {
    return segmentosBloco(block).reduce((soma, segmento) => {
        const width = segmento.mono ? 76 : 75;
        return soma + segmento.texto.split('\n').reduce((total, line) => total + Math.max(1, Math.ceil(line.length / width)), 0);
    }, 0);
}

function blocoVazio(block) {
    return textosDoBloco(block).some((texto) => !texto.trim());
}

function validarPBL(deck) {
    const sequencia = deck.slides.flatMap((slide) => slide.blocks.map((block) => block.type));
    const primeira = (tipo) => sequencia.indexOf(tipo);
    for (const etapa of ['problema', 'conceito', 'aplicacao', 'sintese']) {
        if (!sequencia.includes(etapa)) throw new Error(`Arco PBL incompleto: falta a etapa ${etapa}.`);
    }
    if (!(primeira('problema') < primeira('conceito') && primeira('conceito') < primeira('aplicacao'))) {
        throw new Error('Arco PBL fora de ordem: use problema, conceito e aplicacao nesta sequencia.');
    }
    if (!(sequencia.lastIndexOf('sintese') > sequencia.lastIndexOf('aplicacao'))) {
        throw new Error('Arco PBL fora de ordem: a sintese deve fechar a aplicacao.');
    }
    for (const [indice, tipo] of sequencia.entries()) {
        if ((tipo === 'hipoteses' || tipo === 'investigacao') && !(indice > primeira('problema') && indice < primeira('conceito'))) {
            throw new Error('Hipotese ou investigacao fora do lugar: coloque entre problema e conceito.');
        }
    }
    const modalidades = sequencia.filter((tipo) => tipo === 'aplicacao').map((_, indice) => deck.slides.flatMap((slide) => slide.blocks).filter((block) => block.type === 'aplicacao')[indice].modalidade);
    if (deck.pedagogia.modalidadeAplicacao === 'pratica' && modalidades.some((modalidade) => modalidade !== 'pratica')) {
        throw new Error('Modalidade pratica exige todas as aplicacoes praticas.');
    }
    if (deck.pedagogia.modalidadeAplicacao === 'analitica' && modalidades.some((modalidade) => modalidade !== 'analitica')) {
        throw new Error('Modalidade analitica exige todas as aplicacoes analiticas.');
    }
    if (deck.pedagogia.modalidadeAplicacao === 'mista' && (!modalidades.includes('pratica') || !modalidades.includes('analitica'))) {
        throw new Error('Modalidade mista exige ao menos uma aplicacao pratica e uma analitica.');
    }
    if (['pratica', 'mista'].includes(deck.pedagogia.modalidadeAplicacao)) {
        const pratica = deck.slides.flatMap((slide) => slide.blocks).some((block) => block.type === 'aplicacao' && block.modalidade === 'pratica' && (block.codigo || block.demonstracao));
        if (!pratica) throw new Error('Aplicacao pratica exige codigo ou demonstracao em ao menos um bloco.');
    }
}

export function validateDeck(deck) {
    if (!deck || typeof deck !== 'object') throw new Error('Fonte invalida: JSON incompativel.');
    if (deck.version === 1) {
        if (!validateV1(deck)) throw new Error(`Fonte invalida: ${ajv.errorsText(validateV1.errors, { separator: '; ' })}`);
    } else if (deck.version === 2) {
        if (!validateV2(deck)) throw new Error(`Fonte invalida: ${ajv.errorsText(validateV2.errors, { separator: '; ' })}`);
        validarPBL(deck);
    } else {
        throw new Error('Fonte invalida: versao nao suportada. Use 1 para exposicao legada ou 2 para PBL.');
    }
    const strings = [deck.title, ...deck.slides.flatMap((slide) => [slide.title, slide.notes || '', ...slide.blocks.flatMap((block) => textosDoBloco(block))])];
    if (strings.some((text) => /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/u.test(text))) {
        throw new Error('Fonte invalida: caracteres de controle incompativeis com XML.');
    }
    if ([deck.title, ...deck.slides.map((slide) => slide.title)].some((title) => !title.trim() || /[\r\n\t]/.test(title))) {
        throw new Error('Titulos devem ter texto em uma unica linha.');
    }
    for (const [index, slide] of deck.slides.entries()) {
        if (slide.blocks.some(blocoVazio)) {
            throw new Error(`Slide ${index + 1}: texto vazio.`);
        }
        if (slide.blocks.reduce((sum, block) => sum + blockLines(block) + 1, 0) > 15) {
            throw new Error(`Slide ${index + 1}: conteudo excessivo; divida em mais slides.`);
        }
        for (const block of slide.blocks) {
            const urls = block.type === 'demo' ? [block.url] : block.type === 'aplicacao' && block.demonstracao ? [block.demonstracao.url] : [];
            for (const url of urls) {
                const valida = new URL(url);
                if (valida.protocol !== 'https:' || !valida.hostname || valida.username || valida.password) throw new Error('URL de demo invalida.');
            }
        }
    }
    return deck;
}

function htmlDoBloco(block) {
    if (block.type === 'bullets') return `<ul>${block.items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>`;
    if (block.type === 'code') return `<pre><code>${escape(block.text)}</code></pre>`;
    if (block.type === 'demo') return `<p><a href="${escape(block.url)}">${escape(block.text)}</a><br>${escape(block.url)}<br>${demoNotice}</p>`;
    if (block.type === 'problema') {
        return `<div class="problem-box"><strong>Problema:</strong><p>${escape(block.contexto)}</p><p class="question">${escape(block.questao)}</p></div>`;
    }
    if (block.type === 'hipoteses') {
        return `<div class="hypothesis-box"><strong>Hipoteses:</strong><ul>${block.items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul></div>`;
    }
    if (block.type === 'investigacao') {
        return `<div class="investigation-box"><strong>Investigacao:</strong><p>${escape(block.texto)}</p></div>`;
    }
    if (block.type === 'conceito') {
        const corpo = block.items ? `<ul>${block.items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>` : `<p>${escape(block.texto)}</p>`;
        return `<div class="concept-box"><strong>Conceito:</strong>${corpo}</div>`;
    }
    if (block.type === 'aplicacao') {
        const rotulo = block.modalidade === 'pratica' ? 'Aplicacao pratica:' : 'Aplicacao analitica:';
        const classe = block.modalidade === 'pratica' ? 'practice-box' : 'analysis-box';
        const codigo = block.codigo ? `<pre><code>${escape(block.codigo)}</code></pre>` : '';
        const demo = block.demonstracao ? `<p><a href="${escape(block.demonstracao.url)}">${escape(block.demonstracao.texto)}</a><br>${escape(block.demonstracao.url)}<br>${demoNotice}</p>` : '';
        return `<div class="${classe}"><strong>${rotulo}</strong><p>${escape(block.texto)}</p>${codigo}${demo}</div>`;
    }
    if (block.type === 'sintese') {
        const corpo = block.items ? `<ul>${block.items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>` : `<p>${escape(block.texto)}</p>`;
        return `<div class="synthesis-box"><strong>Sintese:</strong>${corpo}</div>`;
    }
    return `<p class="${block.type === 'callout' ? 'tip-box' : 'text'}">${escape(block.text)}</p>`;
}

export async function generateSlides(source, output) {
    if (['slides.html', 'slides.pptx'].some((name) => resolve(source) === resolve(output, name))) {
        throw new Error('A fonte nao pode ser um dos arquivos de saida.');
    }
    const deck = validateDeck(JSON.parse(await readFile(source, 'utf8')));
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.title = deck.title;
    pptx.author = 'Material didatico';
    pptx.subject = 'Gerado de fonte JSON; texto e formas editaveis';
    pptx.lang = 'pt-BR';
    pptx.theme = { headFontFace: 'Aptos', bodyFontFace: 'Aptos', lang: 'pt-BR' };
    const sections = deck.slides.map((slide, index) => {
        const page = pptx.addSlide();
        page.background = { color: '0F172A' };
        page.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: '38BDF8' }, line: { transparency: 100 } });
        page.addText(slide.title, { x: 0.65, y: 0.4, w: 12, h: 0.95, fontSize: 30, bold: true, color: 'F8FAFC', margin: 0, breakLine: false });
        let y = 1.55;
        const blocks = slide.blocks.map((block) => {
            const segmentos = segmentosBloco(block);
            for (const segmento of segmentos) {
                const linhas = segmento.texto.split('\n').reduce((total, line) => total + Math.max(1, Math.ceil(line.length / (segmento.mono ? 76 : 75))), 0);
                const h = linhas * 0.29 + 0.18;
                if (segmento.destaque) page.addShape(pptx.ShapeType.rect, { x: 0.6, y: y - 0.04, w: 12.1, h: h + 0.08, fill: { color: block.type === 'problema' ? '1E3A8A' : '1E293B' }, line: { color: '475569' } });
                page.addText(segmento.texto, { x: 0.75, y, w: 11.8, h, fontSize: segmento.mono ? 18 : 20, fontFace: segmento.mono ? 'Courier New' : 'Aptos', color: 'F8FAFC', margin: 0, valign: 'top', ...(segmento.url ? { hyperlink: { url: segmento.url } } : {}) });
                y += h + 0.18;
            }
            return htmlDoBloco(block);
        }).join('\n');
        const temDemo = slide.blocks.some((block) => block.type === 'demo' || (block.type === 'aplicacao' && block.demonstracao));
        const notes = [slide.notes, ...(temDemo ? [demoNotice] : [])].filter(Boolean).join('\n');
        if (notes) page.addNotes(notes);
        page.addText(`${index + 1} / ${deck.slides.length}`, { x: 11.6, y: 7.05, w: 1, h: 0.25, fontSize: 12, color: 'CBD5E1', margin: 0 });
        return `<section class="slide" aria-label="Slide ${index + 1}"><div class="slide-content"><h2>${escape(slide.title)}</h2>${blocks}${slide.notes ? `<details><summary>Notas</summary><p>${escape(slide.notes)}</p></details>` : ''}</div></section>`;
    }).join('\n');
    const css = await readFile(new URL('../_templates/assets/slides.css', import.meta.url), 'utf8');
    const js = await readFile(new URL('../_templates/assets/slides.js', import.meta.url), 'utf8');
    const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escape(deck.title)}</title><style>${css}</style></head>
<body><main class="presentation"><h1 class="lesson-badge">${escape(deck.title)}</h1><div class="progress-bar"><div class="progress-fill"></div></div>${sections}
<div class="slide-counter" role="status" aria-live="polite"></div><nav class="nav-arrows" aria-label="Slides"><button class="nav-prev" aria-label="Slide anterior">Anterior</button><button class="nav-next" aria-label="Proximo slide">Proximo</button></nav></main><script>${js}</script></body></html>`;
    // Render both representations before publishing either file.
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    await mkdir(output, { recursive: true });
    await writeFile(join(output, 'slides.pptx'), buffer);
    await writeFile(join(output, 'slides.html'), html);
    return deck;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const [source, output] = process.argv.slice(2);
    if (!source || !output || process.argv.length !== 4) {
        console.error('Uso: npm run slides -- <slides.json> <pasta-de-saida>');
        process.exitCode = 1;
    } else {
        try {
            await generateSlides(resolve(source), resolve(output));
            console.log(`Gerados: ${join(output, 'slides.html')} e ${join(output, 'slides.pptx')}`);
        } catch (error) {
            console.error(error.message);
            process.exitCode = 1;
        }
    }
}
