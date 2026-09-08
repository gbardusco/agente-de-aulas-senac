import { cp, mkdir, mkdtemp, readdir, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import JSZip from 'jszip';
import { generateSlides } from './gerar-slides.mjs';
import { gerarRelatorio } from './relatorio-docente.mjs';
import { aprovarEstado, avaliarEstado, marcarAplicada, prepararEstado, solicitarRevisao } from './aula-estado.mjs';
import { empacotarAula } from './pacote-alunos.mjs';
import { verificarAula } from './verificar.mjs';
import { analisarArgumentosCli, escreverArquivoAtomico, exigirArquivoRegular, validarIdentificador } from './modelo-aula.mjs';

const RAIZ_REPO = resolve(fileURLToPath(new URL('../', import.meta.url)));
const FIXTURE_PADRAO = join(RAIZ_REPO, 'exemplos/fluxo-completo-ficticio');
const AULAS = [
    {
        aulaId: 'aula-03',
        atividadeId: 'atividade-03-estrutura-demo-1',
        rubricaId: 'rubrica-03-estrutura-demo-1-v1',
        registroId: 'registro-03-diario-demo-1',
        evidenciaId: 'evidencia-03-estrutura-demo-a'
    },
    {
        aulaId: 'aula-04',
        atividadeId: 'atividade-04-interpretacao-demo-1',
        rubricaId: 'rubrica-04-interpretacao-demo-1-v1',
        registroId: 'registro-04-diario-demo-1',
        evidenciaId: 'evidencia-04-interpretacao-demo-a'
    }
];
const AGORA = '2026-09-09T10:00:00-03:00';
const PADROES_REAIS = [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/];

async function listarTexto(diretorio, arquivos = []) {
    for (const entrada of await readdir(diretorio, { withFileTypes: true })) {
        const caminho = join(diretorio, entrada.name);
        if (entrada.isDirectory()) await listarTexto(caminho, arquivos);
        else if (entrada.isFile() && /\.(md|json|html)$/i.test(entrada.name)) arquivos.push(caminho);
    }
    return arquivos;
}

export async function verificarFixture(fonte) {
    const ocorrencias = [];
    for (const caminho of await listarTexto(fonte)) {
        const conteudo = await readFile(caminho, 'utf8');
        if (PADROES_REAIS.some((padrao) => padrao.test(conteudo))) ocorrencias.push(caminho);
    }
    if (ocorrencias.length > 0) {
        throw new Error(`Fixture com possivel dado real: ${ocorrencias.join(', ')}.`);
    }
}

async function prepararSaida(saida, sobrescrever) {
    const destino = saida ? resolve(process.cwd(), saida) : await mkdtemp(join(tmpdir(), 'demo-fluxo-'));
    try {
        const info = await stat(destino);
        if (!info.isDirectory()) throw new Error(`Saida invalida: ${destino}.`);
        if ((await readdir(destino)).length > 0 && !sobrescrever) {
            throw new Error(`Saida ocupada: ${destino}. Use --sobrescrever em diretorio isolado.`);
        }
    } catch (erro) {
        if (erro.code === 'ENOENT') await mkdir(destino, { recursive: true });
        else if (!erro.message.startsWith('Saida ocupada') && !erro.message.startsWith('Saida invalida')) throw erro;
        else if (erro.message.startsWith('Saida ocupada') || erro.message.startsWith('Saida invalida')) throw erro;
    }
    return destino;
}

export async function executarDemonstracao({ fonte = FIXTURE_PADRAO, saida, sobrescrever = false } = {}) {
    await verificarFixture(fonte);
    const workspace = await prepararSaida(saida, sobrescrever);
    const bibliotecaDir = join(workspace, '.docs', 'materiais-consulta');
    await mkdir(bibliotecaDir, { recursive: true });
    await cp(join(fonte, 'fontes'), bibliotecaDir, { recursive: true });
    const biblioteca = join(bibliotecaDir, 'indice.md');
    const aulas = [];
    for (const config of AULAS) {
        aulas.push(await executarAulaDemo({ fonte, workspace, biblioteca, ...config }));
    }
    const resumo = { fixture: fonte, workspace, aulas };
    await escreverArquivoAtomico(join(workspace, 'resumo.json'), `${JSON.stringify(resumo, null, 2)}\n`);
    return resumo;
}

async function executarAulaDemo({ fonte, workspace, biblioteca, aulaId, atividadeId, rubricaId, registroId, evidenciaId }) {
    const aula = join(workspace, 'AULAS', aulaId);
    const docente = join(workspace, 'AULAS', 'registros-docentes', aulaId);
    await mkdir(aula, { recursive: true });
    await mkdir(docente, { recursive: true });

    const origemAula = join(fonte, aulaId);
    await cp(join(origemAula, 'slides.json'), join(aula, 'slides.json'));
    await cp(join(origemAula, 'index.md'), join(aula, 'index.md'));
    await cp(join(origemAula, 'exercicios.html'), join(aula, 'exercicios.html'));
    await cp(join(origemAula, 'rubrica-final.md'), join(aula, 'rubrica-atividade.md'));
    const valores = JSON.parse(await readFile(join(origemAula, 'relatorio-valores.json'), 'utf8'));
    const publicos = JSON.parse(await readFile(join(origemAula, 'arquivos-publicos.json'), 'utf8'));
    const fontesEstado = JSON.parse(await readFile(join(origemAula, 'fontes-estado.json'), 'utf8'));
    const esperados = JSON.parse(await readFile(join(origemAula, 'resultados-esperados.json'), 'utf8'));
    validarIdentificador('aula', esperados.aulaId);

    await generateSlides(join(aula, 'slides.json'), aula);
    const relatorio = await gerarRelatorio({
        raiz: workspace,
        aulaId,
        configPath: join(origemAula, 'diario-config.json'),
        valores,
        atualizadoEm: AGORA
    });
    await prepararEstado({ raiz: workspace, aulaId, publicos, atividadeId, agora: AGORA });
    await solicitarRevisao({ raiz: workspace, aulaId, agora: AGORA, motivo: 'Revisao ficticia da demonstracao.' });
    await aprovarEstado({
        raiz: workspace,
        aulaId,
        rubricaId,
        aprovadoPor: 'Docente DEMO',
        aprovadoEm: '2026-09-09',
        referencia: 'DEC-DEMO-001',
        fontes: fontesEstado,
        registro: { registroId, evidencias: [evidenciaId], observacao: 'Registro ficticio vinculado.' },
        agora: AGORA
    });
    await marcarAplicada({ raiz: workspace, aulaId, data: '2026-09-09', fonte: `Relatorio ficticio ${registroId}`, agora: AGORA });
    const bibliotecaPath = biblioteca;
    const verificacao = await verificarAula({ raiz: workspace, aulaId, biblioteca: bibliotecaPath, modo: 'distribuicao' });
    if (verificacao.erros.length > 0) {
        throw new Error(`Demonstracao reprovada na verificacao: ${verificacao.erros.map((erro) => erro.mensagem).join('; ')}`);
    }
    const pacote = await empacotarAula({ raiz: workspace, aulaId, destino: join(workspace, 'saidas', `${aulaId}.zip`), geradoEm: AGORA });
    const zip = await JSZip.loadAsync(await readFile(pacote.caminhoSaida));
    const entradas = Object.keys(zip.files).filter((nome) => !nome.endsWith('/')).sort();
    if (JSON.stringify(entradas) !== JSON.stringify(esperados.pacote)) {
        throw new Error(`Pacote fora do esperado: ${entradas.join(', ')}.`);
    }
    for (const excluido of esperados.excluidosDoPacote) {
        if (entradas.some((entrada) => entrada.endsWith(excluido))) throw new Error(`Conteudo privado no pacote: ${excluido}.`);
    }
    const estado = await avaliarEstado({ raiz: workspace, aulaId });
    if (estado.estado !== esperados.estadoFinal || !estado.atualizado) throw new Error('Estado final fora do esperado.');
    return {
        aulaId,
        estado: estado.estado,
        versao: estado.versao,
        pacote: pacote.caminhoSaida,
        entradas,
        avisos: verificacao.avisos,
        relatorio: relatorio.htmlPath
    };
}

function analisarArgumentos(argumentos) {
    const { comando, opcoes } = analisarArgumentosCli(argumentos);
    if (comando) throw new Error(`Argumento inesperado: ${comando}.`);
    if (opcoes.fonte && !isAbsolute(opcoes.fonte)) opcoes.fonte = resolve(process.cwd(), opcoes.fonte);
    return opcoes;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        const resumo = await executarDemonstracao(analisarArgumentos(process.argv.slice(2)));
        console.log(`Demonstracao concluida: ${resumo.workspace}`);
        for (const aula of resumo.aulas) {
            console.log(`Pacote ${aula.aulaId}: ${aula.pacote}`);
            for (const entrada of aula.entradas) console.log(`- ${entrada}`);
            if (aula.avisos.length > 0) console.log(`Avisos: ${aula.avisos.map((aviso) => aviso.mensagem).join('; ')}`);
        }
    } catch (erro) {
        console.error(erro.message);
        process.exitCode = 1;
    }
}
