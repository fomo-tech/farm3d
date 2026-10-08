# Kiểm chứng bộ mô phỏng — 06/10/2026

- `npm run test:economy-simulation`: seed tái lập, chọn cá dùng luật server, bảo toàn tiền/tồn kho, thưởng một lần, điểm danh hai buổi/ngày, mồi theo gói, cá chưa bán, thiếu vốn dụng cụ, logout và báo tỷ lệ đạt khi thời gian mô phỏng không đủ.
- `node scripts/test-fishing-session.mjs`: luật hook/pull, tension, cá thoát, chống nhận cá lặp và nhiệm vụ.
- `node scripts/test-fishing-config.mjs`, `node scripts/test-daily-attendance.mjs`, `node scripts/test-missions.mjs`: config hiện hành, chu kỳ thưởng và điều kiện nhiệm vụ.
- `npm run test:economy` và `node scripts/test-fishing-server.mjs`: đều qua trên database MongoDB test riêng tự tạo/xóa, không dùng dữ liệu người chơi thật.
- `npm run build`: asset, bố cục, đường và bundle qua; còn cảnh báo chunk lớn hiện có.
- Simulator được tối ưu sao chép trạng thái nhưng đã so sánh toàn bộ ledger/outcome của seed 1 trước/sau tối ưu, kết quả giống nhau.

Giá, thưởng, xác suất chọn cá và luật kéo cá server giữ nguyên. Module chọn cá được tách ra để server và simulator dùng chung; code có thể đổi được giữ ở module server, không đưa vào bundle client. Phương án trial tồn tại trong công cụ offline, không được import vào game.

Chưa đo thời gian/tỷ lệ thành công của người chơi thật, chưa mô phỏng mọi chiến lược kiếm xu trước mua đất. Nhiệm vụ chính tuyến và daily nông trại được liệt kê nhưng không cộng tiền trước khi đủ điều kiện hướng dẫn. Thu nhập giúp tưới vườn hàng xóm được liệt kê riêng, không cộng vào chiến lược chỉ câu cá. Mốc mua là thời điểm ví có đủ tiền; thao tác chọn lô và xác nhận mua chưa tính thêm thời gian.
