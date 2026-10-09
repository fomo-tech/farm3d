# Halloween

Chỉ trang trí quảng trường, hai bên cổng làng và góc nông trại. Bí ngô, đèn lồng và bù nhìn không có va chạm hoặc thao tác gameplay.

Chọn sự kiện bằng biến `EVENT` trong `.env` của backend. Cấu hình local và cấu hình mẫu hiện bật Halloween:

```env
EVENT=halloween
```

- `halloween`: bật Halloween ngay.
- `none`: tắt toàn bộ sự kiện.
- `auto`: tự chọn sự kiện theo lịch trong `EVENT_DEFINITIONS`; Halloween từ 00:00 ngày 20/10 đến hết 02/11 mỗi năm, giờ Việt Nam.

Có thể thay lịch bằng ngày ISO có múi giờ; thời điểm kết thúc không nằm trong sự kiện:

```env
EVENT_START=2026-10-20T00:00:00+07:00
EVENT_END=2026-11-03T00:00:00+07:00
```

`npm run dev`, `npm run dev:server` và `npm run start:server` đều đọc `.env`. Nếu không đặt `EVENT`, sự kiện sẽ tắt.

Restart backend sau khi sửa `.env` (PM2: `pm2 restart vibecity`). Server gửi trạng thái khi kết nối và trong bản tin thế giới, nên người đang chơi cũng được cập nhật khi tới hạn theo lịch. Client chỉ tải module trang trí khi bật và gỡ toàn bộ khi tắt.

Mobile giữ tối đa 10 cụm trong 85 m; desktop 20 cụm trong 135 m. Tạo lần lượt một cụm mỗi 350 ms, gộp mesh theo vật liệu, không thêm nguồn sáng hoặc particle.

Kiểm tra: `node scripts/test-halloween.mjs`. Mẫu trực quan local: `/halloween-preview.html`.

Thêm mùa mới bằng một ID riêng trong `EVENT_DEFINITIONS` và module trang trí tương ứng phía client. Hiện chỉ Halloween có trang trí; ID chưa được hỗ trợ sẽ tắt an toàn.
