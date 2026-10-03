import { FARM_ACTIVE_PLOTS, FARM_LOT_SPEC } from '../../shared/farmLayout.js';

export const FARM_CONFIG = Object.freeze({
  // Nông trại starter luôn có đúng 12 ô, bố cục 4 x 3.
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
