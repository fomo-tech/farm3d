// Farm lookup is spatial data only; never index Babylon meshes or asset graphs.
export class FarmStreamingGrid {
  constructor(farms, cellSize = 64) {
    this.cellSize = cellSize;
    this.cells = new Map();
    for (const farm of farms) {
      const key = `${Math.floor(farm.x / cellSize)}:${Math.floor(farm.z / cellSize)}`;
      if (!this.cells.has(key)) this.cells.set(key, []);
      this.cells.get(key).push(farm);
    }
  }

  select(position, chunks, ownerId = null, maxNeighbours = 6) {
    const radius = 112;
    const candidates = [];
    for (let x = Math.floor((position.x - radius) / this.cellSize); x <= Math.floor((position.x + radius) / this.cellSize); x++) {
      for (let z = Math.floor((position.z - radius) / this.cellSize); z <= Math.floor((position.z + radius) / this.cellSize); z++) {
        for (const farm of this.cells.get(`${x}:${z}`) || []) {
          if (farm.id === ownerId) continue;
          const distance = Math.hypot(farm.x - position.x, farm.z - position.z);
          const retained = chunks.get(farm.id)?.wantsDetail;
          if (distance <= (retained ? radius : 96)) candidates.push({ farm, distance });
        }
      }
    }
    candidates.sort((a, b) => a.distance - b.distance);
    const selected = new Set(candidates.slice(0, maxNeighbours).map(item => item.farm.id));
    if (ownerId) selected.add(ownerId);
    return selected;
  }
}
