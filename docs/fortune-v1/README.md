# Thần Tài và vé may mắn

NPC mesh 3D ở quảng trường (18,14), nhấn E trong bán kính 5m hoặc chạm NPC/nút tương tác. Menu điện thoại có mục Vé may mắn để xem vé/kết quả, mua chỉ khi đến quầy.

100 xu/vé, Tối đa 5 vé/ngày và 5 vé/kỳ. Sáu số tự chọn hoặc server chọn ngẫu nhiên. Kỳ quay 20:00 Asia/Ho_Chi_Minh, đóng bán 19:55. Sau 20:00 bán kỳ tiếp theo. Giải cao nhất duy nhất: 6 số 50.000 xu; 3 số cuối 3.000 xu; 2 số cuối 300 xu. Chỉ xu trong game.

Server tạo và lưu một kết quả ngẫu nhiên mật mã cho mỗi kỳ, kèm SHA-256 commitment. Winner/salt chỉ được gửi sau giờ quay. Không dùng đồng hồ, số dư hoặc kết quả do client gửi. Hệ thống đọc kết quả theo thời gian server nên không cần cron và không quay lại khi restart. Vé và cờ đã nhận thưởng nằm trong progress có revision guard; request cache WebSocket chống gửi lặp. Vé chưa nhận không tự hết hạn.

Kiểm thử: scripts/test-lottery.mjs dùng database test ngẫu nhiên, kiểm tra mua xa quầy, số sai, số dư, giới hạn, thời điểm đóng bán, kết quả dùng chung/ẩn trước giờ quay, các giải và nhận lặp. Browser preview: fortune-preview.html và fortune-review.html; không ghi dữ liệu tài khoản.
