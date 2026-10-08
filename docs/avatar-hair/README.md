# Tóc avatar chibi

Bộ dựng `src/game/player/createAvatarHair.js` dùng một vỏ tóc liền có độ dày, không tạo mái hoặc lọn tóc rời. Đường chân tóc thay đổi theo kiểu để tạo mái lệch/mái bằng. Bob và tóc ngang vai kéo dài cùng vỏ tóc xuống hai bên và sau gáy, mở phần mặt. Hai đuôi và đuôi ngựa là các khối elip tròn đơn giản.

Mặc định nam là tóc ngắn mái lệch; nữ là bob ngang cằm. Mesh dùng chung material với avatar, tạo theo kiểu đang chọn và hủy geometry cũ khi đổi kiểu hoặc LOD. Tóc gộp thành 1–3 mesh theo material và phần đuôi ngựa có chuyển động.

## Các kiểu tóc

| Kiểu | Mã cửa hàng giữ nguyên |
| --- | --- |
| Đầu đinh ôm sát sọ | hair_buzzcut |
| Đuôi gà buộc cao | hair_high_ponytail |
| Mái lệch 7/3 | hair_slick_side; hair_classic trên avatar nam |
| Two-block mềm | hair_anime_bangs |
| Ngắn phồng nhẹ | hair_wavy_curly |
| Bob ngang cằm | hair_chic_bob; hair_classic trên avatar nữ |
| Dài ngang vai | hair_celestial_flow |
| Hai đuôi thấp | hair_twintails |

Đuôi ngựa, slick back, các alias wolf cut và surfer vẫn dùng được. Giá và mã các kiểu đã lưu giữ nguyên. Thêm màu nâu chocolate vào bảng màu; highlight nhuộm theo màu tóc và specular power giảm để ánh bóng mềm hơn.

## Kiểm tra

- `node scripts/test-avatar-hair.mjs`: mọi kiểu trong cửa hàng, cả hai giới, 3 LOD, hướng normal đỉnh tóc, dữ liệu geometry hữu hạn, giảm tam giác theo LOD, giữ chiều dài tóc, không tích lũy mesh khi đổi kiểu, đuôi ngựa còn parent chuyển động.
- `node scripts/test-avatar-appearance.mjs`
- `npm run test:fashion`
- `npm run build`

Số mesh tóc 1–3, không tính thân avatar hoặc các phụ kiện khác. Các lớp vỏ ngoài/trong cùng một mesh và giữ nguyên đường viền ở ba LOD. Chưa đo FPS trên thiết bị di động thật.

Đã kiểm tra bản đơn giản trong avatar-preview: tóc nam mái lệch, nữ bob chính diện, tóc ngang vai phía sau ở LOD xa và hai đuôi. Trang `/avatar-preview.html` có bảng chọn giới, kiểu tóc, màu, góc, LOD, ánh sáng và chuyển động. Ảnh `male-side-part.png` và `female-bob.png` là bản chụp preview.

Đầu đinh thu nhỏ vỏ tóc về sát kích thước sọ, không có mái rời. Đuôi gà dùng điểm buộc cao hơn đuôi ngựa cũ và đuôi tròn ngắn; giữ chuyển động đuôi khi chạy và ba mức LOD. Hai mã mới có trong cửa hàng và preview. Ảnh: `male-buzzcut.png`, `female-high-ponytail.png`.
