# Rà soát WebSocket – 09/10/2026

Đã bổ sung và kiểm tra:
- Giới hạn payload tại ws: 16 KiB, tắt nén per-message.
- Tối đa 32 kết nối/IP, 1500 kết nối tổng; giới hạn lượt mở kết nối/phút, dọn IP hết hạn và chặn bảng IP vượt 10000 mục.
- Chưa join sau 15 giây: đóng socket. Không join lại hoặc join đồng thời trên một socket; không đăng ký socket đã đóng sau khi chờ database.
- 40 tin/giây/socket, đóng khi flood kéo dài; tối đa 4 xử lý bất đồng bộ đang chạy/socket.
- Chat 4/5 giây; social snapshot 2/10 giây; bạn bè 6/10 giây; hồ sơ 8/10 giây; travel 3/10 giây; land/resync 2/10 giây.
- Gói JSON lỗi/null/array/type sai bị từ chối. Social action chỉ nhận add_friend/remove_friend.
- Ngắt client có send buffer vượt 1 MiB.
- WS_ALLOWED_ORIGINS: allowlist chính xác khi cấu hình; mặc định trống cho LAN. Đây không thay thế xác thực tài khoản.

Kiểm chứng: test-socket-guard, test-casino-table-view và kiểm tra socket local thực tế với null/JSON lỗi/payload 17000 byte. Không tiến hành flood đường truyền.

Vận hành Internet: cấu hình WS_ALLOWED_ORIGINS bằng origin HTTPS của game; đặt backend sau proxy TLS và giới hạn kết nối/request ở proxy hoặc nhà cung cấp chống DDoS. Giới hạn IP dùng địa chỉ TCP thật, không tin X-Forwarded-For; sau proxy tất cả người chơi có thể chung một IP. Cần thiết kế trusted-proxy trước khi triển khai, không tăng giới hạn tùy tiện. LOCAL_LOAD_TEST chỉ nới giới hạn với tên database test đã kiểm tra; không bật cho server thực tế.

Giới hạn: chưa kiểm tra tấn công DDoS phân tán hoặc toàn bộ codebase/dependencies. Các giới hạn trong bộ nhớ áp dụng cho từng process, chưa chia sẻ giữa nhiều server. Kết nối được xác thực vẫn có thể tạo tải trong hạn mức; cần giám sát và điều chỉnh bằng tải đo được.
