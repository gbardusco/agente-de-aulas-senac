import { access, mkdir, readFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { analisarArgumentosCli, escreverArquivoAtomico, exigirArquivoRegular, resolverCaminhoSeguro, validarIdentificador, validarSchema } from './modelo-aula.mjs';

const RAIZ = resolve(fileURLToPath(new URL('../', import.meta.url)));
const SCHEMA_RELATORIO = JSON.parse(await readFile(new URL('../_templates/relatorio-docente.schema.json', import.meta.url), 'utf8'));
const SCHEMA_CONFIG = JSON.parse(await readFile(new URL('../_templates/diario-sistema.schema.json', import.meta.url), 'utf8'));
const TEMPLATE_HTML = new URL('../_templates/relatorio-docente-template.html', import.meta.url);
const TEMPLATE_CONFIG = new URL('../_templates/diario-sistema-template.json', import.meta.url);

export function escaparTextarea(texto) {
    return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function removerTags(texto) {
    return texto.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function serializarJsonEmbutido(valor) {
    return JSON.stringify(valor).replace(/</g, '\\u003c');
}

export function analisarCampos(html) {
    const rotulos = new Map();
    for (const match of html.matchAll(/<label\s+[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/label>/g)) {
        if (rotulos.has(match[1])) throw new Error(`Rotulo duplicado para o campo ${match[1]}.`);
        rotulos.set(match[1], removerTags(match[2]));
    }
    const campos = [];
    const vistos = new Set();
    for (const match of html.matchAll(/<textarea\b([^>]*)>([\s\S]*?)<\/textarea>/g)) {
        const id = match[1].match(/(?:^|\s)id="([^"]+)"/)?.[1];
        if (!id) throw new Error('Campo textarea sem identificador.');
        if (vistos.has(id)) throw new Error(`Campo duplicado: ${id}.`);
        if (!rotulos.has(id)) throw new Error(`Campo sem rotulo: ${id}.`);
        vistos.add(id);
        const secao = html.slice(0, match.index).match(/<section\b[^>]*data-grupo="([^"]+)"[^>]*>(?!.*<section\b[^>]*data-grupo="[^"]+"[^>]*>)/s);
        campos.push({
            id,
            rotulo: rotulos.get(id),
            grupo: secao?.[1] || 'personalizado',
            valor: match[2].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        });
    }
    return campos;
}

export function analisarAula(html) {
    const aula = html.match(/<main\b[^>]*data-aula="([^"]+)"[^>]*>/)?.[1];
    if (!aula) throw new Error('Identificador da aula ausente no relatorio HTML.');
    return validarIdentificador('aula', aula);
}

export function analisarDadosEmbutidos(html) {
    const match = html.match(/<script\b[^>]*id="relatorio-dados"[^>]*>([\s\S]*?)<\/script>/);
    if (!match) return null;
    try {
        return JSON.parse(match[1]);
    } catch {
        throw new Error('Bloco de dados do relatorio invalido.');
    }
}

export async function carregarConfiguracao(caminho) {
    const origem = caminho ? resolve(process.cwd(), caminho) : fileURLToPath(TEMPLATE_CONFIG);
    const config = JSON.parse(await readFile(await exigirArquivoRegular(origem), 'utf8'));
    return validarSchema(SCHEMA_CONFIG, config, 'Configuracao do diario');
}

export function montarRelatorio({ aulaId, config, valores = {}, atualizadoEm = new Date().toISOString() }) {
    validarIdentificador('aula', aulaId);
    validarSchema(SCHEMA_CONFIG, config, 'Configuracao do diario');
    if (valores.aulaId && valores.aulaId !== aulaId) throw new Error('Valores de outra aula.');
    const porId = new Map(config.campos.map((campo) => [campo.id, campo]));
    const listaSubstituicoes = valores.campos ?? [];
    if (!Array.isArray(listaSubstituicoes)) throw new Error('Lista de campos invalida.');
    const substituicoes = new Map();
    for (const campo of listaSubstituicoes) {
        if (!campo?.id) throw new Error('Campo personalizado precisa de id, rotulo e valor em texto.');
        if (substituicoes.has(campo.id)) throw new Error(`Campo duplicado: ${campo.id}.`);
        substituicoes.set(campo.id, campo);
    }
    const campos = [];
    for (const base of config.campos) {
        const substituto = substituicoes.get(base.id) || {};
        if (substituto.valor !== undefined && typeof substituto.valor !== 'string') {
            throw new Error(`Valor invalido para o campo ${base.id}.`);
        }
        campos.push({
            id: base.id,
            rotulo: substituto.rotulo || base.rotulo,
            grupo: substituto.grupo || base.grupo,
            obrigatorio: base.obrigatorio,
            limiteCaracteres: substituto.limiteCaracteres ?? base.limiteCaracteres ?? null,
            instrucoes: substituto.instrucoes || base.instrucoes || '',
            valor: substituto.valor || ''
        });
        substituicoes.delete(base.id);
    }
    for (const extra of substituicoes.values()) {
        if (!extra?.id || typeof extra.valor !== 'string' || !extra.rotulo) {
            throw new Error('Campo personalizado precisa de id, rotulo e valor em texto.');
        }
        campos.push({
            id: extra.id,
            rotulo: extra.rotulo,
            grupo: extra.grupo || 'personalizado',
            obrigatorio: false,
            limiteCaracteres: extra.limiteCaracteres ?? null,
            instrucoes: extra.instrucoes || '',
            valor: extra.valor
        });
    }
    const relatorio = {
        version: 1,
        aulaId,
        atualizadoEm,
        sistema: valores.sistema || {
            instituicao: config.instituicao,
            sistema: config.sistema,
            manual: config.manual,
            manualVersao: config.manualVersao,
            revisadoEm: config.revisadoEm || ''
        },
        campos,
        evidencias: valores.evidencias || [],
        fontes: valores.fontes || [],
        historico: valores.historico || []
    };
    const ids = new Set();
    for (const campo of campos) {
        if (ids.has(campo.id)) throw new Error(`Campo duplicado: ${campo.id}.`);
        ids.add(campo.id);
    }
    return validarSchema(SCHEMA_RELATORIO, relatorio, 'Relatorio docente');
}

function resolverSaida(raiz, destino) {
    if (isAbsolute(destino)) {
        if (!destino.startsWith(`${raiz}/`)) throw new Error('Saida fora do diretorio permitido.');
        return resolverCaminhoSeguro(raiz, destino.slice(raiz.length + 1));
    }
    return resolverCaminhoSeguro(raiz, destino);
}

async function exigirNovo(caminho, sobrescrever) {
    try {
        await access(caminho);
    } catch {
        return;
    }
    if (!sobrescrever) throw new Error(`Arquivo ja existe: ${caminho}. Use --sobrescrever para substituir.`);
}

function definirAulaHtml(html, aulaId) {
    const numero = aulaId.replace('aula-', 'Aula ');
    return html
        .replace(/<main\b[^>]*data-aula="[^"]+"[^>]*>/, `<main data-aula="${aulaId}">`)
        .replace(/<h1>Registro docente - Aula [^<]*<\/h1>/, `<h1>Registro docente - ${numero}</h1>`)
        .replace(/<script\b[^>]*id="relatorio-dados"[^>]*>[\s\S]*?<\/script>/, (bloco) => bloco);
}

function injetarValores(html, relatorio) {
    let resultado = definirAulaHtml(html, relatorio.aulaId);
    const ausentes = [];
    for (const campo of relatorio.campos) {
        const padrao = new RegExp(`(<textarea\\b[^>]*\\bid="${escaparRegex(campo.id)}"[^>]*>)([\\s\\S]*?)(<\\/textarea>)`);
        if (padrao.test(resultado)) {
            resultado = resultado.replace(padrao, `$1${escaparTextarea(campo.valor)}$3`);
        } else {
            ausentes.push(campo);
        }
    }
    if (ausentes.length > 0) {
        const blocos = ausentes.map((campo) => [
            `<div class="campo-dinamico">`,
            `<label for="${campo.id}">${escaparTextarea(campo.rotulo)}</label>`,
            `<textarea id="${campo.id}" rows="5">${escaparTextarea(campo.valor)}</textarea>`,
            `<button type="button" data-copy="${campo.id}">Copiar ${escaparTextarea(campo.rotulo).slice(0, 80)}</button>`,
            `<p class="copy-status" id="status-${campo.id}" role="status" aria-live="polite" aria-atomic="true"></p>`,
            `</div>`
        ].join(''));
        resultado = resultado.replace('<noscript>', `<section data-grupo="personalizado" aria-label="Campos adicionais">${blocos.join('')}</section><noscript>`);
    }
    return resultado.replace(
        /<script\b[^>]*id="relatorio-dados"[^>]*>[\s\S]*?<\/script>/,
        `<script type="application/json" id="relatorio-dados">\n${serializarJsonEmbutido(relatorio)}\n</script>`
    );
}

export async function gerarRelatorio({ raiz = RAIZ, aulaId, configPath, valores = {}, valoresPath, destinoHtml, destinoJson, sobrescrever = false, atualizadoEm } = {}) {
    validarIdentificador('aula', aulaId);
    const config = await carregarConfiguracao(configPath);
    const valoresArquivo = valoresPath ? JSON.parse(await readFile(await exigirArquivoRegular(resolve(process.cwd(), valoresPath)), 'utf8')) : {};
    const relatorio = montarRelatorio({ aulaId, config, valores: { ...valoresArquivo, ...valores }, atualizadoEm });
    const pasta = resolverCaminhoSeguro(raiz, 'AULAS', 'registros-docentes', aulaId);
    await mkdir(pasta, { recursive: true });
    const htmlPath = destinoHtml ? resolverSaida(raiz, destinoHtml) : join(pasta, 'relatorio.html');
    const jsonPath = destinoJson ? resolverSaida(raiz, destinoJson) : join(pasta, 'relatorio.json');
    await exigirNovo(htmlPath, sobrescrever);
    await exigirNovo(jsonPath, sobrescrever);
    const modelo = await readFile(TEMPLATE_HTML, 'utf8');
    await escreverArquivoAtomico(jsonPath, `${JSON.stringify(relatorio, null, 2)}\n`);
    await escreverArquivoAtomico(htmlPath, injetarValores(modelo, relatorio));
    return { relatorio, htmlPath, jsonPath };
}

export async function exportarRelatorio({ raiz = RAIZ, origemHtml, destinoJson, configPath, aulaId, sobrescrever = false, atualizadoEm } = {}) {
    const origem = await exigirArquivoRegular(resolve(process.cwd(), origemHtml));
    const html = await readFile(origem, 'utf8');
    const aula = aulaId || analisarAula(html);
    const embutidos = analisarDadosEmbutidos(html) || {};
    const config = configPath ? await carregarConfiguracao(configPath) : null;
    const mapa = new Map((config?.campos || []).map((campo) => [campo.id, campo]));
    const valores = {
        aulaId: aula,
        sistema: embutidos.sistema,
        campos: analisarCampos(html).map((campo) => ({ ...campo, ...(mapa.get(campo.id) || {}) })),
        evidencias: embutidos.evidencias || [],
        fontes: embutidos.fontes || [],
        historico: embutidos.historico || []
    };
    const relatorio = montarRelatorio({ aulaId: aula, config: config || await carregarConfiguracao(), valores, atualizadoEm });
    const destino = resolverSaida(raiz, destinoJson);
    await exigirNovo(destino, sobrescrever);
    await escreverArquivoAtomico(destino, `${JSON.stringify(relatorio, null, 2)}\n`);
    return { relatorio, destino };
}

export async function importarRelatorio({ origemJson, destinoHtml } = {}) {
    const origem = await exigirArquivoRegular(resolve(process.cwd(), origemJson));
    const relatorio = validarSchema(SCHEMA_RELATORIO, JSON.parse(await readFile(origem, 'utf8')), 'Relatorio docente');
    const destino = await exigirArquivoRegular(resolve(process.cwd(), destinoHtml));
    const html = await readFile(destino, 'utf8');
    if (analisarAula(html) !== relatorio.aulaId) throw new Error('JSON de outra aula.');
    await escreverArquivoAtomico(destino, injetarValores(html, relatorio));
    return { relatorio, destino };
}

export function validarRelatorioHtml(html, config = null) {
    const erros = [];
    const avisos = [];
    let aula = null;
    let campos = [];
    try {
        aula = analisarAula(html);
    } catch (erro) {
        erros.push(erro.message);
    }
    try {
        campos = analisarCampos(html);
    } catch (erro) {
        erros.push(erro.message);
    }
    try {
        const embutidos = analisarDadosEmbutidos(html);
        if (!embutidos) avisos.push('Bloco de dados para exportacao ausente.');
        else if (aula && embutidos.aulaId !== aula) erros.push('Bloco de dados de outra aula.');
    } catch (erro) {
        erros.push(erro.message);
    }
    if (config) {
        const mapa = new Map(config.campos.map((campo) => [campo.id, campo]));
        for (const campo of campos) {
            const esperado = mapa.get(campo.id);
            if (!esperado) {
                avisos.push(`Campo personalizado fora da configuracao: ${campo.id}.`);
                continue;
            }
            if (esperado.obrigatorio && !campo.valor.trim()) avisos.push(`Campo obrigatorio vazio: ${campo.id}.`);
            if (esperado.limiteCaracteres !== null && esperado.limiteCaracteres !== undefined && campo.valor.length > esperado.limiteCaracteres) {
                avisos.push(`Campo acima do limite configurado: ${campo.id}.`);
            }
        }
    }
    for (const campo of campos) {
        if (!html.includes(`data-copy="${campo.id}"`) || !html.includes(`id="status-${campo.id}"`)) {
            erros.push(`Copia inacessivel para o campo ${campo.id}.`);
        }
    }
    return { aula, erros, avisos };
}

export async function validarRelatorio({ origemHtml, configPath } = {}) {
    const origem = await exigirArquivoRegular(resolve(process.cwd(), origemHtml));
    const html = await readFile(origem, 'utf8');
    const config = configPath ? await carregarConfiguracao(configPath) : null;
    return validarRelatorioHtml(html, config);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        const { comando, opcoes } = analisarArgumentosCli(process.argv.slice(2));
        if (comando === 'gerar' && opcoes.aula) {
            const resultado = await gerarRelatorio({
                aulaId: opcoes.aula,
                configPath: opcoes.config,
                valoresPath: opcoes.valores,
                destinoHtml: opcoes.html,
                destinoJson: opcoes.json,
                sobrescrever: Boolean(opcoes.sobrescrever)
            });
            console.log(`Relatorio gerado: ${resultado.htmlPath} e ${resultado.jsonPath}`);
        } else if (comando === 'exportar' && opcoes.origem && opcoes.destino) {
            const resultado = await exportarRelatorio({
                origemHtml: opcoes.origem,
                destinoJson: opcoes.destino,
                configPath: opcoes.config,
                aulaId: opcoes.aula,
                sobrescrever: Boolean(opcoes.sobrescrever)
            });
            console.log(`Relatorio exportado: ${resultado.destino}`);
        } else if (comando === 'importar' && opcoes.origem && opcoes.destino) {
            const resultado = await importarRelatorio({ origemJson: opcoes.origem, destinoHtml: opcoes.destino });
            console.log(`Relatorio importado: ${resultado.destino}`);
        } else if (comando === 'validar' && opcoes.origem) {
            const resultado = await validarRelatorio({ origemHtml: opcoes.origem, configPath: opcoes.config });
            if (resultado.erros.length > 0) throw new Error(resultado.erros.join('; '));
            console.log(resultado.avisos.length === 0 ? 'Relatorio valido.' : `Avisos: ${resultado.avisos.join('; ')}`);
        } else {
            throw new Error('Uso: node scripts/relatorio-docente.mjs <gerar|exportar|importar|validar> --opcoes');
        }
    } catch (erro) {
        console.error(erro.message);
        process.exitCode = 1;
    }
}
