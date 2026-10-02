import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline.js';
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration.js';
import { Color4 } from '@babylonjs/core/Maths/math.color.js';

/**
 * Khởi tạo Pipeline Đồ Họa Điện Ảnh AAA Chuẩn Game Thương Mại:
 * 1. Hardware 4x MSAA + FXAA: Khử răng cưa phần cứng sắc bén, xóa bỏ hoàn toàn hiện tượng vỡ hạt/pixel
 * 2. Adaptive Edge Sharpening: Bộ lọc làm sắc nét viền 3D, chi tiết vật thể nổi khối rõ ràng
 * 3. ACES Tone Mapping & Vibrant Color Grading: Cân bằng tương phản, màu sắc trong trẻo chuẩn Studio Ghibli
 * 4. Soft Dreamy Bloom: Ánh sáng lung linh cổ tích
 */
export function createCinematicRenderingPipeline(scene, camera, options = {}) {
  let pipeline = null;

  try {
    pipeline = new DefaultRenderingPipeline('cinematic-pipeline', true, scene, [camera]);
    
    // 1. Khử răng cưa phần cứng siêu sắc nét (4x MSAA + FXAA)
    pipeline.samples = options.lightweight ? 1 : 4;
    pipeline.fxaaEnabled = true;

    // 2. Làm nét các chi tiết 3D (Sharpening filter) - Khắc phục triệt để hiện tượng mờ nhòe / pixel
    pipeline.sharpenEnabled = !options.lightweight;
    pipeline.sharpen.edgeAmount = 0.25;
    pipeline.sharpen.colorAmount = 1.0;

    // 3. Bloom nhẹ nhàng thơ mộng kiểu Studio Ghibli
    pipeline.bloomEnabled = !options.lightweight;
    pipeline.bloomThreshold = 0.88;
    pipeline.bloomWeight = 0.16;
    pipeline.bloomKernel = 32;
    pipeline.bloomScale = 0.5;

    // 4. Tone Mapping ACES Điện Ảnh
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
    pipeline.imageProcessing.contrast = 1.08;
    pipeline.imageProcessing.exposure = 1.08;
    pipeline.imageProcessing.vignetteEnabled = false;
  } catch (err) {
    console.warn('[CinematicPipeline] Fallback to direct scene processing:', err);
    if (scene.imageProcessingConfiguration) {
      scene.imageProcessingConfiguration.isEnabled = true;
      scene.imageProcessingConfiguration.toneMappingEnabled = true;
      scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
      scene.imageProcessingConfiguration.contrast = 1.08;
      scene.imageProcessingConfiguration.exposure = 1.08;
    }
  }

  return {
    pipeline,
    ssao: null,
    updateFocus: () => {},
    setCinematicPreset: (preset = 'vibrant') => {
      const config = pipeline?.imageProcessing || scene.imageProcessingConfiguration;
      if (!config) return;
      if (preset === 'vibrant') {
        config.contrast = 1.08;
        config.exposure = 1.08;
      } else if (preset === 'dusk') {
        config.contrast = 1.12;
        config.exposure = 1.02;
      } else if (preset === 'night') {
        config.contrast = 1.05;
        config.exposure = 1.15;
      }
    }
  };
}
