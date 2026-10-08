import assert from 'node:assert/strict';
import {getFishingConditions,fishingBiteBounds,fishingNibbleState} from '../shared/fishingConditions.js';
const before=Date.parse('2026-10-07T16:59:59.999Z'),after=before+1;
const today=getFishingConditions(before),tomorrow=getFishingConditions(after);
assert.equal(today.dayKey,'2026-10-07');assert.equal(tomorrow.dayKey,'2026-10-08');assert.equal(today.resetAt,after);
assert.deepEqual(getFishingConditions(Date.parse('2026-10-07T01:00:00Z')),today,'same daily profile across the whole Vietnam day');
const restarted=await import('../shared/fishingConditions.js?restart-test');assert.deepEqual(restarted.getFishingConditions(before),today,'restart does not reroll abundance');
const totals={};
for(let day=0;day<90;day++){
 const now=Date.parse('2026-10-01T03:00:00Z')+day*86400000,conditions=getFishingConditions(now),zones=Object.values(conditions.zones);
 assert.equal(zones.filter(z=>z.density==='high').length,1);assert.equal(zones.filter(z=>z.density==='low').length,1);assert.equal(zones.filter(z=>z.density==='normal').length,2);
 const high=zones.find(z=>z.density==='high'),low=zones.find(z=>z.density==='low'),normal=zones.find(z=>z.density==='normal');totals[high.id]=(totals[high.id]||0)+1;
 const a=fishingBiteBounds(high.id,null,'rod_bamboo',now),b=fishingBiteBounds(normal.id,null,'rod_bamboo',now),c=fishingBiteBounds(low.id,null,'rod_bamboo',now);
 assert.ok(a.maxMs<b.maxMs&&b.maxMs<c.maxMs,'density actually changes server wait bounds');
 for(const zone of zones){const bare=fishingBiteBounds(zone.id,null,'rod_bamboo',now),bait=fishingBiteBounds(zone.id,'fish_chum','rod_bamboo',now);assert.ok(bait.maxMs<bare.maxMs);assert.ok(bait.minMs>=1150,'bite follows cast animation');assert.ok(bait.maxMs>bait.minMs);}
}
for(const remaining of [20000,2500,2000,1200,0,-10])assert.equal(fishingNibbleState(remaining),false);
for(const remaining of [1700,1500,700,500])assert.equal(fishingNibbleState(remaining),true);
const ranges={high:[4000,8000],normal:[8000,15000],low:[15000,25000]};
for(const zone of Object.values(today.zones)){const bounds=fishingBiteBounds(zone.id,null,'rod_bamboo',before);const cast=950;const [min,max]=ranges[zone.density];assert.equal(bounds.minMs,cast+2000+min);assert.equal(bounds.maxMs,cast+2000+max);}
assert.equal(Object.keys(totals).length,4,'all regions can become the rich region');
assert.throws(()=>getFishingConditions(NaN));assert.throws(()=>fishingBiteBounds('fake',null,'rod_bamboo',after));
console.log('PASS daily fishing: Vietnam midnight, whole-day stability, restart consistency, distribution, server wait bounds and bait/animation limits.');
// Real transport dispatch, with a test socket and no network/account mutation.
const noop=()=>{};globalThis.window={location:{protocol:'http:',hostname:'localhost'},addEventListener:noop,removeEventListener:noop,clearTimeout:noop,clearInterval:noop};globalThis.document={addEventListener:noop,removeEventListener:noop};
class TestSocket{static OPEN=1;static CONNECTING=0;readyState=0;handlers={};addEventListener(type,fn){this.handlers[type]=fn;}close(){}send(){}receive(message){this.handlers.message({data:JSON.stringify(message)});}}
globalThis.WebSocket=TestSocket;
const {GameClient}=await import('../src/game/network/GameClient.js');const received=[],accounts=[];
const client=new GameClient({onFishingConditions:(data,time)=>received.push({data,time}),onAccountState:state=>accounts.push(state)});client.connect({playerId:'fixture'});
client.socket.receive({type:'account_state',progress:{},fishingConditions:today,serverNow:before});
client.socket.receive({type:'fishing_conditions',fishingConditions:tomorrow,serverNow:after});
assert.equal(accounts.length,1);assert.equal(received.length,2);assert.deepEqual(received[1],{data:tomorrow,time:after});client.disconnect();
console.log('PASS client: account snapshot and daily rollover both deliver server fishing conditions.');
