# Mạng xe buýt

Dữ liệu tuyến trong `shared/busRoutes.js` được dùng chung cho client và server.
Mạng có 19 tuyến và 32 xe:

| Tuyến | Phạm vi |
| --- | --- |
| 01 | Quốc lộ 86, các làng hàng giữa, quay đầu tại hai đầu đường |
| 02 | Biển Bình Minh và đường ven biển tới hai đầu đường tại x ±620 |
| 03 | Quốc lộ Bắc -234 và Phú Điền |
| 04A / 04B | Cửa Tây, Phố Chợ / Cửa Đông, Hồ Pha Lê, các đường nối xuống quốc lộ 86 |
| 05 | Vành đai Bắc -650 và các nhánh vào làng |
| 06 | Cửa Nam, Bãi Biển Bình Minh, Bến tàu hơi nước |
| L01–L12 | Mỗi làng một tuyến qua 7 đường ngang, hai vành đai, trục giữa và cuối làng |

Xe nội làng chạy 14 m/s, tuyến bến tàu và nội đô 14 m/s, xe liên làng 22 m/s.
Xe dùng làn phải, giảm tốc tại góc rẽ, phân bố theo chiều dài tuyến và giữ
khoảng cách với xe cùng chiều. Xe nội làng có bề rộng nhỏ hơn để phù hợp đường 5 m.
Mỗi trạm dừng 8 giây. Biển xanh nhỏ đánh dấu các trạm mới; HUD hiện tên
trạm, tuyến và nút lên xe khi đứng gần một xe đang dừng. Quảng trường,
cầu tàu, lối đi ven hồ và các lối đi bộ không phải đường chạy xe buýt.

Khi xuống xe, hệ thống kiểm tra vị trí còn trống theo kích thước xe cá nhân.
Nếu không có vị trí phù hợp, người chơi tiếp tục ở trên xe.

Kiểm tra:

- `npm run test:bus-network`: lấy mẫu toàn bộ vòng tuyến, đối chiếu hành lang server,
  phủ 84 đường ngang, vành đai, trục làng, tránh biển/hồ/quảng trường.
- `npm run test:ground-bus`: 32 xe chạy đến mọi trạm, kiểm tra gói di chuyển,
  lên/xuống, vị trí xuống cho người đi bộ và máy kéo, cùng tiếp xúc chân/mặt đất.
- `npm run build`: kiểm tra tài nguyên, đường nối và bản build.

Các bài kiểm tra chuyển động dùng NullEngine; chúng không đo FPS GPU thực tế.
