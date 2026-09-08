import { access, mkdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { analisarArgumentosCli, escreverArquivoAtomico, exigirArquivoRegular, hashBytes, hashConteudo, resolverCaminhoSeguro, validarIdentificador, validarSchema } from './modelo-aula.mjs';

const RAIZ = resolve(fileURLToPath(new URL('../', import.meta.url)));
const SCHEMA = JSON.parse(await readFile(new URL('../_templates/aula-estado.schema.json', import.meta.url), 'utf8'));

export const TRANSICOES = {
    rascunho: ['em-revisao'],
    'em-revisao': ['rascunho', 'aprovado'],
    aprovado: ['em-revisao', 'aplicado', 'revisao-necessaria'],
    aplicado: ['revisao-necessaria'],
    'revisao-necessaria': ['em-revisao', 'aprovado']
};

export function caminhoAula(raiz, aulaId) {
    validarIdentificador('aula', aulaId);
    return resolverCaminhoSeguro(raiz, 'AULAS', aulaId);
}

export function caminhoEstado(raiz, aulaId) {
    return join(caminhoAula(raiz, aulaId), 'aula-estado.json');
}

function dividirLista(valor, nome) {
    const itens = String(valor || '').split(',').map((item) => item.trim()).filter(Boolean);
    if (itens.length === 0) throw new Error(`Informe ao menos um item em ${nome}.`);
    return itens;
}

export async function inventariarPublicos(raiz, aulaId, publicos) {
    const base = caminhoAula(raiz, aulaId);
    const arquivos = [];
    for (const caminho of publicos) {
        if (caminho.includes('\\') || caminho.startsWith('/') || caminho === '.' || caminho.startsWith('./')) {
            throw new Error(`Caminho publico invalido: ${caminho}.`);
        }
        const absoluto = resolverCaminhoSeguro(raiz, 'AULAS', aulaId, caminho);
        await exigirArquivoRegular(absoluto);
        arquivos.push({ caminho, hash: hashBytes(await readFile(absoluto)) });
    }
    arquivos.sort((a, b) => a.caminho.localeCompare(b.caminho));
    return { hash: hashConteudo(arquivos), arquivos };
}

export function validarPedagogiaEstado(pedagogia) {
    if (!pedagogia) return undefined;
    if (pedagogia.abordagem !== 'pbl') throw new Error('Estado com abordagem pedagogica invalida.');
    if (!['pratica', 'analitica', 'mista'].includes(pedagogia.modalidadeAplicacao)) {
        throw new Error('Estado com modalidade de aplicacao invalida.');
    }
    validarIdentificador('problema', pedagogia.problemaId);
    if (!Array.isArray(pedagogia.objetivos) || pedagogia.objetivos.length === 0 || pedagogia.objetivos.some((objetivo) => typeof objetivo !== 'string' || !objetivo.trim())) {
        throw new Error('Estado sem objetivos pedagogicos validos.');
    }
    if (!Array.isArray(pedagogia.fontes) || pedagogia.fontes.length === 0) {
        throw new Error('Estado sem fontes pedagogicas.');
    }
    for (const fonte of pedagogia.fontes) validarIdentificador('fonte', fonte);
    return {
        abordagem: pedagogia.abordagem,
        modalidadeAplicacao: pedagogia.modalidadeAplicacao,
        problemaId: pedagogia.problemaId,
        objetivos: pedagogia.objetivos,
        fontes: pedagogia.fontes
    };
}

export async function extrairPedagogia(raiz, aulaId, publicos) {
    if (!publicos.includes('slides.json')) return undefined;
    const caminho = resolverCaminhoSeguro(raiz, 'AULAS', aulaId, 'slides.json');
    let fonte;
    try {
        fonte = JSON.parse(await readFile(await exigirArquivoRegular(caminho), 'utf8'));
    } catch {
        throw new Error('Fonte slides.json invalida para extrair a pedagogia.');
    }
    if (fonte.version !== 2 || !fonte.pedagogia) return undefined;
    return validarPedagogiaEstado(fonte.pedagogia);
}

function validarFontes(fontes) {
    if (!Array.isArray(fontes) || fontes.length === 0) throw new Error('Informe ao menos uma fonte consultada.');
    for (const fonte of fontes) {
        validarIdentificador('fonte', fonte?.id);
        for (const campo of ['titulo', 'tipo', 'situacaoLeitura', 'dataConsulta']) {
            if (!fonte?.[campo]) throw new Error(`Fonte ${fonte?.id || 'desconhecida'} sem ${campo}.`);
        }
    }
    return fontes;
}

async function exigirNovo(caminho, sobrescrever) {
    try {
        await access(caminho);
    } catch {
        return;
    }
    if (!sobrescrever) throw new Error(`Estado ja existe: ${caminho}.`);
}

async function carregarEstado(raiz, aulaId) {
    const caminho = caminhoEstado(raiz, aulaId);
    const estado = validarSchema(SCHEMA, JSON.parse(await readFile(await exigirArquivoRegular(caminho), 'utf8')), 'Estado da aula');
    if (estado.aulaId !== aulaId) throw new Error('Estado de outra aula.');
    return { caminho, estado };
}

function registrar(estado, agora, acao, ator = '', detalhe = '') {
    estado.historico.push({ quando: agora, acao, ...(ator ? { ator } : {}), ...(detalhe ? { detalhe } : {}) });
}

function transitar(estado, destino) {
    if (!TRANSICOES[estado.estado]?.includes(destino)) {
        throw new Error(`Transicao invalida: ${estado.estado} para ${destino}.`);
    }
    estado.estado = destino;
    estado.versao += 1;
}

export async function prepararEstado({ raiz = RAIZ, aulaId, publicos, atividadeId, fontes = [], agora = new Date().toISOString(), sobrescrever = false } = {}) {
    const caminho = caminhoEstado(raiz, aulaId);
    await exigirNovo(caminho, sobrescrever);
    if (atividadeId) validarIdentificador('atividade', atividadeId);
    const lista = Array.isArray(publicos) ? publicos : dividirLista(publicos, '--publicos');
    const conteudo = await inventariarPublicos(raiz, aulaId, lista);
    const pedagogia = await extrairPedagogia(raiz, aulaId, lista);
    const estado = validarSchema(SCHEMA, {
        version: 1,
        aulaId,
        versao: 1,
        estado: 'rascunho',
        atualizadoEm: agora,
        conteudoPublico: conteudo,
        ...(atividadeId ? { atividadeId } : {}),
        ...(pedagogia ? { pedagogia } : {}),
        fontes,
        historico: [{ quando: agora, acao: 'Estado preparado como rascunho.' }]
    }, 'Estado da aula');
    await mkdir(caminhoAula(raiz, aulaId), { recursive: true });
    await escreverArquivoAtomico(caminho, `${JSON.stringify(estado, null, 2)}\n`);
    return { caminho, estado };
}

export async function solicitarRevisao({ raiz = RAIZ, aulaId, publicos, agora = new Date().toISOString(), motivo = '' } = {}) {
    const { caminho, estado } = await carregarEstado(raiz, aulaId);
    const lista = publicos ? (Array.isArray(publicos) ? publicos : dividirLista(publicos, '--publicos')) : estado.conteudoPublico.arquivos.map((arquivo) => arquivo.caminho);
    estado.conteudoPublico = await inventariarPublicos(raiz, aulaId, lista);
    const pedagogia = await extrairPedagogia(raiz, aulaId, lista);
    if (pedagogia) estado.pedagogia = pedagogia;
    else delete estado.pedagogia;
    transitar(estado, 'em-revisao');
    estado.atualizadoEm = agora;
    registrar(estado, agora, 'Enviado para revisao docente.', '', motivo);
    await escreverArquivoAtomico(caminho, `${JSON.stringify(validarSchema(SCHEMA, estado, 'Estado da aula'), null, 2)}\n`);
    return { caminho, estado };
}

export async function aprovarEstado({ raiz = RAIZ, aulaId, publicos, rubricaId, aprovadoPor, aprovadoEm, referencia = '', fontes, registro, agora = new Date().toISOString() } = {}) {
    const { caminho, estado } = await carregarEstado(raiz, aulaId);
    if (!['em-revisao', 'revisao-necessaria'].includes(estado.estado)) {
        throw new Error('Apenas conteudo em revisao pode ser aprovado.');
    }
    validarIdentificador('rubrica', rubricaId);
    if (!aprovadoPor || !aprovadoEm) throw new Error('Aprovacao exige responsavel e data.');
    const lista = publicos ? (Array.isArray(publicos) ? publicos : dividirLista(publicos, '--publicos')) : estado.conteudoPublico.arquivos.map((arquivo) => arquivo.caminho);
    estado.conteudoPublico = await inventariarPublicos(raiz, aulaId, lista);
    const pedagogia = await extrairPedagogia(raiz, aulaId, lista);
    if (pedagogia) estado.pedagogia = pedagogia;
    else delete estado.pedagogia;
    estado.rubrica = { rubricaId, criteriosAprovados: true, escalaAprovada: true, aprovadoPor, aprovadoEm, ...(referencia ? { referencia } : {}) };
    estado.fontes = validarFontes(fontes);
    if (registro) {
        validarIdentificador('registro', registro.registroId);
        for (const evidencia of registro.evidencias || []) validarIdentificador('evidencia', evidencia);
        estado.registro = registro;
    }
    transitar(estado, 'aprovado');
    estado.atualizadoEm = agora;
    registrar(estado, agora, 'Conteudo aprovado pelo professor.', aprovadoPor, referencia);
    await escreverArquivoAtomico(caminho, `${JSON.stringify(validarSchema(SCHEMA, estado, 'Estado da aula'), null, 2)}\n`);
    return { caminho, estado };
}

export async function marcarAplicada({ raiz = RAIZ, aulaId, data, fonte, agora = new Date().toISOString() } = {}) {
    const { caminho, estado } = await carregarEstado(raiz, aulaId);
    if (estado.estado !== 'aprovado') throw new Error('Apenas conteudo aprovado pode ser marcado como aplicado.');
    if (!data || !fonte) throw new Error('Aplicacao exige data e fonte fornecidas pelo professor.');
    const atual = await inventariarPublicos(raiz, aulaId, estado.conteudoPublico.arquivos.map((arquivo) => arquivo.caminho));
    if (atual.hash !== estado.conteudoPublico.hash) {
        throw new Error('Conteudo alterado apos a aprovacao. Solicite nova revisao antes de marcar como aplicado.');
    }
    estado.aplicacao = { data, fonte };
    transitar(estado, 'aplicado');
    estado.atualizadoEm = agora;
    registrar(estado, agora, 'Aula marcada como aplicada.', '', `${data}; ${fonte}`);
    await escreverArquivoAtomico(caminho, `${JSON.stringify(validarSchema(SCHEMA, estado, 'Estado da aula'), null, 2)}\n`);
    return { caminho, estado };
}

export async function avaliarEstado({ raiz = RAIZ, aulaId } = {}) {
    const { estado } = await carregarEstado(raiz, aulaId);
    const atual = await inventariarPublicos(raiz, aulaId, estado.conteudoPublico.arquivos.map((arquivo) => arquivo.caminho));
    const atualizado = atual.hash === estado.conteudoPublico.hash;
    return {
        estado: estado.estado,
        versao: estado.versao,
        atualizado,
        esperado: estado.conteudoPublico.hash,
        atual: atual.hash,
        arquivos: estado.conteudoPublico.arquivos,
        pedagogia: estado.pedagogia,
        fontes: estado.fontes,
        revisaoRecomendada: !atualizado && ['aprovado', 'aplicado'].includes(estado.estado)
    };
}

export async function marcarRevisao({ raiz = RAIZ, aulaId, motivo, agora = new Date().toISOString() } = {}) {
    const { caminho, estado } = await carregarEstado(raiz, aulaId);
    if (!['aprovado', 'aplicado'].includes(estado.estado)) throw new Error('Apenas conteudo aprovado ou aplicado pode exigir revisao.');
    if (!motivo) throw new Error('Informe o motivo da revisao.');
    const atual = await inventariarPublicos(raiz, aulaId, estado.conteudoPublico.arquivos.map((arquivo) => arquivo.caminho));
    if (atual.hash === estado.conteudoPublico.hash) throw new Error('Nenhuma alteracao detectada no conteudo aprovado.');
    estado.conteudoPublico = atual;
    transitar(estado, 'revisao-necessaria');
    estado.atualizadoEm = agora;
    registrar(estado, agora, 'Revisao exigida apos alteracao do conteudo aprovado.', '', motivo);
    await escreverArquivoAtomico(caminho, `${JSON.stringify(validarSchema(SCHEMA, estado, 'Estado da aula'), null, 2)}\n`);
    return { caminho, estado };
}

async function lerJsonEntrada(caminho) {
    return JSON.parse(await readFile(await exigirArquivoRegular(resolve(process.cwd(), caminho)), 'utf8'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        const { comando, opcoes } = analisarArgumentosCli(process.argv.slice(2));
        if (comando === 'preparar' && opcoes.aula && opcoes.publicos) {
            const resultado = await prepararEstado({
                aulaId: opcoes.aula,
                publicos: opcoes.publicos,
                atividadeId: opcoes.atividade,
                fontes: opcoes.fontes ? await lerJsonEntrada(opcoes.fontes) : []
            });
            console.log(`Estado preparado: ${resultado.caminho}`);
        } else if (comando === 'solicitar-revisao' && opcoes.aula) {
            const resultado = await solicitarRevisao({ aulaId: opcoes.aula, publicos: opcoes.publicos, motivo: opcoes.motivo || '' });
            console.log(`Revisao solicitada: ${resultado.caminho}`);
        } else if (comando === 'aprovar' && opcoes.aula && opcoes.rubrica && opcoes.aprovadoPor && opcoes.aprovadoEm && opcoes.fontes) {
            const resultado = await aprovarEstado({
                aulaId: opcoes.aula,
                publicos: opcoes.publicos,
                rubricaId: opcoes.rubrica,
                aprovadoPor: opcoes.aprovadoPor,
                aprovadoEm: opcoes.aprovadoEm,
                referencia: opcoes.referencia || '',
                fontes: await lerJsonEntrada(opcoes.fontes)
            });
            console.log(`Conteudo aprovado: ${resultado.caminho}`);
        } else if (comando === 'marcar-aplicada' && opcoes.aula && opcoes.data && opcoes.fonte) {
            const resultado = await marcarAplicada({ aulaId: opcoes.aula, data: opcoes.data, fonte: opcoes.fonte });
            console.log(`Aula aplicada: ${resultado.caminho}`);
        } else if (comando === 'avaliar' && opcoes.aula) {
            console.log(JSON.stringify(await avaliarEstado({ aulaId: opcoes.aula }), null, 2));
        } else if (comando === 'marcar-revisao' && opcoes.aula && opcoes.motivo) {
            const resultado = await marcarRevisao({ aulaId: opcoes.aula, motivo: opcoes.motivo });
            console.log(`Revisao exigida: ${resultado.caminho}`);
        } else {
            throw new Error('Uso: node scripts/aula-estado.mjs <preparar|solicitar-revisao|aprovar|marcar-aplicada|avaliar|marcar-revisao> --opcoes');
        }
    } catch (erro) {
        console.error(erro.message);
        process.exitCode = 1;
    }
}
