# Đại lý xe Bình Minh

Đại lý mở bằng bảng riêng, không còn lồng vào game-panel. Tông kem/cam/xanh ngọc, icon WebP HUD, danh mục Tất cả/Xe của tôi, ví xu, giá bán và trạng thái sở hữu/đang dùng. Giữ danh mục, giá, tốc độ và callback buyVehicle hiện tại; trạng thái tài khoản thật vẫn do server xác nhận.

Ảnh từng mẫu xe chụp từ createVehicleRigs, có căn khung theo bounding box. Một engine tạm tạo ảnh tuần tự, cache ảnh WebP trong bộ nhớ rồi dispose. Khung lớn dùng VehiclePreview với avatar, điều khiển xoay/zoom, chạy thử/tạm dừng, PreviewFrameGate 30 FPS và dừng render khi bị ẩn.

Desktop dùng danh sách dọc + chi tiết; điện thoại dùng danh sách ngang và phần xem thử/chi tiết cuộn. Header, ví và footer luôn hiện. Escape đóng và Tab giữ trong bảng.

Đã kiểm tra bằng fixture: đủ 7 mẫu và ảnh mesh, chọn Scooter/Kart, thiếu xu khóa nút (thiếu 252 xu), mua Scooter trừ 900 xu (1248→348), trạng thái sở hữu/đang dùng, mất kết nối khóa Lên xe, lên xe trên màn hình 390×844. Không thực hiện mua trên tài khoản thật. Console không báo error.

Test app-bindings và vehicle-redesign qua. Hai test vehicle-rigs và vehicle-optimization thất bại tại kiểm tra dispose vì còn 1 vật liệu; createVehicleRigs không được sửa trong thay đổi này. Cần xử lý riêng vòng đời vật liệu của rig. Build và diff-check được ghi nhận trong kết quả bàn giao.

Preview: /hud-preview.html?dealerDemo=1, thêm &dealerOffline=1 để thử mất kết nối; /dealer-review.html cho điện thoại.
