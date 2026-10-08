# Popup bản đồ Bình Minh

Popup mở từ minimap và panel map trong App. Bản đồ lớn dùng chung FarmMapTerrain với minimap: đường, 288 ô đất, hồ, bờ biển; hướng Bắc cố định và bộ icon farm-v2 WebP.

Có tìm kiếm không dấu, lọc 12 làng/biển hồ/nhà, chọn ghim hoặc danh sách, phóng to và đặt lại toàn cảnh. Ghim nhiệm vụ là điểm theo dõi, không cho dịch chuyển. Vị trí nhà lấy từ farmTilePosition; thành phố lấy TOWN_SPAWN. Phí dự kiến dùng travelCost và nút dịch chuyển gọi luồng xác nhận hiện có trong App. Hủy xác nhận giữ popup mở. Nút bị khóa khi mất kết nối hoặc thiếu xu.

Kiểm chứng: npm run build; npm run test:world-map; npm run test:minimap; node scripts/test-hud-runtime.mjs đều qua. Build còn cảnh báo chunk lớn. Đã kiểm tra trình duyệt: bấm minimap mở popup thật, chọn hồ, zoom, tìm kiếm, Escape đóng và trả focus, ghim nhiệm vụ, lọc/chọn nhà trên iframe 390×844. Ảnh desktop.png và mobile.png dùng HUD fixture; không thực hiện dịch chuyển trên tài khoản thật.
