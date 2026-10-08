# Badge điểm danh

Badge cam số 1 ở menu HUD, icon điểm danh trong điện thoại (kèm nhãn Nhận quà) và tab điểm danh trong bảng tin. Dùng claimedToday từ communityRewards.daily; chỉ ẩn sau khi dữ liệu điểm danh cập nhật. Thông báo nhiệm vụ/đơn hàng khác vẫn được giữ.

useDailyAttendance đọc giờ theo offset server, kiểm tra đổi ngày mỗi 30 giây, khi focus và khi thay đổi visibility. Không tạo render mới mỗi lần kiểm tra nếu ngày không đổi. Mốc đổi ngày là UTC 00:00 / Việt Nam 07:00; bảng tin và badge dùng cùng hook.

Kiểm tra fixture: menu và tab có badge trước nhận; nhận giả lập bằng state cục bộ làm cả hai badge biến mất, nút nhận bị khóa. Không nhận quà tài khoản thật. Test daily attendance có thêm kiểm tra ngay trước/sau mốc đổi ngày. Build production và test-app-bindings qua. hud.png là ảnh HUD fixture.
