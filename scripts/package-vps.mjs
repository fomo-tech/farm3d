import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const domain = process.env.DEPLOY_DOMAIN || 'vibecity.world';
if (!/^[a-z0-9.-]+$/i.test(domain)) throw new Error('DEPLOY_DOMAIN phải là tên miền, không kèm https:// hoặc đường dẫn.');
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} thất bại (${result.status}).`);
}
run('zip', ['-v'], { stdio: 'ignore' });
console.log(`Build production cho https://${domain} ...`);
run('npm', ['run', 'build'], { env: { ...process.env, VITE_MULTIPLAYER_URL: `wss://${domain}/ws` } });

const temp = mkdtempSync(resolve(tmpdir(), 'vibecity-package-'));
const name = 'vibecity';
const stage = resolve(temp, name);
const output = resolve(root, 'releases');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const archive = resolve(output, `vibecity-vps-${stamp}.zip`);
try {
  mkdirSync(stage);
  cpSync(resolve(root, 'dist'), resolve(stage, 'dist'), { recursive: true });
  for (const file of ['package.json', 'package-lock.json']) cpSync(resolve(root, file), resolve(stage, file));
  // Include the server's local module graph, including shared rules and physics
  // under src. Never copy environment files, databases or the whole workspace.
  const visited = new Set();
  function include(file) {
    file = resolve(file);
    const path = relative(root, file);
    if (path.startsWith('..')) throw new Error(`Module nằm ngoài dự án: ${path}`);
    if (visited.has(file)) return;
    visited.add(file);
    const source = readFileSync(file, 'utf8');
    mkdirSync(dirname(resolve(stage, path)), { recursive: true });
    cpSync(file, resolve(stage, path));
    const imports = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)['"]([^'"]+)['"]/g;
    for (const match of source.matchAll(imports)) {
      if (match[1].startsWith('.')) include(resolve(dirname(file), match[1]));
    }
  }
  include(resolve(root, 'server/index.js'));
  writeFileSync(resolve(stage, '.env.example'), `MONGODB_URI=mongodb://127.0.0.1:27017\nMONGODB_DB=farm_online_3d\nMULTIPLAYER_PORT=8787\nGOOGLE_CLIENT_ID=\n`);
  writeFileSync(resolve(stage, 'DEPLOY.txt'), `Bản đã build cho https://${domain}\n\nGiải nén trên Ubuntu, đặt thư mục vibecity tại /var/www/farm-online-3d\nđể bên trong có dist/, server/, shared/, src/ và package.json.\n\nTrong thư mục đó chạy:\n  npm ci --omit=dev\n  cp -n .env.example .env\n  nano .env\n\nĐiền MongoDB URI và GOOGLE_CLIENT_ID (nếu dùng Google login).\nFrontend Google Client ID đã được nhúng khi build từ .env trên máy Mac.\nKhông đổi frontend domain/Google Client ID bằng .env trên VPS; cần build lại.\n\nKhởi động lần đầu (Node.js 24, PM2 đã cài):\n  pm2 start server/index.js --name vibecity --node-args="--env-file=.env"\n  pm2 save\n  pm2 startup\nChạy tiếp lệnh mà pm2 startup in ra. Chỉ chạy một instance.\n\nCập nhật bản đang chạy: giữ nguyên .env cũ, thay các file ứng dụng, chạy\n  npm ci --omit=dev\n  pm2 restart vibecity\n\nNginx phục vụ dist/ và proxy /ws về http://127.0.0.1:8787 với WebSocket Upgrade.\nCần cấu hình DNS và HTTPS riêng. Không mở công khai cổng 8787 hoặc 27017.\nKiểm tra backend: curl http://127.0.0.1:8787/health\n\nGói này không chứa database, .env thật, node_modules hoặc source để build lại.\n`);
  mkdirSync(output, { recursive: true });
  run('zip', ['-qr', archive, name], { cwd: temp });
  console.log(`\nĐã đóng gói ${visited.size} module backend cùng frontend.\nZIP: ${archive}\nKhông chứa .env thật, database hay node_modules.`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
