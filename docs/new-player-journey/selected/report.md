# Nhịp kinh tế người chơi mới

32 seed × 3 mức thời gian × 1 kỹ năng × 1 chiến lược = 96 lượt, mỗi lượt 14 ngày. Không cấp xu, không giftcode. Giữ nguyên giá/thưởng game.

| Phút/ngày | Kỹ năng | Ngày mua P50 / P90 | Phút chơi mua P50 | Mua ≤2 ngày | Vốn sau tân thủ P50 | Ngày mở ô 5 P50 | Ngày mở ô 8 P50 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 30 | regular | 3 / 3 | 81.42 | 0/32 | 445 | 4 | 6 |
| 60 | regular | 2 / 2 | 84.41 | 32/32 | 474 | 2 | 3 |
| 120 | regular | 1 / 1 | 86.94 | 32/32 | 443 | 1 | 2 |

## Luật nối hai giai đoạn

- Hai buổi 09:00 và 19:00 Việt Nam; 30/60/120 phút mỗi ngày là 15/30/60 phút mỗi buổi. Ngân sách bao gồm thời gian chờ và đi lại câu cá.
- Dừng câu tại mốc đủ tiền lô rẻ nhất, trừ giá lô đúng một lần. Chuyển XP câu cá, thống kê, điểm danh và snapshot nhiệm vụ ngày sang nông trại; không cấp ví mới, không nhận điểm danh hoặc daily hai lần cùng ngày.
- Dành 10 phút chơi cho việc đi xem lô, nhận quà, gieo/tưới/thu vụ nhanh, giao đơn đầu và tốt nghiệp; thời gian này trừ vào các buổi còn lại, có thể qua ngày. Đây là giả định thời gian, chưa đo telemetry.
- Tân thủ cộng đúng 50 + 65 + 200 xu, 131 XP từ gieo/tưới/thu/giao đơn/tốt nghiệp, giữ hai hạt miễn phí còn lại. Đơn đầu được đánh dấu đã giao.
- Mở ô phải giữ đủ vốn một vụ cây đang chọn và đáp ứng cấp/liền kề. Mọi sản xuất, vật nuôi, chế biến, đơn, nhiệm vụ và khai hoang dùng chung ví/kho/ngân sách thao tác. Chuồng ở khu riêng.
- Sau tân thủ dùng simulator sản xuất hiện có, thao tác 2,5 giây; chưa tính đường đi giữa các hoạt động nông trại, mạng, trộm hoặc lựa chọn không tối ưu. Không tiếp tục câu cá sau mua đất.
- P10/P50/P90 chỉ tính lượt đạt mốc; xem số lượt đạt trong results.json. Đây là dự báo mô hình, không phải chứng minh nhịp chơi thực tế.

## Quyết định

Đọc kết quả theo mức phút/ngày và kỹ năng. Chỉ điều chỉnh cấu hình production khi có bằng chứng mục tiêu của nhóm chơi chính lệch; không ép cả ba ngân sách chơi vào cùng ngày mua bằng cách tăng thưởng chung.
