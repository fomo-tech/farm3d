# Master Plan Implementation

Nguồn thiết kế: “Đô thị hiện đại & thế giới nông trại Việt Nam”. Repository và dữ liệu MongoDB là nguồn sự thật kỹ thuật.

## Phân tích kiến trúc

- Quy hoạch client và dữ liệu server được tách biệt: cảnh quan chỉ mô tả hình học; quyền sở hữu lô, cây trồng, vật nuôi và vị trí người chơi tiếp tục do server xác nhận.
- `WORLD_LAYOUT` là nguồn tọa độ duy nhất. Không đặt trigger cửa hàng tách rời vị trí công trình.
- Model 3D đi qua `AssetRegistry` và `ModelAssetManager`; cảnh quan procedural không được chứa logic kinh tế.
- Thiết bị di động dùng cùng layout nhưng giảm hiệu ứng hậu kỳ và số lượng vegetation.

## Trạng thái triển khai

| Giai đoạn | Trạng thái | Nội dung |
| --- | --- | --- |
| 1. HUD vector | Đang triển khai | Topbar, đồng hồ, minimap, di chuyển, xuống xe, shop/kho/xưởng/map và màn hình tạo nhân vật đã chuyển sang SVG 3D. Các modal phụ còn cần chuẩn hóa. |
| 2. Downtown | Đã có nền tảng | Vành đai, promenade, crosswalk, trạm xe buýt, EV charging, smart LED, neon ring và Cyber-Deco fountain. Trigger bốn cửa hàng đã khớp công trình thật. |
| 3. Nông trại Việt | Đã có nền tảng | 24 lô server-driven, ruộng lúa phụ trợ, bờ tre, ụ rơm và vùng xưởng. |
| 4. Động vật quê | Đã có nền tảng | Trâu nước procedural có animation, vũng mương, bò vàng, vịt và chuồng hiện hữu. |
| 5. Sen & làng chài | Đã có nền tảng | Hồ sen hiện hữu, cầu khỉ, thuyền thúng, dàn phơi lưới và lửa trại. |

## Việc còn lại để đạt production art hoàn chỉnh

1. Thay toàn bộ hình khối tạm của năm tòa nhà bằng bộ model tối ưu cùng một art bible.
2. Chuẩn hóa các modal phụ còn emoji sang `GameIcons3D`.
3. Dùng thin instances cho lúa, tre và sen trước khi tăng mật độ cảnh quan.
4. Thêm LOD, occlusion và budget đo draw-call theo từng thiết bị.
5. Chạy E2E cho luồng tạo nhân vật, vào/ra cả bốn cửa hàng, canh tác và reconnect.
