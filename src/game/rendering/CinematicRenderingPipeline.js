import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline.js';

/**
 * Crisp world rendering: MSAA and restrained sharpening without color-washing tone mapping.
 * FXAA and bloom stay disabled so distant thin geometry does not smear together.
 */
export function createCinematicRenderingPipeline(scene, camera, options = {}) {
  let pipeline = null;

  try {
    pipeline = new DefaultRenderingPipeline('cinematic-pipeline', true, scene, [camera]);
    
    const quality = options.quality || (options.lightweight ? 'balanced' : 'ultra');
    const isUltra = quality === 'ultra';
    const isEco = quality === 'eco';

    // 1. Khử răng cưa phần cứng siêu sắc nét (4x/2x Hardware MSAA)
    pipeline.samples = isEco ? 1 : (isUltra && !options.lightweight ? 4 : 2);
    pipeline.fxaaEnabled = false;

    // Contrast Adaptive Sharpening (CAS): Micro-contrast that makes leaves, textures, and edges pop.
    pipeline.sharpenEnabled = !isEco;
    if (pipeline.sharpen) {
      pipeline.sharpen.edgeAmount = isUltra ? 0.18 : 0.10;
      pipeline.sharpen.colorAmount = 1.0;
    }

    // Keep bloom disabled for clarity; retain tuned values if it is re-enabled later.
    pipeline.bloomEnabled = false;
    if (pipeline.bloom) {
      pipeline.bloomThreshold = 0.88;
      pipeline.bloomWeight = 0.08;
      pipeline.bloomKernel = 24;
      pipeline.bloomScale = 0.5;
    }

    // Preserve material color with vibrant contrast and clean daylight exposure.
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.toneMappingEnabled = false;
    pipeline.imageProcessing.contrast = 1.12;
    pipeline.imageProcessing.exposure = 0.98;
    pipeline.imageProcessing.vignetteEnabled = false;
  } catch (err) {
    console.warn('[CinematicPipeline] Fallback to direct scene processing:', err);
    if (scene.imageProcessingConfiguration) {
      scene.imageProcessingConfiguration.isEnabled = true;
      scene.imageProcessingConfiguration.toneMappingEnabled = false;
      scene.imageProcessingConfiguration.contrast = 1.12;
      scene.imageProcessingConfiguration.exposure = 0.98;
    }
  }

  return {
    pipeline,
    ssao: null,
    updateFocus: () => {},
    setQuality: (quality = 'ultra') => {
      if (!pipeline) return;
      if (quality === 'ultra') {
        pipeline.samples = options.lightweight ? 2 : 4;
        pipeline.fxaaEnabled = false;
        pipeline.sharpenEnabled = true;
        if (pipeline.sharpen) {
          pipeline.sharpen.edgeAmount = 0.18;
          pipeline.sharpen.colorAmount = 1.0;
        }
        pipeline.bloomEnabled = false;
      } else if (quality === 'balanced') {
        pipeline.samples = 2;
        pipeline.fxaaEnabled = false;
        pipeline.sharpenEnabled = true;
        if (pipeline.sharpen) {
          pipeline.sharpen.edgeAmount = 0.10;
          pipeline.sharpen.colorAmount = 1.0;
        }
        pipeline.bloomEnabled = false;
      } else if (quality === 'eco') {
        pipeline.samples = 1;
        pipeline.fxaaEnabled = false;
        pipeline.sharpenEnabled = false;
        pipeline.bloomEnabled = false;
      }
    },
    setCinematicPreset: (preset = 'day') => {
      const config = pipeline?.imageProcessing || scene.imageProcessingConfiguration;
      if (!config) return;
      if (preset === 'day') {
        config.contrast = 1.06;
        config.exposure = 0.94;
      } else if (preset === 'dawn') {
        config.contrast = 1.05;
        config.exposure = 0.92;
      } else if (preset === 'dusk') {
        config.contrast = 1.06;
        config.exposure = 0.92;
      } else if (preset === 'night') {
        config.contrast = 1.05;
        config.exposure = 0.88;
      }
    }
  };
}

