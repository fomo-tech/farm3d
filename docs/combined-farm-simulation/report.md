# Tổng kinh tế nông trại

60 kịch bản offline, 14 buổi, một buổi/ngày. Toàn bộ ô đất là ô trồng; chuồng dùng khu riêng. Không đổi giá/thưởng production.

## Tham chiếu: 250 xu sau hướng dẫn, 30 phút/ngày

| Cách chơi | Phút mở 24 ô | Xu cuối buổi 14 | Bán cây | Bán vật nuôi/sản phẩm | Bán chế biến | Giao đơn |
| --- | --- | --- | --- | --- | --- | --- |
| crops | Chưa đạt | 32959 | 215844 | 0 | 0 | 0 |
| orders | Chưa đạt | 34756 | 200564 | 0 | 0 | 17840 |
| combined-current | Chưa đạt | 55164 | 201316 | 18372 | 11808 | 17840 |
| combined-premium20 | Chưa đạt | 55164 | 201316 | 18372 | 11808 | 17840 |
| all-animals | Chưa đạt | 27830 | 210020 | 73736 | 11232 | 17840 |

Các cột bán/giao đơn là doanh thu, không phải lãi ròng. summary.csv tách hạt, chuồng, con giống, thức ăn, reset và khai hoang. Tiền cuối = tiền đầu + mọi khoản thu − mọi khoản chi; hàng tồn được ghi riêng.

## Luật mô hình

- Dùng chung một ví, kho 20 và ngân sách thao tác 2,5/5 giây. Mọi gieo/tưới/thu, cho ăn/thu/bán, giao/reset, chế biến/bán, xây chuồng/mua con giống/mở ô đều tốn một lượt. Không cộng các mô hình thu nhập độc lập.
- Chăn nuôi gọi trực tiếp applyLivestockAction của game: sức chứa, thức ăn, thời gian sản phẩm, XP, kho và heo bán rồi mua lại. Gà/bò trong profile combined; all-animals kiểm tra đủ 5 loài. Chuồng không chiếm ô trồng.
- Mở đất gọi quote/unlock thật, có liền kề/cấp và giữ vốn một vụ. Khởi đầu 4 ô, 80 XP; trừ đầy đủ tiền chuồng/con giống, không tặng đàn.
- Ưu tiên giao đơn đủ hàng; giữ nguyên liệu cho đơn kế tiếp, trồng thêm loại còn thiếu đã mở cấp; chỉ reset khi giao đủ tất cả và đủ xu. Reset tốn 25 xu.
- Chế biến chọn công thức có giá bán cao hơn giá trị nguyên liệu và không lấy hàng đang giữ cho đơn. Giá hiện tại khiến chiến lược hiệu quả bỏ qua công thức lỗ; premium20 tính giá +20% trên nguyên liệu; hiện trùng bảng giá chế biến đã áp dụng.
- Cây đã tưới và vật nuôi đã ăn có thể chín khi offline; mỗi đợt chỉ tạo một vụ/một sản phẩm, không tự thu/gieo/cho ăn/chế biến. Tồn hàng và thời điểm chín giữ qua buổi.
- Không cộng quà, daily, nhiệm vụ, câu cá, giúp hàng xóm, NPC mua nguyên liệu, nâng kho hoặc hướng dẫn nhanh. Đây là chặng sau hướng dẫn, không mô phỏng toàn bộ nguồn xu của game.
- Chưa tính đi bộ, mạng, trộm, bỏ thao tác hoặc sự khác biệt kỹ năng. Lịch ưu tiên xác định, không phải chứng minh lịch tối ưu hay dữ liệu chơi thật. Các profile có thể chọn cây khác nhau do XP nên khác biệt không chỉ do doanh thu vật nuôi.

## Dùng để cân khai hoang

So sánh các mốc 8/12/18/24 và độ dài buổi; chưa suy giá mới chỉ từ xu cuối. Giá khai hoang thử phải giữ vốn sản xuất và kiểm tra cùng các cách chơi này. Không giảm giá bán âm thầm để bù diện tích.
