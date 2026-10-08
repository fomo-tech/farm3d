import assert from 'node:assert/strict';
import {createRuntimeId} from '../src/game/runtime/BrowserRuntime.js';
for(const cryptoApi of [null,{}, {getRandomValues:bytes=>bytes.fill(7)}, {randomUUID:()=>{throw new Error('Insecure origin');}}]){
 const id=createRuntimeId('notice',cryptoApi);assert.match(id,/^notice_[a-z0-9]+$/);assert.ok(id.length>10);
}
assert.equal(createRuntimeId('notice',{randomUUID:()=> '12345678-1234-1234-1234-123456789012'}),'notice_123456781234123412341234');
assert.equal(new Set(Array.from({length:1000},()=>createRuntimeId('notice',null))).size,1000);
console.log('PASS runtime ID: UUID, getRandomValues, missing crypto, rejected insecure calls and fallback uniqueness.');
