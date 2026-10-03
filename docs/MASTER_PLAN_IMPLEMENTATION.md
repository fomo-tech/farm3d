# Master Plan & Architecture Bible: Quy hoạch Thế giới Farm3D

Nguồn thiết kế: Đô thị sinh thái ấm cúng & Thế giới Nông trại Ghibli Việt Nam. Repository và dữ liệu authoritative server là nguồn sự thật kỹ thuật.

## 1. Quy hoạch Phân khu Đề xuất

| Khu vực | Quy hoạch đề xuất | Định hướng thị giác & Kỹ thuật |
| --- | --- | --- |
| **Trung tâm** | Quảng trường thoáng, một công trình biểu tượng rõ ràng; chừa tầm nhìn và lối đi từ điểm xuất phát. | Đài phun nước hoàng gia Kaia 3 tầng cẩm thạch trắng tại `(0, 0, 0)`. Điểm xuất phát `(0, 18)` giải phóng hoàn toàn đạo cụ che chắn, mở rộng tầm nhìn panorama 360°. |
| **Phía tây** | Phố chợ, quán cà phê, cửa hàng; mái ngói, biển hiệu gỗ và đèn vàng ấm. | Chuỗi cửa hàng thương mại, quán cà phê Airstream/Vintage, chợ phiên nông sản tại `x: -30..-80`. Mái ngói đỏ cam Terracotta, biển hiệu gỗ sồi chữ nổi, đèn vàng Edison ấm áp. |
| **Phía đông** | Đường dạo ven hồ, cầu nhỏ, bến câu cá và hàng cây tạo khoảng nghỉ thị giác. | Hồ Pha Lê `x: 120..180`. Bến câu cá & Pro Fishing Tackle dời sang bờ hồ `(x: 135, z: 6)`. Đường dạo ven hồ lát sỏi, cầu gỗ qua hồ sen, liễu rủ và thông đồi tạo khoảng nghỉ thị giác dịu mát. |
| **Trục phía nam** | Đại lộ cây xanh dẫn từ thị trấn qua các làng đến bãi biển; biển chỉ đường nhất quán. | Đại lộ Nam rộng 8.5m + vỉa hè sỏi kem bơ (`z: 46 -> 340`). Hàng cây sồi và phong vàng rợp bóng ngoài vỉa hè `|x| = 11m`, biển chỉ dẫn cọc gỗ đồng bộ dẫn thẳng tới Bãi biển Bình Minh `(z: 340)`. |
| **12 làng** | Giữ cấu trúc lô hiện tại, nhưng chia thành các nhóm có cổng làng, cây trồng và màu nhấn riêng để dễ nhận diện. | Giữ nguyên 288 lô đất (24 lô x 12 làng) tương thích 100% server. Chia làm 6 nhóm bản sắc: Ban Mai (vàng cúc), Thủy Trúc (xanh ngọc, tre), Đồi Thông (tím, thông), Mộc Lan (hồng pastel), Mùa Gặt (cam đất, rơm rạ), Thu Vàng (vàng hướng dương, phong). |
| **Từng nông trại** | Một bộ mẫu thống nhất cho nhà, chuồng, ruộng, hàng rào và lối vào; cho phép tùy biến mà không làm bố cục lộn xộn. | Bộ khung chuẩn `FARM_LOT_SPEC`: Nhà chính Ghibli mái ngói dốc, chuồng trại gia súc máng gỗ, 12 ô ruộng canh tác (4x3), hàng rào gỗ cọc thấp, lối đi rải sỏi từ cổng vào sân. |

## 2. Lộ trình Triển khai 5 Bước

1. **Bước 1 (Đã hoàn thành nền tảng)**:
   - Chốt bảng màu, vật liệu, kiểu mái nhà, cây và biển hiệu (`src/game/world/worldDesignSystem.js`).
   - Dọn sạch các đạo cụ che chắn tầm nhìn tại điểm xuất phát `(x: 0, z: 18)`. Dời bến câu cá sang bờ hồ phía Đông `(x: 135, z: 6)`.
   - Mở thông trục đường và cổng Nam để nhìn thẳng ra đại lộ cây xanh.
2. **Bước 2**:
   - Làm hoàn chỉnh một lát cắt mẫu (Vertical Slice): Điểm xuất phát `(0, 18)` → Quảng trường đài phun nước `(0, 0)` → Phố chợ phía Tây `(x: -34, z: 6)`.
   - Đạt chuẩn chất lượng ánh sáng, chi tiết mặt tiền mái ngói, biển hiệu gỗ và đèn vàng ấm áp.
3. **Bước 3**:
   - Quy hoạch lại phân cấp đường: Trục chính đô thị (Boulevard 8.5m), đường vào làng (5.5m), lối đi trong nông trại (sỏi rải 2.2m).
   - Đặt công trình bám sát theo tuyến đường thay vì rải độc lập.
4. **Bước 4**:
   - Áp dụng bộ nhận diện cảnh quan (cổng làng, cây đặc trưng, khóm hoa, màu nhấn) cho toàn bộ 12 làng.
   - Hoàn thiện dải hồ Pha Lê và bãi biển duyên hải Bình Minh.
5. **Bước 5**:
   - Tinh chỉnh chiếu sáng chu kỳ ngày/đêm điện ảnh 4 pha (Dawn, Day, Dusk, Night), sương nhẹ (soft fog), bóng đổ mềm và tối ưu LOD/Draw call theo khoảng cách.

