import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('preparacao valida entradas antes de instalar e preserva arquivos personalizados', async () => {
    const root = await mkdtemp(join(tmpdir(), 'preparar-test-'));
    try {
        await cp(new URL('../preparar.sh', import.meta.url), join(root, 'preparar.sh'));
        await cp(new URL('../setup.sh', import.meta.url), join(root, 'setup.sh'));
        await cp(new URL('../_templates/', import.meta.url), join(root, '_templates'), { recursive: true });
        await writeFile(join(root, 'package-lock.json'), '{}');
        await mkdir(join(root, 'bin'));
        await writeFile(join(root, 'bin/npm'), '#!/bin/sh\nprintf installed >> "$PWD/install-log"\n', { mode: 0o755 });
        const env = { ...process.env, PATH: `${join(root, 'bin')}:${process.env.PATH}` };
        const run = (...args) => spawnSync('bash', ['preparar.sh', ...args], { cwd: root, env, encoding: 'utf8' });
        assert.equal(run().status, 1);
        assert.equal(run('Curso de teste').status, 0);
        const profile = join(root, '.memory/perfil-turma.md');
        await writeFile(profile, 'Dados personalizados de teste');
        assert.equal(run('Curso de teste').status, 0);
        assert.equal(await readFile(profile, 'utf8'), 'Dados personalizados de teste');
        await rm(join(root, '_templates/assets/slides.css'));
        const before = await readFile(join(root, 'install-log'), 'utf8');
        assert.equal(run('Curso').status, 1);
        assert.equal(await readFile(join(root, 'install-log'), 'utf8'), before);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
