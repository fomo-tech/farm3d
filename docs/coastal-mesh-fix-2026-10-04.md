# Vật thể còn nằm dưới biển — kiểm tra thực tế

Lần audit toàn world tại (0,406), cổng 4177, đã tìm 20 mesh giao nước: 12 mesh ô dù/ghế nằm thuộc world-scenic-landscapes tại (±140,418), và 8 lamp-halo thuộc đường coast-landward/regional-highway-86. Đây là nguồn lỗi chưa được sửa trong lượt quy hoạch trước.

Sửa bộ dựng lounge cũ: từ chối footprint giao nước, chuyển hai cụm cạnh vịnh vào cát theo beachOceanHalfWidth(418)+14, cập nhật chiều cao nền. Những cụm phía trước cũng chuyển khỏi đường sang cát.

Sửa halo: Babylon billboard bỏ góc xoay cha khi tính offset; thêm TransformNode anchor không billboard, đặt offset lên anchor, billboard ở offset 0. Không bật cờ toàn cục ảnh hưởng các billboard khác.

Test-lamp-world-position qua bốn góc xoay; test-coastal-mesh-audit kiểm tra road footprint, thin-instance center, từ chối lounge cũ và geometry lounge mới ngoài nước; test-beach và test-coastal-layout qua.

Báo cáo runtime có thể xem trong performance.html qua Show report, trường coastalAudit. Audit là chẩn đoán theo mẫu bounding box và tâm thin instances, không phải chứng minh hình học chính xác cho mọi asset. Không chạy trong render loop và không tự động xóa/ẩn mesh.

Lần kiểm tra lại toàn world bị giới hạn khoảng 1 FPS, chưa dựng xong (Boot timeout trong harness). Vì vậy chưa có kết quả toàn cảnh sau sửa; không kết luận coastalAudit=0 hay đã hết mọi vật thể lỗi trong phiên người dùng.

## Kiểm tra tiếp theo: tuyến xe và cảnh đã dựng xong

Tuyến xe buýt 02 vẫn sử dụng đường cũ qua (0,406), dù đường ven biển đã đổi. Đã chuyển toàn bộ waypoint và chỉ số trạm sang COASTAL_BUS_CONFIG trong shared/beachConfig.js; trạm biển nằm phía đất liền ở z=304.8, tuyến ngang ở z=310 và vòng qua x=±240. Chiều cao xe lấy từ nền địa hình. Test-coastal-bus kiểm tra 2.183 điểm trên toàn bộ các đoạn tuyến, cả footprint bán kính 6, đều ngoài biển và nằm trên đường ở khu ven biển.

Browser audit tại (0,406) đã đạt World ready, không ghi dữ liệu tài khoản. Báo cáo coastal-final-audit-2026-10-04.json: coastalAudit.count=0, thinPlacementsChecked=2629. Đây là kiểm tra nhóm mesh được chọn bằng tên và mẫu bounding box/tâm instance; không bao phủ tuyệt đối mọi asset hoặc các chunk chưa tải. Foliage vẫn còn 121 công việc chờ tại thời điểm báo cáo.

Audit dùng audit=1 để dựng cảnh bằng các tác vụ cooperative 4ms độc lập RAF, chỉ dành cho kiểm tra hình học. Không dùng số FPS trong chế độ này để kết luận hiệu năng sản phẩm. Build thành công. Không xóa thư mục assets hay loại bỏ toàn bộ cảnh quan.
