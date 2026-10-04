# Cấu hình nông trại dùng chung

Chỉnh `shared/farmConfig.js`. Client và server cùng nhập file này; không đổi ID đã có trong dữ liệu người chơi. Thời gian dùng mili giây, giá dùng xu.

- `crops`: danh mục bốn cây đang chơi, giá hạt, giá bán, cấp mở khóa, thời gian lớn và màu.
- `care`: thời gian hướng dẫn, phí cho ăn cả đàn, kinh nghiệm cho ăn/thu sản phẩm và thời gian đói mặc định.
- `animals`: thời gian đói, thời gian tạo sản phẩm và loại sản phẩm của gà, vịt, heo, bò sữa.
- `products`: tên sản phẩm. `maturePig` hiện là quy ước cấu hình, chưa phải tính năng bán heo hoàn chỉnh.
- `buildings.barn`: sức chứa, sức chứa tăng theo cấp, hệ số giá nâng kho.
- `expansions`: số ô, giá và cấp mở rộng.
- `visuals`: ngưỡng cập nhật bốn giai đoạn cây, hệ số kích thước model cây.

Cấu hình được kiểm tra và đóng băng khi import. Chạy `npm run test:farm-config` sau khi sửa, khởi động lại server và tải lại client. Không đổi giá trị âm, ID, hay tham chiếu sản phẩm tùy tiện. Thêm ID cây mới vẫn cần bổ sung model, icon và tương thích inventory; thêm vật nuôi vẫn cần cơ chế mua, chuồng, hiển thị và lưu dữ liệu.

Phạm vi đợt này: hợp nhất cấu hình đang hoạt động, giữ cân bằng và dữ liệu cũ, thu sản phẩm theo loài, không mất lượt thu nếu kho đầy. Chưa hoàn thành redesign model cây, giao diện chăm sóc, mua/chăn nuôi đủ bốn loài, công cụ mới hoặc hợp nhất cấu hình đơn hàng/công thức/nhiệm vụ.
