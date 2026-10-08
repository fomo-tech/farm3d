# Câu cá: thao tác và hành vi

Triển khai đợt 1–2 của kế hoạch nâng cấp. Các đợt mở rộng loài, bể cá và sự kiện chưa thuộc bản này.

- Chọn trái/thẳng/phải; giữ nút hoặc F để lấy lực, thả để ném. Chạm nhanh dùng lực 75%. Máy chủ kiểm tra lực 25–100% và hướng hợp lệ trước khi tiêu hao mồi, tự tính điểm rơi và tầm ném.
- Mọi cá đều vào lượt kéo. Giật trong 650 ms đầu được lợi thế 12% tiến độ; trong 1.500 ms được 6%; giật muộn vẫn bắt đầu bình thường. Cửa sổ giật 2.400 ms giữ nguyên.
- Bảy loài có sức kéo, thời gian nghỉ và vùng khác nhau; nhịp biến thiên theo phiên. Báo hiệu trước khi vùng, đổi hướng chạy và giảm sức chống cự khi mệt. Có khoảng đệm đầu lượt để đọc tín hiệu trước khi dây bắt đầu chùng.
- HUD hiện lực/hướng ném, chất lượng giật, độ mệt và cảnh báo; tín hiệu rung/âm thanh khi cá sắp vùng. Rig 3D giữ bóng cá lúc kéo, gợn nước và chuyển động ngang theo nhịp; phao tiến về bờ theo tiến độ máy chủ, nội suy để tránh giật.
- Thời gian chờ cá cắn giảm từ 2.500–6.500 ms xuống 1.300–3.100 ms trước hệ số mồi. Giá, xác suất cá, XP và đồ câu đã sở hữu được giữ nguyên. Thời gian kiếm xu có thể thay đổi theo kỹ năng; chưa phải kết quả đo người chơi thực.
- Máy chủ vẫn giữ loài/cân nặng chưa bắt, tính sức dây/tiến độ, chống replay, sai thứ tự và nhận cá lặp. Hệ số kích thước được chia nhóm để không lộ cân nặng chính xác qua hệ số kéo. Phiên cũ thiếu profile được bổ sung khi kéo.

## Kiểm tra

Các kiểm tra session, config, vùng nước, rig, hình ảnh rig, app bindings, telemetry, mô phỏng kinh tế và hành trình tân thủ đạt. MongoDB thử riêng kiểm tra mua/thả/giật/kéo/bắt/lưu/bán và nhật ký giao dịch đạt, gồm cá thường không được nhận ngay khi giật và chống nhận trùng.

`balance.json`: 1.400 lượt mô phỏng, 7 loài × 2 cần × 100 mẫu, phản ứng 750 ms và nhịp 400 ms. Chính sách giữ/thả đúng bắt được toàn bộ. Với cần trúc, trung vị lượt kéo: cá thường 4,4–5,2 giây; cá ít gặp 6,4 giây; cá hiếm/huyền thoại 10,8–12,8 giây. Đây là mô phỏng, không phải telemetry người chơi.

Kiểm tra trình duyệt fixture: đổi hướng trái, F ném, giật hoàn hảo chuyển sang kéo cá chép và khởi đầu 12%; giao diện desktop/mobile. Fixture không ghi tài khoản thật. Ảnh cast.png, fight.png, mobile.png. Chạy báo cáo: `node scripts/report-fishing-fights.mjs`.
