import assert from 'node:assert/strict';
import {contextHudIcon} from '../src/components/icons3d/contextHudIcon.js';
assert.deepEqual(contextHudIcon({iconAsset:'ticket',label:'Thần Tài'}),{asset:'coin',mobileAsset:'ticket'});
assert.equal(contextHudIcon({label:'Câu cá · Hồ Pha Lê'}).mobileAsset,'fishing');
assert.equal(contextHudIcon({label:'Chọn đất nông trại'}).mobileAsset,'land');
assert.equal(contextHudIcon({label:'Xem lô đất 12'}).mobileAsset,'land');
assert.equal(contextHudIcon({label:'Mở cổng'}).mobileAsset,'gate');
assert.equal(contextHudIcon({label:'Xem tất cả'}).mobileAsset,'hand','generic text must not select fish');
assert.equal(contextHudIcon({iconAsset:'chat',label:'Câu cá'}).mobileAsset,'chat','explicit action wins');
console.log('PASS: explicit action icons and distinct land, fishing, ticket, gate meanings');
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const names=['backpack','wardrobe','camera','phone','quest','coin','gem','chat','bike','sprint','jump','land','fishing','gate','ticket','hand'];
const hashes = new Set();
for(const name of names) {
 const bytes=readFileSync(new URL(`../public/assets/hud/mobile-v1/${name}.webp`,import.meta.url));
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 assert.ok(bytes.length<30000, `${name} must remain lightweight for mobile`);
 hashes.add(createHash('sha256').update(bytes).digest('hex'));
}
assert.equal(hashes.size,names.length,'each mobile function has its own image');
console.log('PASS: 16 distinct lightweight mobile WebP assets');
