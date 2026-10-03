export function selectNearbyShadowCasters(meshes, position, radius = 90, maxCasters = 128) {
  const result = [];
  for (const mesh of meshes || []) {
    if (mesh.isDisposed() || !mesh.isEnabled() || !mesh.isVisible) continue;
    const bounds = mesh.getBoundingInfo().boundingSphere;
    const center = bounds.centerWorld;
    const reach = radius + bounds.radiusWorld;
    const distanceSq = (center.x - position.x) ** 2 + (center.z - position.z) ** 2;
    if (distanceSq <= reach ** 2 && Math.abs(center.y - position.y) <= reach) result.push({ mesh, distanceSq });
  }
  if (result.length > maxCasters) result.sort((a, b) => a.distanceSq - b.distanceSq).length = maxCasters;
  return result.map(item => item.mesh);
}

export function installNearbyShadows(shadows, getPosition) {
  const map = shadows.getShadowMap();
  if (!map) return;
  let lastAt = -Infinity;
  let nearby = [];
  map.getCustomRenderList = (_face, meshes) => {
    const position = getPosition();
    if (!position) return [];
    const now = performance.now();
    if (now - lastAt > 500) {
      nearby = selectNearbyShadowCasters(meshes, position);
      lastAt = now;
    }
    return nearby;
  };
  return () => nearby.length;
}
