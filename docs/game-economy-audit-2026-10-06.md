# Kiểm tra kinh tế game — 06/10/2026

Phạm vi: mã nguồn trong workspace hiện tại, gồm thay đổi chưa commit. Không truy cập database thật, không thay giá. Kết quả là kiểm tra luật server và tính toán từ config, chưa phải telemetry hoặc thử chơi nhiều client. Chạy lại bằng `node scripts/audit-game-economy.mjs`; số liệu gốc ở `game-economy-audit-2026-10-06.json`.

## Kết luận

Kinh tế hiện tại chưa đáp ứng PLAN mua lô sau 1–2 ngày và khai hoang chậm dần. Ưu tiên xử lý vòng mua/bán tạo xu trước khi cân giá; tiếp theo là ngân sách thưởng, câu cá và giá trị chế biến. Tăng riêng giá đất không giải quyết các nguồn tạo xu này.

## 1. Mua lô đầu có thể ngay ngày đầu

`server/GameStore.js`: khởi tạo 180 xu. `server/CommunityRewards.js`: ba code đang bật, không hết hạn, mỗi tài khoản nhận một lần: 500 + 1.000 + 300 = 1.800 xu. `shared/dailyAttendance.js`: ngày đầu 200 xu. Tổng 2.180 xu, vượt giá lô thấp nhất 2.000 trong `shared/landConfig.js`, còn 180 xu. Không cần có đất để nhận code/điểm danh. Các code có trong mã nguồn; chưa kiểm tra độ phổ biến với người chơi thực tế.

Điểm danh đủ 7 ngày cho 3.000 xu, trung bình khoảng 429 xu/ngày. Mốc ngày điểm danh là UTC (đổi ngày 07:00 Việt Nam), còn nhiệm vụ daily dùng múi giờ UTC+7. Hai hệ thống đổi ngày lệch nhau.

## 2. Vòng mua ven đường rồi bán lại tạo xu không giới hạn

Trong `server/GameStore.js`, `roadside_buy` dùng giá cố định, không stock/cooldown, không kiểm tra vị trí và không yêu cầu sở hữu đất. `sell_item` bán theo giá chuẩn, không yêu cầu cấp cây hay vị trí. Kho mặc định trước mua có hiệu lực 20 vật phẩm nên không chặn vòng mua rồi bán.

| Gói | Mua | Bán lại | Lãi/vòng |
| --- | ---: | ---: | ---: |
| 5 cà rốt | 50 | 60 | 10 |
| 4 lúa mì | 100 | 120 | 20 |
| 3 cà chua | 135 | 156 | 21 |
| 2 dâu tây | 210 | 240 | 30 |

Tài khoản 180 xu có thể bắt đầu ngay. Đây là đường tạo tiền bằng các yêu cầu hợp lệ nối tiếp, không cần nhân đôi giao dịch. Chưa đo tốc độ yêu cầu trên server chạy thật. Cần làm giá mua lớn hơn/ít nhất bằng tổng giá bán lại hoặc tách cơ chế chợ có stock, người bán và nguồn hàng thực.

## 3. Thu nhập cây trồng và tốc độ khai hoang

Vụ thường cho 4 sản phẩm/ô; lợi nhuận = 4 × giá bán − giá hạt. Vụ hướng dẫn có sản lượng 1, lớn 8 giây, không dùng để tính tốc độ lặp.

| Cây | Cấp | Phút/vụ | Lãi/ô/vụ | Lãi/ô/giờ lý thuyết |
| --- | ---: | ---: | ---: | ---: |
| Cà rốt | 1 | 1 | 43 | 2.580 |
| Lúa mì | 2 | 3 | 108 | 2.160 |
| Cà chua | 3 | 5 | 188 | 2.256 |
| Bí ngô | 4 | 7 | 312 | 2.674 |
| Dâu tây | 5 | 10 | 435 | 2.610 |
| Dưa hấu | 6 | 12 | 562 | 2.810 |
| Củ cải | 8 | 15 | 744 | 2.976 |

Cây cấp cao cho giá trị mỗi lần thao tác lớn hơn; cà rốt vẫn có hiệu quả thời gian cao hơn lúa mì/cà chua. Không thể đánh giá lựa chọn cây chỉ theo xu/giờ, cần đo thao tác và nhịp quay lại.

| Đang có ô | Giá ô kế | Lãi cà rốt/vụ toàn trại | Thời gian tích lũy liên tục lý thuyết |
| --- | ---: | ---: | ---: |
| 4 | 350 | 172 | 2,03 phút |
| 8 | 700 | 344 | 2,03 phút |
| 12 | 1.400 | 516 | 2,71 phút |
| 18 | 2.400 | 774 | 3,10 phút |

Đây là tỷ lệ giá/thu nhập, không phải thời gian hoàn thành thực: bỏ qua vốn ban đầu, thao tác, vụ tròn, đi lại, bán, trộm và yêu cầu cấp. Tổng mở thêm 20 ô là 27.000 xu. Giá tăng cùng diện tích nên công sức từng ô gần như giữ nguyên; chưa ra mốc 15–30 phút, 30–60 phút hoặc nhiều buổi.

Cấp 2/4/6 tương ứng tổng XP 80/720/2.000. Một vụ mỗi ô tự gieo/tưới/thu cho 11 XP; nhiệm vụ, câu cá và vật nuôi cũng tăng XP. Chặn cấp không tương đương chặn theo ngày.

Kho ban đầu 20 vật phẩm: 4 ô tạo 16, 24 ô tạo 96/vụ. Người chơi có thể bán xen giữa lúc thu; server không yêu cầu tới chợ, không có quota nhu cầu đầu ra. Kho và thao tác giảm tốc độ nhưng không giới hạn lượng xu bán trong ngày.

## 4. Câu cá có thể mua đất nhanh hơn 1–2 ngày

Cần trúc 150 xu, tài khoản còn 30. Không bắt buộc mồi. Cắn câu trung bình 4,5 giây; cá common/uncommon nhận ngay khi giật, cá rare/legendary phải kéo. Thùng 10 con, phải đến tiệm/quầy để bán; cần chưa thấy cơ chế hao độ bền server.

Bình quân hồ, không mồi, qua bốn pha thời gian: khoảng 25,83 xu/lần bắt thành công. Chỉ tính tiền cá, cần khoảng 77 con để từ 30 lên 2.000 xu. Nếu mỗi con gồm mọi thao tác mất 10–20 giây, khoảng 13–26 phút bắt cá, cộng đi bán/di chuyển/thất bại. Đây là kịch bản độ nhạy, chưa đo thời gian chơi; thưởng câu cá và điểm danh còn rút ngắn thêm.

Mồi hồ: lãi kỳ vọng mỗi lần bắt thành công lần lượt không mồi 25,83; trùn 20,83; mồi ruồi 15,14; thính 5,18 xu. Mồi tăng tốc/cơ hội cá hiếm nhưng chưa chứng minh tăng lợi nhuận theo thời gian. Mất cá vẫn mất mồi; số trên giả định bắt thành công tất cả và chưa tính thời gian kéo cá hiếm.

## 5. Chế biến làm mất giá trị nguyên liệu

| Sản phẩm | Giá bán nguyên liệu | Giá sản phẩm | Chênh lệch |
| --- | ---: | ---: | ---: |
| Bột từ 2 lúa mì | 60 | 18 | −42 |
| Phô mai từ 2 sữa | 80 | 35 | −45 |
| Mứt từ 2 dâu | 240 | 55 | −185 |

Có thưởng XP/nhiệm vụ một lần nhưng không bù cho sản xuất lặp. Server chưa kiểm tra sở hữu xưởng, thời gian chế biến hoặc sức chứa đầu ra trước `craft`. Cần chốt vai trò xưởng: tăng giá trị, phục vụ đơn đặc biệt hoặc sưu tầm; sửa recipe cùng mục tiêu đó.

## 6. Đơn hàng và chăn nuôi

Ba đơn trả 430 xu. Giá bán nguyên liệu cần giao là 312 xu; phí reset 25, nên chênh so với bán thô là +93 xu/vòng đầy đủ. Reset không cooldown. Mua nguyên liệu ven đường rồi giao cũng có lợi nhuận, nên cần xử lý cùng vòng mua/bán ở mục 2.

Chăn nuôi, trừ thức ăn, không tính hoàn vốn chuồng/con giống: gà 520, vịt 540, bò 500, cừu 450 xu/con/giờ lý thuyết. Heo bán trưởng thành phải trừ cả giá mua con mới: 78 xu/10 phút, 468 xu/giờ. Mỗi loài tối đa 3 con. Sản phẩm phải thu rồi cho ăn để bắt đầu đợt tiếp; không tự tích lũy nhiều đợt offline. Chuồng hiện chưa tiêu thụ ô đất, nên chưa tạo lựa chọn giữa canh tác và chăn nuôi như PLAN.

## 7. Casino dùng chung ví nông trại

`shared/casino/casinoConfig.js` đặt currency `farm-coins`; `server/casino/CasinoWalletService.js` ghi trực tiếp `progress.coins`. Tài Xỉu cửa Tài/Xỉu có kỳ vọng mất 2,78% tiền cược; Bầu Cua một cửa mất khoảng 7,87% (xúc xắc đều, theo luật hiện tại). Casino làm số dư mua đất biến động, không thể coi là thu nhập ổn định. Tách ví nếu muốn giữ tiến trình nông trại độc lập.

## Thứ tự xử lý đề xuất

1. Đóng vòng mua ven đường/bán lại và kiểm tra địa điểm giao dịch theo thiết kế.
2. Quyết định giftcode/điểm danh có được bỏ qua mục tiêu tích lũy 1–2 ngày hay không; tính ngân sách thưởng chung.
3. Đo câu cá thật theo phiên 15/30/60 phút, tính lần thất bại, kéo cá và đi bán; định nghĩa nguồn kiếm xu trước mua đất.
4. Chỉnh giá trị recipe và điều kiện xưởng; gắn công trình vào diện tích sử dụng.
5. Mô phỏng mở đất có XP, vụ rời rạc, kho, vốn hạt và thao tác. Chốt giá theo vùng từ lợi nhuận thực, không tăng riêng giá đất để bù.
6. Đồng bộ giờ reset, tách thưởng một lần khỏi lợi nhuận lặp và quyết định ví casino.

Chưa sửa config cân bằng trong lần kiểm tra này. Chưa xác nhận cấu hình của server đang deploy hoặc dữ liệu thu nhập người chơi thực tế.
