import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
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
  const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit' });
  children.push(child);
  child.on('error', error => {
    console.error(error);
    stop(1);
  });
  child.on('exit', code => stop(code ?? 1));
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
