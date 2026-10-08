# Đo kinh tế câu cá trước mua đất

Server ghi phiên kết nối, di chuyển giữa bờ câu và cửa hàng, mua cần/mồi, thả câu, kéo cá, cá thoát và bán cá. Giao dịch được ghi vào outbox cùng lần lưu tài khoản; bản ghi được chuyển sang collection `fishing_telemetry` bằng ID cố định để tránh nhân đôi khi thử lại hoặc khởi động lại server.

## Thu dữ liệu

Khởi động lại server với mã mới để bật ghi nhận. Mặc định bật; đặt `FISHING_TELEMETRY_ENABLED=0` để tắt. Chưa có dữ liệu chơi thật được thu trong lần triển khai này.

Cho người thử chưa có đất chơi các buổi 15, 30 và 60 phút, gồm mua dụng cụ, đi câu, quay về bán cá rồi thoát game. Khi hiệu chỉnh một kiểu chơi, giữ cùng hồ, loại cần và cách dùng mồi để tránh trộn các điều kiện khác nhau. Cần nhiều tài khoản mới để đo hành trình mua cần và tới hồ lần đầu.

Sau khi các phiên đã đóng và server đã chuyển hết outbox:

```sh
npm run report:fishing
```

Lệnh đọc MongoDB qua `MONGODB_URI` và `MONGODB_DB`, mặc định database `farm_online_3d`. Có thể chọn `--since 2026-10-06T00:00:00Z`, `--database ten_database` và `--output thu_muc`.

Báo cáo mặc định nằm trong `docs/fishing-measurements`: `report.md`, `report.json`, `sessions.csv` và `measured-profile.json`. Xu ròng câu cá là tiền bán cá trừ tiền mua cần, mồi và dụng cụ; tiền nhiệm vụ được thống kê riêng.

## Đưa số đo vào mô phỏng

Mỗi thông số cần ít nhất 20 mẫu theo mặc định. Báo cáo chỉ tạo profile dùng được khi đủ mẫu và không có dấu hiệu mất bản ghi, outbox chưa xử lý, phiên chưa đóng, phiên trùng thời gian hoặc lượt câu thiếu kết quả. Cá hiếm cần đủ mẫu giao chiến riêng. Không dùng việc hạ ngưỡng mẫu để kết luận đã cân bằng kinh tế.

```sh
npm run simulate:economy -- --profiles docs/fishing-measurements/measured-profile.json --output docs/economy-measured-simulation
```

Simulator từ chối profile chưa đạt điều kiện. Các thông số không đo được vẫn dùng giả định trong mô hình; kết quả mô phỏng không thay thế thử nghiệm người chơi.

## Giới hạn và vận hành

- Thời gian kết nối và thời gian hoạt động ước tính được báo riêng. Hoạt động được suy ra từ thao tác và khoảng đệm 60 giây, không đo việc người chơi có đang nhìn màn hình.
- Mỗi kết nối là một phiên; lượt câu được liên kết bằng mã băm qua reconnect. Lượt chưa có kết quả được ghi là chưa quan sát, không tự coi là thất bại.
- Dữ liệu sự kiện có TTL 30 ngày. Outbox tối đa 256 bản ghi mỗi tài khoản; đầy outbox vẫn cho giao dịch chạy và tăng bộ đếm mất dữ liệu để báo cáo phát hiện.
- Không lưu tên, token, tọa độ chính xác hay ID người chơi nguyên dạng trong sự kiện. Mã băm vẫn cho phép liên kết các phiên, nên đây là dữ liệu giả danh, không phải dữ liệu hoàn toàn vô danh.
- Bộ đếm mất dữ liệu mang tính bảo thủ; không tự xóa bộ đếm để làm báo cáo đạt điều kiện.

Kiểm tra triển khai: `npm run test:fishing-telemetry` dùng database thử riêng, kiểm tra lưu nguyên tử, thử lại, tranh chấp ghi, phục hồi outbox, TTL và chặn hiệu chỉnh khi thiếu dữ liệu.
