import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const choose = source.slice(source.indexOf('  const chooseCrop ='), source.indexOf('  const sellItem ='));
const shop = source.split('\n').find(line => line.includes("panel === 'shop' &&"));
assert.match(choose, /!network\.connected/);
assert.match(choose, /sendGameAction\('select_crop', \{ crop: crop\.id \}\)/);
assert.doesNotMatch(choose, /!connected\b|setPanel\(null\)/);
assert.match(shop, /disabled=\{!network\.connected/);
assert.match(shop, /aria-pressed=\{progress\.selectedCrop === crop\.id\}/);
assert.doesNotMatch(shop, /!connected\b/);
console.log('PASS seed selector: valid connection state, server action, confirmation visible');
