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
export const demoNotice = 'Demo externa: abrir no navegador. O PPTX não executa HTML, CSS ou JavaScript.';
const ROTULOS = {
    problema: 'Problema',
    hipoteses: 'Hipóteses',
    investigacao: 'Investigação',
    conceito: 'Conceito',
    sintese: 'Síntese'
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
        const rotulo = '';
        return `${rotulo}${block.items.map((item) => `- ${item}`).join('\n')}`;
    }
    if (block.type === 'demo') return `${block.text}\n${block.url}\n${demoNotice}`;
    if (block.type === 'problema') return `${block.contexto}\n${block.questao}`;
    if (block.type === 'aplicacao') {
        const rotulo = block.modalidade === 'pratica' ? 'Aplicação prática' : 'Aplicação analítica';
        return textosDoBloco(block).join('\n');
    }
    if (ROTULOS[block.type]) return block.texto;
    return block.text;
}

function segmentosBloco(block) {
    if (block.type === 'aplicacao' && block.codigo) {
        const segmentos = [{ texto: `${block.modalidade === 'pratica' ? 'Aplicação prática' : 'Aplicação analítica'}\n${block.texto}`, mono: false, destaque: true }];
        segmentos.push({ texto: block.codigo, mono: true, destaque: true });
        if (block.demonstracao) segmentos.push({ texto: `${block.demonstracao.texto}\n${block.demonstracao.url}\n${demoNotice}`, mono: false, destaque: false, url: block.demonstracao.url });
        return segmentos;
    }
    if (block.type === 'aplicacao' && block.demonstracao) {
        return [
            { texto: `${block.modalidade === 'pratica' ? 'Aplicação prática' : 'Aplicação analítica'}\n${block.texto}`, mono: false, destaque: true },
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
        throw new Error('Arco PBL fora de ordem: use problema, conceito e aplicação nesta sequência.');
    }
    if (!(sequencia.lastIndexOf('sintese') > sequencia.lastIndexOf('aplicacao'))) {
        throw new Error('Arco PBL fora de ordem: a síntese deve fechar a aplicação.');
    }
    for (const [indice, tipo] of sequencia.entries()) {
        if ((tipo === 'hipoteses' || tipo === 'investigacao') && !(indice > primeira('problema') && indice < primeira('conceito'))) {
            throw new Error('Hipótese ou investigação fora do lugar: coloque entre problema e conceito.');
        }
    }
    const modalidades = sequencia.filter((tipo) => tipo === 'aplicacao').map((_, indice) => deck.slides.flatMap((slide) => slide.blocks).filter((block) => block.type === 'aplicacao')[indice].modalidade);
    if (deck.pedagogia.modalidadeAplicacao === 'pratica' && modalidades.some((modalidade) => modalidade !== 'pratica')) {
        throw new Error('A modalidade prática exige que todas as aplicações sejam práticas.');
    }
    if (deck.pedagogia.modalidadeAplicacao === 'analitica' && modalidades.some((modalidade) => modalidade !== 'analitica')) {
        throw new Error('A modalidade analítica exige que todas as aplicações sejam analíticas.');
    }
    if (deck.pedagogia.modalidadeAplicacao === 'mista' && (!modalidades.includes('pratica') || !modalidades.includes('analitica'))) {
        throw new Error('A modalidade mista exige ao menos uma aplicação prática e uma analítica.');
    }
    if (['pratica', 'mista'].includes(deck.pedagogia.modalidadeAplicacao)) {
        const pratica = deck.slides.flatMap((slide) => slide.blocks).some((block) => block.type === 'aplicacao' && block.modalidade === 'pratica' && (block.codigo || block.demonstracao));
        if (!pratica) throw new Error('Aplicação prática exige código ou demonstração em ao menos um bloco.');
    }
}

export function validateDeck(deck) {
    if (!deck || typeof deck !== 'object') throw new Error('Fonte inválida: JSON incompatível.');
    if (deck.version === 1) {
        if (!validateV1(deck)) throw new Error(`Fonte inválida: ${ajv.errorsText(validateV1.errors, { separator: '; ' })}`);
    } else if (deck.version === 2) {
        if (!validateV2(deck)) throw new Error(`Fonte inválida: ${ajv.errorsText(validateV2.errors, { separator: '; ' })}`);
        validarPBL(deck);
    } else {
        throw new Error('Fonte inválida: versão não suportada. Use 1 para exposição legada ou 2 para PBL.');
    }
    const strings = [deck.title, ...['subtitle', 'disciplina', 'professor', 'data'].map((key) => deck[key] || ''), ...deck.slides.flatMap((slide) => [slide.title, slide.notes || '', ...slide.blocks.flatMap((block) => textosDoBloco(block))])];
    if (strings.some((text) => /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/u.test(text))) {
        throw new Error('Fonte inválida: caracteres de controle incompatíveis com XML.');
    }
    if ([deck.title, ...deck.slides.map((slide) => slide.title)].some((title) => !title.trim() || /[\r\n\t]/.test(title))) {
        throw new Error('Títulos devem ter texto em uma única linha.');
    }
    for (const [index, slide] of deck.slides.entries()) {
        if (slide.blocks.some(blocoVazio)) {
            throw new Error(`Slide ${index + 1}: texto vazio.`);
        }
        if (slide.blocks.some((block) => blockLines(block) + 1 > 14)) {
            throw new Error(`Slide ${index + 1}: conteúdo excessivo; divida em mais slides.`);
        }
        for (const block of slide.blocks) {
            const urls = block.type === 'demo' ? [block.url] : block.type === 'aplicacao' && block.demonstracao ? [block.demonstracao.url] : [];
            for (const url of urls) {
                const valida = new URL(url);
                if (valida.protocol !== 'https:' || !valida.hostname || valida.username || valida.password) throw new Error('URL de demo inválida.');
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
        return `<div class="problem-box"><p>${escape(block.contexto)}</p><p class="question">${escape(block.questao)}</p></div>`;
    }
    if (block.type === 'hipoteses') {
        return `<div class="hypothesis-box"><ul>${block.items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul></div>`;
    }
    if (block.type === 'investigacao') {
        return `<div class="investigation-box"><p>${escape(block.texto)}</p></div>`;
    }
    if (block.type === 'conceito') {
        const corpo = block.items ? `<ul>${block.items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>` : `<p>${escape(block.texto)}</p>`;
        return `<div class="concept-box">${corpo}</div>`;
    }
    if (block.type === 'aplicacao') {
        const rotulo = block.modalidade === 'pratica' ? 'Aplicação prática:' : 'Aplicação analítica:';
        const classe = block.modalidade === 'pratica' ? 'practice-box' : 'analysis-box';
        const codigo = block.codigo ? `<pre><code>${escape(block.codigo)}</code></pre>` : '';
        const demo = block.demonstracao ? `<p><a href="${escape(block.demonstracao.url)}">${escape(block.demonstracao.texto)}</a><br>${escape(block.demonstracao.url)}<br>${demoNotice}</p>` : '';
        return `<div class="${classe}"><p>${escape(block.texto)}</p>${codigo}${demo}</div>`;
    }
    if (block.type === 'sintese') {
        const corpo = block.items ? `<ul>${block.items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>` : `<p>${escape(block.texto)}</p>`;
        return `<div class="synthesis-box">${corpo}</div>`;
    }
    return `<p class="${block.type === 'callout' ? 'tip-box' : 'text'}">${escape(block.text)}</p>`;
}

export async function generateSlides(source, output) {
    if (['slides.html', 'slides.pptx'].some((name) => resolve(source) === resolve(output, name))) {
        throw new Error('A fonte não pode ser um dos arquivos de saída.');
    }
    const deck = validateDeck(JSON.parse(await readFile(source, 'utf8')));
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.title = deck.title;
    pptx.author = 'Material didático';
    pptx.subject = 'Gerado de fonte JSON; texto e formas editáveis';
    pptx.lang = 'pt-BR';
    pptx.theme = { headFontFace: 'Aptos', bodyFontFace: 'Aptos', lang: 'pt-BR' };
    const slides = [{ title: deck.title, cover: true, blocks: [] }];
    for (const slide of deck.slides) {
        let part = { ...slide, blocks: [] };
        let lines = 0;
        for (const block of slide.blocks) {
            const cost = blockLines(block) + 1;
            if (lines + cost > 14 && part.blocks.length) {
                slides.push(part);
                part = { ...slide, title: `${slide.title} — continuação`, blocks: [] };
                lines = 0;
            }
            part.blocks.push(block);
            lines += cost;
        }
        slides.push(part);
    }
    const sections = slides.map((slide, index) => {
        const page = pptx.addSlide();
        page.background = { color: slide.cover ? '0F172A' : 'F7F5EF' };
        page.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: '38BDF8' }, line: { transparency: 100 } });
        page.addText(slide.title, { x: 0.75, y: slide.cover ? 1.6 : 0.4, w: 11.8, h: slide.cover ? 2 : 0.95, fontSize: slide.cover ? 40 : 30, bold: true, color: slide.cover ? 'F8FAFC' : '0F172A', margin: 0, breakLine: false });
        if (slide.cover) {
            if (deck.subtitle) page.addText(deck.subtitle, { x: 0.75, y: 3.9, w: 11.8, h: 1, fontSize: 24, color: 'CBD5E1', margin: 0 });
            const meta = ['disciplina', 'professor', 'data'].map((key) => deck[key]).filter(Boolean).join(' · ');
            if (meta) page.addText(meta, { x: 0.75, y: 5.5, w: 11.8, h: 1, fontSize: 18, color: '7DD3FC', margin: 0 });
            return `<section class="slide cover-slide" aria-label="Capa"><div class="slide-content"><h2>${escape(deck.title)}</h2>${deck.subtitle ? `<p class="subtitle">${escape(deck.subtitle)}</p>` : ''}${meta ? `<p class="cover-meta">${escape(meta)}</p>` : ''}</div></section>`;
        }
        let y = 1.55;
        const blocks = slide.blocks.map((block) => {
            const segmentos = segmentosBloco(block);
            for (const segmento of segmentos) {
                const linhas = segmento.texto.split('\n').reduce((total, line) => total + Math.max(1, Math.ceil(line.length / (segmento.mono ? 76 : 75))), 0);
                const h = linhas * 0.29 + 0.18;
                if (segmento.mono) page.addShape(pptx.ShapeType.rect, { x: 0.6, y: y - 0.04, w: 12.1, h: h + 0.08, fill: { color: '1E293B' }, line: { transparency: 100 } });
                else if (block.type === 'problema' || block.type === 'callout') page.addShape(pptx.ShapeType.rect, { x: 0.6, y, w: 0.04, h, fill: { color: '0284C7' }, line: { transparency: 100 } });
                page.addText(segmento.texto, { x: 0.75, y, w: 11.8, h, fontSize: segmento.mono ? 18 : 20, fontFace: segmento.mono ? 'Courier New' : 'Aptos', color: segmento.mono ? 'F8FAFC' : '0F172A', margin: 0, valign: 'top', ...(segmento.url ? { hyperlink: { url: segmento.url } } : {}) });
                y += h + 0.18;
            }
            return htmlDoBloco(block);
        }).join('\n');
        const temDemo = slide.blocks.some((block) => block.type === 'demo' || (block.type === 'aplicacao' && block.demonstracao));
        const notes = [slide.notes, ...(temDemo ? [demoNotice] : [])].filter(Boolean).join('\n');
        if (notes) page.addNotes(notes);
        page.addText(`${index + 1} / ${slides.length}`, { x: 11.6, y: 7.05, w: 1, h: 0.25, fontSize: 12, color: '475569', margin: 0 });
        return `<section class="slide" aria-label="Slide ${index + 1}"><div class="slide-content"><h2>${escape(slide.title)}</h2>${blocks}${slide.notes ? `<details><summary>Notas</summary><p>${escape(slide.notes)}</p></details>` : ''}</div></section>`;
    }).join('\n');
    const css = await readFile(new URL('../_templates/assets/slides.css', import.meta.url), 'utf8');
    const js = await readFile(new URL('../_templates/assets/slides.js', import.meta.url), 'utf8');
    const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escape(deck.title)}</title><style>${css}</style></head>
<body class="editorial"><main class="presentation"><div class="progress-bar"><div class="progress-fill"></div></div>${sections}
<div class="slide-counter" role="status" aria-live="polite"></div><nav class="nav-arrows" aria-label="Slides"><button class="nav-prev" aria-label="Slide anterior">Anterior</button><button class="nav-next" aria-label="Próximo slide">Próximo</button></nav></main><script>${js}</script></body></html>`;
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
