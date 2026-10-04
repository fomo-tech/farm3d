import { VENUE_LAYOUT } from './venueLayout.js';

// Geometry remains shared with authoritative venue transitions.
const styles = {
  supplies: { wall: '#f3e9cf', accent: '#79b58a', roof: '#608e76', glass: '#c4e2d7', keeper: 'CHỊ MẦM · VẬT TƯ' },
  fashion: { wall: '#f6e5df', accent: '#df9eac', roof: '#ba8299', glass: '#d3e7e5', keeper: 'CÔ SOPHIE · THỜI TRANG' },
  vehicles: { wall: '#e7edec', accent: '#80adc6', roof: '#668ba8', glass: '#c4dfe9', keeper: 'ANH BẢO · ĐẠI LÝ XE' },
  fishing: { wall: '#e9eee0', accent: '#77b9bd', roof: '#548e9d', glass: '#c6e7e7', keeper: 'LÃO NGƯ · ĐỒ CÂU' },
  casino: { wall: '#eee5f0', accent: '#af98c6', roof: '#87749f', glass: '#dcd6eb', keeper: 'CHÚ LỘC · HỘI QUÁN' },
};
export const SHOP_CONFIG = Object.freeze(Object.fromEntries(Object.entries(styles).map(([id, style]) => [id, Object.freeze({
  ...style, layout: VENUE_LAYOUT[id], wood: '#ad8867', cream: '#f7efdc', floor: '#ddcdb6',
  facade: Object.freeze({ frontZ: 6.14, doorWidth: 3.6, doorHeight: 4.5, awningWidth: 13.6, awningDepth: 1.65 }),
})])));
