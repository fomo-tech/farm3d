# Hội quán dân gian

Làm lại CasinoLobby với bảng sảnh kem/cam/xanh ngọc: bốn thẻ Tài Xỉu/Bầu Cua/Bài Cào/Tiến Lên, ảnh xúc xắc/linh vật/lá bài, ví xu, công tắc âm, luật chơi và danh sách bàn theo trò đã chọn. Nội dung luật và số ghế lấy từ CASINO_GAMES; bỏ nhãn HOT và quảng cáo phần thưởng không cần thiết.

Giữ callback chọn trò, vào bàn, vào bàn nhanh, tạo bàn và thoát ra sảnh 3D. Không thay đổi luật, server hay thao tác cược trong các màn bàn chơi. Khóa vào/tạo bàn khi mất kết nối, ngoài hội quán hoặc đang vào nhanh. Form tạo bàn lấy mức cược hợp lệ 10/50/100 xu từ CASINO_CONFIG.chips (form cũ có20/500 không được server chấp nhận). Mật khẩu tối đa64 ký tự, bàn riêng có form nhập mật khẩu. Server message truyền từ CasinoGames vào trạng thái trong sảnh để không bị bảng mới che.

Desktop hai cột, điện thoại nội dung một cột cuộn với header/footer luôn hiện. Escape đóng form trước, sau đó đóng sảnh; Tab giữ trong dialog hiện tại.

Đã kiểm tra bằng fixture cục bộ: thẻ trò/luật, danh sách bàn công khai/riêng, form tạo với đúng3 mức cược, form mật khẩu không cho vào khi trống, Escape form, mất kết nối khóa nút và bố cục390×844. Không vào bàn/cược xu trên tài khoản thật. Test casino-rules và app-bindings qua. Preview /hud-preview.html?loungeDemo=1, thêm loungeOffline=1 hoặc loungeOutside=1; /lounge-review.html cho điện thoại.

Build production thành công, git diff --check qua; cảnh báo chunk lớn có sẵn. Không có console error trong fixture.
