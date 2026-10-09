import assert from 'node:assert/strict';
// Polyfill minimal OffscreenCanvas for Babylon under Node.js NullEngine
if (typeof globalThis.OffscreenCanvas === 'undefined') {
  globalThis.OffscreenCanvas = class OffscreenCanvas {
    constructor(width, height) {
      this.width = width || 1024;
      this.height = height || 1024;
    }
    getContext() {
      const gradMock = { addColorStop() {} };
      return new Proxy({}, {
        get(target, prop) {
          if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return () => gradMock;
          if (prop === 'measureText') return () => ({ width: 100 });
          if (typeof target[prop] === 'function') return target[prop];
          return () => {};
        },
        set(target, prop, val) { target[prop] = val; return true; },
      });
    }
  };
}

import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Ray } from '@babylonjs/core/Culling/ray.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Scene } from '@babylonjs/core/scene.js';
import { CasinoTableView } from '../src/game/casino/CasinoTableView.js';
const engine=new NullEngine(),scene=new Scene(engine);
const view=new CasinoTableView(scene);
view.update({game:'bai-cao',stake:10,round:{id:'test',phase:'dealing',hand:[0,1,2],bets:{}}});
view.cards.forEach(c=>c.position.set(0,1.38,0)); // final animation frame before playing
view.update({game:'bai-cao',stake:10,round:{id:'test',phase:'playing',hand:[0,1,2],bets:{}}});
assert.equal(view.cards.filter(c=>c.isEnabled(false)).length,6,'player and hidden banker each have three cards');
assert.ok(view.cards.slice(3,6).every(c=>c.position.z<0));
view.update({game:'bai-cao',stake:10,round:{id:'test',phase:'result',hand:[0,1,2],bets:{},result:{banker:[3,4,5]}}});
assert.equal(view.cards.filter(c=>c.isEnabled(false)).length,6);
assert.deepEqual(view.cards.slice(3,6).map(c=>c.metadata.cardId),[3,4,5],'banker reveals even when player hand stays unchanged');
assert.ok(view.cards.slice(0,3).every(c=>c.position.z>0),'player row is restored after dealing');
assert.ok(view.cards.slice(3,6).every(c=>c.position.z<0),'banker occupies separate row');
assert.ok(view.cards[1].position.x-view.cards[0].position.x>.28*1.65,'cards do not overlap');
view.update({game:'bau-cua',stake:10,round:{id:'symbols',phase:'betting',bets:{cua:50}}});
assert.equal(view.symbolTiles.filter(({tile})=>tile.isEnabled(false)).length,6);
assert.ok(view.symbolTiles.every(({tile,choice})=>tile.isPickable&&tile.metadata.casinoChoice===choice));
view.root.setEnabled(true);
for(const {tile,choice} of view.symbolTiles){
 tile.computeWorldMatrix(true);
 const origin=tile.getAbsolutePosition().add(new Vector3(0,5,0));
 const hit=scene.pickWithRay(new Ray(origin,new Vector3(0,-1,0)),mesh=>mesh.isPickable);
 assert.equal(hit?.pickedMesh?.metadata?.casinoChoice,choice,'ray reaches every symbol on the table');
}
assert.equal(new Set(view.symbolTiles.map(({tile})=>`${tile.position.x}:${tile.position.z}`)).size,6);
view.update({game:'bau-cua',stake:10,round:{id:'symbols',phase:'result',bets:{cua:50},result:{symbols:['cua','cua','ca']}}});
assert.equal(view.symbolTiles.find(t=>t.choice==='cua').tile.metadata.winningCount,2);
assert.equal(view.symbolTiles.find(t=>t.choice==='nai').tile.metadata.winningCount,0);
assert.equal(view.symbolTiles.find(t=>t.choice==='cua').tile.metadata.betAmount,50);
view.update({game:'bai-cao',stake:10,round:null});
assert.ok(view.symbolTiles.every(({tile})=>!tile.isEnabled(false)),'symbol tiles disappear when switching games');
scene.dispose();engine.dispose();console.log('PASS: 3D table constructs and updates player/banker hands without runtime errors.');
