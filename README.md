# Vibe City

Project sạch, độc lập với các game hiện tại. Bản nền dùng React, Vite và Babylon.js.

## Chạy local

```sh
npm install
npm run dev
```

Game client chạy tại `http://localhost:4177`, multiplayer server chạy tại `http://localhost:8787`.
Lệnh dev chạy cả hai; dùng `npm run dev:client` hoặc `npm run dev:server` khi cần chạy riêng.
Để bật Google Sign-In, tạo OAuth 2.0 **Web Client ID** trong Google Cloud,
thêm `http://localhost:4177` vào Authorized JavaScript origins, rồi chép `.env.example`
thành `.env` và đặt cùng Client ID ở `VITE_GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_ID`.
Không cần Client Secret. Khi chạy riêng server, xuất `GOOGLE_CLIENT_ID` vào môi trường.
Không có Client ID, chế độ Chơi ngay vẫn hoạt động còn nút Google hiển thị trạng thái chưa cấu hình.
Mở nhiều tab để thử nhiều người chơi trong cùng kênh. Nếu server tắt, client tự chuyển sang
offline và thử kết nối lại sau mỗi 2,5 giây.

## Phạm vi bản nền

- Scene nông trại 3D và nhân vật điều khiển được.
- Lô đất khởi đầu 6 × 6.
- Cổng định hướng tới thành phố, ngoại ô, hồ và bãi biển.
- Tách riêng world, player, farming và network để phát triển multiplayer về sau.
- WebSocket multiplayer theo kênh, đồng bộ vị trí 10 lần/giây và nội suy nhân vật từ xa.

## Điều khiển

- `WASD` hoặc phím mũi tên: di chuyển.
- Giữ chuột trái và kéo: xoay camera.
- Cuộn chuột: phóng to/thu nhỏ.

## Test tải 500 người trên local

Cần MongoDB đang chạy ở `127.0.0.1:27017`. Script tự chạy backend riêng trên cổng
18787, tạo database tạm `farm_load_test_*` và xóa database này sau khi dừng.
Không cần chạy `npm run dev` hoặc backend trước; script không dùng database trong `.env`.

```sh
# Kiểm tra nhanh trước
npm run test:load -- --bots 50 --ramp 10 --duration 30

# 500 bot vào dần trong 60 giây, sau đó giữ tải 15 phút
npm run test:load -- --bots 500 --ramp 60 --duration 900
```

Client hỗ trợ đồng bộ delta: gửi thông tin nhân vật khi xuất hiện/đổi ngoại hình,
các nhịp sau chỉ gửi vị trí thay đổi; client cũ vẫn nhận world state đầy đủ.
Server gửi tối đa 48 người gần nhất cho mỗi client mới, kèm tổng số online
trong kênh. Client dựng tối đa 16 avatar trên desktop hoặc 8 trên mobile,
1 avatar mới mỗi lần đồng bộ; bảng tên cập nhật 15 lần/giây cho người chơi khác.
Bot cùng vào thị trấn, di chuyển tối đa 10 lần/giây và đo ping, ACK di chuyển,
world state, lỗi và mất kết nối. Mỗi bot chỉ giữ một lệnh di chuyển chờ ACK;
server chậm sẽ làm tần suất gửi thực tế giảm. Script ghi báo cáo JSON vào
`artifacts/load-tests/`, hiển thị số bot online mỗi 5 giây và trả mã lỗi nếu
không đủ bot, mất kết nối, lỗi di chuyển hoặc thiếu dữ liệu thế giới.
PASS xác nhận kịch bản kết nối/di chuyển chạy đủ; cần đọc p95/p99 để đánh giá độ trễ.
Ctrl+C dừng, xuất báo cáo chưa hoàn tất và dọn database tạm.

Để mở game thật trong lúc test, chạy ở terminal khác:

```sh
VITE_MULTIPLAYER_URL=ws://127.0.0.1:18787 npm run dev:client
```

Có thể đổi `--port 18787`, `--hz 10`, `--bots`, `--ramp` và `--duration` (giây).
Chế độ test nới giới hạn đăng nhập theo IP chỉ khi database có tên tạm hợp lệ,
và backend test chỉ lắng nghe `127.0.0.1`. Backend bình thường vẫn giữ giới hạn cũ.
Test này đo backend trên cùng máy tạo tải; chưa đo FPS của 500 trình duyệt,
thao tác kinh tế/gameplay, reconnect hoặc khả năng chịu tải của VPS.

### Test cùng thiết bị trong mạng LAN

```sh
npm run test:load -- --bots 500 --ramp 60 --duration 900 --lan
# Terminal khác: để trống URL cố định, dùng hostname đang mở trang
VITE_MULTIPLAYER_URL='' VITE_MULTIPLAYER_PORT=18787 npm run dev:client
```

Mở `http://<IP-LAN-máy-chủ>:4177/` trên các thiết bị cùng mạng.
Cả HTTP 4177 và WebSocket 18787 phải truy cập được từ LAN.
`--lan` mở backend test trên `0.0.0.0`; chỉ bot kết nối từ loopback được
nới giới hạn đăng nhập. Các IP LAN vẫn giữ giới hạn 12 lần/phút.
