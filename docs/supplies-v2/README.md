# Cửa hàng vật tư nông trại

- Thay panel shop chung bằng FarmSuppliesModal, dùng tông kem, cam và xanh đồng bộ HUD.
- Bảy loại hạt sử dụng ảnh render mesh cây trồng trong game; lọc tất cả hoặc đã mở theo cấp.
- Chi tiết hiển thị giá gieo, thời gian lớn, giá bán, tồn kho và hạt cà rốt miễn phí.
- Giữ callback chọn hạt hiện có. Chọn hạt không trừ xu; server xử lý chi phí khi gieo. Hạt chưa mở và mất kết nối không thể chọn để gieo.
- Bố cục máy tính hai vùng; điện thoại cuộn danh mục và chi tiết, giữ nút đóng sẵn dùng.

## Kiểm tra

- npm run build: thành công; còn cảnh báo chunk lớn của dự án.
- test-app-bindings.mjs và test-farm-config.mjs: PASS.
- Browser fixture: kiểm tra chọn Bí ngô, số xu không đổi, Dưa hấu cấp 6 bị khóa, bố cục 390×844 và không có console error.
- Ảnh: desktop.png, mobile.png. Fixture: /hud-preview.html?suppliesDemo=1 và /supplies-review.html.
- Fixture không thực hiện giao dịch trên tài khoản thật.
