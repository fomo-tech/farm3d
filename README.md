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
