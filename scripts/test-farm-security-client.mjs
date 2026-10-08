import assert from 'node:assert/strict';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { FarmingSystem } from '../src/game/farming/FarmingSystem.js';
const system = Object.create(FarmingSystem.prototype);
const sent = [], notices = [];
Object.assign(system, { playerFarmId: 'farm_000002', tool: 'hand', pendingActions: new Set(), state: {},
  controls: { onNetworkAction: payload => sent.push(payload) }, notify: text => notices.push(text), gateStates: new Map() });
const tile = { metadata: { interactive: true, farmId: 'farm_000001', column: 0, row: 0 }, getAbsolutePosition: () => new Vector3(-48.15, 0, 107.2) };
system.state[system.key(tile)] = { crop: 'carrot', state: 'watered', wateredAt: Date.now() - 1801000, yield: 4 };
assert.equal(system.determineSmartTool(tile), 'harvest');
assert.equal(sent.length, 0, 'smart tool selection must have no side effects');
system.gateStates.set('farm_000001', { open: false });
system.applyTool(tile);
assert.equal(sent.length, 0, 'closed gate prevents client theft request');
system.gateStates.set('farm_000001', { open: true });
system.applyTool(tile);
assert.equal(sent.at(-1).action, 'steal_start');
assert.equal(sent.at(-1).farmId, 'farm_000001');
assert.equal(sent.at(-1).tileKey, '0:0');
for (const tool of ['hoe','seed','water','harvest']) {
  system.pendingActions.clear();
  system.tool=tool;
  const before=sent.length;
  system.applyTool(tile);
  assert.equal(sent.length,before+1, `${tool} must not block ripe neighbor crop theft`);
  assert.equal(sent.at(-1).action,'steal_start');
}
console.log('PASS: visitor smart-tool selection is pure, closed gate denied, ripe crop interaction starts server-authorized theft.');

const remote=Object.create(FarmingSystem.prototype);
Object.assign(remote,{playerFarmId:"mine",pendingActions:new Set(),state:{},tiles:[],notify:()=>{}});
remote.applyRemoteFarmAction({farmId:"neighbor",tileKey:"0:0",action:"steal",tileData:{state:"tilled",yield:0}});
assert.equal(remote.state["neighbor:0:0"].state,"tilled","stolen crop must stay harvested when its mesh is streamed out");
console.log("PASS stolen crop update persists harvested state for streaming");
