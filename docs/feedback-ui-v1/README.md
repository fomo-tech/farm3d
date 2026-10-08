# Confirm và toast

GameConfirm dùng nền kem, icon HUD WebP, bảng phí, nút Để sau và nút hành động. Tích hợp dịch chuyển (thay window.confirm) và mua đất. Chỉ gửi giao dịch sau xác nhận, kiểm tra lại kết nối sau khi chờ. Escape/backdrop hủy; Tab giữ focus trong hộp; đóng trả focus về nơi mở.

GameToast thay status toàn game: icon, tiêu đề, nội dung, nút đóng; nhận dạng thông báo/chú ý/thành công từ chuỗi hiện có. Thời gian tự ẩn 4,5 giây giữ nguyên; mất kết nối hiển thị liên tục. Khi có confirm, toast nằm dưới để không che hộp.

Kiểm tra App bindings, production build; trình duyệt xác nhận/hủy Escape, toast thành công, iframe 390×844. Fixture feedbackDemo không giao dịch tài khoản thật.
