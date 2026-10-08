# Vụ mùa và bảo vệ nông trại

Thời gian tính từ lúc tưới, vẫn chạy khi offline. Cấu hình chung phiên bản 2 áp dụng cho cây thường, kể cả vụ đang trồng; vụ hướng dẫn vẫn 8 giây. Giá hạt, giá bán và sản lượng không đổi.

| Cây | Trước (phút) | Mới (phút) | Xu ròng/ô/giờ | Sau một lượt trộm |
|---|---:|---:|---:|---:|
| Cà rốt | 1 | 30 | 86 | 62 |
| Lúa mì | 3 | 45 | 144 | 104 |
| Cà chua | 5 | 60 | 188 | 136 |
| Bí ngô | 7 | 90 | 208 | 151 |
| Dâu tây | 10 | 120 | 218 | 158 |
| Dưa hấu | 12 | 180 | 187 | 136 |
| Củ cải | 15 | 240 | 186 | 135 |

Các con số là trần lý thuyết: (4 × giá bán − giá hạt) × 60 / số phút. Khi bị trộm dùng 3 sản phẩm. Chưa tính thời gian thao tác, kho đầy, giao đơn, chế biến hay thưởng. Cây dài ngày phục vụ lúc rời game và nguyên liệu; không tuyên bố toàn bộ nền kinh tế đã cân bằng từ bảng này.

Ăn trộm cần cổng mở, cây đã chín và đứng cạnh cây 3 giây. Mỗi ô chỉ mất một sản phẩm mỗi vụ. Bật giới hạn 10 lượt/người/ngày và 6 lượt/nông trại/ngày; ngày theo UTC hiện có của server. Lô mới được bảo vệ 30 phút, cây hướng dẫn luôn được bảo vệ. Đóng cổng hủy lượt đang thực hiện.

Kiểm tra: test-crop-growth-balance.mjs, test-farm-config.mjs, test-farm-security-client.mjs, test-farm-interactions.mjs và test-farm-security.mjs (MongoDB biệt lập).
