import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline.js';
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration.js';
import { isolateColorGrading, applyColorPreset } from './IsolatedColorGrading.js';

/**
 * Crisp world rendering: 4x MSAA, Khronos PBR Neutral Tone Mapping (Cozy Farmy standard),
 * and Contrast Adaptive Sharpening (CAS).
 * Highlights roll off softly without burning out, preserving lush grass and pastel toy colors.
 */
export function createCinematicRenderingPipeline(scene, camera, options = {}) {
  let pipeline = null;
  let currentPreset = 'day';
  let currentQuality = options.quality || (options.lightweight ? 'balanced' : 'ultra');
  let stableSamples = !!options.stableSamples;
  const engine = scene.getEngine();
  const supportedSamples = engine.webGLVersion >= 2 ? Math.max(1, engine.getCaps().maxMSAASamples || 1) : 1;
  const resolveSamples = quality => quality === 'eco' ? 1 : Math.min(options.lightweight ? 2 : 4, supportedSamples);

  try {
    pipeline = new DefaultRenderingPipeline('cinematic-pipeline', true, scene, [camera]);
    
    const quality = options.quality || (options.lightweight ? 'balanced' : 'ultra');
    const isUltra = quality === 'ultra';
    const isEco = quality === 'eco';

    // 1. Khử răng cưa phần cứng siêu sắc nét (4x Hardware MSAA trên desktop, 2x trên mobile)
    // MSAA khử răng cưa hình học trực tiếp ở rasterizer phần cứng, giữ nguyên 100% độ nét của texture & text
    pipeline.samples = resolveSamples(quality);

    // Tắt hoàn toàn FXAA khi có MSAA phần cứng để triệt tiêu hiện tượng mờ nhòe (FXAA làm mờ texture & viền)
    pipeline.fxaaEnabled = pipeline.samples < 2;

    // Contrast Adaptive Sharpening (CAS): Giữ độ sắc nét vi mô tinh tế, không tạo viền sáng/tối
    pipeline.sharpenEnabled = true;
    if (pipeline.sharpen) {
      pipeline.sharpen.edgeAmount = isEco ? 0.02 : (isUltra ? 0.08 : 0.05);
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

    // 2. Khronos PBR Neutral Tone Mapping (chuẩn Cozy Farmy): Giữ độ no màu rực rỡ, không bị cháy trắng hay bệt đen
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL;
    pipeline.imageProcessing.contrast = 1.01;
    pipeline.imageProcessing.exposure = 0.92;
    pipeline.imageProcessing.vignetteEnabled = false;
    isolateColorGrading(scene, pipeline.imageProcessing);
  } catch (err) {
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

      if (keepSamplesStable) {
        // Trong chế độ Auto (keepSamplesStable = true), giữ nguyên cấu hình pipeline (samples, fxaa, sharpen)
        // để tuyệt đối không trigger _buildPipeline(), chỉ tinh chỉnh thông số sharpen mà không giật khung hình
        if (pipeline.sharpen) {
          pipeline.sharpen.edgeAmount = isEco ? 0.02 : 0.05;
        }
      } else {
        const nextSamples = resolveSamples(quality);
        if (pipeline.samples !== nextSamples) pipeline.samples = nextSamples;

        if (quality === 'ultra') {
          pipeline.fxaaEnabled = nextSamples < 2;
          pipeline.sharpenEnabled = true;
          if (pipeline.sharpen) {
            pipeline.sharpen.edgeAmount = 0.08;
            pipeline.sharpen.colorAmount = 1.0;
          }
          pipeline.bloomEnabled = false;
        } else if (quality === 'balanced') {
          pipeline.fxaaEnabled = nextSamples < 2;
          pipeline.sharpenEnabled = true;
          if (pipeline.sharpen) {
            pipeline.sharpen.edgeAmount = 0.05;
            pipeline.sharpen.colorAmount = 1.0;
          }
          pipeline.bloomEnabled = false;
        } else if (quality === 'eco') {
          pipeline.fxaaEnabled = true;
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
