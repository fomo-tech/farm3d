# Thiết lập nông trại

Bảng Thiết lập riêng được mở từ mục Thiết lập trong điện thoại; nút đóng/Xong quay về menu điện thoại. Tài khoản giữ nguyên các callback liên kết Google và đăng xuất hiện có.

Tông kem, cam và xanh ngọc; icon WebP của HUD. Âm thanh dùng công tắc, đồ họa chọn trực tiếp 4 chế độ, góc nhìn chọn Khám phá/Canh tác. Thao tác áp dụng vào farmAudio/FarmWorld qua callback trong App. Không thêm tùy chọn giả.

Bố cục hai cột trên desktop, một cột cuộn trên điện thoại, tiêu đề và nút Xong luôn hiện. Escape đóng; Tab giữ trong bảng. Dữ liệu thử: `/hud-preview.html?settingsDemo=1`, mobile 390×844: `/settings-review.html`.

Đã kiểm tra trực quan desktop/mobile, bật/tắt âm thanh, chọn Tiết kiệm, chọn Canh tác, Escape và mở lại. Không có console error trong fixture. `test-app-bindings` qua. `test-graphics-settings` hiện thất bại ngay assertion mặc định cũ `auto`; mã GraphicsSettings hiện dùng `ultra` (có trước thay đổi giao diện này).

Build production thành công; cảnh báo chunk lớn có sẵn vẫn còn. `git diff --check` qua.
