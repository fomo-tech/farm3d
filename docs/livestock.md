# Chăn nuôi

Trong lô đất của mình, chọn **Quản lý chăn nuôi**. Xây chuồng cho từng loài, mua con giống, cho ăn; thu trứng gà/vịt và sữa. Heo hết thời gian nuôi được bán trực tiếp và rời đàn. Sản phẩm trong kho có thể bán tại cùng bảng quản lý.

Giá con giống, giá xây chuồng, thức ăn, sức chứa, thời gian sản xuất, giá bán và vị trí/màu/dao động mô hình nằm trong `shared/farmConfig.js`. Mặc định mỗi loài tối đa 3 con. Chưa có nâng cấp sức chứa chuồng, bệnh, sinh sản hoặc thức ăn dạng vật phẩm.

Server kiểm tra quyền sở hữu từ farm_assignments, tính giá từ config và lưu với revision để chống giao dịch cạnh tranh. Cho ăn chỉ bắt đầu chu kỳ khi không còn sản phẩm đang chờ; không xóa hay đặt lại chu kỳ cũ. Đàn cũ được giữ và nhận ID ổn định nếu thiếu. Sản phẩm maturePig cũ vẫn bán được từ kho; đàn mới không tạo vật phẩm đó.

Đàn công khai được đồng bộ với scope nông trại. Mô hình chỉ được tạo trong chuồng chi tiết đang cư trú, không còn bò trang trí giả. Một observer mỗi chuồng, bỏ qua chuồng đang ẩn; dispose theo vòng đời farm buildings. Cấu trúc chuồng dùng chung hiện có, chưa phải bốn công trình riêng biệt.

Kiểm thử: `npm run test:livestock` (MongoDB tạm, tự dọn), `npm run test:farm-config`, `npm run build`.

Kiểm tra trình duyệt 2026-10-04 trên server/DB riêng: nút quản lý xuất hiện với đàn rỗng; xây chuồng gà trừ 80 xu, mua gà trừ 60 xu, tài khoản nhận 1 con. Đã phát hiện và sửa nút bị thanh tiền che. Chưa xác nhận trọn vòng cho ăn–chờ–thu–bán trên UI: các lần nạp lại sau đó gặp FPS 1–4 và BOOT TIMEOUT trong cả IAB và Chrome. Không coi đây là kiểm chứng hết lag hoặc hoàn tất toàn bộ QA. Logic thu/bán đã qua kiểm thử Mongo trực tiếp.
