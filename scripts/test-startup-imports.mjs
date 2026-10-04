import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const reactImport = app.match(/import\s*\{([^}]+)\}\s*from\s*['"]react['"]/);
assert.ok(reactImport, 'App must import its React hooks');
const hooks = new Set(reactImport[1].split(',').map(value => value.trim()));
for (const [, hook] of app.matchAll(/\b(use[A-Z]\w*)\s*\(/g)) {
  assert.ok(hooks.has(hook), `Missing React hook import: ${hook}`);
}
const design = await readFile(new URL('../src/game/world/worldDesignSystem.js', import.meta.url), 'utf8');
assert.match(design, /import\s*\{\s*Vector3\s*\}\s*from\s*['"]@babylonjs\/core\/Maths\/math\.vector\.js['"]/);
console.log('PASS: App React hooks and lamp Vector3 imports');
