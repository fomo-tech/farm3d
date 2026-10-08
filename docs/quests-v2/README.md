# Sổ nhiệm vụ

MissionBoard trở thành modal riêng, tránh lồng trong game-panel. Giao diện kem, cam, xanh đồng bộ cửa hàng, dùng các ảnh WebP HUD hiện có cho sổ, xu, chỉ đường và phần thưởng. Giữ ba loại nhiệm vụ, chương chính tuyến, theo dõi HUD, chỉ đường và callback nhận thưởng.

Badge từng loại đếm nhiệm vụ có thể nhận thưởng dựa trên tiến độ và điều kiện hiện có. Bố cục điện thoại giữ thanh danh mục, nút đóng và phần chân; chương cuộn ngang, thẻ nhiệm vụ xuống hàng. Có focus trap và Escape.

Kiểm tra trình duyệt với dữ liệu thử: ba danh mục, theo dõi/bỏ theo dõi, nhận thưởng chuyển sang chặng tiếp, màn hình 390×844; không console error. Ảnh desktop.png, mobile.png. Fixture /hud-preview.html?questsDemo=1, /quests-review.html. Không nhận thưởng trên tài khoản thật trong fixture.

test-app-bindings.mjs và test-missions.mjs PASS.
