import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const pptxRequire = createRequire(require.resolve('pptxgenjs'));
const parserPath = pptxRequire.resolve('image-size');
const imageSize = pptxRequire('image-size');

test('PptxGenJS resolves the fixed fork with the compatible 1.x API', async () => {
    const metadata = pptxRequire('image-size/package.json');
    assert.equal(metadata.name, 'image-size-next');
    assert.equal(metadata.version, '1.2.2');
    assert.equal(imageSize.imageSize, imageSize);
    assert.equal((await import(pathToFileURL(parserPath).href)).default, imageSize);
    const directory = await mkdtemp('/tmp/opencode/image-size-test-');
    try {
        const fixtures = [
            ['png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=', 'base64'), 1, 1],
            ['gif', Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'), 1, 1],
            ['svg', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="24"></svg>'), 32, 24]
        ];
        for (const [type, buffer, width, height] of fixtures) {
            const expected = { width, height, type };
            assert.deepEqual(imageSize(buffer), expected);
            assert.deepEqual(imageSize(new Uint8Array(buffer)), expected);
            const file = join(directory, `image.${type}`);
            await writeFile(file, buffer);
            assert.deepEqual(imageSize(file), expected);
            assert.deepEqual(await new Promise((resolve, reject) => imageSize(file, (error, size) => error ? reject(error) : resolve(size))), expected);
        }
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});

// Zero-length entries/boxes from the reported DoS patterns. Run outside the test
// process: a JS test timeout cannot interrupt a synchronous parser's infinite loop.
const payloads = [
    ['ICNS', '69636e73000000106973333200000000', 12],
    ['HEIF', '00000010667479706176696600000000000000246d657461000000000000000869707270000000146970636f000000006973706500000000000000000000000000000000', 44],
    ['JXL', '0000000c4a584c200d0a870a00000010667479706a786c2000000000000000006a786c7000000000', 28]
];

for (const [format, hex, offset] of payloads) {
    test(`${format} malformed sizes terminate without blocking (DoS regression)`, () => {
        const child = spawnSync(process.execPath, ['--input-type=commonjs', '-e', `
            const assert = require('node:assert/strict');
            const imageSize = require(${JSON.stringify(parserPath)});
            const { ${format}: handler } = require(${JSON.stringify(join(parserPath, '..', 'types', `${format.toLowerCase()}.js`))});
            const original = Buffer.from(${JSON.stringify(hex)}, 'hex');
            assert.equal(handler.validate(original), true, 'payload reaches the intended parser');
            for (const size of [0, 1, 7, 0xffffffff]) {
                const buffer = Buffer.from(original);
                buffer.writeUInt32BE(size, ${offset});
                // ISO BMFF size 0 may legally mean EOF; either a result or a
                // parser error is acceptable, but hanging/crashing is not.
                try { imageSize(buffer); } catch (error) { assert.ok(error instanceof Error); }
            }
            process.stdout.write('completed');
        `], { encoding: 'utf8', timeout: 3000, killSignal: 'SIGKILL' });
        assert.ifError(child.error);
        assert.equal(child.status, 0, child.stderr);
        assert.equal(child.stdout, 'completed');
    });
}
