import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const root = fileURLToPath(new URL('../', import.meta.url));
const devEnv = { ...process.env };
try {
  for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && devEnv[match[1]] === undefined) devEnv[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
} catch { /* .env is optional for guest-only development. */ }
const children = [];
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill();
}

for (const args of [
  ['--watch', 'server/index.js'],
  ['node_modules/vite/bin/vite.js', '--host', '0.0.0.0'],
]) {
  const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit', env: devEnv });
  children.push(child);
  child.on('error', error => {
    console.error(error);
    stop(1);
  });
  child.on('exit', code => stop(code ?? 1));
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
