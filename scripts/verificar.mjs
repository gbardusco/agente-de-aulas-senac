import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { analisarArgumentosCli, analisarTabelaMarkdown } from './modelo-aula.mjs';
import { validarSchema as validarJsonSchema } from './modelo-aula.mjs';
import { validarRelatorioHtml } from './relatorio-docente.mjs';
import { avaliarEstado } from './aula-estado.mjs';
import { planejarPacote } from './pacote-alunos.mjs';
import { validarBiblioteca, verificarCitacoes } from './fontes.mjs';
import { validateDeck } from './gerar-slides.mjs';

const RAIZ = resolve(fileURLToPath(new URL('../', import.meta.url)));
const MODOS = ['desenvolvimento', 'distribuicao'];
const ARQUIVOS_ESSENCIAIS = [
    'README.md',
    'CONTRIBUTING.md',
    'exemplos/README.md',
    'exemplos/avaliacao-e-exportacao.md',
    'exemplos/fluxo-completo-ficticio/roteiro.md',
    'exemplos/fluxo-completo-ficticio/aula-03/slides.json',
    'exemplos/fluxo-completo-ficticio/aula-03/index.md',
    'exemplos/fluxo-completo-ficticio/aula-03/exercicios.html',
    'exemplos/fluxo-completo-ficticio/aula-03/rubrica-final.md',
    'exemplos/fluxo-completo-ficticio/aula-03/diario-config.json',
    'exemplos/fluxo-completo-ficticio/aula-03/relatorio-valores.json',
    'exemplos/fluxo-completo-ficticio/aula-03/arquivos-publicos.json',
    'exemplos/fluxo-completo-ficticio/aula-03/fontes-estado.json',
    'exemplos/fluxo-completo-ficticio/aula-03/resultados-esperados.json',
    'exemplos/fluxo-completo-ficticio/fontes/indice.md',
    'exemplos/fluxo-completo-ficticio/fontes/plano-curso-ficticio.md',
    'exemplos/fluxo-completo-ficticio/fontes/manual-diario-ficticio.md',
    'package.json',
    'package-lock.json',
    '.github/workflows/ci.yml',
    '.github/dependabot.yml',
    '.agents/AGENTS.md',
    '.agents/agente-checklist-pos-aula.md',
    '.agents/agente-diario-de-classe.md',
    '.agents/agente-exportador.md',
    '.agents/agente-gerador-de-exercicios.md',
    '.agents/agente-gestor-de-memoria.md',
    '.agents/agente-orquestrador.md',
    '.agents/agente-planejador-didatico.md',
    '.agents/agente-revisor-de-material.md',
    '.agents/agente-setup-inicial.md',
    '.context/index.md',
    '.context/agente-template.md',
    '.memory/padroes-tecnicos.md',
    '.memory/index.md',
    '.skills/css-layout.md',
    '.skills/markdown-authoring.md',
    '.skills/accessibility-check.md',
    '.skills/code-formatting.md',
    '.skills/html-template.md',
    '.skills/atividades-complementares.md',
    '00-MOC/Home.md',
    '00-MOC/Agentes.md',
    '00-MOC/Memoria.md',
    '00-MOC/Aulas.md',
    '_templates/README.md',
    '_templates/perfil-turma-template.md',
    '_templates/decisoes-template.md',
    '_templates/feedback-aulas-template.md',
    '_templates/status-aulas-template.md',
    '_templates/feedback-aluno-template.md',
    '_templates/glossario-template.md',
    '_templates/aula-index-template.md',
    '_templates/sintese-diario-classe-template.md',
    '_templates/slides-template.html',
    '_templates/exercicios-template.html',
    '_templates/demo-template.html',
    'scripts/gerar-slides.mjs',
    'scripts/relatorio-docente.mjs',
    'scripts/aula-estado.mjs',
    'scripts/pacote-alunos.mjs',
    'scripts/fontes.mjs',
    'scripts/demo-fluxo.mjs',
    'scripts/verificar.mjs',
    'scripts/modelo-aula.mjs',
    '_templates/slides.schema.json',
    '_templates/slides.schema.v2.json',
    '_templates/relatorio-docente.schema.json',
    '_templates/diario-sistema.schema.json',
    '_templates/aula-estado.schema.json',
    '_templates/pacote-manifest.schema.json',
    '_templates/diario-sistema-template.json',
    '_templates/relatorio-docente-template.html',
    '_templates/rubrica-atividade-template.md',
    '_templates/slides-fonte-template.json',
    '_templates/slides-fonte-teorica-template.json',
    '_templates/diario-sistema-template.json',
    '_templates/materiais-consulta-index-template.md',
    '_templates/assets/slides.css',
    '_templates/assets/slides.js',
    '_templates/assets/relatorio.css',
    '_templates/assets/relatorio.js'
];
const COMANDOS = {
    slides: 'scripts/gerar-slides.mjs',
    relatorio: 'scripts/relatorio-docente.mjs',
    'aula:estado': 'scripts/aula-estado.mjs',
    'pacote:alunos': 'scripts/pacote-alunos.mjs',
    fontes: 'scripts/fontes.mjs',
    'demo:fluxo': 'scripts/demo-fluxo.mjs',
    verificar: 'scripts/verificar.mjs'
};
const ESCOPO_WIKI = ['.agents', '.skills', '_templates', '00-MOC', 'exemplos', 'README.md', '.memory'];
const ALVOS_DE_TURMA = new Set(['perfil-turma', 'status-aulas', 'decisoes', 'feedback-aulas', 'feedback-aluno', 'sintese-diario-classe']);
const EXEMPLOS_DE_LINK = /nome-do-arquivo|\.caminho\/|TODO|preencher|\bXX\b/i;
const PLACEHOLDERS = [/TODO/, /\[preencher\]/, /\(preencher\)/, /Aula XX/, /DD\/MM/, /HHh[0-9]?/, /\[confirmar[^\]]*\]/];

export function criarRelatorio() {
    return { erros: [], avisos: [] };
}

export function registrar(relatorio, modo, mensagem, bloqueiaDistribuicao = true, detalhe = '') {
    const item = { mensagem, ...(detalhe ? { detalhe } : {}) };
    if (modo === 'distribuicao' && bloqueiaDistribuicao) relatorio.erros.push(item);
    else if (modo === 'desenvolvimento' && bloqueiaDistribuicao) relatorio.avisos.push(item);
    else relatorio.avisos.push(item);
}

async function existe(raiz, caminho) {
    try {
        await stat(join(raiz, caminho));
        return true;
    } catch {
        return false;
    }
}

async function listarMarkdown(raiz, origem) {
    const alvo = join(raiz, origem);
    const info = await stat(alvo).catch(() => null);
    if (!info) return [];
    if (info.isFile()) return origem.endsWith('.md') ? [origem] : [];
    const resultados = [];
    const pilha = [origem];
    while (pilha.length > 0) {
        const atual = pilha.pop();
        const absoluto = join(raiz, atual);
        for (const entrada of await readdir(absoluto, { withFileTypes: true })) {
            if (entrada.name === 'node_modules' || entrada.name === '.git') continue;
            const relativo = join(atual, entrada.name);
            if (entrada.isDirectory()) pilha.push(relativo);
            else if (entrada.isFile() && entrada.name.endsWith('.md')) resultados.push(relativo);
        }
    }
    return resultados.sort();
}

function analisarMetadados(conteudo) {
    const frontmatter = conteudo.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatter) return [];
    const chaves = [];
    for (const linha of frontmatter[1].split('\n')) {
        const texto = linha.trim();
        if (texto.startsWith('aliases:') || texto.startsWith('name:')) {
            const valor = texto.split(':').slice(1).join(':').trim();
            if (valor.startsWith('[')) {
                chaves.push(...valor.replace(/^\[|\]$/g, '').split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean));
            } else if (valor) {
                chaves.push(valor.replace(/^['"]|['"]$/g, ''));
            }
        }
    }
    return chaves;
}

export function resolverWikilink(mapa, origem, destino) {
    const alvo = destino.split('|')[0].trim();
    if (!alvo || /^(https?:|mailto:|#)/i.test(alvo)) return { ignorado: true };
    const caminho = alvo.split('#')[0];
    const chave = caminho.toLowerCase();
    if (mapa.has(chave)) {
        const arquivos = mapa.get(chave);
        if (arquivos.length > 1) return { ambiguo: true, arquivos };
        return { arquivo: arquivos[0] };
    }
    if (ALVOS_DE_TURMA.has(chave)) return { turma: true };
    if (caminho.includes('/') || caminho.includes('.')) {
        return { arquivo: null, candidato: caminho };
    }
    return { arquivo: null, candidato: caminho };
}

export async function verificarRepositorio({ raiz = RAIZ, modo = 'desenvolvimento' } = {}) {
    if (!MODOS.includes(modo)) throw new Error('Modo invalido.');
    const relatorio = criarRelatorio();
    const pacote = JSON.parse(await readFile(join(raiz, 'package.json'), 'utf8'));
    for (const arquivo of ARQUIVOS_ESSENCIAIS) {
        if (!await existe(raiz, arquivo)) registrar(relatorio, modo, `Arquivo essencial ausente: ${arquivo}.`);
    }
    for (const [comando, alvo] of Object.entries(COMANDOS)) {
        if (pacote.scripts?.[comando] !== `node ${alvo}`) {
            registrar(relatorio, modo, `Script npm divergente ou ausente: ${comando}.`, true, `Esperado: node ${alvo}.`);
        } else if (!await existe(raiz, alvo)) {
            registrar(relatorio, modo, `Alvo do comando ausente: ${alvo}.`);
        }
    }
    const ignorados = await readFile(join(raiz, '.gitignore'), 'utf8');
    for (const entrada of ['AULAS/', '.docs/', '.memory/perfil-turma.md', 'saidas/']) {
        if (!ignorados.includes(entrada)) registrar(relatorio, modo, `Protecao ausente no .gitignore: ${entrada}.`);
    }

    const arquivos = [];
    for (const origem of ESCOPO_WIKI) arquivos.push(...await listarMarkdown(raiz, origem));
    const mapa = new Map();
    for (const arquivo of arquivos) {
        const conteudo = await readFile(join(raiz, arquivo), 'utf8');
        const chaves = new Set([arquivo.toLowerCase(), ...analisarMetadados(conteudo).map((alias) => alias.toLowerCase())]);
        const base = arquivo.split('/').pop().replace(/\.md$/, '').toLowerCase();
        chaves.add(base);
        for (const chave of chaves) mapa.set(chave, [...(mapa.get(chave) || []), arquivo]);
    }
    const turmasAusentes = new Set();
    for (const arquivo of arquivos) {
        const conteudo = await readFile(join(raiz, arquivo), 'utf8');
        const semCodigo = conteudo.replace(/```[\s\S]*?```/g, '');
        for (const match of semCodigo.matchAll(/\[\[([^\]]+)\]\]/g)) {
            if (match.index > 0 && semCodigo[match.index - 1] === '!') continue;
            if (EXEMPLOS_DE_LINK.test(match[1])) continue;
            const resolvido = resolverWikilink(mapa, arquivo, match[1]);
            if (resolvido.ignorado) continue;
            if (resolvido.ambiguo) {
                const rotulo = match[1].split('|').slice(1).join('|').replace(/`/g, '').trim();
                if (rotulo.includes('/') || rotulo.includes('.')) {
                    const tentativasRotulo = [join(dirname(arquivo), rotulo), rotulo];
                    if (await existe(raiz, tentativasRotulo[0]) || await existe(raiz, tentativasRotulo[1])) continue;
                }
                registrar(relatorio, modo, `Wikilink ambiguo em ${arquivo}: ${match[1]}.`, false, resolvido.arquivos.join(', '));
                continue;
            }
            if (resolvido.arquivo) continue;
            if (resolvido.turma) {
                turmasAusentes.add(match[1].split('|')[0].trim().toLowerCase());
                continue;
            }
            const candidato = resolvido.candidato;
            const tentativas = [join(dirname(arquivo), candidato), candidato].map((item) => item.endsWith('.md') ? item : `${item}.md`);
            if (!await existe(raiz, tentativas[0]) && !await existe(raiz, tentativas[1])) {
                registrar(relatorio, modo, `Wikilink sem destino em ${arquivo}: ${match[1]}.`, false);
            }
        }
    }
    if (turmasAusentes.size > 0) {
        registrar(relatorio, modo, 'Links para arquivos de turma ausentes no repositorio base.', false, `${[...turmasAusentes].join(', ')}. Configure a turma para validar esses destinos.`);
    }
    return relatorio;
}

function trechosComPlaceholder(texto) {
    return PLACEHOLDERS.filter((padrao) => padrao.test(texto)).map((padrao) => String(padrao));
}

export async function verificarAula({ raiz = RAIZ, aulaId, biblioteca, modo = 'desenvolvimento' } = {}) {
    const relatorio = criarRelatorio();
    let avaliacao = null;
    try {
        avaliacao = await avaliarEstado({ raiz, aulaId });
    } catch (erro) {
        registrar(relatorio, modo, `Estado da aula indisponivel: ${erro.message}.`);
        return relatorio;
    }
    if (!avaliacao.atualizado) {
        registrar(relatorio, modo, `Conteudo divergente da aprovacao em ${aulaId}.`, true, `Esperado ${avaliacao.esperado}; atual ${avaliacao.atual}.`);
    }
    if (!['aprovado', 'aplicado'].includes(avaliacao.estado)) {
        registrar(relatorio, modo, `Aula ${aulaId} fora de estado distribuivel: ${avaliacao.estado}.`, true);
    }
    const bibliotecaValidada = await validarBiblioteca({ raiz, biblioteca });
    for (const erro of bibliotecaValidada.erros) registrar(relatorio, modo, `Biblioteca com erro: ${erro}.`);
    for (const aviso of bibliotecaValidada.avisos) registrar(relatorio, modo, `Biblioteca exige revisao: ${aviso}.`, true);
    const citacoes = verificarCitacoes(avaliacao.fontes, bibliotecaValidada.registros);
    for (const erro of citacoes.erros) registrar(relatorio, modo, `Citacao invalida em ${aulaId}: ${erro}.`);
    for (const aviso of citacoes.avisos) registrar(relatorio, modo, `Citacao exige revisao em ${aulaId}: ${aviso}.`, true);
    const pasta = join(raiz, 'AULAS', aulaId);
    const fonteSlides = join(pasta, 'slides.json');
    if (await existe(raiz, join('AULAS', aulaId, 'slides.json'))) {
        try {
            const deck = validateDeck(JSON.parse(await readFile(fonteSlides, 'utf8')));
            for (const derivado of ['slides.html', 'slides.pptx']) {
                const caminho = join(pasta, derivado);
                try {
                    const [fonte, saida] = await Promise.all([stat(fonteSlides), stat(caminho)]);
                    if (fonte.mtimeMs > saida.mtimeMs) {
                        registrar(relatorio, modo, `Derivado desatualizado em ${aulaId}: ${derivado}.`);
                    }
                } catch {
                    registrar(relatorio, modo, `Derivado ausente em ${aulaId}: ${derivado}.`);
                }
            }
            if (!deck.slides.length) registrar(relatorio, modo, `Fonte de slides vazia em ${aulaId}.`);
            if (deck.version === 1) {
                registrar(relatorio, modo, `Fonte legada v1 em ${aulaId}; migre para o contrato PBL v2 quando aplicavel.`, false);
            }
            if (avaliacao.pedagogia) {
                for (const alvo of ['exercicios.html', 'rubrica-atividade.md']) {
                    if (avaliacao.arquivos.some((arquivo) => arquivo.caminho === alvo)) {
                        const conteudo = await readFile(join(pasta, alvo), 'utf8').catch(() => null);
                        if (conteudo !== null && !conteudo.includes(avaliacao.pedagogia.problemaId)) {
                            registrar(relatorio, modo, `${alvo} nao referencia o problema ${avaliacao.pedagogia.problemaId} em ${aulaId}.`, true);
                        }
                    }
                }
            }
        } catch (erro) {
            registrar(relatorio, modo, `Fonte de slides invalida em ${aulaId}: ${erro.message}.`);
        }
    } else {
        registrar(relatorio, modo, `Fonte de slides ausente em ${aulaId}: slides.json.`, false);
    }
    for (const arquivo of avaliacao.arquivos.map((item) => item.caminho)) {
        const conteudo = await readFile(join(pasta, arquivo), 'utf8').catch(() => null);
        if (conteudo === null) {
            registrar(relatorio, modo, `Arquivo aprovado ilegivel em ${aulaId}: ${arquivo}.`);
            continue;
        }
        const placeholders = trechosComPlaceholder(conteudo);
        if (placeholders.length > 0) {
            registrar(relatorio, modo, `Placeholder em arquivo de ${aulaId}: ${arquivo}.`, true, placeholders.join(', '));
        }
    }
    const pastaDocente = join(raiz, 'AULAS', 'registros-docentes', aulaId);
    const relatorioHtml = join(pastaDocente, 'relatorio.html');
    if (await existe(raiz, join('AULAS', 'registros-docentes', aulaId, 'relatorio.html'))) {
        const html = await readFile(relatorioHtml, 'utf8');
        let config = null;
        const configPath = join(pastaDocente, 'diario-config.json');
        if (await existe(raiz, join('AULAS', 'registros-docentes', aulaId, 'diario-config.json'))) {
            try {
                config = validarJsonSchema(JSON.parse(await readFile(configPath, 'utf8')), JSON.parse(await readFile(join(raiz, '_templates/diario-sistema.schema.json'), 'utf8')), 'Configuracao do diario');
            } catch (erro) {
                registrar(relatorio, modo, `Configuracao do diario invalida em ${aulaId}: ${erro.message}.`);
            }
        }
        const validacao = validarRelatorioHtml(html, config);
        for (const erro of validacao.erros) registrar(relatorio, modo, `Relatorio docente com erro em ${aulaId}: ${erro}.`);
        for (const aviso of validacao.avisos) registrar(relatorio, modo, `Relatorio docente exige revisao em ${aulaId}: ${aviso}.`, modo === 'distribuicao');
    } else {
        registrar(relatorio, modo, `Relatorio docente ausente em ${aulaId}.`, false);
    }
    try {
        const plano = await planejarPacote({ raiz, aulaId });
        if (plano.manifesto.arquivos.some((arquivo) => /(^|\/)registros-docentes(\/|$)/i.test(arquivo.caminho))) {
            registrar(relatorio, modo, `Plano de pacote inclui registro docente em ${aulaId}.`);
        }
    } catch (erro) {
        registrar(relatorio, modo, `Pacote para alunos bloqueado em ${aulaId}: ${erro.message}.`, true);
    }
    return relatorio;
}

function analisarArgumentos(argumentos) {
    const { comando, opcoes } = analisarArgumentosCli(argumentos);
    if (comando) throw new Error(`Argumento inesperado: ${comando}.`);
    const final = { modo: 'desenvolvimento', formato: 'texto', ...opcoes };
    if (!MODOS.includes(final.modo)) throw new Error('Modo invalido. Use desenvolvimento ou distribuicao.');
    if (!['texto', 'json'].includes(final.formato)) throw new Error('Formato invalido. Use texto ou json.');
    return final;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        const opcoes = analisarArgumentos(process.argv.slice(2));
        const relatorio = await verificarRepositorio({ modo: opcoes.modo });
        if (opcoes.aula) {
            const aula = await verificarAula({ aulaId: opcoes.aula, biblioteca: opcoes.biblioteca, modo: opcoes.modo });
            relatorio.erros.push(...aula.erros);
            relatorio.avisos.push(...aula.avisos);
        }
        if (opcoes.formato === 'json') {
            console.log(JSON.stringify({ ...relatorio, verificacaoTecnica: true, aprovacaoPedagogica: false }, null, 2));
        } else {
            for (const erro of relatorio.erros) console.error(`ERRO: ${erro.mensagem}${erro.detalhe ? ` (${erro.detalhe})` : ''}`);
            for (const aviso of relatorio.avisos) console.log(`AVISO: ${aviso.mensagem}${aviso.detalhe ? ` (${aviso.detalhe})` : ''}`);
            console.log(`Erros: ${relatorio.erros.length}; avisos: ${relatorio.avisos.length}. Verificacao tecnica concluida; aprovacao pedagogica continua manual.`);
        }
        if (relatorio.erros.length > 0) process.exitCode = 1;
    } catch (erro) {
        console.error(erro.message);
        process.exitCode = 1;
    }
}
