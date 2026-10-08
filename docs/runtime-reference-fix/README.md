# Sửa ReferenceError từ log 2026-10-07

App thiếu state cameraViewMode/setCameraViewMode và import PlazaEventNoticeModal. Khôi phục state mặc định explore, dùng ref đọc chế độ mới nhất trong callback onReady bất đồng bộ, import đúng named export của cửa sổ bảng tin.

Test mới test-app-bindings phân tích scope của App bằng Babel, gồm cả JSX có điều kiện và callback khởi động. Đã chạy test camera, boot và kiểm tra tên biến. Build production qua; vẫn có cảnh báo chunk lớn.

Kiểm tra trình duyệt localhost:4177: thế giới tải đến màn hình bắt đầu/tạo nhân vật mà không có JavaScript error; không hoàn tất tạo hoặc sửa nhân vật. Cửa sổ bảng tin được kiểm tra riêng bằng HUD fixture noticeDemo, không nhận thưởng hoặc gửi giftcode. Ảnh notice.png ghi lại cửa sổ hoạt động. Kết nối multiplayer của phiên kiểm tra báo đang thử lại; không coi đây là bằng chứng giao dịch hoặc toàn bộ gameplay online đã được kiểm tra.
