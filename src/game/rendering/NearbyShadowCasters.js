export function selectNearbyShadowCasters(meshes, position, radius = 90, maxCasters = 128) {
  if (!meshes || !position) return [];
  const result = [];
  const px = position.x;
  const py = position.y;
  const pz = position.z;
  const len = meshes.length || 0;

  for (let i = 0; i < len; i++) {
    const mesh = meshes[i];
    if (!mesh || mesh.isDisposed?.() || (mesh.isEnabled && !mesh.isEnabled()) || mesh.isVisible === false) continue;
    
    // Bỏ qua hoa, lá, khóm hoa nhỏ và sỏi đá (không cần tốn draw call tạo shadow map 3D)
    const name = mesh.name || '';
    if (name.startsWith('flw-') || name.startsWith('petal-') || name.includes('flower') || name.includes('grass') || name.includes('pebble')) continue;

    // Ưu tiên absolutePosition O(1), fallback getBoundingInfo cho test runner mock
    let cx = 0, cy = 0, cz = 0, reachExtra = 0;
    if (mesh.absolutePosition) {
      cx = mesh.absolutePosition.x;
      cy = mesh.absolutePosition.y;
      cz = mesh.absolutePosition.z;
    } else if (mesh.getBoundingInfo) {
      const bounds = mesh.getBoundingInfo().boundingSphere;
      cx = bounds.centerWorld.x;
      cy = bounds.centerWorld.y;
      cz = bounds.centerWorld.z;
      reachExtra = bounds.radiusWorld || 0;
    } else if (mesh.position) {
      cx = mesh.position.x;
      cy = mesh.position.y;
      cz = mesh.position.z;
    }

    const reach = radius + reachExtra;
    const dx = cx - px;
    const dz = cz - pz;
    const distanceSq = dx * dx + dz * dz;

    if (distanceSq <= reach * reach && Math.abs(cy - py) <= reach + 10) {
      result.push({ mesh, distanceSq });
    }
  }

  if (result.length > maxCasters) {
    result.sort((a, b) => a.distanceSq - b.distanceSq);
    result.length = maxCasters;
  }
  return result.map(item => item.mesh);
}

export function installNearbyShadows(shadows, getPosition, options = {}) {
  const map = shadows?.getShadowMap?.();
  if (!map) return () => 0;
  const radius = options.radius ?? 36;
  const maxCasters = options.maxCasters ?? 24;
  let lastAt = -Infinity;
  let lastX = -999999;
  let lastZ = -999999;
  let nearby = [];

  map.getCustomRenderList = (_face, meshes) => {
    const position = getPosition();
    if (!position) return [];
    const now = performance.now();
    const dx = position.x - lastX;
    const dz = position.z - lastZ;
    const distMovedSq = dx * dx + dz * dz;

    // Chỉ tính toán lại khi nhân vật di chuyển thực tế > 2.5m hoặc sau mỗi 1200ms
    if (distMovedSq > 6.25 || now - lastAt > 1200) {
      nearby = selectNearbyShadowCasters(meshes, position, radius, maxCasters);
      lastAt = now;
      lastX = position.x;
      lastZ = position.z;
    }
    return nearby;
  };
  return () => nearby.length;
}
