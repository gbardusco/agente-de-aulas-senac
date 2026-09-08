import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { analisarArgumentosCli, analisarTabelaMarkdown, canonicalizar, exigirArquivoRegular, hashBytes, hashConteudo, resolverCaminhoSeguro, validarIdentificador, validarSchema } from '../scripts/modelo-aula.mjs';

test('canonicalizacao e hash sao estaveis independentemente da ordem das chaves', () => {
    const primeiro = { b: 2, a: [3, { y: 1, x: 2 }] };
    const segundo = { a: [3, { x: 2, y: 1 }], b: 2 };
    assert.equal(canonicalizar(primeiro), canonicalizar(segundo));
    assert.equal(hashConteudo(primeiro), hashConteudo(segundo));
    assert.notEqual(hashConteudo(primeiro), hashConteudo({ ...primeiro, b: 3 }));
    assert.match(hashConteudo(primeiro), /^[0-9a-f]{64}$/);
    assert.equal(hashBytes(Buffer.from('a')), 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb');
});

test('identificadores aceitam o padrao e rejeitam valores inesperados', () => {
    assert.equal(validarIdentificador('aula', 'aula-03'), 'aula-03');
    assert.equal(validarIdentificador('fonte', 'fonte-plano-curso-vigente'), 'fonte-plano-curso-vigente');
    assert.equal(validarIdentificador('problema', 'problema-03-catalogo-demo-1'), 'problema-03-catalogo-demo-1');
    for (const [tipo, valor] of [['aula', 'aula3'], ['atividade', '../x'], ['fonte', 'FONTE-X']]) {
        assert.throws(() => validarIdentificador(tipo, valor), /Identificador invalido/);
    }
    assert.throws(() => validarIdentificador('desconhecido', 'x'), /desconhecido/);
});

test('argumentos aceitam valores separados ou com igual e sinalizadores', () => {
    assert.deepEqual(analisarArgumentosCli(['gerar', '--aula', 'aula-03', '--sobrescrever']), { comando: 'gerar', opcoes: { aula: 'aula-03', sobrescrever: true } });
    assert.deepEqual(analisarArgumentosCli(['--modo=distribuicao']), { comando: null, opcoes: { modo: 'distribuicao' } });
    assert.throws(() => analisarArgumentosCli(['gerar', 'extra']), /inesperado/);
});

test('schemas invalidos sao rejeitados com mensagem acionavel', () => {
    const schema = { type: 'object', required: ['nome'], additionalProperties: false, properties: { nome: { type: 'string' } } };
    assert.equal(validarSchema(schema, { nome: 'Aula' }, 'Teste').nome, 'Aula');
    assert.throws(() => validarSchema(schema, { nome: 3 }, 'Teste'), /Teste invalido/);
});

test('caminhos ficam contidos na raiz e symlinks sao recusados', async () => {
    const diretorio = await mkdtemp('/tmp/opencode/modelo-teste-');
    try {
        const arquivo = join(diretorio, 'aula', 'estado.json');
        await mkdir(join(diretorio, 'aula'), { recursive: true });
        await writeFile(arquivo, '{}');
        assert.equal(resolverCaminhoSeguro(diretorio, 'aula', 'estado.json'), arquivo);
        await exigirArquivoRegular(arquivo);
        for (const segmentos of [['..', 'fora'], ['/etc', 'x'], ['']]) {
            assert.throws(() => resolverCaminhoSeguro(diretorio, ...segmentos), /Caminho|Segmento/);
        }
        const elo = join(diretorio, 'elo');
        await symlink(arquivo, elo);
        await assert.rejects(exigirArquivoRegular(elo), /Symlink/);
        await assert.rejects(exigirArquivoRegular(join(diretorio, 'ausente.json')), /nao encontrado/);
        await assert.rejects(exigirArquivoRegular(join(diretorio, 'aula')), /nao e arquivo regular/);
    } finally {
        await rm(diretorio, { recursive: true, force: true });
    }
});

test('tabela Markdown exige cabecalhos e formato consistente', () => {
    const tabela = ['| ID | Titulo |', '|----|--------|', '| a | b |', '| c | d |'].join('\n');
    assert.deepEqual(analisarTabelaMarkdown(tabela, ['ID', 'Titulo']), [{ ID: 'a', Titulo: 'b' }, { ID: 'c', Titulo: 'd' }]);
    assert.throws(() => analisarTabelaMarkdown(tabela, ['Ausente']), /cabecalhos obrigatorios/);
    assert.throws(() => analisarTabelaMarkdown('sem tabela'), /Tabela Markdown/);
});
