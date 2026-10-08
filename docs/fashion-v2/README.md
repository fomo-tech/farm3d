# Phòng thử đồ

Giao diện kem–cam–xanh ngọc đồng bộ HUD và túi đồ. Avatar và thanh mua/mặc nằm riêng, không che nhau. Desktop có danh mục bên phải; điện thoại có danh mục kéo ngang và lưới ba cột. Giữ tùy chỉnh tóc, da, khuôn mặt, phụ kiện, áo/quần/giày, bộ phối, góc nhìn và tạo dáng.

Header/mode/tiền dùng icon farm-v2. Thumbnail chụp mesh từ preview engine hiện có; áo/quần/giày/tóc được tách và căn theo bounding box. Cửa hàng giữ giá, trạng thái đang mặc/đã có; tủ đồ lọc sở hữu. Nút mua khóa khi thiếu xu hoặc mất kết nối. Luồng fashion_save_customization trong App được giữ. Escape đóng và Tab giữ focus trong dialog.

Kiểm chứng: test-fashion-boutique.mjs, test-inventory-fashion-mesh.mjs; build production. Trình duyệt kiểm tra mở từ HUD, thử hoodie 220 xu, bỏ thử, tủ đồ sở hữu và bố cục iframe 390×844. desktop.png/mobile.png dùng HUD fixture; không mua hoặc lưu trang phục trên tài khoản thật. Build vẫn có cảnh báo chunk lớn.
