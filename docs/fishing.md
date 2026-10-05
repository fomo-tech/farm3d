# Hệ thống câu cá

Toàn bộ cân bằng và danh mục câu cá nằm trong [shared/fishingConfig.js](../shared/fishingConfig.js):

- `rods`: cần câu, giá, tầm ném, sức kéo và animation.
- `baits`: mồi, số lượng mỗi gói, tốc độ cá cắn, bonus cá hiếm và loại cá ưu tiên.
- `tools`: dụng cụ như thùng ướp lạnh và sức chứa.
- `fish`: tên, độ hiếm, giá, XP, khoảng cân nặng và vùng sống.
- `zones`: hồ/ao/sông/biển, danh sách cá, tỉ lệ cá hiếm và tầm ném.
- `defaults` và `animations`: thời gian chờ phao, timeout và timing animation.

Server dùng cùng file config để chống sửa giá từ client. Dữ liệu cá cũ dạng số vẫn được tự động nâng cấp thành bản ghi `{ count, totalWeight, maxWeight }` bởi `normalizeFishingState`.

Luồng chơi:

1. Mua cần, mồi hoặc thùng tại NPC Lão Ngư.
2. Trang bị cần/mồi, đứng sát vùng nước rồi chọn `Giăng câu`.
3. Đóng bảng cửa hàng: HUD câu cá riêng hiện trên cảnh 3D. Chờ phao rung và giật trong cửa sổ 2.4 giây do server xác định.
4. Giữ nút kéo; thả khi cá vùng vẫy. Lực căng về 0 hoặc lên 100 sẽ mất cá. Server tính theo thời gian thực, không nhận tiến độ hoặc kết quả thắng từ client.
5. Cá được lưu vào MongoDB theo loài, số lượng, cân nặng và nhật ký bắt; bộ sưu tập vẫn giữ kỷ lục khi bán hết.
6. Đến tiệm đồ câu hoặc quầy Lão Ngư trên biển để mua/bán. Giá cá hiện có không đổi. Ba nhiệm vụ dùng cấu hình chung và chỉ nhận thưởng một lần.

Phiên câu có ID ngẫu nhiên, sequence, thời hạn và vị trí gốc. Server ẩn loài/cân nặng chờ bắt trong gói tài khoản; chống nhận cá trùng bằng revision MongoDB hiện có. Rời điểm câu, ngắt thao tác quá hai giây hoặc hết hạn không nhận cá. Reload có thể phục hồi phiên chưa hết hạn; phiên kiểu cũ không có ID bị bỏ, không xóa kho cá hoặc xu.

Server chọn vị trí phao trong tầm cần; ở hồ tránh mặt bến và lối đi. Ngày/đêm lấy theo chu kỳ 240 giây giống atmosphere tự động; loài ưa khung giờ có trọng số cao hơn. Client đổi chế độ giờ để xem cảnh không thay đổi tỷ lệ trên server.

Người chơi gần nhau nhận phase/target phao qua presence. Rig từ xa chỉ tạo khi có người câu và được hủy khi kết thúc; không thêm hiệu ứng liên tục cho tất cả người chơi. Thao tác fishing không gọi refreshFarm hoặc rebuild ngoại hình mỗi heartbeat.

## Kiểm thử 2026-10-05

- State machine: giật sớm/trễ, kéo thành công, đứt/chùng dây, mất kết nối/rời vị trí, replay, ẩn loài, nhiệm vụ và điểm phao: PASS.
- MongoDB trong database thử nghiệm riêng: mua/thả/giật/kéo/lưu/bán, thưởng nhiệm vụ một lần và bộ sưu tập sau bán: PASS. Không sửa database thật.
- NullEngine: 10 vòng tạo/hủy phao/dây/cá không tăng mesh/material/node: PASS.
- UI fixture 844×390: thả câu → giật → minigame và thất bại khi không kéo: PASS. Fixture không ghi tài khoản; không phải bằng chứng E2E trong map thật hoặc iPhone thật.
- Build Vite sau thay đổi cuối: PASS (`/private/tmp/farm-fishing-build-20261005`).

## Phần chưa hoàn thành so với đề xuất ban đầu

Chưa có hệ thống thời tiết server để cá thay đổi theo mưa/gió, bể trưng bày cá trong nhà, hoặc nghiệm thu hai thiết bị trên map thật. Chưa tuyên bố trải nghiệm/asset giống Play Together 100%. Animation/phao/cá dùng rig hiện có và mesh riêng của dự án, không lấy asset của game khác.

Kiểm tra nhanh sau khi sửa config:

```bash
npm run test:fishing-config
npm run test:fishing
npm run build
```
