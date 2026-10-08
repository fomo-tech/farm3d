# Sổ tay nông dân

Giao diện kem/cam/xanh ngọc với icon WebP HUD. Sáu mục: Bắt đầu, Trồng trọt, Kho đồ, Đơn hàng, Khám phá, Phương tiện. Desktop dùng thanh mục bên trái; điện thoại dùng lưới 3×2, nội dung cuộn riêng và nút đóng/tiếp tục luôn hiện.

Tiến độ Bắt đầu phản ánh hành trình trước khi mua đất qua preLandJourney, hoặc 5 bước với Oliver khi đã có nông trại. Nút Đi ngay nối vào callback App: tiệm câu/hồ/đất hoặc ô trồng/đơn hàng/Oliver. Chơi lại cần xác nhận trong bảng và giữ callback reset hiện có.

Cây trồng, kho, đơn hàng, xe và thưởng hoàn thành lấy từ các cấu hình chung hiện tại; bỏ thông tin xe cũ, tuyến bus chưa xác minh và tuyên bố đơn hàng luôn lời gấp 3. Hiển thị số vật phẩm/sức chứa thực tế của người chơi.

Kiểm tra: mở từ Thiết lập trong fixture, 6 mục, hai hành trình, xác nhận/hủy chơi lại, Escape và bố cục desktop/390×844. Không có console error trong fixture. test-app-bindings, test-farm-config, test-pre-land-missions, git diff --check và build production qua. Cảnh báo chunk lớn có sẵn.

Preview dữ liệu thử: /hud-preview.html?guideDemo=1 (chưa có đất); thêm &guideFarm=1 (đã có đất); /guide-review.html cho điện thoại. Không thực hiện giao dịch trên tài khoản thật khi kiểm tra.
