# Nhiệm vụ — đợt 1 (2026-10-07)

## Đã triển khai

- Schema nhiệm vụ phiên bản 2; hướng dẫn hiện hành được nhận diện phiên bản 1 khi đọc tài khoản. Không đổi ý nghĩa số bước hướng dẫn cũ.
- Giữ 12 ID chính tuyến, 3 ID daily và ID thành tích cũ, mức thưởng, XP và lịch sử đã nhận.
- Chính tuyến ghi rõ tiến độ lifetime; daily ghi rõ tiến độ theo ngày. Giữ baseline và lịch sử daily còn trong ngày khi chuyển phiên bản; bỏ ID không tồn tại và gộp ID chính tuyến trùng, không cấp lại thưởng.
- Nhiệm vụ nông trại yêu cầu có đất và hoàn thành hướng dẫn. Nhiệm vụ cho ăn còn yêu cầu có vật nuôi. Hỗ trợ điều kiện cần câu cho nội dung đợt 2; chưa tạo nhiệm vụ câu cá mới.
- Server kiểm tra quyền sở hữu trong farm_assignments (không chấp nhận bản ghi pending); kiểm tra đàn vật nuôi từ tài khoản. Payload không được quyết định quyền sở hữu, tiến độ hoặc giá trị thưởng.
- Nhận hạt, chuyển bước giải thích và hoàn thành hướng dẫn trồng đều cần sở hữu đất. Client hiển thị điều kiện chưa đạt và khóa nút nhiệm vụ tương ứng.
- Từ chối stat âm, không nguyên, Infinity hoặc thiếu khi nhận nhiệm vụ. Giữ kiểm tra thứ tự chính tuyến, điều kiện đủ tiến độ và chống nhận lặp hiện có.
- Daily reset 00:00 Asia/Ho_Chi_Minh; điểm danh vẫn dùng lịch UTC riêng.

## Rà nguồn tiến độ hiện tại

| Nguồn | Tiến độ server | Điều kiện/ghi nhận |
| --- | --- | --- |
| Gieo | planted | Gieo thành công, đã trả hạt hoặc dùng hạt miễn phí |
| Tưới | watered | Tưới thành công; hiện gồm giúp ruộng người khác |
| Thu hoạch | harvested | Thu hoạch thành công; tăng 1 theo ô, không theo số sản phẩm |
| Giao đơn | orders | Đủ nguyên liệu, tiêu nguyên liệu, trả thưởng đơn |
| Chế biến | crafted | Đủ nguyên liệu, tiêu nguyên liệu, tạo sản phẩm |
| Cho ăn | animalsFed | Thao tác chăn nuôi thành công theo quy tắc hiện hành |
| Hướng dẫn | onboarding.step | Tạo nhân vật → nhận hạt → thu hoạch → giải thích → giao đơn → nhận thưởng |

Chưa thay chuỗi này bằng hành trình câu cá. Tài khoản chưa có đất hiện phải mua đất trước khi nhận hạt; đây là trạng thái chuyển tiếp tới đợt 2, không phải hướng dẫn tân thủ hoàn chỉnh.

## Ngân sách kinh tế giữ nguyên

Tiền đầu 180 xu; mã đã phát hành tổng 1.800; điểm danh 1.220/tuần; hướng dẫn 250 xu và 3 hạt miễn phí; thành tích cũ 145 xu; 12 chính tuyến 1.690 xu; daily tối đa 105 xu/ngày. Giá lô 6.000–12.000 xu, 4 ô trồng ban đầu; chuồng khu riêng.

Thành tích, chính tuyến và hướng dẫn có thể ghi nhận cùng hành động nhưng trả các khoản riêng. Chưa xóa hoặc hợp nhất quyền lợi đã phát hành. Đợt 2 phải cân tổng thưởng khi thêm chuỗi trước đất, không cộng ngân sách mới mặc định.

## Kiểm chứng và bước tiếp

Unit kiểm tra thứ tự, nhận lặp, stat không hợp lệ, migration giữ lịch sử/baseline và rollover nửa đêm. Kiểm tra server/MongoDB riêng xác nhận authoritative ownership, bản ghi pending và payload giả bị từ chối, nhận đồng thời trả một lần. Simulator chặng nông trại đã dùng điều kiện vật nuôi thật; build client được kiểm tra.

Tiếp theo: chuỗi trước đất câu → bán → xem đất, daily không cần đất và nối hướng dẫn sau mua. Chưa restart server hoặc thay dữ liệu tài khoản thật trong đợt này.
