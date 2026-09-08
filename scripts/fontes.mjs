import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { analisarArgumentosCli, analisarTabelaMarkdown, exigirArquivoRegular, resolverCaminhoSeguro, validarIdentificador } from './modelo-aula.mjs';

const RAIZ = resolve(fileURLToPath(new URL('../', import.meta.url)));
const CABECALHOS = ['ID', 'Titulo', 'Tipo', 'Autor ou orgao', 'Versao / data', 'Caminho local ou URL verificada', 'Tema / indicador', 'Secao / paginas', 'Situacao de leitura', 'Aplicabilidade', 'Data da consulta', 'Restricoes de uso'];
const TIPOS = ['oficial', 'manual', 'primaria', 'complementar'];
const LEITURAS = ['nao-lido', 'consultado', 'parcial', 'nao-processado'];
const TEXTO_LEGIVEL = ['.md', '.markdown', '.txt', '.html', '.htm'];

export function classificarFonte(registro) {
    const local = registro['Caminho local ou URL verificada'] || '';
    if (/^https?:\/\//i.test(local)) return 'url';
    const extensao = local.slice(local.lastIndexOf('.')).toLowerCase();
    if (TEXTO_LEGIVEL.includes(extensao)) return 'texto';
    if (extensao === '.pdf') return 'pdf';
    return 'outro';
}

export async function validarBiblioteca({ raiz = RAIZ, biblioteca } = {}) {
    const caminho = biblioteca ? resolve(process.cwd(), biblioteca) : resolve(raiz, '.docs/materiais-consulta/index.md');
    const erros = [];
    const avisos = [];
    let registros = [];
    try {
        registros = analisarTabelaMarkdown(await readFile(await exigirArquivoRegular(caminho), 'utf8'), CABECALHOS);
    } catch (erro) {
        erros.push(`Biblioteca indisponivel ou invalida: ${erro.message}.`);
        return { caminho, registros: [], erros, avisos };
    }
    const vistos = new Set();
    for (const [indice, registro] of registros.entries()) {
        const linha = `Fonte na linha ${indice + 1}`;
        try {
            validarIdentificador('fonte', registro.ID);
        } catch {
            erros.push(`${linha} com ID invalido.`);
        }
        if (vistos.has(registro.ID)) erros.push(`ID duplicado na biblioteca: ${registro.ID}.`);
        vistos.add(registro.ID);
        for (const campo of ['Titulo', 'Tipo', 'Versao / data', 'Tema / indicador', 'Data da consulta']) {
            if (!registro[campo]) erros.push(`${linha} sem ${campo}.`);
        }
        if (!TIPOS.includes(registro.Tipo)) erros.push(`${linha} com tipo invalido: ${registro.Tipo || 'ausente'}.`);
        if (!LEITURAS.includes(registro['Situacao de leitura'])) erros.push(`${linha} com situacao de leitura invalida.`);
        const local = registro['Caminho local ou URL verificada'];
        if (!local) {
            erros.push(`${linha} sem caminho local ou URL.`);
            continue;
        }
        if (/^https?:\/\//i.test(local)) {
            try {
                const url = new URL(local);
                if (!url.hostname || url.username || url.password) throw new Error('URL invalida');
            } catch {
                erros.push(`${linha} com URL invalida.`);
            }
            if (registro['Situacao de leitura'] === 'nao-lido') avisos.push(`${linha} cadastrada, mas ainda nao lida.`);
        } else {
            try {
                const absoluto = resolverCaminhoSeguro(raiz, local);
                await exigirArquivoRegular(absoluto);
                const classe = classificarFonte(registro);
                if ((classe === 'pdf' || classe === 'outro') && !['consultado', 'parcial'].includes(registro['Situacao de leitura'])) {
                    avisos.push(`${linha} exige leitura manual confirmada antes do uso.`);
                }
            } catch {
                erros.push(`${linha} com arquivo local ausente ou fora da biblioteca permitida.`);
            }
        }
    }
    return { caminho, registros, erros, avisos };
}

export function verificarCitacoes(fontes, registros) {
    const erros = [];
    const avisos = [];
    const mapa = new Map(registros.map((registro) => [registro.ID, registro]));
    for (const fonte of fontes || []) {
        const catalogada = mapa.get(fonte.id);
        if (!catalogada) {
            erros.push(`Fonte citada fora do catalogo: ${fonte.id}.`);
            continue;
        }
        if (catalogada['Situacao de leitura'] === 'nao-lido' || catalogada['Situacao de leitura'] === 'nao-processado') {
            avisos.push(`Fonte citada sem leitura confirmada: ${fonte.id}.`);
        }
        if ((catalogada['Versao / data'] || '') !== (fonte.versaoData || '') && fonte.versaoData) {
            avisos.push(`Versao da fonte divergente do catalogo: ${fonte.id}.`);
        }
    }
    return { erros, avisos };
}

function analisarArgumentos(argumentos) {
    const { comando, opcoes } = analisarArgumentosCli(argumentos);
    if (comando) throw new Error(`Argumento inesperado: ${comando}.`);
    return opcoes;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        const opcoes = analisarArgumentos(process.argv.slice(2));
        const resultado = await validarBiblioteca({ biblioteca: opcoes.biblioteca });
        for (const erro of resultado.erros) console.error(`ERRO: ${erro}`);
        for (const aviso of resultado.avisos) console.log(`AVISO: ${aviso}`);
        console.log(`Fontes: ${resultado.registros.length}; erros: ${resultado.erros.length}; avisos: ${resultado.avisos.length}.`);
        if (resultado.erros.length > 0) process.exitCode = 1;
    } catch (erro) {
        console.error(erro.message);
        process.exitCode = 1;
    }
}
