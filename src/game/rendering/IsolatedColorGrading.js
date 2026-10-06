// Materials subscribe to the scene configuration. Changing it at runtime makes
// each material scan every scene mesh (O(materials * meshes)). Grade the final
// image with a separate configuration, not the configuration of world materials.
export function isolateColorGrading(scene, postProcess) {
  if (!postProcess) return null;
  const shared = scene.imageProcessingConfiguration;
  if (postProcess.imageProcessingConfiguration === shared) {
    postProcess.imageProcessingConfiguration = shared.clone();
  }
  return postProcess.imageProcessingConfiguration;
}

export function applyColorPreset(config, preset) {
  if (!config) return;
  const settings = {
    day: [1.04, 0.90], dawn: [1.03, 0.91], dusk: [1.06, 0.90], night: [1.04, 0.92],
  };
  const [contrast, exposure] = settings[preset] || settings.day;
  config.contrast = contrast;
  config.exposure = exposure;
}
