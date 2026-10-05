# Hồ Pha Lê: quy hoạch và kiểm thử

## Thay đổi

- Một mặt hồ và bờ cát theo cùng đường bao dùng ở client/server.
- Một bến chữ T nối đại lộ bằng lối đi trên đất; tiệm câu cá đặt trên bờ.
- Bỏ cầu/đảo trang trí không tiếp cận được, bến và thuyền cũ tạo trùng ở countryside, swan boats và pergola chồng lối đi.
- Trạm và điểm quay đầu xe buýt nằm trên đất liền, không chắn lối ra bến.
- Ghép mesh tĩnh theo material và parent; chi tiết/animation chỉ bật gần người chơi, có hysteresis và dispose rõ ràng.
- Collision, độ cao sàn, vùng câu cá, cửa tiệm và khôi phục vị trí cũ dùng geometry chung. Không reset tài khoản hoặc thay đổi kinh tế câu cá.

## Đo cảnh hồ riêng (không phải toàn game)

Cùng camera và render 1920×1080: draw calls 1244 → 63 (giảm khoảng 95%); triangles 139016 → 8768; meshes 950 → 42; scene CPU frame 9.8 → 1.8 ms. Khi rời xa, detail tắt và animation dừng. Đây là đo fixture lake-preview, không đại diện FPS toàn map.

## Kiểm thử

- Production build với Vite, output riêng `/private/tmp/farm-lake-build.IXzxxK`: PASS sau thay đổi cuối.
- `node scripts/test-lake-layout.mjs`: lối đi, bến chữ T, cửa tiệm, collision nước, fishing, vị trí cũ và năm vòng tạo/hủy không tăng tài nguyên: PASS.
- `node scripts/test-lake-statics.mjs`: 20 mesh → 1, giữ nguyên world bounds và triangles: PASS.
- `node scripts/test-fishing-water.mjs`: PASS.
- Landscape, boot, beach, venue/casino, collision, fishing config, asset/farm validation: PASS trong lượt kiểm tra trước.
- Map thật: nhân vật đi từ (122,2) đến (162,2), không bị chặn; quan sát bến cũ đã biến mất. Ảnh: `/private/tmp/crystal-lake-map-after.png`.
- Từ bến đi theo lối trên bờ tới cửa tiệm: tự vào venue fishing, nội thất (70,-220.5); thoát về (112.5,-16), detail hồ được bật lại: PASS.
- Viewport 844×390: cảnh render được, đã reset viewport sau kiểm tra. Không tương đương kiểm thử Safari/iPhone thật.

## Giới hạn

Map tổng thể vẫn nặng và tải chậm trong kiểm thử; không tuyên bố đã sửa hiệu năng toàn game. Chưa xác nhận trên iPhone thật hoặc hai người chơi đồng thời.
