# Kiểm chứng hành trình sau mua đất — 2026-10-07

Đã cập nhật scripts/test-land-purchase.mjs theo giá đất hiện tại, 4 ô ban đầu và phiên bản vị trí nông trại hiện hành. Chạy npm run test:land thành công trên server WebSocket và MongoDB thử nghiệm riêng; database được xóa sau kiểm tra.

Các chặng đã xác nhận:

- Tài khoản mới chưa có đất, nhà hoặc ô trồng; không nhận hạt trước khi mua đất.
- Giá của 288 lô do server xác định; payload giá giả không làm giảm tiền mua. Hai người mua cùng lô chỉ một người thành công.
- Mua đất cấp 4 ô và nhà cấp 1, trừ đúng giá; không mua thêm lô bằng tài khoản đã sở hữu đất.
- Nhận hạt một lần, xới/gieo/tưới/thu hoạch; payload thời gian giả không cho thu hoạch sớm, thu hoạch lại bị chặn.
- Hoàn tất bước giải thích rồi giao đơn starter: tiêu đúng một cà rốt, nhận 65 xu; hoàn tất hướng dẫn nhận 200 xu và xe đạp.
- Không hoàn tất hướng dẫn sớm; không nhận lại hạt hoặc thưởng hoàn tất. Bộ daily, baseline và lịch sử thưởng trong ngày không bị reset.
- Trồng vụ bình thường tiếp theo, bán đúng số sản phẩm và giá; số lượng bán không hợp lệ bị chặn.
- Đăng nhập lại giữ tiền/kho/đất; khôi phục giao dịch đất và thao tác ruộng sau restart server thử nghiệm. Quyền sở hữu save cũ được giữ.

Giới hạn: bài test cấp vốn vào database thử nghiệm để kiểm tra giao dịch, và điều chỉnh thời gian cây trong fixture để kiểm tra thu hoạch. Không dùng kết quả này để kết luận thời gian kiếm đủ tiền hoặc cảm giác chơi. Chặng câu/bán trước đất và daily được kiểm tra riêng trong test:pre-land-missions và test:economy-rewards ở các đợt trước. Chưa chơi thử toàn hành trình bằng giao diện, chưa restart server thật.

Trong lượt này không đổi giá, thưởng hoặc dữ liệu người chơi thật. git diff --check đạt.
