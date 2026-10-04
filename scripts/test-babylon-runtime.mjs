import assert from 'node:assert/strict';
import { ThinEngine } from '@babylonjs/core/Engines/thinEngine.pure.js';
import { assertBabylonRuntime } from '../src/game/rendering/BabylonRuntime.js';

assertBabylonRuntime(ThinEngine.prototype);
assert.throws(() => assertBabylonRuntime({}), /createUniformBuffer.*createDynamicTexture/);
console.log('PASS: Babylon uniform buffers and dynamic texture extensions registered');
