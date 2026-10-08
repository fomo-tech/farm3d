# Giao diện câu cá

FishingHUD dùng tông kem, xanh và cam đồng bộ cửa hàng. Thêm ba bước câu, thông tin mồi/thùng, nhãn vùng lực dây và cảnh báo dây chùng/căng. Giữ cơ chế giật cần và gửi nhịp giữ/thả hiện có.

Kết quả hiển thị ảnh render mesh cá trong game bằng useInventoryMeshArt (cache ảnh, không chạy thêm vòng render liên tục), độ hiếm, cân nặng và giá trị. Có fallback khi ảnh chưa sẵn sàng.

Kiểm tra UI bằng fishing-preview.html: vòng thả → chờ → giật → bắt cá thành công, thùng 1/10; kết quả mesh cá; lực dây 90% và mất kết nối khóa thao tác; mobile 390×844. Fixture không ghi tài khoản. Preview bổ sung các trạng thái bằng ?state=waiting|bite|fighting|caught, ?tension=90 và &offline=1. Ảnh desktop.png, mobile.png, caught.png.

test-fishing-config.mjs, test-fishing-session.mjs, test-app-bindings.mjs PASS. Fixture giữ React root qua HMR để tránh tạo root hai lần khi sửa giao diện.
