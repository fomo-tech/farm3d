import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline.js';
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration.js';
import { isolateColorGrading, applyColorPreset } from './IsolatedColorGrading.js';

/**
 * Crisp world rendering: 4x MSAA, Khronos PBR Neutral Tone Mapping (Cozy Farmy standard),
 * without an edge-enhancement pass that amplifies stair-stepping.
 * Highlights roll off softly without burning out, preserving lush grass and pastel toy colors.
 */
export function resolveAntialiasSamples(quality, supportedSamples = 1) {
  return Math.min(quality === 'ultra' ? 4 : quality === 'eco' ? 1 : 2, Math.max(1, supportedSamples));
}

export function createCinematicRenderingPipeline(scene, camera, options = {}) {
  let pipeline = null;
  let currentPreset = 'day';
  let currentQuality = options.quality || (options.lightweight ? 'balanced' : 'ultra');
  let stableSamples = !!options.stableSamples;
  const engine = scene.getEngine();
  const supportedSamples = engine.webGLVersion >= 2 ? Math.max(1, engine.getCaps().maxMSAASamples || 1) : 1;
  const resolveSamples = quality => options.lightweight ? 1 : resolveAntialiasSamples(quality, supportedSamples);

  // Mobile grades each material directly. A full-screen postprocess allocates
  // an additional color/depth target at Retina resolution even with MSAA off.
  if (options.lightweight) {
    const config = scene.imageProcessingConfiguration;
    config.applyByPostProcess = false;
    config.isEnabled = true;
    config.toneMappingEnabled = true;
    config.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL;
    applyColorPreset(config, 'day');
    return { pipeline: null, ssao: null, updateFocus: () => {}, setQuality: () => {},
      // Avoid dirtying every world material during the mobile day/night loop.
      setCinematicPreset: () => {} };
  }

  try {
    pipeline = new DefaultRenderingPipeline('cinematic-pipeline', !options.lightweight, scene, [camera]);
    
    const quality = options.quality || (options.lightweight ? 'balanced' : 'ultra');

    // Desktop uses hardware AA. Mobile keeps single-sample LDR targets to
    // reserve GPU memory for world geometry rather than HDR/MSAA buffers.
    pipeline.samples = resolveSamples(quality);

    // Tắt hoàn toàn FXAA khi có MSAA phần cứng để triệt tiêu hiện tượng mờ nhòe (FXAA làm mờ texture & viền)
    pipeline.fxaaEnabled = !options.lightweight && pipeline.samples < 2;

    // Babylon's sharpen is an edge filter, not CAS. Native pixels and MSAA
    // provide clarity without enhancing aliasing or adding a full-screen pass.
    pipeline.sharpenEnabled = false;

    // Keep bloom disabled for clarity; retain tuned values if it is re-enabled later.
    pipeline.bloomEnabled = false;
    if (pipeline.bloom) {
      pipeline.bloomThreshold = 0.88;
      pipeline.bloomWeight = 0.08;
      pipeline.bloomKernel = 24;
      pipeline.bloomScale = 0.5;
    }

    // 2. Khronos PBR Neutral Tone Mapping (chuẩn Cozy Farmy): Giữ độ no màu rực rỡ, không bị cháy trắng hay bệt đen
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL;
    pipeline.imageProcessing.contrast = 1.01;
    pipeline.imageProcessing.exposure = 0.92;
    pipeline.imageProcessing.vignetteEnabled = false;
    isolateColorGrading(scene, pipeline.imageProcessing);
  } catch (err) {
    pipeline?.dispose();
    pipeline = null;
    console.warn('[CinematicPipeline] Fallback to direct scene processing:', err);
    if (scene.imageProcessingConfiguration) {
      scene.imageProcessingConfiguration.isEnabled = true;
      scene.imageProcessingConfiguration.toneMappingEnabled = true;
      scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL;
      scene.imageProcessingConfiguration.contrast = 1.01;
      scene.imageProcessingConfiguration.exposure = 0.92;
    }
  }

  return {
    pipeline,
    ssao: null,
    updateFocus: () => {},
    setQuality: (quality = 'ultra', keepSamplesStable = false) => {
      // Auto also calls this when only resolution changes. Rebuilding an unchanged
      // pipeline dirties shaders and can expose the clear color during compilation.
      if (!pipeline || (quality === currentQuality && stableSamples === keepSamplesStable)) return;
      currentQuality = quality;
      stableSamples = keepSamplesStable;
      const isEco = quality === 'eco';

      if (!keepSamplesStable) {
        const nextSamples = resolveSamples(quality);
        if (pipeline.samples !== nextSamples) pipeline.samples = nextSamples;

        if (quality === 'ultra') {
          pipeline.fxaaEnabled = !options.lightweight && nextSamples < 2;
          pipeline.sharpenEnabled = false;
          pipeline.bloomEnabled = false;
        } else if (quality === 'balanced') {
          pipeline.fxaaEnabled = !options.lightweight && nextSamples < 2;
          pipeline.sharpenEnabled = false;
          pipeline.bloomEnabled = false;
        } else if (quality === 'eco') {
          pipeline.fxaaEnabled = !options.lightweight;
          pipeline.sharpenEnabled = false;
          pipeline.bloomEnabled = false;
        }
      }
      // Quality changes recreate the postprocess: detach its shared config again.
      applyColorPreset(isolateColorGrading(scene, pipeline.imageProcessing), currentPreset);
    },
    setCinematicPreset: (preset = 'day') => {
      currentPreset = preset;
      // Direct-render fallback keeps its initial grading; lights/sky still cycle.
      // Never broadcast periodic grading changes to all world materials.
      applyColorPreset(isolateColorGrading(scene, pipeline?.imageProcessing), preset);
    }
  };
}
