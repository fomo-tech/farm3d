import { access, readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASSET_REGISTRY } from '../src/game/rendering/AssetRegistry.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = resolve(projectRoot, 'public');
const errors = [];
let totalBytes = 0;

function readGlbDocument(buffer) {
  if (buffer.length < 20 || buffer.readUInt32LE(0) !== 0x46546c67) throw new Error('GLB header không hợp lệ');
  const jsonLength = buffer.readUInt32LE(12);
  const jsonType = buffer.readUInt32LE(16);
  if (jsonType !== 0x4e4f534a) throw new Error('GLB thiếu JSON chunk');
  return JSON.parse(buffer.subarray(20, 20 + jsonLength).toString('utf8').replace(/\0+$/g, '').trim());
}

async function validateDependencies(asset, filePath, document) {
  const dependencies = [...(document.buffers || []), ...(document.images || [])]
    .map((item) => item.uri)
    .filter((uri) => uri && !uri.startsWith('data:'));
  for (const uri of dependencies) {
    try { await access(resolve(dirname(filePath), decodeURIComponent(uri))); }
    catch { errors.push(`${asset.id}: thiếu dependency ${uri}`); }
  }
}

for (const asset of Object.values(ASSET_REGISTRY)) {
  if (!asset.url.startsWith('/models/') || !/\.(glb|gltf)$/i.test(asset.url)) {
    errors.push(`${asset.id}: đường dẫn không hợp lệ (${asset.url})`);
    continue;
  }
  const filePath = resolve(publicRoot, asset.url.slice(1));
  if (!filePath.startsWith(publicRoot)) {
    errors.push(`${asset.id}: đường dẫn vượt ngoài public`);
    continue;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile() || info.size === 0) errors.push(`${asset.id}: file rỗng hoặc không phải file`);
    totalBytes += info.size;
    const content = await readFile(filePath);
    const document = asset.url.endsWith('.gltf')
      ? JSON.parse(content.toString('utf8'))
      : readGlbDocument(content);
    await validateDependencies(asset, filePath, document);
  } catch (error) {
    errors.push(`${asset.id}: không tìm thấy ${asset.url} (${error.code || error.message})`);
  }
}

if (errors.length) {
  console.error(`Asset validation thất bại (${errors.length} lỗi):\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  const sizeMb = (totalBytes / 1024 / 1024).toFixed(1);
  console.log(`Asset validation OK: ${Object.keys(ASSET_REGISTRY).length} model, ${sizeMb} MB.`);
}
