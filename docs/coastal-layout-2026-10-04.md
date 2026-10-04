# Quy hoạch đường và tài nguyên ven biển

Đường cũ tại z=406 đi qua mặt biển bắt đầu khoảng z=361. Thay bằng sáu đoạn đường cấu hình trong shared/beachConfig.js: hai nhánh ngoài tại z=406, hai nhánh nối tại x=±200, đoạn ven bờ trên đất liền tại z=310 và nhánh nối đường trung tâm từ z=278. Bãi cát từ z=318, đường đi bộ tại z=328 và mép nước khoảng z=361 giữ nguyên. Lối vào đi bộ nối từ z=310 đến z=326.

Ranh giới nước tính theo độ rộng các ribbon biển (118 → 176 → 244 → 550), không chỉ một hình chữ nhật gần bờ. Bộ đặt cây instancing và factory cảnh quan chặn vật thể có footprint chạm nước; bộ đặt model thông thường dùng guard chung RoadSafetyZone. Bến câu/hải đăng và các asset nguồn vẫn được giữ. Hai làng phía Nam tại x≈±300 không bị chuyển thành biển.

Đã chạy test-coastal-layout, test-beach, test-collision-system và npm run build thành công. Cảnh toàn map trên trình duyệt 4177 tại (0,310) vào World ready, không có JavaScript error trong lần kiểm tra, ảnh lưu coastal-layout-2026-10-04.png. Chưa chạy bài soak dài hoặc kiểm chứng điều khiển nhân vật đi hết sáu đoạn đường trong phiên multiplayer; không kết luận mọi lỗi lag đã được giải quyết.
