import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { executarDemonstracao } from '../scripts/demo-fluxo.mjs';

test('demonstracao ficticia executa fluxos pratico e teorico sem dados reais', async () => {
    const saida = await mkdtemp('/tmp/opencode/demo-teste-');
    await rm(saida, { recursive: true, force: true });
    try {
        const resumo = await executarDemonstracao({ saida, sobrescrever: true });
        assert.equal(resumo.aulas.length, 2);
        const pratica = resumo.aulas.find((aula) => aula.aulaId === 'aula-03');
        const teorica = resumo.aulas.find((aula) => aula.aulaId === 'aula-04');
        for (const aula of [pratica, teorica]) {
            assert.equal(aula.estado, 'aplicado');
            assert.deepEqual(aula.avisos, []);
            assert.ok(aula.entradas.includes(`${aula.aulaId}/slides.pptx`));
        }
        assert.deepEqual(pratica.entradas, [
            'aula-03/exercicios.html',
            'aula-03/index.md',
            'aula-03/manifesto.json',
            'aula-03/rubrica-atividade.md',
            'aula-03/slides.html',
            'aula-03/slides.json',
            'aula-03/slides.pptx'
        ]);
        assert.deepEqual(teorica.entradas, [
            'aula-04/exercicios.html',
            'aula-04/index.md',
            'aula-04/manifesto.json',
            'aula-04/rubrica-atividade.md',
            'aula-04/slides.html',
            'aula-04/slides.json',
            'aula-04/slides.pptx'
        ]);
        const gravado = JSON.parse(await readFile(join(resumo.workspace, 'resumo.json'), 'utf8'));
        assert.equal(gravado.aulas.length, 2);
        assert.ok((await readFile(pratica.relatorio, 'utf8')).includes('ALUNO-DEMO-01'));
        assert.ok((await readFile(teorica.relatorio, 'utf8')).includes('ALUNO-DEMO-02'));
    } finally {
        await rm(saida, { recursive: true, force: true });
    }
});
