import { SceneInstrumentation } from '@babylonjs/core/Instrumentation/sceneInstrumentation.js';
// Opt-in local profiler. No telemetry, network writes or production-frame overhead.
export function installRenderProfile(world) {
  const scene = world.scene;
  const stats = new SceneInstrumentation(scene);
  stats.captureActiveMeshesEvaluationTime = true;
  stats.captureRenderTime = true;
  stats.captureFrameTime = true;
  stats.captureRenderTargetsRenderTime = true;
  const panel = document.createElement('pre');
  panel.id = 'render-profile';
  panel.style.cssText = 'position:fixed;right:8px;bottom:8px;padding:10px;background:#102030ee;color:white;font:12px monospace;max-height:70vh;overflow:auto;pointer-events:none';
  document.body.append(panel);
  const timer = setInterval(() => {
    const debug = world.getDebugState();
    const candidates = scene.getActiveMeshCandidates();
    const groups = meshes => {
      const counts = {};
      for (const mesh of meshes) {
        const key = mesh.name.replace(/[0-9]+/g, '#').split('-').slice(0, 3).join('-');
        counts[key] = (counts[key] || 0) + 1;
      }
      return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,12);
    };
    panel.textContent = JSON.stringify({
      fps: debug.fps, mobile: world.isMobile, boot: world.bootTimings,
      renderSize: [debug.renderWidth, debug.renderHeight],
      meshTotal: debug.meshes, active: debug.activeMeshes, candidates: candidates.length,
      dynamic: debug.dynamicCandidates, indexed: debug.indexedMeshes,
      drawCalls: stats.drawCallsCounter.current,
      frameMs: +stats.frameTimeCounter.average.toFixed(2),
      evaluateMs: +stats.activeMeshesEvaluationTimeCounter.average.toFixed(2),
      renderMs: +stats.renderTimeCounter.average.toFixed(2),
      targetsMs: +stats.renderTargetsRenderTimeCounter.average.toFixed(2),
      quality: debug.autoGraphics,
      dynamicGroups: groups(scene.selectionOctree?.dynamicContent || []),
      activeGroups: groups(scene.getActiveMeshes().data.slice(0, scene.getActiveMeshes().length)),
    }, null, 2);
  }, 1000);
  scene.onDisposeObservable.addOnce(() => { clearInterval(timer); stats.dispose(); panel.remove(); });
}
