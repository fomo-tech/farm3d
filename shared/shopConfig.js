import { VENUE_LAYOUT } from './venueLayout.js';

// Geometry remains shared with authoritative venue transitions.
const styles = {
  supplies: {
    wall: '#f1ebda', accent: '#97bca9', roof: '#729c8e', glass: '#c7ded7',
    keeper: 'CHỊ MẦM · THỦ KHO NÔNG CỤ',
    title: 'NÔNG TRANG VẬT TƯ',
    subtitle: 'HẠT GIỐNG · NÔNG CỤ · PHÂN BÓN',
    icon: '🌾',
    carpet: '#15803d',
    bladeIcon: 'sprout',
  },
  fashion: {
    wall: '#f2e8e2', accent: '#d3a6b2', roof: '#b78799', glass: '#cadde3',
    keeper: 'CÔ THẢO · NGHỆ NHÂN DỆT MAY',
    title: 'TIỆM MAY TƠ LỤA',
    subtitle: 'ÁO DÀI · KHĂN RẰN · NÓN LÁ',
    icon: '🌸',
    carpet: '#9f1239',
    bladeIcon: 'dress',
  },
  vehicles: {
    wall: '#e7edf0', accent: '#9bb7cb', roof: '#789db6', glass: '#c4dce4',
    keeper: 'ANH BẢO · THỢ MÁY CƠ KHÍ',
    title: 'TRẠM CƠ GIỚI & XE CỘ',
    subtitle: 'MÁY CÀY · XE LÔI · XE ĐẠP',
    icon: '🚜',
    carpet: '#1e293b',
    bladeIcon: 'wheel',
  },
  fishing: {
    wall: '#e5eee6', accent: '#91bdbb', roof: '#729fa6', glass: '#c8dfdf',
    keeper: 'LÃO NGƯ · BẾN HỒ PHA LÊ',
    title: 'TIỆM ĐỒ CÂU LÃO NGƯ',
    subtitle: 'CẦN TRÚC · NƠM LỜ · MỒI CÂU',
    icon: '🐟',
    carpet: '#0369a1',
    bladeIcon: 'fish',
  },
  casino: {
    wall: '#eee8f1', accent: '#baa9cf', roof: '#9c8bb3', glass: '#d8d0e3',
    keeper: 'CHÚ LỘC · QUẢN QUÁN DÂN GIAN',
    title: 'HỘI QUÁN DÂN GIAN',
    subtitle: 'CỜ TƯỚNG · TRÀ QUÁN · VƯỜN LINH VẬT',
    icon: '🎲',
    carpet: '#581c87',
    bladeIcon: 'dice',
  },
};
export const SHOP_CONFIG = Object.freeze(Object.fromEntries(Object.entries(styles).map(([id, style]) => [id, Object.freeze({
  ...style, layout: VENUE_LAYOUT[id], wood: '#ad8867', cream: '#f7efdc', floor: '#ddcdb6',
  facade: Object.freeze({ frontZ: 6.14, doorWidth: 3.6, doorHeight: 4.5, awningWidth: 13.6, awningDepth: 1.65 }),
})])));
