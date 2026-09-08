import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { carregarConfiguracao, exportarRelatorio, gerarRelatorio, importarRelatorio, montarRelatorio, validarRelatorio } from '../scripts/relatorio-docente.mjs';

const configPath = new URL('../_templates/diario-sistema-template.json', import.meta.url).pathname;

test('relatorio canonico usa configuracao, preserva rastreabilidade e rejeita duplicados', async () => {
    const config = await carregarConfiguracao(configPath);
    const relatorio = montarRelatorio({
        aulaId: 'aula-03',
        config,
        atualizadoEm: '2026-09-09T10:00:00-03:00',
        valores: {
            campos: [{ id: 'atividades-chamada', valor: 'Aula aplicada com evidencia ficticia.' }],
            evidencias: [{ id: 'evidencia-03-ficticia-a', descricao: 'Evidencia sintetica.', situacao: 'observada' }],
            fontes: [{ id: 'fonte-manual-ficticio', titulo: 'Manual ficticio', tipo: 'manual', situacaoLeitura: 'consultado', dataConsulta: '2026-09-09' }],
            historico: [{ quando: '2026-09-09', acao: 'Rascunho criado para teste.' }]
        }
    });
    assert.equal(relatorio.campos.length, 7);
    assert.equal(relatorio.campos.find((campo) => campo.id === 'atividades-chamada').valor, 'Aula aplicada com evidencia ficticia.');
    assert.throws(() => montarRelatorio({ aulaId: 'aula-XX', config, valores: {} }), /Identificador invalido/);
    assert.throws(() => montarRelatorio({
        aulaId: 'aula-03',
        config,
        valores: { campos: [{ id: 'atividades-chamada', valor: 'a' }, { id: 'atividades-chamada', valor: 'b' }] }
    }), /duplicado/);
});

test('gerar, exportar e importar preservam texto, escapam HTML e nao sobrescrevem sem autorizacao', async () => {
    const raiz = await mkdtemp('/tmp/opencode/relatorio-teste-');
    try {
        const malicioso = '</script><script>alert("x")</script>';
        const { htmlPath, jsonPath, relatorio } = await gerarRelatorio({
            raiz,
            aulaId: 'aula-03',
            configPath,
            atualizadoEm: '2026-09-09T10:00:00-03:00',
            valores: {
                campos: [
                    { id: 'observacao-docente', valor: malicioso },
                    { id: 'feedback-aluno-demo-1', rotulo: 'Feedback do aluno demo 1', grupo: 'feedback', valor: 'Texto adicional.' }
                ]
            }
        });
        const html = await readFile(htmlPath, 'utf8');
        assert.ok(html.includes('&lt;/script&gt;&lt;script&gt;alert(&quot;x&quot;)'));
        assert.ok(html.includes('\\u003c/script'));
        assert.ok(html.includes('id="feedback-aluno-demo-1"'));
        assert.ok(html.includes('data-copy="feedback-aluno-demo-1"'));
        assert.ok(html.includes('id="status-feedback-aluno-demo-1"'));
        assert.equal(relatorio.campos.length, 8);
        assert.equal(JSON.parse(await readFile(jsonPath, 'utf8')).campos.find((campo) => campo.id === 'observacao-docente').valor, malicioso);
        await assert.rejects(gerarRelatorio({ raiz, aulaId: 'aula-03', configPath }), /ja existe/);

        const editado = html.replace('&lt;/script&gt;&lt;script&gt;alert(&quot;x&quot;)', 'Texto revisado');
        await writeFile(htmlPath, editado);
        const exportado = await exportarRelatorio({ raiz, origemHtml: htmlPath, destinoJson: join(raiz, 'exportado.json'), atualizadoEm: '2026-09-09T11:00:00-03:00' });
        assert.equal(exportado.relatorio.campos.find((campo) => campo.id === 'observacao-docente').valor, 'Texto revisado</script>');
        const validacao = await validarRelatorio({ origemHtml: htmlPath, configPath });
        assert.deepEqual(validacao.erros, []);
        const importado = await importarRelatorio({ origemJson: join(raiz, 'exportado.json'), destinoHtml: htmlPath });
        assert.ok((await readFile(importado.destino, 'utf8')).includes('Texto revisado'));
    } finally {
        await rm(raiz, { recursive: true, force: true });
    }
});
