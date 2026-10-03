# Vibe City

Project sạch, độc lập với các game hiện tại. Bản nền dùng React, Vite và Babylon.js.

## Chạy local

```sh
npm install
npm run dev:server
```

Mở terminal thứ hai:

```sh
npm run dev
```

Game client chạy tại `http://localhost:4176`, multiplayer server chạy tại `http://localhost:8787`.
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
