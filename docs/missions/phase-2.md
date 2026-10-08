# Nhiệm vụ — đợt 2 (2026-10-07)

## Hành trình trước đất

Tạo nhân vật → đến tiệm đồ câu mua cần tre (giá hiện tại 150 xu, tiền đầu 180) → đến cầu hồ và câu cá → mang cá tới tiệm/Lão Ngư bán → xem lô đất, tích tiền và mua. Cần cơ bản không bắt buộc mua mồi. HUD chỉ đường tới điểm tương ứng; trong tiệm mở quầy, chuyển sang câu thì ra ngoài trước khi đi tới hồ. Sổ chính tuyến hiển thị hành trình lập nghiệp trước các chương nông trại.

Checkpoint đọc từ dụng cụ, cá bắt và giao dịch bán đã được server ghi nhận, không có nút tự khai hoàn thành. Bước tích tiền hiển thị giá lô thấp nhất và số xu còn thiếu; giá từng lô vẫn theo bảng đất. Các checkpoint không cấp thêm xu/XP. Đây là hướng dẫn trước đất, không thêm ID có thưởng vào 12 nhiệm vụ chính tuyến nông trại cũ.

Khi có đất, HUD tự chuyển sang gặp Oliver → nhận 3 hạt và 50 xu → trồng/tưới/thu hoạch → giao đơn → nhận 200 xu/80 XP/xe đạp. Giữ ID, bước và quyền lợi cũ. Không yêu cầu mua ô thứ năm. Ô trồng và chuồng khu riêng.

## Daily trước đất

Schema phiên bản 3, danh sách ba nhiệm vụ chốt trong ngày:

| Mục tiêu | Xu | XP |
| --- | --- | --- |
| Câu 3 cá | 30 | 15 |
| Bán 3 cá | 40 | 20 |
| Câu 6 cá | 35 | 20 |

Mở nhận thưởng sau khi có cần và thực hiện lần bán đầu tiên. Dùng số cá, không yêu cầu hiếm hay trọng lượng. Tổng 105 xu/55 XP mỗi ngày; thành tích câu cá hiện có vẫn là nguồn thưởng riêng, simulator tính cả hai. Nhiệm vụ câu 3 và 6 cùng ghi nhận số bắt nhưng có khoản thưởng trong cùng trần đã chốt.

Server cập nhật totalSold khi bán thành công; client không được truyền số cá để nhận thưởng. Tiến độ ngày là chênh lệch so với baseline, số bắt đọc từ fishing.stats.totalCaught và số bán từ fishing.stats.totalSold. Save cũ có lastSale được ghi nhận đã học bán, nhưng không hồi dựng tổng bán để trả thưởng hồi tố.

Đã chốt bộ câu cá thì mua đất giữa ngày vẫn giữ bộ này. Ngày tiếp theo chuyển bộ trồng/tưới/thu hoạch khi có đất; bộ nông trại cần hoàn tất hướng dẫn trồng. Hoàn thành hướng dẫn không reset lại daily hoặc xóa baseline/lịch sử thưởng. Save cũ giữ bộ daily còn trong ngày; nếu trước đó đã được cấp bộ nông trại khi chưa có đất thì chuyển bộ phù hợp ở lần reset ngày tiếp theo. Không có đổi nhiệm vụ trong đợt này.

## Kinh tế và kiểm chứng

Tiền đầu, giá dụng cụ, giá cá, mã quà, điểm danh, giá lô và thưởng hướng dẫn/chính tuyến cũ giữ nguyên. Simulator trước đất thêm daily vào cùng ví, lịch ngày và ngân sách thao tác (2 giây/lần nhận). Không cộng thưởng khi offline.

12 điều kiện ×32 seed ×8 buổi: ba phong cách, có/không mã, có/không daily, hai buổi 30 phút/ngày. Tham chiếu thông thường có daily: trung vị khoảng 60 phút có mã hoặc 84,41 phút không mã, vẫn buổi thứ ba/ngày thứ hai. Đây là giả định simulator, chưa phải dữ liệu chơi thật; xem phase-2-economy.json. Audit thưởng hiện tại được cập nhật ở docs/reward-impact.

Unit: guide đổi theo tài sản/cá/bán, điều kiện daily, tổng thưởng/ngày, nhận lặp, rollover và giữ bộ sau mua. MongoDB riêng: payload giả không tăng tiến độ, cần bán thật mới mở, nhận đồng thời trả một lần, giữ claim sau hoàn tất hướng dẫn và từ chối nhiệm vụ ngoài bộ. Regression câu/bán cá, nhiệm vụ nông trại, simulator và build đều được kiểm tra. Không reset dữ liệu tài khoản thật hoặc restart server.

## Tiếp nối

Đợt 3 mở rộng nội dung chính tuyến sau đất và daily theo đơn/chăn nuôi/chế biến. Nền chọn bộ ngày hiện dùng hai bộ cố định, chưa phải hệ random cá nhân hóa hoặc đổi nhiệm vụ.
