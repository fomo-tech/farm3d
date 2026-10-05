import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { zoneAtPosition } from '../src/game/world/worldLayout.js';

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
assert.match(app, /import\s*\{[^}]*\bzoneAtPosition\b[^}]*\}\s*from\s*['"]\.\/game\/world\/worldLayout\.js['"]/,
  'App calls zoneAtPosition during initial render and must import its binding');
for (const [x, z] of [[0,0],[162,2],[-285,102],[0,365]]) {
  const zone = zoneAtPosition(x,z);
  assert.equal(typeof zone.key,'string');
  assert.equal(typeof zone.label,'string');
}
console.log('PASS: App zoneAtPosition import and pre-world position lookup');
