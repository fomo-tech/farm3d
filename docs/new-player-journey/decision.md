# Quyết định cân nhịp người chơi mới — 07/10/2026

Đã chạy 576 lượt tham chiếu (32 seed × ba mức thời gian × ba kỹ năng × hai chiến lược), 48 lượt thử ba bảng giá và 96 lượt xác nhận bảng đã chọn. Không cấp thêm xu, không dùng giftcode; dùng giá và luật hiện hành trong từng phiên bản cấu hình. Đây là mô hình với thời gian thao tác giả định, chưa phải đo người chơi thật.

## Mua đất

Giữ giá lô 6.000–12.000 xu, không giảm giá bán nông sản hoặc tăng thưởng chung.

| Người chơi thông thường | Ngày mua trung vị / P90 | Vốn sau tân thủ trung vị |
| --- | --- | --- |
| 30 phút/ngày | 3 / 3 | 445 xu |
| 60 phút/ngày | 2 / 2 | 474 xu |
| 120 phút/ngày | 1 / 1 | 443 xu |

Mục tiêu 1–2 ngày được hiểu cho nhóm thông thường chơi từ 60 phút/ngày và mua lô rẻ nhất. Nhóm thao tác chậm, 30 phút/ngày cần khoảng năm ngày. Không tuyên bố mọi người chơi hoặc mọi vị trí lô đều đạt 1–2 ngày.

Vốn còn lại cùng hai hạt miễn phí đủ bắt đầu vụ tiếp theo. Không cần khoản phí mở ô bắt buộc sau mua đất.

## Khai hoang

Áp dụng `LAND_EXPANSION_CONFIG.version = 3`:

| Ô mở thêm | Giá cũ | Giá mới | Phút mỗi ô trung vị trong thử nghiệm 60 phút/ngày |
| --- | --- | --- | --- |
| 5 | 2.500 | 2.500 | 18,38 |
| 6 | 5.000 | 6.500 | 20,64 |
| 7 | 6.500 | 7.000 | 14,87 |
| 8 | 8.000 | 8.000 | 27,58 |

Bảng cũ cho ô 6 khoảng 8,17 phút chơi, do thu vụ đã chín trong thời gian offline. Bảng mới làm nhịp ô 5–8 gần mục tiêu 15–30 phút hơn; tổng thời gian từ mua đất tới tám ô tăng khoảng 82 → 88,75 phút ở mẫu thử. Bảng tăng mạnh hơn (2.500/7.000/8.000/9.000) kéo ô 8 vượt 30 phút nên không chọn.

Các con số theo phút chơi không bao gồm thời gian offline; từng ô không tăng đều vì vụ mùa, XP, đơn và lịch buổi tạo bước nhảy thu nhập. Không ép từng người chơi vào đúng một khoảng cố định.

Giữ ô 9–24, yêu cầu cấp và liền kề. Giữ bốn ô ban đầu; chuồng ở khu riêng. Save cũ giữ nguyên xu và mọi ô đã mở, không thu bù tiền. Giá mới chỉ áp dụng lần khai hoang tiếp theo sau khi server/client nhận cấu hình mới.

## Simulator và kiểm tra

Nối hai giai đoạn bằng cùng ví, XP, thống kê câu cá, snapshot nhiệm vụ ngày và điểm danh. Trừ giá lô một lần; trừ 10 phút tân thủ khỏi lịch chơi; giữ hai hạt còn lại và đơn đầu đã giao. Chặn điểm danh lặp trong các buổi cùng ngày. Mỗi mở ô giữ vốn một vụ.

Đã đạt: kiểm thử hành trình mới, simulator câu cá, simulator nông trại, nhiệm vụ trước đất, hoạt động nhiệm vụ, cảnh báo vốn và giá khai hoang trên MongoDB thử riêng; build thành công. Kiểm tra va chạm đã sửa giả định bồn hoa cũ và đạt, không thêm vật cản vô hình vào cảnh.

Chạy lại:

```
npm run simulate:new-player-journey
npm run test:new-player-journey
npm run test:land-expansion-prices
```

`results.json` là bảng giá phiên bản 2 trước điều chỉnh; `selected/results.json` là phiên bản 3 đã chọn. `expansion-trials.json` lưu so sánh ba bảng thử. Chưa khởi động lại hoặc triển khai server production trong đợt này.
