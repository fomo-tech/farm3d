import assert from 'node:assert/strict';
import { AutoGraphicsController } from '../src/game/rendering/GraphicsSettings.js';

const budget = new AutoGraphicsController(false);
for (let i = 0; i < 240; i++) budget.sample(37);
assert.equal(budget.level, 1, 'sustained 27 FPS reduces desktop Ultra effects');
assert.equal(budget.scale, 1, 'the first pressure response keeps native resolution');
for (let i = 0; i < 600; i++) budget.sample(16);
assert.equal(budget.level, 0, 'effects recover after sustained fast frames');
console.log('PASS: desktop Ultra pressure and recovery preserve native pixels first.');
