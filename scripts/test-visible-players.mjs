import assert from 'node:assert/strict';
import { selectVisiblePlayers } from '../src/game/network/visiblePlayers.js';
const players = Array.from({length:500}, (_,i)=>({playerId:`player_${i}`,x:i,z:0}));
assert.equal(selectVisiblePlayers(players,{x:0,z:0}).length,32);
assert.equal(selectVisiblePlayers(players,{x:499,z:0})[0].playerId,'player_499');
assert.equal(selectVisiblePlayers(players,{x:0,z:0},new Map([['player_2',{}]]))[0].playerId,'player_2');
assert.equal(players[0].playerId,'player_0','selection must not reorder network presence');
assert.equal(selectVisiblePlayers([{playerId:'bad',x:NaN,z:0}],{x:0,z:0}).length,0);
console.log('PASS: bounded nearby avatars, camera proximity, retention, invalid positions and complete network input.');
