# Mô phỏng sản xuất và khai hoang 24 ô

Đây là mô hình offline từ cấu hình game hiện tại, không phải số liệu chơi thật. Không thay giá hay thưởng production. 18 kịch bản, mỗi kịch bản 56 buổi, một buổi/ngày.

## Kịch bản tham chiếu

Sau hướng dẫn: 4 ô, 20 xu còn lại, 80 XP; 30 phút/ngày; thao tác 2,5 giây; chọn cây có lợi nhuận lý thuyết cao nhất mỗi thời điểm; giữ vốn một vụ trước mở ô.

| Ô | Phút chơi tích lũy | Buổi |
| --- | --- | --- |
| 8 | 11.0 | 1 |
| 12 | 24.5 | 1 |
| 18 | 39.3 | 2 |
| 24 | 78.3 | 3 |

Tổng chi phí mở 20 ô: 27000 xu. Kho ban đầu 20 sản phẩm. Cây thường cho 4 sản phẩm/ô, không phải một.

## Cách tính và giới hạn

- Tính riêng tiền bán, vốn hạt và khai hoang; XP gieo/tưới/thu hoạch 2/1/8, cấp theo công thức server. Mở ô dùng trực tiếp quote và hàm unlock của game, có kiểm tra liền kề và cấp.
- Thu hoạch bị giới hạn kho; bán từng loại tối đa 99 sản phẩm/lượt, có thời gian thao tác. Bán nông sản hiện không kiểm tra vị trí trong server nên mô hình không tự thêm chuyến đi bán.
- Cây đã tưới tiếp tục chín khi offline, nhưng không tự thu hoạch/gieo lại hoặc tạo thêm nhiều vụ. Gieo xong phải tưới mới bắt đầu thời gian sinh trưởng.
- Không cộng quà, daily, nhiệm vụ, thu nhập câu cá, đơn hàng, chế biến hay vật nuôi. Bắt đầu sau hướng dẫn, không tính cây hướng dẫn 8 giây hoặc thưởng lần đầu.
- Chuồng có khu riêng; toàn bộ ô đất dùng để trồng cây. Không trừ ô trồng cho chuồng/xưởng.
- Không tính thất thoát do trộm, đi bộ giữa các ô, mạng, sai thao tác hay mất tập trung; kết quả là đường chơi hiệu quả với giả định thời gian thao tác, không phải cam kết cho người chơi.
- Các trường hợp 0 xu và không còn hạt miễn phí cho thấy rủi ro hết vốn; không đại diện tài khoản vừa nhận thưởng hướng dẫn.

## Đối chiếu nhịp khai hoang

| Ô vừa mở | Phút từ lần mở trước |
| --- | --- |
| 5 | 4.5 |
| 6 | 1.6 |
| 7 | 3.2 |
| 8 | 1.8 |
| 9 | 3.6 |
| 10 | 9.8 |
| 11 | 0.0 |
| 12 | 0.0 |
| 13 | 6.2 |
| 14 | 0.0 |
| 15 | 0.0 |
| 16 | 8.5 |
| 17 | 0.0 |
| 18 | 0.0 |
| 19 | 38.8 |
| 20 | 0.0 |
| 21 | 0.0 |
| 22 | 0.0 |
| 23 | 0.0 |
| 24 | 0.0 |

Đối chiếu nhóm 5–8 với mục tiêu 15–30 phút/ô, nhóm 9–12 với 30–60 phút/ô; nhóm cuối cần quan sát theo buổi. Phút giữa hai lần mở có cả thời gian chờ cấp và lựa chọn giữ vốn, không chỉ thời gian kiếm giá ô. Chưa suy giá mới trực tiếp từ một kịch bản vì diện tích làm tăng thu nhập.

## Bước tiếp theo

Đo thao tác và lợi nhuận nông trại thực tế, kiểm tra các kịch bản trong summary.csv, rồi thử phương án giá offline. Tính thu nhập chăn nuôi và chế biến riêng, không trừ diện tích trồng cây. Không coi 24 ô hoàn tất là kết thúc nghề nghiệp.
