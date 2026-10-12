# Nghiên cứu giao diện Play Together cho Vibe City

Ngày: 12/10/2026. Nghiên cứu từ tài liệu, ảnh chính thức và một ảnh tạo nhân vật lịch sử. Chưa trực tiếp chơi bản mới hoặc đo chuyển động trong game; không coi ảnh năm 2021 là giao diện hiện tại. Không dùng tài sản của Play Together trong sản phẩm.

## Nguồn đã đối chiếu

1. [Hướng dẫn chính thức HAEGIN](https://hub.playtogether.haegin.kr/homegame-guide/whats-the-play-together): điện thoại mở các chức năng, nhiệm vụ, bạn bè, bản đồ, tùy chỉnh và cài đặt; túi đồ là chức năng riêng ở góc phải trên.
2. [Ảnh gameplay trong hướng dẫn chính thức](https://static-platform.aghanim.com/news/a0/33/60/bf/a03360bf-359d-4534-8e83-9d8bbe1de77d.webp): đã xem trực tiếp. Cảnh ban đêm, HUD bao quanh thế giới 3D; avatar ở trái trên, tiền ở phải trên, điện thoại và túi đồ ở cạnh phải, chat ở trái dưới, nhảy ở phải dưới. Tiền dùng nền tối trong ảnh này: phong cách không chỉ được quyết định bởi màu pastel.
3. [Trang phát hành của HAEGIN trên Google Play](https://play.google.com/store/apps/details?hl=en_US&id=com.haegin.playtogether): mô tả thế giới xã hội 3D, tùy chỉnh nhân vật và nhà; hình quảng bá không đủ để suy ra mọi trạng thái UI.
4. [Hướng dẫn tùy chỉnh chính thức](https://help-playtogether.haegin.kr/hc/en-us/articles/1500008804941-What-is-Character-Customization): phân biệt ngoại hình, trang phục và biểu cảm; mở từ Phone > Customize.
5. [Ảnh tạo nhân vật lịch sử, Games.lol, 02/10/2021](https://games.lol/blog/play-together-gameplay-review-casual-social-game/): đã xem ảnh trực tiếp. Avatar lớn bên trái; lưới lựa chọn hình tròn bên phải; dấu tích nổi; một nút xác nhận xanh trời; nền tím đồng nhất. Đây là tham khảo bố cục lịch sử, không xác nhận bản mới.

## Nhận định từ hình ảnh

- Thế giới và nhân vật là nội dung chính. HUD ở các mép, không có thanh điều hướng ngang giống website.
- Hình ảnh truyền đạt chức năng trước chữ: icon có hình vật thể dễ nhận, nhãn ngắn. Cần nhất quán tỷ lệ và góc chiếu của icon, thay vì mỗi icon một kỹ thuật.
- Các lựa chọn ngoại hình dùng thumbnail và dấu tích; người chơi thấy ngay tác động trên avatar.
- Nền studio đơn giản giúp avatar rõ. Không cần thêm tranh phong cảnh giả lập để biến một form thành game.
- Màu tươi dùng để phân biệt hành động/trạng thái. Không phủ một gradient và shadow lên mọi thành phần.
- Ảnh gameplay đã xem có trạng thái ban đêm và yếu tố giao diện tối. Theo yêu cầu người dùng, Vibe City vẫn sẽ dùng các bề mặt sáng; học bố cục và chất lượng hình ảnh, không sao chép toàn bộ màu của ảnh.

## Các điểm Vibe City đang sai

- Cảnh nông trại SVG phẳng không cùng chất liệu với avatar Babylon 3D. Đã bỏ cảnh SVG vừa thêm.
- Màn tạo nhân vật có nhiều nhãn phụ và khoảng trống của biểu mẫu, avatar còn nhỏ so với diện tích.
- Thumbnail tóc là SVG tự vẽ, không phản ánh chính xác kiểu tóc trên model. Avatar lỗi WebGL cũng có fallback SVG. Không được gọi các phần này là thumbnail 3D.
- Inventory có render mesh thật nhưng trong lúc chờ vẫn dùng InventoryItemArt SVG. Cần một bộ thumbnail raster từ model, có cache và trạng thái tải riêng.
- Nhiều stylesheet nối tiếp với !important khiến thiết kế phụ thuộc thứ tự import. GameUiUpgrade.css chứa nhiều lần đổi theme; cần thay bằng một bộ token và quy tắc cuối duy nhất.
- Chỉ đổi bảng màu không giải quyết tỷ lệ avatar, thumbnail, cách tổ chức chức năng và chất lượng model.

## Đặc tả cho lần nâng cấp kế tiếp

### Tạo nhân vật

- Desktop/ngang: avatar 3D chiếm khoảng 45% chiều ngang; nhóm lựa chọn ở 55% còn lại. Dọc: avatar khoảng 35–40% chiều cao, bảng chọn phía dưới. Đo trên kích thước thật trước khi chốt.
- Một dòng tiêu đề; bỏ thẻ Lv.1 và các dòng trang trí không giúp chọn nhân vật.
- Tên bắt đầu trống, kiểm tra theo server; giữ nguyên tính năng đã sửa. Giới tính, tóc, màu da, màu tóc có nhóm rõ; không phục hồi chọn màu áo.
- Thumbnail tóc chụp từ cùng model và customization dùng trong game; PNG/WebP trong suốt, góc camera, ánh sáng và kích thước thống nhất. Không vẽ tóc hoặc phong cảnh mới bằng SVG.
- Nền studio đơn giản hoặc scene Babylon có chiều sâu thật. Avatar có bóng tiếp xúc, xoay được, không trôi lơ lửng.
- Nút xác nhận duy nhất, dấu tích rõ, vùng chạm tối thiểu 44px. Trạng thái đang kiểm tra tên và mất kết nối phải đọc được.

### HUD và cửa sổ

- Giữ các hành động sát mép; điện thoại tập trung chức năng phụ; nút túi đồ riêng. Không thêm hàng thẻ thông tin giữa thế giới.
- Bảng chọn tập trung vào icon/thumbnail, tên ngắn, giá/số lượng và thao tác. Không biến cửa hàng thành landing page.
- Bộ màu mục tiêu riêng cho Vibe City: kem #FFFCF2, mint #DDF4EA, xanh trời #9EDDF4, vàng #FFD877, xanh lá #94D884; chữ #4A6861. Đây là lựa chọn thiết kế, không phải màu trích đo từ game gốc.
- Chỉ dùng shadow nhỏ để phân tầng. Chọn/khóa/loading/disabled có tín hiệu riêng và tương phản đủ; không làm mọi thứ nhạt bằng opacity.

## Thứ tự triển khai và nghiệm thu

1. Hợp nhất theme, bỏ các override chết; không đổi hành vi lưu profile.
2. Render và cache thumbnail tóc/vật phẩm từ model; kiểm tra cả khi tải và WebGL lỗi.
3. Làm lại studio và tỷ lệ avatar; giữ tên trống, kiểm tra trùng, lưu tóc/da qua reconnect.
4. Đồng bộ HUD, điện thoại, túi đồ và cửa hàng bằng cùng bộ asset.
5. Chụp và kiểm tra 390×844, 844×390, 1280×800 với viewport đo được từ DOM. Trang không cuộn; mọi CTA nằm trong màn hình; thumbnail không bị cắt; mở/đóng bằng chuột, chạm và bàn phím hoạt động.

Chưa coi nghiên cứu này là bản nâng cấp hoàn tất. Cần kiểm chứng chuyển động, âm thanh và các màn còn thiếu bằng nguồn video/gameplay trước khi kết luận về độ giống tổng thể.
