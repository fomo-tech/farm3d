# Cảnh vật hai bờ hồ và sông

Mô-đun cảnh quan được dựng cùng GrandWindingRiver trong thế giới thật. Dùng đường bờ chính xác của bốn hồ mạng lưới, Hồ Pha Lê, năm nhánh sông và sông chính. Các hồ mới có cảnh vật ở đủ bốn hướng; mỗi dòng sông có cả bờ trái và phải. Phần phía đông Hồ Pha Lê hòa vào sông, cảnh vật đi theo bờ đất của sông thay vì đặt vào vùng hợp lưu.

Cụm cây lớn/cây non, bụi hoa, lau, đá rêu xen kẽ khoảng trống. Hồ Thông Xanh có thông; Hồ Sen có cây hoa và sen nổi; hồ lau có cụm lau; các đoạn sông khác có thông, cây xanh và cây hoa rải rác. Góc nghỉ có ghế gỗ quay ra nước, cây che bóng, hoa, đèn thấp và vài đá bước chân. Cảnh vật trang trí không mở popup và không bổ sung tương tác ngồi/câu cá mới.

Bố trí có hạt giống cố định, tránh mặt nước, đường, cầu, đất nông trại và khoảng trống 6 m quanh điểm dịch chuyển (cộng bán kính từng cụm). Kiểm tra lại vị trí 147,-70, các cầu và toàn bộ điểm dịch chuyển hồ. Sen nổi nằm trong lòng Hồ Sen và tách độ cao khỏi mặt nước để tránh nhấp nháy.

545 cụm đất được ghép theo vật liệu trong 51 ô 96 m, cùng các điểm sen nổi. Tổng 498 batch/315534 đỉnh cho toàn cảnh; thế giới thật bật/tắt từng ô theo WorldChunkStreamer. Đây là số toàn cảnh từ kiểm tra mesh, không phải số draw call thực tế mỗi khung hình hay cam kết FPS trên thiết bị mobile. Dựng theo generator để scheduler chia công việc giữa các khung hình. Không tạo observer animation cho từng cây.

Kiểm tra: scripts/test-waterfront-scenery.mjs (hai bờ, khoảng trống, mesh, streaming và giải phóng tài nguyên), test-water-network.mjs, test-water-shore-movement.mjs và test-lake-travel.mjs. Bản xem mesh thật riêng: /waterfront-preview.html; không thay thế kiểm tra hiệu năng trên điện thoại thật.
