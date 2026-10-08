# Nhiệm vụ — đợt 3 (2026-10-07)

## Chính tuyến sau mua đất

Schema phiên bản 4. Năm chương, mỗi chương ba nhiệm vụ:

1. Vụ mùa đầu tiên: thu hoạch 3 ô, gieo 5 lần, tưới 5 lần.
2. Giao hàng và chế biến: thu hoạch 6 ô, giao 2 đơn, chế biến 1 sản phẩm.
3. Chăm đàn vật nuôi: cho ăn 2 rồi 4 lượt vật nuôi cộng dồn (mỗi con trong một lần cho ăn tính một lượt), giao 3 đơn.
4. Nông trại ổn định: thu hoạch 10 ô, chế biến 3 sản phẩm, gieo 15 lần.
5. Khai hoang đất trồng: sở hữu 5, 8, 12 ô đã khai hoang.

Giữ nguyên 12 ID và thưởng cũ, sắp xếp lại thứ tự để trồng trọt được hướng dẫn trước chăn nuôi. Lịch sử đã nhận được giữ theo ID, không giả định một prefix theo thứ tự cũ; nhiệm vụ tiếp theo là ID chưa nhận đầu tiên trong thứ tự mới. Không xóa XP/xu hoặc thu hồi đất. Tiến độ chính tuyến vẫn cộng dồn, chưa chuyển sang baseline lúc nhận.

Ba mốc mới main-land-5/8/12 thưởng 100/150/200 xu, 50/75/100 XP. Tổng thêm một lần 450 xu/225 XP; toàn chính tuyến 2.140 xu/1.070 XP. Mốc được kiểm tra bằng danh sách ô hợp lệ thực tế, không đọc stats.landTiles hoặc payload người chơi. Giá khai hoang không đổi; phải mua ô trước, rồi mới đủ nhận thưởng. Save cũ đã mở đất được nhận mốc mới một lần sau khi hoàn tất các nhiệm vụ cũ chưa nhận. Chuồng ở khu riêng, không chiếm ô trồng.

Sổ nhiệm vụ dùng chung tên chương từ shared/missions.js, có nút đi khai hoang. Tiến độ chương phản ánh ba nhiệm vụ đã nhận; không hứa rương hoặc khoản thưởng chương ngoài các khoản trên.

## Daily theo tiến trình

Mỗi ngày giữ ba nhiệm vụ, ngân sách đúng 105 xu/55 XP. Bộ trước đất câu/bán cá giữ nguyên. Sau đất:

- Ô thưởng 30 xu: gieo 2 hạt.
- Ô thưởng 40 xu: thu hoạch 2 ô, hoặc giao 1 đơn nếu đã giao đơn trước đó.
- Ô thưởng 35 xu: tưới 2 ô; hoặc cho 1 vật nuôi ăn nếu có vật nuôi tạo sản phẩm; hoặc chế biến 1 sản phẩm nếu đã chế biến và có khả năng tự tạo nguyên liệu một công thức.

Chọn ổn định theo tài khoản/ngày, thay đổi ở ngày mới. Không yêu cầu có sẵn nguyên liệu trong kho lúc cấp nhiệm vụ: mục tiêu có thể làm trong ngày bằng trồng/chăn nuôi. Công thức trồng cần đủ cấp; công thức sản phẩm vật nuôi cần có loài tạo nguyên liệu. Đàn chỉ có heo bán lấy thịt không được chọn daily cho ăn/chế biến nếu không có nguồn thích hợp khác.

Giữ snapshot ID, baseline và claim của ngày hiện tại, kể cả khi mua/bán vật nuôi hoặc tăng cấp. Không nhận được nhiệm vụ ngoài bộ, không thêm nhiệm vụ thứ tư, không cộng thưởng daily lên trên 105 xu. Ngày reset 00:00 giờ Việt Nam. Save cũ chưa có ids được giữ bộ trồng cũ trong ngày đó. Chưa thêm đổi nhiệm vụ một lần/ngày; nếu người chơi bán hết đàn sau khi nhận daily chăm sóc, nhiệm vụ đó có thể cần mua lại vật nuôi hoặc chờ ngày mới.

## Kinh tế

Giữ tiền đầu 180, mã đã phát hành 1.800, điểm danh 1.220/tuần, giá lô 6.000–12.000, thưởng tân thủ 250 và thành tích cũ 145. Mô phỏng trước đất không đổi bởi nội dung sau đất.

Simulator sau đất đã dùng snapshot daily cá nhân hóa, sự kiện order/craft/feed thật và số ô đã mở thực tế. So sánh 18 điều kiện có thưởng (cây/đơn/kết hợp ×15/30/60 phút ×20/250 xu vốn), 14 buổi, cùng cấu hình sản xuất. Baseline đợt 2: phase-3-baseline.json; kết quả so sánh: phase-3-economy.json.

Tham chiếu kết hợp, vốn 250, 30 phút/buổi:

| Chỉ số | Trước | Sau |
| --- | --- | --- |
| Ô cuối 14 buổi | 14 | 14 |
| Xu còn lại | 9.898 | 10.853 |
| Thưởng chính tuyến đã nhận | 1.690 | 2.140 |
| Thưởng daily 14 ngày | 1.470 | 1.470 |
| Phút chơi tới 8 ô | 60,88 | 60,83 |
| Phút chơi tới 12 ô | 227,21 | 227,17 |

Chênh tiền cuối lớn hơn 450 vì XP và thứ tự nhiệm vụ thay đổi thời điểm chọn cây/hoạt động. Đây là mô phỏng giả định, không chứng minh mọi người chơi có kết quả như nhau. Chưa thêm việc đi bộ, trộm hoặc câu cá sau đất vào simulator nông trại. Tiền còn lại và tốc độ mở ô phải đọc cùng ledger, không chỉ cộng thưởng danh nghĩa.

## Kiểm tra

Unit: 15 ID duy nhất, migration giữ claim cũ, thứ tự mới, chọn daily ổn định/đủ điều kiện, trần 105, giữ snapshot khi thay đàn, mốc đất bỏ qua stat giả. Server/MongoDB riêng: order/feed/craft thành công mới tăng tiến độ, nhận ngoài bộ và payload giả bị từ chối, nhận lặp/concurrent chỉ trả một lần, baseline ngày và lịch sử nhiệm vụ giữ nguyên. Regression tân thủ trước đất, simulator và build được kiểm tra.

Chưa reset tài khoản thật hoặc restart server. Tiếp theo nên chạy thử hành trình thật và kiểm tra nhiệm vụ bị kẹt, rồi mới mở nghề/sưu tầm hay tăng thêm ngân sách thưởng.
