# Mô phỏng kinh tế trước mua đất — 06/10/2026

Chạy 32 seed cho mỗi kịch bản, 8 buổi/seed, hai buổi mỗi ngày lúc 09:00 và 19:00 Việt Nam. Số liệu là mô hình với giả định thao tác; chưa phải đo chơi thật.

## Luật và phạm vi

- Thời gian và tỷ lệ thành công là giả định, chưa đo telemetry; các phân vị chỉ thể hiện biến động trong mô hình.
- Hai buổi mỗi ngày lúc 09:00/19:00 Việt Nam; điểm danh giữ giờ đổi ngày UTC như server hiện tại.
- Sau mốc đủ tiền mua đất, mô hình tiếp tục câu cá để so sánh dòng tiền; số dư những buổi sau không phải nông trại sau khi mua.
- Phiên câu chưa xong khi hết buổi mất mồi và không nhận cá; cá, mồi dư và tiến độ đi lại được giữ; không tạo thu nhập offline.
- Xu luôn nguyên; bán cả thùng dùng trọng lượng trung bình và cách làm tròn của server; cá chưa bán không được tính là xu mua đất.
- Mua cần trúc một lần, giữ thùng 10 con; chưa nâng cần/thùng. Không tính hao độ bền vì server chưa áp cơ chế này.
- Chỉ xét lô rẻ nhất. Chưa mô phỏng lô cao cấp, phí dịch chuyển nhanh, chiến lược đơn NPC, casino hoặc việc nhờ người chơi khác.
- Giá lô cao cấp và code đã phát hành cần chính sách chuyển tiếp riêng. Phương án thử chỉ chạy offline.

## Giả định thao tác

| Kiểu chơi | Đi quầy → bờ lần đầu | Đi mỗi chiều khi bán | Thao tác cast | Nghỉ/thao tác giữa lượt | Hook thành công | Kéo cá hiếm thành công |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| fast | 60s | 15s | 1.2s | 1.2s | 98% | 95% |
| regular | 180s | 45s | 2.5s | 3s | 90% | 80% |
| relaxed | 240s | 75s | 5s | 6s | 75% | 60% |

Thời gian cắn câu lấy từ config; cá hiếm chạy chính luật tension/pull server với chiến lược thao tác giả định. Tỷ lệ kéo thành công là giả định chọn chiến lược tốt hoặc thao tác sai, không thay xác suất của server.

## Mốc mua lô — chơi thông thường, không mồi

| Phương án | Phút/buổi | P10/P50/P90 phút chơi tới đủ xu | Buổi mua P50 | Đạt trong mô phỏng | Vốn còn P50 |
| --- | ---: | --- | ---: | ---: | ---: |
| current-no-codes | 15 | 25.07 / 28.2 / 29.57 | 2 | 32/32 | 111 |
| current-no-codes | 30 | 25.24 / 28.3 / 29.51 | 1 | 32/32 | 140 |
| current-no-codes | 60 | 25.24 / 28.3 / 29.51 | 1 | 32/32 | 119 |
| current-all-codes | 15 | 0 / 0.0 / 0 | 1 | 32/32 | 180 |
| current-all-codes | 30 | 0 / 0.0 / 0 | 1 | 32/32 | 180 |
| current-all-codes | 60 | 0 / 0.0 / 0 | 1 | 32/32 | 180 |
| trial-no-codes | 15 | 81.07 / 85.4 / 89.3 | 6 | 32/32 | 138 |
| trial-no-codes | 30 | 84.01 / 87.5 / 89.9 | 3 | 32/32 | 155 |
| trial-no-codes | 60 | 84.44 / 88.0 / 92.77 | 2 | 32/32 | 68 |
| trial-future-codes | 15 | 76.98 / 81.2 / 85.23 | 6 | 32/32 | 120 |
| trial-future-codes | 30 | 80 / 83.2 / 86.26 | 3 | 32/32 | 135 |
| trial-future-codes | 60 | 80.71 / 84.4 / 88.53 | 2 | 32/32 | 122 |
| trial-existing-codes | 15 | 58.74 / 60.0 / 61.6 | 5 | 32/32 | 119 |
| trial-existing-codes | 30 | 59.27 / 61.2 / 63.26 | 3 | 32/32 | 118 |
| trial-existing-codes | 60 | 59.27 / 62.5 / 66.28 | 2 | 32/32 | 148 |

P10/P50/P90 chỉ tính những lượt đã đạt; luôn xem cùng tỷ lệ đạt để tránh đọc sai kịch bản chưa đủ thời gian. Mốc 0 phút là mua bằng thưởng ban đầu, trước mua cần câu.

## Độ nhạy tốc độ chơi — buổi 30 phút, không mồi

| Phương án | Kiểu chơi | P50 phút tới đủ xu | P90 | Buổi mua P50 | Đạt |
| --- | --- | ---: | ---: | ---: | ---: |
| current-no-codes | fast | 13.6 | 14.46 | 1 | 32/32 |
| current-no-codes | regular | 28.3 | 29.51 | 1 | 32/32 |
| current-no-codes | relaxed | 49.9 | 53.87 | 2 | 32/32 |
| current-all-codes | fast | 0.0 | 0 | 1 | 32/32 |
| current-all-codes | regular | 0.0 | 0 | 1 | 32/32 |
| current-all-codes | relaxed | 0.0 | 0 | 1 | 32/32 |
| trial-no-codes | fast | 44.2 | 45.19 | 2 | 32/32 |
| trial-no-codes | regular | 87.5 | 89.9 | 3 | 32/32 |
| trial-no-codes | relaxed | 155.4 | 162.31 | 6 | 32/32 |
| trial-future-codes | fast | 41.8 | 42.88 | 2 | 32/32 |
| trial-future-codes | regular | 83.2 | 86.26 | 3 | 32/32 |
| trial-future-codes | relaxed | 146.6 | 152.55 | 5 | 32/32 |
| trial-existing-codes | regular | 61.2 | 63.26 | 3 | 32/32 |

## Mồi — hiện tại, buổi 30 phút, không giftcode

| Mồi | P50 phút tới đủ xu | Xu ròng buổi đầu P50 | Cá bắt TB toàn kỳ | Cá thoát TB |
| --- | ---: | ---: | ---: | ---: |
| Không mồi | 28.3 | 1972 | 635.63 | 83.72 |
| bait_worm | 36.4 | 1512 | 614.84 | 79.44 |
| bait_lure | 111.7 | 408 | 389.41 | 69.63 |
| fish_chum | Chưa đạt | 129 | 292.34 | 43.72 |

Mua mồi theo gói nguyên, trừ tiền cả lần cá thoát; khi thiếu vốn thì câu không mồi cho tới đủ tiền bổ sung. So sánh này giữ thùng 10 và cần trúc. Kịch bản mồi có thêm đi lại mua mồi khi hết.

## Ngân sách thưởng hiện hành

| Nguồn | Xu | Có thể dùng trước mua đất |
| --- | ---: | --- |
| Ban đầu | 180 | Có |
| Toàn bộ code đang bật | 1800 | Có, một lần |
| Điểm danh đủ 7 ngày | 3000 | Có, theo ngày |
| Nhiệm vụ câu cá | 160 | Có, khi đủ điều kiện |
| Hướng dẫn nông trại | 250 | Sau mua/hoàn thành hướng dẫn |
| Quest cũ | 145 | Cần hành động nông trại |
| Chính tuyến | 1690 | Cần hoàn thành hướng dẫn |
| Daily nông trại mỗi ngày | 105 | Cần hoàn thành hướng dẫn |

Đơn hàng nằm trong catalog nhưng cần tiêu nông sản nên không cộng như thưởng miễn phí. Trước mua đất, daily tưới cây vẫn bị điều kiện hoàn thành hướng dẫn chặn dù có thể giúp tưới vườn người khác.

## Ví dụ dòng tiền từng buổi — seed 1, hiện tại, 30 phút, không code

| Buổi | Xu đầu | Bán cá | Điểm danh | Mission cá | Chi cần/mồi | Xu cuối | Cá chưa bán |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 180 | 1762 | 200 | 160 | -150 | 2152 | 1 |
| 2 | 2152 | 2190 | 0 | 0 | 0 | 4342 | 3 |
| 3 | 4342 | 2112 | 250 | 0 | 0 | 6704 | 0 |
| 4 | 6704 | 1775 | 0 | 0 | 0 | 8479 | 10 |

## Phương án thử và điều kiện áp dụng

Phương án offline: lô rẻ nhất 6.000 xu; ngân sách code phát hành mới tổng 300 xu; điểm danh [100, 120, 140, 160, 180, 220, 300] (1.220 xu/7 ngày). Giữ giá cá và chu kỳ câu để đo tác động độc lập. Đây là một phương án thử, chưa thay config game.

Không giảm giá trị code đã phát hành hoặc thu hồi xu đã nhận. Hàng trial-existing-codes mô phỏng giữ nguyên tổng code cũ khi áp giá lô thử, để thấy ảnh hưởng chuyển tiếp. Không coi việc đổi giá lô riêng là cân xong: nghề trước mua, nội dung buổi đầu, giá khai hoang và recipe vẫn cần tiếp tục.

Mục tiêu kiểm tra chính: regular, buổi 30 phút, không mồi đạt P50 trong 60–120 phút và khoảng buổi 2–4; người dùng code tương lai không mua ngay. Fast/relaxed là độ nhạy, không ép mọi người cùng thời gian.

Mốc an toàn cộng 20 xu vốn (4 hạt cà rốt) được báo riêng trong JSON/CSV. Hướng dẫn cấp 50 xu + 3 hạt chỉ được dự báo sau mua, không cộng vào ví trước mua. Thời gian nhận hướng dẫn và vụ đầu chưa mô phỏng ở bước này.

## Bước tiếp

1. Đo thời gian di chuyển tới quầy/bờ, số giây giữa cast, hook thành công và thời gian bán ở phiên chơi thật.
2. Thay các giả định profile bằng số đo rồi chạy lại cùng seed; thử độ nhạy quanh giá lô và ngân sách thưởng.
3. Xây nhiệm vụ trước mua đất để người chơi không chỉ lặp câu cá 60–120 phút.
4. Sau khi đường mua lô ổn định, mở rộng simulator sang sản xuất 4 ô và tiến trình khai hoang.

Lệnh chạy: `npm run simulate:economy -- --seeds 32 --sessions 8`. Có thể tăng seed tới 1.000; `--output` chọn thư mục kết quả. Không kết nối MongoDB hoặc sửa ví/config cân bằng của game.
