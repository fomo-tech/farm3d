# Mua đất — server authoritative

- Tài khoản mới: 180 xu, xuất hiện tại thị trấn (0,42), không có lô đất, nhà hoặc ô canh tác.
- Tạo nhân vật không gọi cấp đất. Server bỏ qua villageId/requestedFarmId do client gửi khi đăng nhập; chỉ khôi phục quyền sở hữu có trong MongoDB.
- Bảng Mua đất hiển thị 288 lô thật của 12 làng; có lọc làng, giá, khoảng cách, tên chủ và bước xác nhận. Nhấn bảng tên trước lô cũng mở chi tiết mua đất.
- Trung tâm giá đất là (0,0). Giá = 6000 + round(6000 × (1 − khoảng cách / khoảng cách xa nhất) / 50) × 50 xu. Giá chỉ được server tính, client không có quyền chỉ định giá giao dịch.
- Mỗi người hiện được mua một lô. Sau khi mua: 4 ô canh tác trong lô tối đa 24 ô, nhà nhỏ cấp 1, chuồng cấp 1 và hàng rào. Bảng tên chỉ hiển thị tên người chơi. Người chơi cũ giữ nguyên lô và tài sản.
- WebSocket `game_action`, action `buy_land`, payload `{farmId}`. Thành công trả `account_state.result.landPurchase` và phát lại `farm_scope.lots` cho người chơi trong thế giới. Giao dịch không dịch chuyển nhân vật.
- Không có đất: server chặn nhận hạt hướng dẫn, nâng nhà/kho/đất và chăm sóc vật nuôi. Các thao tác trồng/thu hoạch vẫn kiểm tra chủ sở hữu server-side.

## An toàn MongoDB standalone

Không yêu cầu replica set. Unique index `playerId` và `(villageId,lot)` giữ lô trước giao dịch với trạng thái `pending`. Một atomic update trên document người chơi kiểm tra đủ tiền, trừ xu, ghi biên nhận `landPurchase`, cấp tài sản và tăng revision. Sau đó đánh dấu lô `owned`. Việc tăng revision ngăn các ghi kinh tế cũ ghi đè số tiền vừa trừ.

Nếu không đủ tiền/chưa tạo nhân vật, giữ chỗ được giải phóng mà không trừ tiền. Nếu process dừng giữa giao dịch, startup đối chiếu biên nhận: đã trả tiền thì hoàn tất quyền sở hữu, chưa trả thì giải phóng lô. Lô pending không được sử dụng như đất đã sở hữu.

## Kiểm thử

`npm run test:land` chạy server WebSocket riêng tại 18877 cùng một database MongoDB ngẫu nhiên có tiền tố `farm_land_test_`. Chỉ database test tự sinh được xóa khi kết thúc; không tác động database thật.

Kiểm tra: không cấp đất khi join, catalog 288 lô/giá theo khoảng cách, giá giả từ client bị bỏ qua, không đủ tiền, lô không hợp lệ, hai người mua cùng lô, số dư/4 ô/nhà sau mua, tên chủ, đăng nhập lại, giới hạn một lô, chặn hướng dẫn trước mua, recovery sau gián đoạn.

## Phát triển sau mua

Xem [PLAN nông trại](farm-land-progression-plan.md). `shared/landExpansionConfig.js` quy định lưới 6×4, 4 ô khởi đầu, mở chung cạnh và các mức giá thử. `unlock_plot` nhận `{tileKey}`; server kiểm tra chủ sở hữu, cấp và số dư. Save cũ giữ các ô đã mở theo tọa độ lưới 4×3 cũ. Giá hiện tăng theo số ô, chưa triển khai vùng giá cố định. Nhịp mua sau 1–2 ngày chưa được kiểm chứng.

## Giá khai hoang phiên bản 3

Áp dụng bảng journey-b: lượt mở ô 5/6/7/8 lần lượt 2500/6500/7000/8000 xu; ô 9–12 là 20000 xu/ô, 13–18 là 60000, 19–24 là 120000. Giá theo số ô đã mở, vẫn chọn ô liền kề theo hướng mong muốn. 4 ô ban đầu giữ nguyên, ô là đất trồng và chuồng dùng khu riêng. Không trừ tiền hoặc thu hồi ô đã mở trong save cũ. Khởi động lại server và tải client mới để đồng bộ giá.

## Cảnh báo vốn trước khai hoang

Bảng xác nhận hiển thị giá ô, xu còn lại, hạt cho toàn bộ ô sau mở theo cây đang chọn và thức ăn một đợt cho cả đàn. Trừ hạt miễn phí chỉ khi tính cà rốt. Đây là mức tham khảo, chưa tính hàng sắp bán/cây đang trồng và không phải tiền bị trừ thêm. Nếu còn ít hơn mức này, cần tích xác nhận đã xem cảnh báo; đổi ô, số dư hoặc mức vốn làm xác nhận hết hiệu lực. Server vẫn kiểm tra giá/điều kiện khai hoang hiện hành, không áp mức vốn bắt buộc mới.

Bảng giá phiên bản 3 dựa trên mô phỏng nối liền câu cá → mua đất → tân thủ → nông trại, có giữ XP và trạng thái thưởng. Xem `new-player-journey/decision.md` để biết kết quả, giới hạn và so sánh các giá thử.
