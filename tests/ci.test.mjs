import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('pipeline de CI executa instalacao, auditoria, testes e verificacao', async () => {
    const workflow = await readFile(`${root}.github/workflows/ci.yml`, 'utf8');
    for (const comando of ['npm ci', 'npm audit --audit-level=high', 'npm test', 'npm run test:browser', 'npm run verificar -- --modo distribuicao', 'git diff --check']) {
        assert.ok(workflow.includes(comando), `CI sem ${comando}`);
    }
    assert.ok(workflow.includes('20.x') && workflow.includes('22.x'));
    const dependabot = await readFile(`${root}.github/dependabot.yml`, 'utf8');
    assert.ok(dependabot.includes('package-ecosystem: npm'));
    assert.ok(dependabot.includes('interval: weekly'));
});
