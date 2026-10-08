# Kế hoạch triển khai chống DDoS cho Farm Online 3D

Ngày: 07/10/2026. Phạm vi: HTTP, WebSocket, Node.js và MongoDB.
Đây là kế hoạch triển khai; chưa thay đổi firewall, CDN hoặc server production.

## Hiện trạng đã kiểm tra

- `server/index.js` lắng nghe trên `0.0.0.0:8787` theo mặc định.
- Có giới hạn đăng nhập 12 lần/phút theo remoteAddress, và 40 message/giây/socket.
- Kiểm tra độ dài chuỗi 16.384 ký tự xảy ra trong callback message, sau khi thư viện ws đã nhận/reassemble payload. Cần giới hạn byte tại ws.
- Chưa cấu hình maxPayload, giới hạn kết nối trước xác thực, allowlist Origin, hoặc ngưỡng bufferedAmount trong safeSend.
- Handler message bất đồng bộ có thể khởi chạy nhiều truy vấn đang chờ. Giới hạn số message chưa phải giới hạn công việc đồng thời.
- Đã có cleanup authAttempts/recentActions và reconnect backoff phía client; cần bổ sung trần bộ nhớ và cơ chế nhận biết quá tải.
- Chưa xác định hạ tầng production, reverse proxy, tên miền, số người chơi đồng thời và mức tài nguyên máy chủ. Các ngưỡng dưới đây là điểm khởi đầu để benchmark, không phải cấu hình cố định.

## Kiến trúc đề xuất

Người chơi → CDN/WAF có bảo vệ DDoS → reverse proxy → Node WebSocket → MongoDB private.

CDN phân phối các asset/versioned bundle; WebSocket sử dụng WSS trên hostname được proxy.
Origin chỉ nhận lưu lượng qua proxy đáng tin hoặc tunnel. MongoDB và cổng Node không mở công khai.
DDoS gây nghẽn đường truyền cần nhà cung cấp/edge giảm thiểu; giới hạn trong Node chỉ bảo vệ tài nguyên ứng dụng.

## Giai đoạn 1 — Gia cố ứng dụng, ưu tiên P0

1. Cấu hình ws `maxPayload: 16 * 1024` byte, xác nhận perMessageDeflate tắt; xử lý error/close và kiểm tra schema trước khi thực thi. Kiểm thử tương thích payload avatar.
2. Kiểm soát HTTP upgrade trước khi cấp socket: đường dẫn WS, Origin hợp lệ, tốc độ handshake, quota tổng và quota kết nối chưa xác thực. Origin chỉ là bộ lọc trình duyệt, không thay thế token.
3. Tách trạng thái connecting/authenticating/authenticated; thời hạn chưa xác thực dự kiến 10 giây. Chỉ một lần join đang xử lý/socket. Khi xác thực thất bại hoặc quá hạn, đóng và giải phóng đầy đủ.
4. Token bucket theo IP, tài khoản và nhóm message. Move giữ ngân sách phù hợp tần suất client; chat, profile/social, đăng nhập và game_action có quota riêng. Giới hạn IP có burst đủ cho mạng dùng chung/NAT.
5. Giới hạn concurrency cho thao tác database/xác thực và độ dài hàng đợi; không xếp hàng move, chỉ giữ cập nhật mới nhất. Không bỏ âm thầm thao tác thay đổi tiền/vật phẩm: trả lỗi retry rõ ràng và bảo toàn idempotency.
6. Heartbeat ping/pong và timeout cho mọi socket, kể cả chưa join. Không dựa riêng vào danh sách người chơi đã xác thực để dọn kết nối.
7. safeSend kiểm tra bufferedAmount. Bỏ snapshot vị trí cũ khi nghẽn; đóng client chậm vượt trần dự kiến 1 MiB kéo dài, để client đồng bộ lại. Bảo vệ giao dịch đã commit và khả năng truy vấn trạng thái sau reconnect.
8. Đặt TTL và trần số entry cho limiter/cache; metrics theo nhóm lý do, tránh log mỗi message bị chặn.

Các ngưỡng tốc độ/concurrency sẽ được chọn sau đo lưu lượng hợp lệ; không áp dụng giới hạn thấp tùy ý cho tất cả game_action.

## Giai đoạn 2 — Proxy và origin, ưu tiên P0

- Triển khai TLS/WSS, CDN asset cache và rule chống handshake flood theo endpoint.
- Nginx: limit_req cho HTTP/upgrade, limit_conn, timeout header và giới hạn tài nguyên kết nối. WS read timeout phải dài hơn chu kỳ heartbeat.
- Node bind loopback/private interface khi proxy cùng máy; firewall chặn truy cập trực tiếp từ Internet. SSH chỉ qua kênh quản trị; MongoDB chỉ qua private network.
- Khôi phục IP thật chỉ từ proxy/CIDR tin cậy. Không tin tùy ý X-Forwarded-For/CF-Connecting-IP; nếu dùng remoteAddress sau proxy, có nguy cơ giới hạn nhầm toàn bộ người chơi.
- Đồng bộ quota giữa nhiều instance bằng Redis khi scale ngang; limiter RAM vẫn có vai trò bảo vệ cục bộ khi Redis lỗi. Từ chối công việc đắt có kiểm soát khi dịch vụ limiter bị lỗi.
- WAF bảo vệ handshake WebSocket; limiter trong ứng dụng vẫn bắt buộc cho message stream. Không gắn challenge tương tác trực tiếp vào handshake WS; nếu cần, giải quyết trên luồng đăng nhập web trước đó.

## Giai đoạn 3 — Bảo vệ database và vận hành, ưu tiên P1

- Cache ngắn hạn leaderboard/public profile và gộp request trùng; giới hạn tần suất get_social_state/get_profile theo tài khoản.
- Kiểm tra index của truy vấn hot, giới hạn pool/concurrency và timeout truy vấn phù hợp. Giao dịch tiền/vật phẩm cần kiểm tra trạng thái commit trước retry.
- Theo dõi active/pending sockets, handshake từ chối, bytes in/out, message theo nhóm, queue depth, bufferedAmount, event-loop lag, CPU/RAM, độ trễ DB, lỗi và reconnect.
- Dashboard + cảnh báo theo baseline/p95, không theo ngưỡng CPU đơn lẻ. Log không chứa token hoặc ảnh base64.
- Runbook: tăng rule edge, giảm tiếp nhận công việc không thiết yếu, giữ giao dịch và heartbeat hoạt động, phối hợp nhà cung cấp; phục hồi quota từ từ tránh reconnect storm.

## Giai đoạn 4 — Kiểm thử và rollout

Chỉ thử tải trên môi trường staging thuộc quyền quản lý, với giới hạn tải và điều kiện dừng.

- Đo baseline trước thay đổi: CCU mục tiêu, tốc độ message hợp lệ, p95 tick/event-loop/DB và RAM.
- Kiểm thử payload lớn/phân mảnh, JSON sai, connection flood, socket không join, join lặp, nhiều socket/tài khoản, message flood, truy vấn DB flood và client đọc chậm.
- Kiểm thử chơi thật: di chuyển, câu cá, casino, đổi avatar, mạng NAT dùng chung và reconnect sau Wi-Fi/4G/đổi tab.
- Xác nhận origin không thể truy cập trực tiếp từ Internet; header IP giả không đổi được limiter key.
- Tiêu chí đạt: quota làm việc trước thao tác đắt; RAM/socket/queue nằm trong trần; không nhân đôi giao dịch; người chơi hợp lệ không bị khóa hàng loạt; p95 trong ngân sách đã chọn từ baseline.
- Rollout: rule ở chế độ quan sát → staging → canary → mở rộng. Mỗi quota có cấu hình và rollback; trần payload/bộ nhớ vẫn giữ khi rollback rule gây chặn nhầm.

## Thứ tự thực hiện và thông tin cần có

Bắt đầu giai đoạn 1 trong code và test staging; tiếp theo triển khai giai đoạn 2 ở hạ tầng, rồi hoàn thiện giám sát và bài kiểm thử tải.
Cần biết: nhà cung cấp/VPS, tên miền + CDN/proxy hiện tại, cấu hình CPU/RAM và CCU mục tiêu để chốt cấu hình triển khai.

## Tài liệu chính thức

- Cloudflare WebSockets: https://developers.cloudflare.com/network/websockets/
- Cloudflare DDoS: https://developers.cloudflare.com/ddos-protection/about/how-ddos-protection-works/
- Nginx limit_req: https://nginx.org/en/docs/http/ngx_http_limit_req_module.html
