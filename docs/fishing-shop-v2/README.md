# Tiệm đồ câu Lão Ngư

Thay panel danh sách cũ bằng FishingShopModal: bốn mục đồ câu, trang bị, thùng cá và bộ sưu tập. Tông kem, cam và xanh đồng bộ cửa hàng vật tư; danh mục có ảnh dụng cụ, thông số và giá từ cấu hình chung.

Giữ nguyên các action máy chủ fishing_buy, fishing_equip, fishing_sell, fishing_claim_mission và callback bán toàn bộ. Khóa thao tác khi mất kết nối; không mua lại cần/thùng đã sở hữu. Hiển thị trạng thái đang dùng, chưa sở hữu, lượng mồi và sức chứa.

Kiểm tra: app bindings, fishing config và fishing session PASS. Browser fixture kiểm tra bốn mục, đổi mồi, thùng trống và bố cục 390×844; không có console error. Không giao dịch trên tài khoản thật. Ảnh desktop.png và mobile.png.

Preview: /hud-preview.html?fishingShopDemo=1; điện thoại /fishing-shop-review.html.
