# Thử giá khai hoang theo tổng kinh tế

180 kịch bản offline, tối đa 56 buổi, một buổi/ngày. Chuồng ở khu riêng, toàn bộ 24 ô dành trồng cây. Giá/thưởng production chưa đổi.

## Giá thử mỗi ô

| Phương án | Ô 5–8 | Ô 9–12 | Ô 13–18 | Ô 19–24 |
| --- | --- | --- | --- | --- |
| current | 350 | 700 | 1400 | 2400 |
| paced | 6000 | 20000 | 60000 | 120000 |
| long | 12000 | 40000 | 120000 | 240000 |

## Tham chiếu: kết hợp giá hiện tại, vốn 250 xu, 30 phút/ngày

| Giá đất | Đạt 8 ô: phút/buổi | 12 ô | 18 ô | 24 ô |
| --- | --- | --- | --- | --- |
| current | 18.4 / 1 | 26.5 / 1 | 44.7 / 2 | 59.5 / 2 |
| paced | 90.9 / 4 | 257.0 / 9 | 737.3 / 25 | 1427.8 / 48 |
| long | 176.1 / 6 | 497.0 / 17 | 1457.5 / 49 | Chưa đạt |

Phút là thời gian chơi tích lũy, buổi là ngày theo lịch giả định. Chưa đạt là chưa đạt trong horizon, không phải không bao giờ đạt. Không loại kịch bản chưa đạt để làm số trung bình đẹp hơn.

## Đối chiếu từng lần mở

| Giá | Kịch bản đạt 24 ô | Nhóm 5–8 trong 15–30 phút / số lần quan sát | Nhóm 9–12 trong 30–60 phút / số lần quan sát | Vi phạm vốn một vụ |
| --- | --- | --- | --- | --- |
| current | 60/60 | 18/240 | 0/240 | 0 |
| paced | 40/60 | 139/240 | 215/240 | 0 |
| long | 20/60 | 18/240 | 7/240 | 0 |

Các số đếm là độ bao phủ lưới kịch bản, không phải tỷ lệ người chơi hoặc xác suất thành công. Thời gian mỗi ô tính từ lần mở trước; ô 5 tính từ bắt đầu sau hướng dẫn, nên gồm mua đàn, chăm sóc và chờ cấp. Một số ô mở liên tiếp do tiền tích lũy sẵn. Nhóm chưa quan sát đủ không được coi là đạt nhịp.

## Vốn và giới hạn

Cùng mô hình combined-farm: ví/kho/thời gian dùng chung, có cây/đàn/chế biến/giao đơn/reset và XP; khai hoang dùng luật liền kề/cấp thật. Mỗi lần mở phải còn đủ vốn hạt một vụ theo cây chiến lược lúc mở. Báo cáo ghi coinsAfter/reserveRequired trong results.json; đây chưa phải bảo đảm vốn thức ăn cho mọi đợt hoặc mọi cây tương lai.

60 kịch bản cho mỗi bảng giá: 5 kiểu chơi, 2 mức vốn, buổi 15/30/60 phút, thao tác 2,5/5 giây. premium20 là giá chế biến thử offline, tách khỏi giá game hiện tại. Không tặng vật nuôi, không chiếm ô trồng và không cộng thưởng, câu cá, NPC mua nguyên liệu, giúp hàng xóm hoặc nâng kho. Chưa tính đi bộ/trộm/mạng/người chơi bỏ thao tác.

## Đánh giá

Giá current mở quá nhanh theo mô hình. paced kéo dài tiến trình nhưng chưa bảo đảm mọi ô đầu nằm trong 15–30 phút; long có nguy cơ làm nhóm đầu quá chậm. Chưa chọn bảng giá production. Cần đo chơi thật và kiểm tra nhịp từng ô trước khi chốt; không giảm giá bán để bù.
