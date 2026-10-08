# Trang phục theo tỉ lệ khớp avatar

Sửa chiều dài tay áo từ 0.63 xuống tổng chiều dài cánh tay + cẳng tay trong CHARACTER_RENDER_CONFIG (hiện tại 0.42). Tay ngắn và vai trần dùng độ dài theo cánh tay trên. Vòng nách được đặt thấp hơn để nằm dưới cổ áo. Bề mặt nối vai tính cả scale của cánh tay nam/nữ; phần uốn khuỷu dùng cùng miền chuyển tiếp với bề mặt da.

Dùng một lớp tay áo liên tục thay vì các bề mặt chồng nhau; bo cổ tay chỉ hiện với áo dài tay. Thumbnail thời trang/túi đồ nhận diện bề mặt tay áo mới; bỏ phần vai da khi chụp áo không tay. Cache thumbnail đổi phiên bản.

Kiểm tra: test-clothing-fit (toàn bộ TOPS/BOTTOMS, ba dáng cơ thể, giới hạn cổ tay, nách dưới cổ áo, không nhân scale khi đổi áo, bo cổ tay); test-fashion-boutique; test-inventory-fashion-mesh; test-avatar-appearance. Trình duyệt thử hoodie trên nam/nữ và vẫy tay. Ảnh male.png/female.png từ fixture, không lưu trang phục tài khoản thật.
