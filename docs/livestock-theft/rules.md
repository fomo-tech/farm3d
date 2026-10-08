# Ăn trộm nông sản và sản phẩm chăn nuôi

Cây chín và sản phẩm chăn nuôi đã sẵn sàng có thể bị lấy khi cổng trại mở. Khách bấm vật nuôi để đi tới, chọn Lấy sản phẩm rồi đứng yên trong 3 giây. Server kiểm tra khoảng cách tối đa 3 m, cổng, thời gian và đợt sản xuất trước khi trả thưởng. Di chuyển hoặc đóng cổng khiến thao tác thất bại.

Ăn trộm lấy hết sản lượng đang sẵn sàng. Cây trở về ô đất đã thu hoạch và mesh cây biến mất. Đợt sản phẩm gà, vịt, bò hoặc cừu bị lấy sẽ xóa productReadyAt: sản phẩm biến mất, chủ không thu lại được và phải cho ăn để bắt đầu đợt mới. Đợt cũ chỉ có 1 sản phẩm cũng áp dụng. Không lấy vật nuôi hoặc heo.

Hai loại ăn trộm dùng chung giới hạn 10 lượt mỗi người và 6 lượt mỗi trại mỗi ngày UTC. Trại mới được bảo vệ 30 phút. Kho khách đầy không làm mất sản phẩm của chủ. Thu của chủ và ăn trộm dùng trạng thái có phiên bản; giao dịch có biên nhận để phục hồi sau gián đoạn và tránh thưởng hai lần.

Kiểm tra: scripts/test-livestock-theft.mjs và scripts/test-livestock-theft-server.mjs. Bài kiểm tra MongoDB dùng cơ sở dữ liệu thử nghiệm riêng.
