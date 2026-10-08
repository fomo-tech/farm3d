# Bảng tin Bình Minh

Giao diện kem–cam–xanh ngọc, dùng toàn bộ icon farm-v2 WebP; CSS riêng FarmNotice tránh xung đột bảng tin cũ. Bốn danh mục: điểm danh, hoạt động, giftcode, đối tác.

Điểm danh dùng nguyên ATTENDANCE_REWARDS/getAttendanceStatus, trạng thái hôm nay/đã nhận/chưa mở, nhấn mạnh ngày 7. Giữ callback nhận quà và mã quà tặng của App, khóa nút offline hoặc thiếu callback/mã. Giftcode bỏ khoảng trắng, chuyển chữ hoa và có label; không quảng bá mã chưa được xác minh. Hoạt động dẫn vào các địa điểm hiện có, bỏ các lời hứa khuyến mãi/phần thưởng chưa được thực thi. Mục đối tác chỉ tạo bản nháp cục bộ; không báo đã gửi và không hiển thị liên hệ giả.

Desktop có hàng 7 ngày; iframe 390×844 có lưới 3 cột và ngày 7 rộng toàn hàng. Focus trong dialog, Escape đóng và trả focus.

Test: test-daily-attendance và test-app-bindings qua; production build qua (còn cảnh báo chunk lớn). Trình duyệt kiểm tra offline, nhận quà/khóa nút, giftcode rỗng và chuẩn hóa mã, 4 hoạt động, bản nháp đối tác và Escape. Nhận quà/giftcode được kiểm tra bằng state cục bộ của HUD fixture noticeConnected, không gửi lên tài khoản thật. Ảnh desktop.png/mobile.png/activities.png.
