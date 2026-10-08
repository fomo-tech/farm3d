# Kinh tế — bước đầu đã triển khai

## Thay đổi

`shared/npcTradingConfig.js` là bảng chung của gói mua NPC, đơn hàng, recipe và phí làm mới đơn. Client/server đọc chung bảng; giá bán nông sản, thưởng đơn, recipe và phí reset vẫn giữ mức trước đợt này. Recipe tạo giá trị thấp hơn nguyên liệu vẫn là vấn đề của giai đoạn sản xuất, chưa được cân lại.

| Gói NPC bán | Giá mua mới | NPC thu mua cả gói | Mua rồi bán lại |
| --- | ---: | ---: | ---: |
| 5 cà rốt | 84 | 60 | −24 |
| 4 lúa mì | 168 | 120 | −48 |
| 3 cà chua | 219 | 156 | −63 |
| 2 dâu tây | 336 | 240 | −96 |

Chênh mua khoảng 40%, chọn để đóng cả vòng đơn hiện tại. Mua 3 gói cà rốt/lúa mì/cà chua tốn 471 xu, giao hết ba đơn được 430, reset tốn 25, bán 2 cà rốt thừa được 24: tổng lỗ 42 xu. Ngay cả giả định mua lẻ đúng số nguyên liệu với giá đơn vị của gói, vòng vẫn lỗ ít nhất 32,4 xu. Giao đơn bằng nông sản tự sản xuất vẫn giữ phần thưởng.

Mua ven đường yêu cầu ở ngoài và cách quầy (-11,5; 60) không quá 8 đơn vị. Client gửi crop và amount; server bỏ qua price từ client và tính giá thật. Giao diện có nút đến quầy, không tự xóa gói trước phản hồi; kho hiển thị giá thu mua thật thay vì gấp đôi. Gói bổ sung vẫn mua lặp được, không giả lập stock hữu hạn chỉ bằng trạng thái UI.

Bán nông sản/cá từ chối số lượng phân số, chuỗi, âm, bằng 0 hoặc vượt tồn kho. Bán cá xác thực toàn bộ lệnh trước sửa kho, không bán một phần nếu gặp tồn kho lỗi. Lookup vật phẩm/đơn/recipe chặn tên khóa prototype.

## Kiểm chứng

- `npm run test:economy`: test logic và test dịch vụ GameStore trên MongoDB localhost với database ngẫu nhiên riêng, tự xóa sau test. Không dùng dữ liệu người chơi thật.
- Kiểm tra sai vị trí, đang trong cửa hàng, giá client giả, số lượng lỗi, thiếu xu, đầy kho; yêu cầu lỗi không đổi document.
- Kiểm tra mua/bán đủ các gói, vòng mua→recipe→bán, vòng mua→giao ba đơn→reset→bán hàng thừa.
- Kiểm tra bán cá đúng xu/số lượng, không bán lại cá đã hết và hai lệnh cạnh tranh bán cùng một sản phẩm chỉ một lệnh thành công.
- `npm run build`: asset, bố cục nông trại, đường và Vite build đã qua; còn cảnh báo bundle lớn hiện có.
- Chưa kiểm tra giao diện trực tiếp trên desktop/điện thoại, chưa test WebSocket restart/replay riêng cho giao dịch mới.

## Còn lại

Giftcode/điểm danh, giá mua đất, năng suất cây, thu nhập câu cá và ví casino chưa đổi. File `game-economy-step1-2026-10-06.json` là audit sau bước đầu; file audit trước được giữ làm mốc so sánh. Vì thưởng ngày đầu vẫn có thể đủ mua lô, chưa coi kinh tế đã đạt PLAN 1–2 ngày.

Bước tiếp: đưa toàn bộ thưởng hiện hành vào simulator theo buổi chơi, đo thời gian câu cá/thao tác thật, rồi cân ngân sách trước mua đất.
