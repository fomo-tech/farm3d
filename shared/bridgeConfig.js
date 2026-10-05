/**
 * shared/bridgeConfig.js
 * Single Source of Truth for all bridges across the Farm3D universe.
 * 
 * Provides:
 * - Geometric and metadata definitions for all highway, pedestrian timber, and rustic stone bridges.
 * - Ultra-fast O(1) mathematical surface elevation sampling for TerrainHeightSystem.
 * - Bridge detection and safety zone bounds.
 */

export const BRIDGE_TYPES = Object.freeze({
  HIGHWAY: 'highway',
  PEDESTRIAN_TIMBER: 'pedestrian-timber',
  PEDESTRIAN_STONE: 'pedestrian-stone',
});

export const ALL_BRIDGES = Object.freeze([
  {
    id: 'bridge-highway-234',
    name: 'Cầu Bắc Tân Lộc',
    subtitle: 'Quốc Lộ Tuyến Bắc (-234)',
    type: BRIDGE_TYPES.HIGHWAY,
    cx: 205,
    cz: -234,
    spanX: 28, // Chiều dài bắc qua sông (Tây -> Đông)
    widthZ: 9.6, // Bề rộng lòng đường 2 làn xe + 2 vỉa hè
    deckY: 0.10, // Cao độ sàn ở mố cầu
    archPeakY: 0.26, // Đỉnh vòm nhẹ giữa nhịp cầu (+0.16m)
    rampLen: 3.5, // Chiều dài đoạn dốc tiếp đất ở 2 mố
    deckColor: '#334155', // Nhựa đường cao cấp
    stoneColor: '#e2e8f0', // Đá hoa cương trắng ngọc
    accentColor: '#f59e0b', // Vạch kẻ đường vàng kép
    hasLanterns: true,
    lanternCount: 4,
    pierCount: 2,
  },
  {
    id: 'bridge-highway-86',
    name: 'Đại Cầu Bình Minh',
    subtitle: 'Đại Lộ Ven Sông (QL 86)',
    type: BRIDGE_TYPES.HIGHWAY,
    cx: 212,
    cz: 86,
    spanX: 28,
    widthZ: 9.8,
    deckY: 0.10,
    archPeakY: 0.28,
    rampLen: 3.5,
    deckColor: '#334155',
    stoneColor: '#f1f5f9',
    accentColor: '#f59e0b',
    hasLanterns: true,
    lanternCount: 4,
    pierCount: 2,
  },
  {
    id: 'bridge-vensong-pedestrian',
    name: 'Cầu Vòm Gỗ Ven Sông',
    subtitle: 'Đường Tản Bộ Bờ Đông',
    type: BRIDGE_TYPES.PEDESTRIAN_TIMBER,
    cx: 214,
    cz: 210,
    spanX: 22,
    widthZ: 4.8,
    deckY: 0.22,
    archPeakY: 0.85, // Nhịp vòm gỗ uốn cong lãng mạn cao +0.63m
    rampLen: 2.8,
    woodColor: '#854d0e', // Gỗ sồi đậm
    railColor: '#a16207', // Tay vịn sồi ấm
    accentColor: '#fef08a', // Ánh sáng đèn lồng đom đóm
    hasLanterns: true,
    lanternCount: 4,
    pierCount: 2,
  },
  {
    id: 'bridge-highway-406',
    name: 'Cầu Nam Hướng Dương',
    subtitle: 'Đường Ven Biển (Tuyến 406)',
    type: BRIDGE_TYPES.HIGHWAY,
    cx: 218,
    cz: 310,
    spanX: 28,
    widthZ: 9.6,
    deckY: 0.10,
    archPeakY: 0.26,
    rampLen: 3.5,
    deckColor: '#334155',
    stoneColor: '#e2e8f0',
    accentColor: '#f59e0b',
    hasLanterns: true,
    lanternCount: 4,
    pierCount: 2,
  },
  {
    id: 'bridge-valley-wood',
    name: 'Cầu Thung Lũng Lá Vàng',
    subtitle: 'Suối Đá Cuội Tự Nhiên',
    type: BRIDGE_TYPES.PEDESTRIAN_TIMBER,
    cx: 150,
    cz: 180,
    spanX: 11,
    widthZ: 3.8,
    deckY: 0.10,
    archPeakY: 0.42,
    rampLen: 2.0,
    woodColor: '#78350f',
    railColor: '#92400e',
    accentColor: '#fbbf24',
    hasLanterns: true,
    lanternCount: 2,
    pierCount: 0,
  },
]);

/**
 * Tra cứu thông tin cây cầu tại tọa độ (x, z).
 * @param {number} x 
 * @param {number} z 
 * @param {number} margin Lề an toàn xung quanh cầu
 * @returns {object|null}
 */
export function getBridgeAt(x, z, margin = 0.5) {
  for (let i = 0; i < ALL_BRIDGES.length; i++) {
    const b = ALL_BRIDGES[i];
    const halfSpan = b.spanX / 2 + b.rampLen + margin;
    const halfWidth = b.widthZ / 2 + margin;
    if (Math.abs(x - b.cx) <= halfSpan && Math.abs(z - b.cz) <= halfWidth) {
      return b;
    }
  }
  return null;
}

/**
 * Tính toán cao độ bề mặt cầu Y tức thời theo công thức Parabol O(1).
 * Đảm bảo avatar và phương tiện giao thông lướt mượt mà qua cầu không giật lag.
 * @param {number} x 
 * @param {number} z 
 * @param {number} groundY Cao độ mặt đất tiếp giáp (mặc định 0.08m mặt đường)
 * @returns {number|null} Cao độ Y trên mặt cầu, hoặc null nếu nằm ngoài cầu
 */
export function getBridgeSurfaceHeight(x, z, groundY = 0.08) {
  for (let i = 0; i < ALL_BRIDGES.length; i++) {
    const b = ALL_BRIDGES[i];
    const halfSpan = b.spanX / 2;
    const halfWidth = b.widthZ / 2;
    const dx = Math.abs(x - b.cx);
    const dz = Math.abs(z - b.cz);

    // Kiểm tra phạm vi bề ngang cầu
    if (dz > halfWidth) continue;

    // 1. Nằm trong nhịp chính của cầu (Span)
    if (dx <= halfSpan) {
      // Chuẩn hóa vị trí t từ 0 (mép Tây) đến 1 (mép Đông)
      const t = (x - (b.cx - halfSpan)) / b.spanX;
      // Đường cong vòm Parabol đỉnh giữa: 4 * t * (1 - t) có giá trị = 1 tại t=0.5, = 0 tại t=0 và t=1
      const archFactor = 4.0 * t * (1.0 - t);
      const elevation = b.deckY + (b.archPeakY - b.deckY) * archFactor;
      return elevation;
    }

    // 2. Nằm trong đoạn dốc mố cầu tiếp đất (Ramp Approach)
    if (dx <= halfSpan + b.rampLen) {
      const distFromSpan = dx - halfSpan;
      const rampProgress = distFromSpan / b.rampLen; // 0 tại mép cầu -> 1 tại chân dốc tiếp đất
      // Nội suy Hermite mượt mà giữa b.deckY và groundY
      const smoothFactor = rampProgress * rampProgress * (3 - 2 * rampProgress);
      return b.deckY + (groundY - b.deckY) * smoothFactor;
    }
  }
  return null;
}
