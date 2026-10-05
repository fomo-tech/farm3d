// One catalogue for purchasing, speed, showroom and multiplayer rendering.
// Existing prices/speeds stay unchanged.
export const VEHICLES = {
  walk: { id: 'walk', name: 'Đi bộ', cost: 0, speed: 7, category: 'Đi bộ', icon: '★' },
  skateboard: { id: 'skateboard', name: 'Ván trượt Street', cost: 200, speed: 9, category: 'Ván trượt', icon: '★', color: '#424e58' },
  bike: { id: 'bike', name: 'Xe đạp Trail', cost: 350, speed: 10, category: 'Xe đạp', icon: '★', color: '#37667e' },
  scooter: { id: 'scooter', name: 'Scooter Urban', cost: 900, speed: 14, category: 'Xe điện', icon: '★', color: '#536b70' },
  kart: { id: 'kart', name: 'Kart Rally', cost: 1500, speed: 16, category: 'Xe đua mini', icon: '★', color: '#bf7845' },
  tractor: { id: 'tractor', name: 'Máy kéo Field', cost: 2200, speed: 18, category: 'Nông trại', icon: '★', color: '#b86f3f' },
  convertible: { id: 'convertible', name: 'Roadster GT', cost: 3200, speed: 18, category: 'Ô tô', icon: '★', color: '#315469' },
  hoverboard: { id: 'hoverboard', name: 'Ván bay Aero', cost: 2600, speed: 15, category: 'Ván bay', icon: '★', color: '#52636c' },
};
export const VEHICLE_LIST = Object.values(VEHICLES);
