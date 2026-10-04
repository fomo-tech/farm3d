# Chỉnh giá đất

Sửa `shared/landConfig.js`, khởi động lại backend, tải lại danh sách đất trên client.

| Trường | Ý nghĩa |
| --- | --- |
| `minPrice` | Giá thấp nhất theo công thức, hiện 150 xu |
| `maxPrice` | Giá cao nhất theo công thức, hiện 2000 xu |
| `roundingStep` | Bước làm tròn phần giá tăng theo vị trí, hiện 50 xu |
| `center` | Tọa độ tâm tính khoảng cách, hiện x=0, z=0 |
| `villageMultipliers` | Hệ số theo ID làng; mặc định 1 |
| `overrides` | Giá chính xác theo ID lô, ưu tiên cao nhất |

Ví dụ đổi hệ số: `villageMultipliers: Object.freeze({ 'binh-minh': 1.2 })`.
Ví dụ đặt giá riêng: `overrides: Object.freeze({ farm_000001: 1800 })`.

Hệ số được áp dụng sau công thức khoảng cách và làm tròn; giá kết quả bị giới hạn trong min/max. Giá ghi đè là số xu chính xác, không làm tròn và có thể nằm ngoài min/max. Giá phải là số nguyên dương an toàn. Cấu hình sai sẽ báo lỗi khi backend import, không âm thầm dùng giá khác.

Khoảng cách chuẩn hóa theo lô xa nhất trong danh sách bán, bao gồm cả lô đã có chủ để không làm giá thay đổi khi người khác mua đất. Mặc định tái tạo đúng công thức cũ trên 288 lô.

Server tính lại giá khi mua, không tin giá client gửi. Giá đã trả trong `purchasePrice` và `landPurchase.price`, quyền sở hữu và ID lô không bị sửa. Giá hiển thị là giá cấu hình hiện tại, không phải lịch sử giá người chủ đã thanh toán.

Kiểm tra: `npm run test:land-config` và `npm run test:land`.
