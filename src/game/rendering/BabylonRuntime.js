import { RegisterEngineUniformBuffer } from '@babylonjs/core/Engines/Extensions/engine.uniformBuffer.pure.js';
import { RegisterEnginesExtensionsEngineDynamicTexture } from '@babylonjs/core/Engines/Extensions/engine.dynamicTexture.pure.js';

// Explicit registration is required by Babylon's modular runtime.
RegisterEngineUniformBuffer();
RegisterEnginesExtensionsEngineDynamicTexture();

export function assertBabylonRuntime(engine) {
  const missing = ['createUniformBuffer', 'createDynamicTexture', 'updateDynamicTexture']
    .filter(name => typeof engine?.[name] !== 'function');
  if (missing.length) throw new Error(`Babylon runtime thiếu extension: ${missing.join(', ')}. Hãy khởi động lại dev server và tải lại trang.`);
}
