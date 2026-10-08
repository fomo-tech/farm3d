# Popup lô đất, thông báo và giá

Bấm nền trong footprint 20×20 của một lô mở popup đúng farmId; đường giữa các lô vẫn dùng để đi lại. Thao tác trên ô cây trồng giữ nguyên. Chọn thẻ đất trong chợ cũng chuyển sang chi tiết riêng thay vì chèn giữa danh sách. Mở từ thế giới gửi land_market để lấy catalog mới.

Nút chuông trên HUD mở lịch sử tối đa 30 thông báo phiên chơi, có số chưa đọc, mở đánh dấu đã đọc. Không lưu lịch sử qua đăng nhập lại. Popup có Escape/focus bàn phím.

Giá đã đúng: 6000–12000 xu, gần tâm thị trấn (0,0) cao hơn; xa rẻ hơn, làm tròn 50 xu. Không đổi công thức/giá đã mua. Distance catalog giờ dùng cùng tâm cấu hình với công thức giá, tránh lệch nếu thay tâm sau này.

Kiểm tra test-land-interaction trên mọi lô/đường giữa lô, test-land-config với thứ tự gần→xa của 288 lô, App bindings và build. UI fixture xác nhận thẻ lô 2 chỉ hiển thị thông tin lô 2, popup thông báo và ảnh parcel.png/notifications.png.
