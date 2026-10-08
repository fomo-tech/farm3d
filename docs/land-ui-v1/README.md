# Mua đất và quyền sử dụng đất

Giao diện kem, xanh lá nhạt và cam, dùng icon WebP đang có trong HUD. Tab chọn mua đất hiển thị lô dạng thẻ, lọc theo làng/đủ xu, giá thấp trước và phân trang. Chọn lô hiện giá niêm yết, giá phải trả, số dư sau mua, nút đến cổng làng và mua; thiếu tiền khóa nút và ghi số xu thiếu.

Tab quyền sử dụng hiển thị lô, mã lô, tên chủ và trạng thái từ catalog server, kèm quyền trồng trọt/phát triển nông trại và giới hạn một lô. Lô được mở từ bảng cổng vẫn được ưu tiên khi đã sở hữu đất. Callback giao dịch buy_land giữ nguyên; không thay đổi giá, quyền hoặc backend.

Kiểm tra App bindings, land config 288 lô, production build. Kiểm tra trình duyệt: đủ xu, thiếu 200 xu/nút khóa, lô đã sở hữu, bố cục iframe 390×844. Fixture landDemo/landOwned dùng dữ liệu giả, không mua đất tài khoản thật.

Ảnh: purchase.png, rights.png, mobile.png.
