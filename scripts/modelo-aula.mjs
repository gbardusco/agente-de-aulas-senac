import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });
const validators = new Map();

export const IDENTIFICADORES = {
    aula: /^aula-[0-9]{2,3}$/,
    atividade: /^atividade-[0-9]{2,3}-[a-z0-9-]{1,64}$/,
    rubrica: /^rubrica-[0-9]{2,3}-[a-z0-9-]{1,64}-v[0-9]+$/,
    evidencia: /^evidencia-[0-9]{2,3}-[a-z0-9-]{1,64}$/,
    problema: /^problema-[0-9]{2,3}-[a-z0-9-]{1,64}$/,
    registro: /^registro-[0-9]{2,3}-[a-z0-9-]{1,64}$/,
    fonte: /^fonte-[a-z0-9-]{1,80}$/
};

export function validarIdentificador(tipo, valor) {
    const padrao = IDENTIFICADORES[tipo];
    if (!padrao) throw new Error(`Tipo de identificador desconhecido: ${tipo}.`);
    if (typeof valor !== 'string' || !padrao.test(valor)) {
        throw new Error(`Identificador invalido para ${tipo}: ${valor}.`);
    }
    return valor;
}

export function canonicalizar(valor) {
    if (Array.isArray(valor)) return `[${valor.map(canonicalizar).join(',')}]`;
    if (valor !== null && typeof valor === 'object') {
        const entradas = Object.keys(valor).sort().map((chave) => `${JSON.stringify(chave)}:${canonicalizar(valor[chave])}`);
        return `{${entradas.join(',')}}`;
    }
    return JSON.stringify(valor);
}

export function hashBytes(valor) {
    return createHash('sha256').update(valor).digest('hex');
}

export function hashConteudo(valor) {
    return createHash('sha256').update(`${canonicalizar(valor)}\n`, 'utf8').digest('hex');
}

export function validarSchema(schema, dados, rotulo = 'Documento') {
    const chave = JSON.stringify(schema);
    let validar = validators.get(chave);
    if (!validar) {
        validar = ajv.compile(schema);
        validators.set(chave, validar);
    }
    if (!validar(dados)) {
        throw new Error(`${rotulo} invalido: ${ajv.errorsText(validar.errors, { separator: '; ' })}`);
    }
    return dados;
}

export function resolverCaminhoSeguro(raiz, ...segmentos) {
    if (!isAbsolute(raiz)) throw new Error('A raiz precisa ser um caminho absoluto.');
    for (const segmento of segmentos) {
        if (typeof segmento !== 'string' || segmento.length === 0 || segmento.includes('\0')) {
            throw new Error('Segmento de caminho invalido.');
        }
    }
    const caminho = resolve(raiz, ...segmentos);
    const relativo = relative(raiz, caminho);
    if (relativo === '' || relativo === '..' || relativo.startsWith(`..${sep}`) || isAbsolute(relativo)) {
        throw new Error('Caminho fora do diretorio permitido.');
    }
    return caminho;
}

export async function exigirArquivoRegular(caminho) {
    const info = await lstat(caminho).catch(() => { throw new Error(`Arquivo nao encontrado: ${caminho}.`); });
    if (info.isSymbolicLink()) throw new Error(`Symlink nao permitido: ${caminho}.`);
    if (!info.isFile()) throw new Error(`Caminho nao e arquivo regular: ${caminho}.`);
    return caminho;
}

export async function lerJson(caminho) {
    return JSON.parse(await readFile(await exigirArquivoRegular(caminho), 'utf8'));
}

export async function escreverArquivoAtomico(caminho, conteudo) {
    await mkdir(resolve(caminho, '..'), { recursive: true });
    const temporario = `${caminho}.${process.pid}.tmp`;
    await writeFile(temporario, conteudo, 'utf8');
    await rename(temporario, caminho);
    return caminho;
}

export async function escreverJsonAtomico(caminho, valor) {
    return escreverArquivoAtomico(caminho, `${JSON.stringify(valor, null, 2)}\n`);
}

export function analisarArgumentosCli(argumentos) {
    const opcoes = {};
    let comando = null;
    for (let indice = 0; indice < argumentos.length; indice += 1) {
        const argumento = argumentos[indice];
        if (argumento.startsWith('--')) {
            const corpo = argumento.slice(2);
            const separador = corpo.indexOf('=');
            if (separador === -1) {
                const proximo = argumentos[indice + 1];
                if (proximo !== undefined && !proximo.startsWith('-')) {
                    opcoes[corpo] = proximo;
                    indice += 1;
                } else {
                    opcoes[corpo] = true;
                }
            } else {
                opcoes[corpo.slice(0, separador)] = corpo.slice(separador + 1);
            }
        } else if (!comando) {
            comando = argumento;
        } else {
            throw new Error(`Argumento inesperado: ${argumento}.`);
        }
    }
    return { comando, opcoes };
}

function dividirLinhaTabela(linha) {
    const celulas = linha.trim().split('|').map((celula) => celula.trim());
    if (celulas.length > 0 && celulas[0] === '') celulas.shift();
    if (celulas.length > 0 && celulas[celulas.length - 1] === '') celulas.pop();
    return celulas;
}

export function analisarTabelaMarkdown(texto, cabecalhosObrigatorios = []) {
    const linhas = texto.split(/\r?\n/);
    for (let indice = 0; indice < linhas.length - 1; indice += 1) {
        if (!/^\s*\|.*\|\s*$/.test(linhas[indice])) continue;
        if (!/^\s*\|[\s:||-]+\|\s*$/.test(linhas[indice + 1])) continue;
        const cabecalhos = dividirLinhaTabela(linhas[indice]);
        const faltando = cabecalhosObrigatorios.filter((cabecalho) => !cabecalhos.includes(cabecalho));
        if (faltando.length > 0) throw new Error(`Tabela sem cabecalhos obrigatorios: ${faltando.join(', ')}.`);
        const registros = [];
        for (let linha = indice + 2; linha < linhas.length; linha += 1) {
            if (!/^\s*\|.*\|\s*$/.test(linhas[linha])) break;
            const celulas = dividirLinhaTabela(linhas[linha]);
            if (celulas.length !== cabecalhos.length) {
                throw new Error(`Linha ${linha + 1} com numero de colunas incompativel.`);
            }
            registros.push(Object.fromEntries(cabecalhos.map((cabecalho, coluna) => [cabecalho, celulas[coluna]])));
        }
        return registros;
    }
    throw new Error('Tabela Markdown nao encontrada.');
}
