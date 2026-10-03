import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline.js';
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration.js';

/**
 * Crisp world rendering: 4x MSAA, Khronos PBR Neutral Tone Mapping (Cozy Farmy standard),
 * and Contrast Adaptive Sharpening (CAS).
 * Highlights roll off softly without burning out, preserving lush grass and pastel toy colors.
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
      pipeline.sharpen.edgeAmount = isUltra ? 0.22 : 0.12;
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

    // 2. Khronos PBR Neutral Tone Mapping (chuẩn Cozy Farmy): Giữ độ no màu rực rỡ, không bị cháy trắng
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL;
    pipeline.imageProcessing.contrast = 1.16;
    pipeline.imageProcessing.exposure = 1.05;
    pipeline.imageProcessing.vignetteEnabled = false;
  } catch (err) {
    console.warn('[CinematicPipeline] Fallback to direct scene processing:', err);
    if (scene.imageProcessingConfiguration) {
      scene.imageProcessingConfiguration.isEnabled = true;
      scene.imageProcessingConfiguration.toneMappingEnabled = true;
      scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL;
      scene.imageProcessingConfiguration.contrast = 1.16;
      scene.imageProcessingConfiguration.exposure = 1.05;
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
          pipeline.sharpen.edgeAmount = 0.22;
          pipeline.sharpen.colorAmount = 1.0;
        }
        pipeline.bloomEnabled = false;
      } else if (quality === 'balanced') {
        pipeline.samples = 2;
        pipeline.fxaaEnabled = false;
        pipeline.sharpenEnabled = true;
        if (pipeline.sharpen) {
          pipeline.sharpen.edgeAmount = 0.12;
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
      config.toneMappingEnabled = true;
      config.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL;
      if (preset === 'day') {
        config.contrast = 1.16;
        config.exposure = 1.05;
      } else if (preset === 'dawn') {
        config.contrast = 1.12;
        config.exposure = 1.02;
      } else if (preset === 'dusk') {
        config.contrast = 1.14;
        config.exposure = 1.02;
      } else if (preset === 'night') {
        config.contrast = 1.12;
        config.exposure = 0.95;
      }
    }
  };
}

