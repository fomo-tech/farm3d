# Cây táo nông trại

Mỗi lô có một cây táo ở tọa độ tương đối (-7.2, -3). Cây ra 10 quả sau 4 giờ thực, tiếp tục chạy khi offline. Quả chín giữ nguyên tới khi thu; không cộng thêm các đợt bỏ lỡ. Thu thành công xóa quả trên mesh và bắt đầu 4 giờ tiếp theo. Mua đất mới đặt thời điểm chín đầu tiên sau 4 giờ. Trại cũ dùng thời điểm mua đất (hoặc ngày tạo tài khoản cho dữ liệu cũ) nếu chưa có đồng hồ táo.

Chạm cây để mở HUD nhỏ có thời gian chín. Chủ trại chọn Hái 10 quả: nhân vật đi tới, phát hoạt ảnh hái rồi gửi yêu cầu. Server kiểm tra quyền sở hữu, đang ngoài cửa hàng, khoảng cách 3 m, thời điểm chín và 10 chỗ trống trong kho. Lưu theo phiên bản tài khoản để hai yêu cầu đồng thời chỉ thu một lần. Đóng HUD hủy thao tác chưa gửi.

Táo vào mục Nông sản của túi đồ, có mesh táo riêng và bán 9 xu/quả. Giá bán do server quyết định. Không nhận thưởng khi cây chưa chín hoặc kho đầy, không làm mất đợt quả đang chín.

## Cân đối kinh tế

Cây miễn phí kèm lô đất: 10 × 9 = 90 xu/đợt, tối đa 22.5 xu/giờ hoặc 540 xu/ngày nếu thu đủ 6 đợt. Để so sánh, một ô cà rốt hiện có 4 sản phẩm × 12 xu, trừ 5 xu hạt giống, trong 30 phút: 86 xu/giờ trước tác động ăn trộm. Cây táo đạt khoảng 26% mức đó, phù hợp nguồn thu phụ khi quay lại game. Đây là so sánh thu nhập lý thuyết từ cấu hình hiện tại, không thay thế số liệu chơi thực tế.

Kiểm tra: `node scripts/test-apple-orchard.mjs` (đồng hồ, kho, giá, tương tác và mesh thật), `node scripts/test-livestock-server.mjs` (MongoDB thử nghiệm riêng: quyền, khoảng cách, giao dịch đồng thời, thu, bán, trạng thái công khai).
