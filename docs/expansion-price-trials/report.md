> **ĐÃ RÚT LẠI:** Báo cáo dùng giả định sai rằng chuồng/xưởng chiếm ô trồng. Không sử dụng kết luận hoặc số liệu này để cân bằng game. Chuồng có khu riêng; ô đất dành cho trồng cây.

# Thử giá khai hoang và diện tích công trình

36 kịch bản offline, 56 buổi tối đa, 20 xu và 80 XP sau hướng dẫn. Mỗi ngày một buổi; không đổi cấu hình giá game. Thời gian thao tác giả định 2,5 giây.

## Giá mỗi ô theo nhóm

| Phương án | Ô 5–8 | Ô 9–12 | Ô 13–18 | Ô 19–24 |
| --- | --- | --- | --- | --- |
| current | 350 | 700 | 1400 | 2400 |
| moderate | 1500 | 4000 | 10000 | 24000 |
| long | 2500 | 7000 | 18000 | 45000 |

## Phút chơi tích lũy, 30 phút/ngày, giữ vốn

| Phương án | 8 ô | 12 ô | 18 ô | 24 ô |
| --- | --- | --- | --- | --- |
| current | 11.0 | 24.5 | 39.3 | 78.3 |
| moderate | 38.1 | 76.6 | 177.9 | 318.3 |
| long | 53.3 | 128.6 | 270.8 | 541.2 |

Đây là thử nghiệm độ nhạy, chưa phải bảng giá được chọn. So sánh thêm phương án giữ vốn/mở ngay và 2 ô dành cho công trình trong summary.csv. Không tự tăng giá production từ kết quả này.

## Diện tích đã quy định cho mô hình

- Chuồng nhỏ: 2 × 1 ô; được xoay thành 1 × 2.
- Xưởng nhỏ: 2 × 1 ô; được xoay thành 1 × 2.
- Chuồng lớn: 2 × 2 ô.

Hàm buildingFootprint kiểm tra ranh giới 6 × 4, ô đã khai hoang và không đè cây/công trình. Ví dụ vị trí chuồng nhỏ ban đầu: 0:0, 1:0. Các quy tắc này mới là cấu hình/hàm kiểm tra dùng cho bước triển khai vị trí. Game hiện vẫn lưu chuồng bằng animalPens; chưa áp dụng diện tích vào chuồng cũ hoặc khóa chế biến sau xưởng.

Hai ô dành công trình trong simulator được giữ ngay từ đầu và không tạo thu nhập, không trừ tiền xây: đây là thử nghiệm phần diện tích mất đi, không phải mô phỏng toàn bộ chăn nuôi/xưởng. Chưa có giá riêng hoặc năng suất chuồng lớn; không tự suy diễn tăng sức chứa.

## Điều cần làm trước áp dụng game

Thêm chọn vị trí công trình trên UI, lưu tọa độ/ô chiếm chỗ cùng giao dịch xây; kiểm tra farm_action phía server; hiển thị footprint trong thế giới; quy định chuyển chuồng cũ không phá cây và không thu lại tiền. Sau đó mô phỏng thu nhập hỗn hợp theo luật thật và thử người chơi để chọn giá.
