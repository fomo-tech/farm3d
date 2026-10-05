import { LAKE_CONFIG } from './lakeConfig.js';
// One source of truth for entrance triggers, return points and room spawns.
export const VENUE_LAYOUT = Object.freeze({
  casino: { entrance: { x: -24, z: -20.9 }, exit: { x: -20.5, z: -18 }, interior: { x: 210, y: 32, z: -215 }, exterior: { x: -29, z: -25, yaw: Math.PI * 0.25 + 0.1 }, label: 'Hội quán trò chơi', color: '#8b63b9' },
  fashion: { entrance: { x: 24, z: -20.9 }, exit: { x: 20.5, z: -18 }, interior: { x: 175, y: 32, z: -215 }, exterior: { x: 29, z: -25, yaw: -Math.PI * 0.25 - 0.1 }, label: 'Tiệm thời trang', color: '#ed7aa7' },
  vehicles: { entrance: { x: -24, z: 20.9 }, exit: { x: -20.5, z: 18 }, interior: { x: 140, y: 32, z: -215 }, exterior: { x: -29, z: 25, yaw: Math.PI * 0.75 - 0.1 }, label: 'Đại lý xe', color: '#499bc4' },
  supplies: { entrance: { x: 24, z: 20.9 }, exit: { x: 20.5, z: 18 }, interior: { x: 105, y: 32, z: -215 }, exterior: { x: 29, z: 25, yaw: -Math.PI * 0.75 + 0.1 }, label: 'Tiệm vật tư', color: '#65ad73' },
  fishing: { entrance: { x: LAKE_CONFIG.shop.entranceX, z: LAKE_CONFIG.shop.z }, exit: { x: LAKE_CONFIG.shop.exitX, z: LAKE_CONFIG.shop.z }, interior: { x: 70, y: 32, z: -215 }, exterior: { x: LAKE_CONFIG.shop.x, z: LAKE_CONFIG.shop.z, yaw: -Math.PI / 2 }, label: 'Tiệm đồ câu', color: '#58a9cf' },
});
