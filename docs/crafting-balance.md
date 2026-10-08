# Giá chế biến đã áp dụng

Cấu hình giao dịch NPC phiên bản 2 dùng chung server/client:

| Thành phẩm | Nguyên liệu | Bán nguyên liệu | Bán thành phẩm | Giá trị tăng thêm |
| --- | --- | --- | --- | --- |
| Bột mì | 2 lúa mì | 60 xu | 72 xu | 12 xu |
| Phô mai | 2 sữa | 80 xu | 96 xu | 16 xu |
| Mứt dâu | 2 dâu tây | 240 xu | 288 xu | 48 xu |

Đây là phần giá trị tăng so với bán nguyên liệu, chưa trừ thời gian thao tác và công sức sản xuất. Không thay nguyên liệu, XP, giá cây/vật nuôi, đơn hàng hoặc thưởng. Không cần xây xưởng mới và không chiếm ô trồng. Thành phẩm đang có trong kho bán theo giá mới.

Bảng chế biến hiển thị giá bán, số lượng thành phẩm và nút bán 1 sản phẩm. Nút chế biến chỉ bật khi đủ nguyên liệu và có kết nối; server vẫn tự kiểm tra tồn kho, giá và lần lưu tài khoản.

Mua 4 lúa mì NPC tốn 168 xu, làm 2 bột bán 144 xu, lỗ 24 xu. Mua 2 dâu tốn 336 xu, làm mứt bán 288 xu, lỗ 48 xu. Sữa không có gói mua NPC. Vòng giao đủ đơn rồi reset vẫn mất xu nếu toàn bộ nguyên liệu mua NPC.

Kiểm tra MongoDB dùng database thử riêng: giá client giả bị bỏ qua, từng loại nguyên liệu bị trừ đúng, bán thành phẩm trừ tồn kho và cộng đúng giá, yêu cầu thiếu hàng không sửa tài khoản, hai yêu cầu chế biến cùng nguyên liệu không tạo hai sản phẩm. Không kiểm thử trực quan toàn bộ phiên game trong bước này.

Khởi động lại server và tải client mới để đồng bộ. Bản audit cấu hình hiện tại: `game-economy-current.json`; đây là audit code, không phải số liệu chơi thật. Kinh tế toàn game còn cần kiểm chứng thưởng/mua đất và tiến trình bằng người chơi thật.
