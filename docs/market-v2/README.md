# Cửa hàng dân gian Hoa Mai

Gian hàng ven đường được thiết kế lại với mái sọc kem/cam, icon WebP HUD, ảnh cây trồng từ mesh game (useInventoryMeshArt), ví xu và thanh sức chứa kho. Desktop bốn gói hàng trong một hàng; điện thoại một cột cuộn. Header/tabs/footer cố định trong bảng.

Nông sản bổ sung giữ giá và số lượng từ NPC_TRADING_CONFIG. Guard trước khi mua: kết nối, chờ xác nhận, đủ xu, đủ chỗ kho, callback. Server vẫn kiểm tra vị trí và giao dịch qua handleBuyOffer hiện có. Nút Đến gian hàng giữ callback dẫn đường. Hàng trong kho hiển thị số lượng và giá thu mua theo CROPS, thêm nút Mở Túi đồ được nối trong App. Không thêm thao tác bán giả.

Đã kiểm tra bằng dữ liệu thử: bốn ảnh mesh, mua 5 cà rốt/84 xu (1248→1164; kho6→11; cà rốt3→8), thiếu xu (còn thiếu44), kho đầy, mất kết nối, pending, tab kho, mở Túi đồ, Escape, desktop và390×844. Không mua bằng tài khoản thật. Không có console error.

Test app-bindings và npc-economy qua; git diff --check qua. Preview /hud-preview.html?marketDemo=1; thêm marketFull/marketPoor/marketOffline/marketPending=1 để kiểm tra trạng thái. /market-review.html cho điện thoại.
