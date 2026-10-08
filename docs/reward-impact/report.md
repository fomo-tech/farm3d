# Ảnh hưởng phần thưởng

Audit cấu hình hiện tại và mô phỏng, chưa phải chơi thật. Cấu hình mới giảm điểm danh; giữ mã đã phát hành và tài sản hiện có.

## Trước mua đất

Xu đầu 180; 3 mã đang bật tổng 1800; điểm danh ngày đầu 100. Tổng không cần sản xuất: **2080 xu**, so với lô rẻ nhất 6000 xu. Dùng đủ mã vẫn chưa đủ mua lô; cần kiếm thêm xu. Mã nhận một lần/tài khoản, không phải nguồn vô hạn. Không công khai tên mã trong báo cáo.

Ngày 2 liên tiếp thêm 120; tổng điểm danh 7 ngày 1220. Thưởng hướng dẫn 250 xu cần đất và tiến trình, không tính vào tiền mua đất trước đó. Nhiệm vụ chính/daily nông trại yêu cầu hoàn tất hướng dẫn. Daily sau đất chọn ba mục tiêu theo hoạt động đã mở, tổng vẫn 105 xu/ngày.

Mô phỏng câu cá trước đất: 12 điều kiện ×32 seed ×8 buổi, hai buổi/ngày 09:00/19:00 giờ Việt Nam. results.json có median thời gian, buổi và mức giữ vốn. Không cộng thu nhập nông trại vào chặng chưa sở hữu đất. Đã tính daily câu/bán cá tối đa 105 xu/ngày; nhận thưởng tốn 2 giây/lượt và chỉ mở sau lần bán cá đầu tiên.

## Tham chiếu trước đất: buổi 30 phút

| Dùng mã quà | Điểm danh | Trung vị phút chơi tới giá lô | Trung vị buổi |
| --- | --- | --- | --- |
| Không | Không | 87.61 | 3 |
| Không | Có | 84.41 | 3 |
| Có | Không | 61.78 | 3 |
| Có | Có | 60 | 3 |

Ở cấu hình mới, tham chiếu 30 phút/buổi đạt lô ở buổi thứ ba (ngày thứ hai), kể cả có hoặc không dùng mã. Người chơi chậm có thể cần lâu hơn.

## Sau hướng dẫn

36 kịch bản cây/đơn/kết hợp, vốn 20/250 xu còn lại, buổi 15/30/60 phút, 14 buổi. Bật/tắt điểm danh + nhiệm vụ cũ + chính tuyến + daily trong cùng ví/kho/lịch thao tác; phần thưởng XP ảnh hưởng cấp và lựa chọn cây. Mọi nhiệm vụ gọi hàm claim thật, chỉ nhận khi đủ stat.

- Giữ toàn bộ ô trồng; chuồng khu riêng. Điểm danh và nhận nhiệm vụ đều tốn lượt thao tác.
- Bắt đầu sau hướng dẫn với 80 XP, stats sản xuất 0; không cộng lại 250 xu hướng dẫn hoặc mã đã dùng trước mua đất. Đây là so sánh chặng riêng, không phải nối save hoàn chỉnh từ chặng câu cá. Stats thực tế sau hướng dẫn có thể khác.
- Nhiệm vụ cũ tối đa 145 xu, chính tuyến tối đa 2140, daily tối đa 105/ngày nếu làm đủ. Hai hệ một lần có thể cùng trả thưởng cho cùng stat; ghi riêng để tránh bỏ sót. Không gọi đây là lỗi nhận lặp.
- Điểm danh reset UTC (07:00 giờ Việt Nam); daily nhiệm vụ reset 00:00 giờ Việt Nam. Hai lịch khác nhau là hành vi hiện tại, cần quyết định thiết kế riêng trước khi sửa.
- Sinh trưởng offline một vụ/đợt; không tự tạo sản phẩm hoặc nhận thưởng khi offline. Chưa tính đi bộ/trộm/mạng, câu cá sau đất hoặc giúp hàng xóm.

## Nhận lặp và xử lý

Kiểm tra MongoDB riêng xác nhận mỗi mã/ngày/quest/main/daily/hướng dẫn chỉ trả thưởng một lần và hai yêu cầu điểm danh đồng thời không trả hai lần. Đã sửa tra cứu quest cũ để loại ID kế thừa từ prototype và stat thiếu/không hợp lệ; không đổi giá trị thưởng.

## Kết luận

Đã áp dụng lô 6.000–12.000 xu và điểm danh 1.220 xu/tuần. Mã đã phát hành giữ nguyên. Mục tiêu ngày thứ hai đạt ở mô hình chơi thông thường, không bảo đảm mọi phong cách chơi; cần telemetry thực tế. Giá chỉ áp dụng giao dịch mới, điểm danh áp dụng lần nhận tiếp theo. Không reset tài sản.
