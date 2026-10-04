# Quy hoạch lại toàn vùng vịnh

## Nguyên nhân xác định trong mã

- FarmWorld vẫn dựng tuyến regional-highway-south tại z=406, không sử dụng các đoạn đường trong config. Test cũ chỉ kiểm tra dữ liệu config nên không phát hiện nơi gọi bị quay lại đường cũ.
- Biển mở rộng hai bên trong khi cát chỉ phủ phía trước. Tại các cạnh, nước tiếp xúc trực tiếp với cỏ.
- Hạ lưu sông và cầu cũ tại (180,406) cắt ngang bãi biển/lối đi mới.
- Normal của ribbon cạnh bờ hướng xuống khiến cát và lối đi tối bất thường.

## Thay đổi

World dựng sáu đoạn đường cấu hình, vòng qua x=±240 và z=310. Hai làng phía Nam vẫn có đường kết nối. Bổ sung cát ướt/cát khô và lối đi ở hai cạnh vịnh tới z=650; lối đi phía trước nối với hai cạnh. Giới hạn chiều rộng biển tới 176 trong khu phía Nam có làng; chân trời mở rộng sau z=650.

Chuyển hạ lưu sông về phía ngoài lối đi, cửa sông nhập biển sau đoạn promenade; cầu quốc lộ chuyển tới (218,310). Vùng câu cá cập nhật theo vị trí hạ lưu. Guard tài nguyên chặn cả nước biển và đoạn hạ lưu mới, đồng thời dành khoảng trống trên promenade. Không xóa các asset nguồn, hải đăng, cầu câu hay bến tàu.

## Kiểm thử

- test-coastal-layout: footprint đường trên đất, lời gọi dựng đường thực tế, không dựng lại tuyến cũ, tài nguyên không ở biển/hạ lưu.
- test-beach: hai cạnh có đủ cát/lối đi, normals hướng lên, streaming gỡ/tải ba vòng, vật liệu ổn định, collider/vùng câu.
- test-winding-river: hạ lưu không lấn 288 farm; cầu nối tuyến đường mới; va chạm sông/cầu.
- test-collision-system và npm run build.

Kiểm tra trình duyệt dùng toàn world tại hai cạnh vịnh, không ghi dữ liệu tài khoản. Không thay thế kiểm thử người chơi đi bộ toàn tuyến, ban đêm hoặc phiên multiplayer dài; không tuyên bố mọi lỗi hiệu năng toàn map đã được giải quyết.
