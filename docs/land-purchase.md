# Mua đất — server authoritative

- Tài khoản mới: 180 xu, xuất hiện tại thị trấn (0,18), không có lô đất, nhà hoặc ô canh tác.
- Tạo nhân vật không gọi cấp đất. Server bỏ qua villageId/requestedFarmId do client gửi khi đăng nhập; chỉ khôi phục quyền sở hữu có trong MongoDB.
- Bảng Mua đất hiển thị 288 lô thật của 12 làng; có lọc làng, giá, khoảng cách, tên chủ và bước xác nhận. Nhấn bảng tên trước lô cũng mở chi tiết mua đất.
- Trung tâm giá đất là (0,0). Giá = 150 + round(1850 × (1 − khoảng cách / khoảng cách xa nhất) / 50) × 50 xu. Giá chỉ được server tính, client không có quyền chỉ định giá giao dịch.
- Mỗi người hiện được mua một lô. Sau khi mua: 12 ô canh tác, nhà nhỏ cấp 1, chuồng cấp 1 và hàng rào. Bảng tên chỉ hiển thị tên người chơi. Người chơi cũ giữ nguyên lô và tài sản.
- WebSocket `game_action`, action `buy_land`, payload `{farmId}`. Thành công trả `account_state.result.landPurchase` và phát lại `farm_scope.lots` cho người chơi trong thế giới. Giao dịch không dịch chuyển nhân vật.
- Không có đất: server chặn nhận hạt hướng dẫn, nâng nhà/kho/đất và chăm sóc vật nuôi. Các thao tác trồng/thu hoạch vẫn kiểm tra chủ sở hữu server-side.

## An toàn MongoDB standalone

Không yêu cầu replica set. Unique index `playerId` và `(villageId,lot)` giữ lô trước giao dịch với trạng thái `pending`. Một atomic update trên document người chơi kiểm tra đủ tiền, trừ xu, ghi biên nhận `landPurchase`, cấp tài sản và tăng revision. Sau đó đánh dấu lô `owned`. Việc tăng revision ngăn các ghi kinh tế cũ ghi đè số tiền vừa trừ.

Nếu không đủ tiền/chưa tạo nhân vật, giữ chỗ được giải phóng mà không trừ tiền. Nếu process dừng giữa giao dịch, startup đối chiếu biên nhận: đã trả tiền thì hoàn tất quyền sở hữu, chưa trả thì giải phóng lô. Lô pending không được sử dụng như đất đã sở hữu.

## Kiểm thử

`npm run test:land` chạy server WebSocket riêng tại 18877 cùng một database MongoDB ngẫu nhiên có tiền tố `farm_land_test_`. Chỉ database test tự sinh được xóa khi kết thúc; không tác động database thật.

Kiểm tra: không cấp đất khi join, catalog 288 lô/giá theo khoảng cách, giá giả từ client bị bỏ qua, không đủ tiền, lô không hợp lệ, hai người mua cùng lô, số dư/12 ô/nhà sau mua, tên chủ, đăng nhập lại, giới hạn một lô, chặn hướng dẫn trước mua, recovery sau gián đoạn.
