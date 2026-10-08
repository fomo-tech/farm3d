# Phát triển vật nuôi

Đàn của người chơi đồng bộ trực tiếp từ account_state sau giao dịch. Bản tải khu vực không được ghi đè đàn đã xác nhận của người chơi; cache riêng cũng dùng khi chuồng được dựng lại.

Vật nuôi mua mới có lifeVersion=1 và createdAt phía server. Lần cho ăn đầu ghi matureAt: gà 30 phút, vịt 45 phút, heo 90 phút, bò/cừu 120 phút. Trước 50% thời gian là con non, sau đó đang lớn, khi đủ thời gian là trưởng thành. Mesh lớn từ 55% tới 100% kích thước riêng của loài. Không có sản phẩm trước trưởng thành. Sau đó các đợt sản xuất dùng thời gian sản xuất hiện hành, cho ăn sau khi thu.

Vòng nuôi 7 ngày lịch từ lúc mua, chạy khi offline. Hết vòng nuôi không biến mất: ngừng nhận đợt ăn mới. Thu nông sản cuối rồi chọn Cho nghỉ nuôi để trả chỗ. Heo đã trưởng thành vẫn có thể bán; heo hết vòng nuôi cũng có thể cho nghỉ. Không hoàn xu khi nghỉ nuôi. Vật nuôi cũ chưa có lifeVersion được giữ trạng thái trưởng thành, không bị hết hạn hồi tố.

Gà, vịt, bò và cừu sản xuất theo đợt 4 sản phẩm: chi phí thức ăn và thời gian sản xuất bằng 4 lần một sản phẩm, vẫn phải chờ trưởng thành. Ăn trộm lấy hết đợt sản phẩm sẵn sàng, xóa thời điểm sản phẩm để chủ bắt đầu đợt ăn mới. Đợt cũ 1 sản phẩm cũng áp dụng. Heo giữ cơ chế nuôi để bán.

Kiểm tra shared logic: scripts/test-livestock-lifecycle.mjs. Kiểm tra mesh mua mới và lớn lên: scripts/test-owned-herd.mjs. MongoDB riêng: scripts/test-livestock-server.mjs.
