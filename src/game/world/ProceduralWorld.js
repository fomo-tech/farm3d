import { chunkAt, villageForChunk } from './WorldPartition.js';
import { zoneAtPosition } from './worldLayout.js';

export class ProceduralWorld {
  constructor(scene, shadows) {
    this.scene = scene;
    this.shadows = shadows;
    this.lastCenter = '';
  }

  update(position) {
    const center = chunkAt(position.x, position.z);
    const centerKey = `${center.x}:${center.z}`;
    if (centerKey === this.lastCenter) return null;
    this.lastCenter = centerKey;
    const zone = zoneAtPosition(position.x, position.z);
    return {
      chunk: center,
      region: zone.key,
      zone,
      village: zone.key === 'countryside' && zone.order != null ? { id: zone.id, name: zone.name } : null,
    };
  }

  dispose() {
    this.lastCenter = '';
  }
}
