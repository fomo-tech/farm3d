# Biển Bình Minh — quy hoạch

`shared/beachConfig.js` là nguồn chung cho đường bờ, màu sắc, các khu, vị trí dừa/ghế nằm, khoảng tải/gỡ, sóng, bến câu, vị trí người bán đồ câu và collider quầy. Thế giới gọi `createCozyBeach` thay khu cũ có offset z=142. Giữ nguyên công trình hải đăng và bến tàu hiện có.

## Đã tích hợp

- Sáu ô streaming thuộc năm loại khu: cổng, hai đoạn đường dạo, bãi tắm, bến câu, góc ngắm cảnh.
- Cụm dừa, ghế nghỉ, ô dù, ghế nằm, quầy dừa, cầu câu và chủ quầy đồ câu. Nhấn E gần chủ quầy nối tới bảng đồ câu hiện có, không tạo giao dịch tiền phía client.
- Geometry lặp lại dùng instancing với template nhỏ dùng chung. Tải theo scheduler, LOD còn hiện khi chi tiết đang tải; gỡ chi tiết khi ra khỏi khoảng giữ. Material/texture chữ được cache để quay lại không tạo bản sao liên tục.
- Nước/cát ướt opaque, giảm phản sáng; texture nước trung tính để màu vật liệu không bị nhân hai màu xanh. Sóng chỉ dịch chuyển nhỏ, không scale toàn dải theo tọa độ thế giới. Dừng cập nhật sóng khi người chơi xa khu biển.
- Vùng câu bờ/cầu dùng config chung client/server. Terrain height khớp cát, đường dạo và cầu; collider quầy/dừa và chặn nước sâu. Bến tàu/hải đăng vẫn giữ collider cũ.

## Kiểm thử và giới hạn

`npm run test:beach` kiểm tra config, vùng câu, collider, chiều cao sàn, opacity, đủ khu, ba vòng gỡ/tải lại và số mesh/material ổn định. Chạy thêm `node scripts/test-world-chunk-streamer.mjs`, `node scripts/test-collision-system.mjs`, `npm run build`.

`beach-preview.html` là cảnh kiểm thử nhẹ dùng đúng builder của game, không phải bản chạy cả thế giới. Đã thao tác nút đi xa/quay lại và xác nhận 0/6 → 6/6 khu, vật liệu không tăng. Trong trình duyệt có lúc FPS giảm còn 1 khi không tương tác; chưa dùng kết quả này để khẳng định hiệu năng toàn map. Lỗi import InstancedMesh và vật liệu chữ/foam đã được phát hiện trong quá trình kiểm tra và sửa.

Ghế nghỉ/ghế nằm hiện là cảnh quan, chưa có animation ngồi; quầy dừa chưa bán đồ uống. Chưa thêm bơi, lái thuyền hoặc trò chơi bãi biển. Chưa kiểm chứng đường đi và mua đồ câu end-to-end trong phiên multiplayer đầy đủ.

## Kết quả chạy trình duyệt ngày 2026-10-04

- Cảnh biển riêng sau reload: đủ 6/6 khu, 325 mesh, 41 material, khoảng 60 FPS tại thời điểm đo; khoảng cách khung hình lớn nhất 23 ms. Đi xa/quay lại khôi phục các khu.
- Bài chạy toàn thế giới 60 giây hoàn thành, không có lỗi khởi tạo/render trong báo cáo, nhưng chưa hoàn tất một vòng tuyến kiểm thử (10 lần chuyển vị trí).
- Có một khoảng gián đoạn 1468 ms. Slow Frame Source ghi callback `import.then` của bundle loader glTF chiếm 1419 ms. Đây là lỗi hiệu năng còn tồn tại; chưa chứng minh thao tác nội bộ nào là nguyên nhân duy nhất và chưa sửa loader trong thay đổi khu biển này.
- Báo cáo thô lưu tại `docs/beach-world-soak-2026-10-04.json`; ảnh cảnh kiểm thử lưu tại `docs/beach-preview-2026-10-04.jpg`.

Chưa nghiệm thu hiệu năng toàn thế giới là hết khựng. Các con số cảnh riêng không thay thế kiểm thử gameplay/multiplayer toàn map.
