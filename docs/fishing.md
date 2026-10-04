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
3. Chờ phao rung, chọn `Cá cắn! Giật cần` trong thời gian cho phép.
4. Cá được lưu theo loài, số lượng, cân nặng trung bình/kỷ lục và nhật ký bắt.
5. Bán từng loài hoặc `Bán toàn bộ cá` để nhận xu theo cân nặng.

Kiểm tra nhanh sau khi sửa config:

```bash
npm run test:fishing-config
npm run build
```
