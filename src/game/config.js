import { FARM_ACTIVE_PLOTS, FARM_LOT_SPEC } from '../../shared/farmLayout.js';

export const FARM_CONFIG = Object.freeze({
  // Physical capacity; individual unlocked tiles live in account progress.
  plotColumns: FARM_LOT_SPEC.columns,
  plotRows: FARM_LOT_SPEC.rows,
  tileSize: FARM_LOT_SPEC.tileSize,
  tileSpacingX: FARM_LOT_SPEC.tileSpacingX || 2.1,
  tileSpacingZ: FARM_LOT_SPEC.tileSpacingZ || 1.8,
  anchors: FARM_LOT_SPEC.anchors,
  activePlots: FARM_ACTIVE_PLOTS,
  layoutVersion: FARM_LOT_SPEC.version,
  estateWidth: FARM_LOT_SPEC.estateWidth,
  estateDepth: FARM_LOT_SPEC.estateDepth,
  playerSpeed: 7,
  worldSize: 4200,
  // Cờ chặn không hiển thị tài nguyên/vật thể trên lòng đường giao thông
  blockRoadResources: true,
});
