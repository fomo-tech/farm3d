// Danh mục dùng để giao diện không bị kẹt nếu máy chủ multiplayer đang khởi động.
// Khi kết nối thành công, số cư dân/chỗ trống sẽ được thay bằng dữ liệu thật từ server.
const VILLAGE_SEEDS = [
  ['binh-minh', 'Làng Bình Minh', '🌅', 'Đồng cỏ yên bình, phù hợp người mới.'],
  ['hoa-mai', 'Làng Hoa Mai', '🌼', 'Vùng quê nhiều hoa và hàng xóm nhộn nhịp.'],
  ['ven-song', 'Làng Ven Sông', '🏞️', 'Khu dân cư cạnh sông, gần tuyến xe buýt.'],
  ['doi-gio', 'Làng Đồi Gió', '🌬️', 'Cao nguyên thoáng đãng cạnh cối xay gió.'],
  ['an-nhien-005', 'Làng An Nhiên', '🌾', 'Miền đất màu mỡ dành cho những mùa vụ lớn.'],
  ['moc-lan-006', 'Làng Mộc Lan', '🌳', 'Đồng cỏ yên bình, phù hợp người mới.'],
  ['thanh-ha-007', 'Làng Thanh Hà', '🌸', 'Vùng quê nhiều hoa và hàng xóm nhộn nhịp.'],
  ['phu-dien-008', 'Làng Phú Điền', '⛰️', 'Khu dân cư cạnh sông, gần tuyến xe buýt.'],
  ['tan-loc-009', 'Làng Tân Lộc', '🍀', 'Cao nguyên thoáng đãng cạnh cối xay gió.'],
  ['hai-van-010', 'Làng Hải Vân', '🌊', 'Miền đất màu mỡ dành cho những mùa vụ lớn.'],
  ['thu-phong-011', 'Làng Thu Phong', '🍁', 'Đồng cỏ yên bình, phù hợp người mới.'],
  ['huong-duong-012', 'Làng Hướng Dương', '🌻', 'Vùng quê nhiều hoa và hàng xóm nhộn nhịp.'],
];

export const DEFAULT_VILLAGES = VILLAGE_SEEDS.map(([id, name, icon, description]) => ({
  id,
  name,
  icon,
  description,
  residents: 0,
  capacity: 24,
  available: 24,
  provisional: true,
}));

export function keepAvailableVillages(villages) {
  return Array.isArray(villages) && villages.length ? villages : DEFAULT_VILLAGES;
}
