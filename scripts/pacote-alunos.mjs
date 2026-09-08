import { access, mkdir, readFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import JSZip from 'jszip';
import { avaliarEstado, caminhoAula } from './aula-estado.mjs';
import { analisarArgumentosCli, escreverArquivoAtomico, exigirArquivoRegular, hashBytes, resolverCaminhoSeguro, validarIdentificador, validarSchema } from './modelo-aula.mjs';

const RAIZ = resolve(fileURLToPath(new URL('../', import.meta.url)));
const SCHEMA = JSON.parse(await readFile(new URL('../_templates/pacote-manifest.schema.json', import.meta.url), 'utf8'));

const CAMINHOS_PROIBIDOS = [
    /(^|\/)registros-docentes(\/|$)/i,
    /(^|\/)relatorio([-_][^/]*)?\.html?$/i,
    /(^|\/)feedback([-_][^/]*)?\.(md|html|txt)$/i,
    /(^|\/)sintese([-_][^/]*)?\.(md|html|txt)$/i,
    /(^|\/)aula-estado\.json$/i,
    /(^|\/)\.[^/]+$/,
    /\.json$/i,
    /\.zip$/i
];

export function arquivoPermitido(caminho, incluirGabarito = false) {
    if (caminho.includes('\\') || caminho.startsWith('/') || caminho === '.' || caminho.startsWith('./') || caminho.includes('..')) return false;
    if (/(^|\/)slides\.json$/i.test(caminho)) return true;
    if (!incluirGabarito && /(^|\/)gabarito(\/|$)/i.test(caminho)) return false;
    return !CAMINHOS_PROIBIDOS.some((padrao) => padrao.test(caminho));
}

function resolverDestino(raiz, destino) {
    if (isAbsolute(destino)) return destino;
    return resolverCaminhoSeguro(raiz, destino);
}

async function exigirNovo(caminho, sobrescrever) {
    try {
        await access(caminho);
    } catch {
        return;
    }
    if (!sobrescrever) throw new Error(`Pacote ja existe: ${caminho}. Use --sobrescrever para substituir.`);
}

export async function planejarPacote({ raiz = RAIZ, aulaId, arquivos, incluirGabarito = false, geradoEm = new Date().toISOString() } = {}) {
    validarIdentificador('aula', aulaId);
    const avaliacao = await avaliarEstado({ raiz, aulaId });
    if (!['aprovado', 'aplicado'].includes(avaliacao.estado)) {
        throw new Error(`Aula ${aulaId} nao esta aprovada para distribuicao. Estado atual: ${avaliacao.estado}.`);
    }
    if (!avaliacao.atualizado) {
        throw new Error(`Conteudo da aula ${aulaId} mudou apos a aprovacao. Solicite nova revisao.`);
    }
    const selecionados = arquivos
        ? String(arquivos).split(',').map((item) => item.trim()).filter(Boolean)
        : avaliacao.arquivos?.map((arquivo) => arquivo.caminho);
    if (!selecionados || selecionados.length === 0) throw new Error('Nenhum arquivo publico selecionado.');
    const conteudos = [];
    const manifestoArquivos = [];
    for (const caminho of selecionados) {
        if (!arquivoPermitido(caminho, incluirGabarito)) {
            throw new Error(`Arquivo recusado no pacote para alunos: ${caminho}.`);
        }
        const absoluto = resolverCaminhoSeguro(raiz, 'AULAS', aulaId, caminho);
        await exigirArquivoRegular(absoluto);
        const conteudo = await readFile(absoluto);
        const entrada = {
            caminho,
            tamanho: conteudo.length,
            hash: hashBytes(conteudo)
        };
        const esperado = avaliacao.arquivos?.find((arquivo) => arquivo.caminho === caminho);
        if (!esperado || esperado.hash !== entrada.hash) {
            throw new Error(`Arquivo fora da aprovacao atual: ${caminho}.`);
        }
        conteudos.push({ caminho, conteudo });
        manifestoArquivos.push(entrada);
    }
    const manifesto = validarSchema(SCHEMA, {
        version: 1,
        aulaId,
        estado: avaliacao.estado,
        versao: avaliacao.versao,
        hash: avaliacao.atual,
        geradoEm,
        gabaritoIncluido: incluirGabarito && manifestoArquivos.some((arquivo) => /(^|\/)gabarito(\/|$)/i.test(arquivo.caminho)),
        arquivos: manifestoArquivos
    }, 'Manifesto do pacote');
    return { avaliacao, manifesto, conteudos };
}

export async function empacotarAula({ raiz = RAIZ, aulaId, arquivos, destino, incluirGabarito = false, sobrescrever = false, geradoEm = new Date().toISOString() } = {}) {
    const planejado = await planejarPacote({ raiz, aulaId, arquivos, incluirGabarito, geradoEm });
    const zip = new JSZip();
    for (const item of planejado.conteudos) zip.file(`${aulaId}/${item.caminho}`, item.conteudo);
    zip.file(`${aulaId}/manifesto.json`, `${JSON.stringify(planejado.manifesto, null, 2)}\n`);
    const saida = destino || join(raiz, 'saidas', 'pacote-alunos', `${aulaId}.zip`);
    const caminhoSaida = resolverDestino(raiz, saida);
    await exigirNovo(caminhoSaida, sobrescrever);
    await mkdir(dirname(caminhoSaida), { recursive: true });
    await escreverArquivoAtomico(caminhoSaida, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
    return { caminhoSaida, manifesto: planejado.manifesto };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        const { comando, opcoes } = analisarArgumentosCli(process.argv.slice(2));
        if ((comando === 'empacotar' || !comando) && opcoes.aula) {
            if (opcoes.listar) {
                const avaliacao = await avaliarEstado({ aulaId: opcoes.aula });
                console.log(JSON.stringify(avaliacao, null, 2));
            } else {
                const resultado = await empacotarAula({
                    aulaId: opcoes.aula,
                    arquivos: opcoes.arquivos,
                    destino: opcoes.saida,
                    incluirGabarito: Boolean(opcoes['incluir-gabarito']),
                    sobrescrever: Boolean(opcoes.sobrescrever)
                });
                console.log(`Pacote criado: ${resultado.caminhoSaida}`);
                for (const arquivo of resultado.manifesto.arquivos) console.log(`- ${arquivo.caminho} (${arquivo.tamanho} bytes, sha256 ${arquivo.hash})`);
                if (resultado.manifesto.gabaritoIncluido) console.log('Aviso: gabarito incluido por solicitacao explicita.');
            }
        } else {
            throw new Error('Uso: node scripts/pacote-alunos.mjs [empacotar] --aula aula-XX [--arquivos a,b] [--saida caminho] [--incluir-gabarito] [--listar]');
        }
    } catch (erro) {
        console.error(erro.message);
        process.exitCode = 1;
    }
}
