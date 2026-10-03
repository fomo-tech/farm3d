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
    
    const quality = options.quality || (options.lightweight ? 'balanced' : 'ultra');
    const isUltra = quality === 'ultra';
    const isEco = quality === 'eco';

    // 1. Khử răng cưa phần cứng siêu sắc nét (4x Hardware MSAA)
    // Tắt FXAA khi có 4x MSAA để loại bỏ hoàn toàn hiện tượng mờ nhòe (vaseline blur)
    pipeline.samples = isEco ? 1 : 4;
    pipeline.fxaaEnabled = isEco ? false : false;

    // 2. Bộ lọc làm sắc nét viền 3D (Contrast-Adaptive Edge Sharpening) - Xóa bỏ triệt để mờ nhòe pixel
    pipeline.sharpenEnabled = !isEco;
    if (pipeline.sharpen) {
      pipeline.sharpen.edgeAmount = isUltra ? 0.35 : 0.22;
      pipeline.sharpen.colorAmount = 1.0;
    }

    // 3. Bloom dịu nhẹ cổ tích cho đèn LED Neon & Phản chiếu pha lê Studio Ghibli
    pipeline.bloomEnabled = isUltra;
    if (pipeline.bloom) {
      pipeline.bloomThreshold = 0.82;
      pipeline.bloomWeight = 0.20;
      pipeline.bloomKernel = 40;
      pipeline.bloomScale = 0.5;
    }

    // 4. Tone Mapping ACES Điện Ảnh Chuẩn Studio Ghibli (Chống Cháy Nắng, Đậm Đà Chi Tiết)
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
    pipeline.imageProcessing.contrast = 1.16;  // Tương phản điện ảnh sâu lắng, tách bạch nắng và râm
    pipeline.imageProcessing.exposure = 0.94;  // Hạ từ 1.10 xuống 0.94 - Giữ trọn dải màu, xóa bỏ lóa trắng
    pipeline.imageProcessing.vignetteEnabled = true;
    pipeline.imageProcessing.vignetteWeight = 0.15;
    pipeline.imageProcessing.vignetteColor = new Color4(0.02, 0.06, 0.10, 0);
  } catch (err) {
    console.warn('[CinematicPipeline] Fallback to direct scene processing:', err);
    if (scene.imageProcessingConfiguration) {
      scene.imageProcessingConfiguration.isEnabled = true;
      scene.imageProcessingConfiguration.toneMappingEnabled = true;
      scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
      scene.imageProcessingConfiguration.contrast = 1.16;
      scene.imageProcessingConfiguration.exposure = 0.94;
    }
  }

  return {
    pipeline,
    ssao: null,
    updateFocus: () => {},
    setQuality: (quality = 'ultra') => {
      if (!pipeline) return;
      if (quality === 'ultra') {
        pipeline.samples = 4;
        pipeline.fxaaEnabled = false;
        pipeline.sharpenEnabled = true;
        if (pipeline.sharpen) {
          pipeline.sharpen.edgeAmount = 0.35;
          pipeline.sharpen.colorAmount = 1.0;
        }
        pipeline.bloomEnabled = true;
      } else if (quality === 'balanced') {
        pipeline.samples = 2;
        pipeline.fxaaEnabled = false;
        pipeline.sharpenEnabled = true;
        if (pipeline.sharpen) {
          pipeline.sharpen.edgeAmount = 0.22;
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
        config.contrast = 1.16;
        config.exposure = 0.94;
      } else if (preset === 'dawn') {
        config.contrast = 1.14;
        config.exposure = 0.95;
      } else if (preset === 'dusk') {
        config.contrast = 1.18;
        config.exposure = 0.92;
      } else if (preset === 'night') {
        config.contrast = 1.12;
        config.exposure = 0.98;
      }
    }
  };
}

