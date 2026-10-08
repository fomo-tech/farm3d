> **ĐÍNH CHÍNH:** Các mục lịch sử về chuồng/xưởng chiếm ô trồng và kết luận chi phí cơ hội theo diện tích đã bị rút lại. Chuồng dùng khu chăn nuôi có sẵn; ô đất chỉ dùng trồng cây. Các thay đổi đó đã gỡ khỏi server/UI/3D; chế biến không cần xây xưởng trên ô trồng.

# PLAN — hoàn thiện kinh tế nông trại

Ngày: 06/10/2026. Cơ sở: `game-economy-audit-2026-10-06.md` và `farm-land-progression-plan.md`.

Đây là kế hoạch triển khai, chưa phải thay đổi giá đã phát hành. Các khoảng thời gian và tỷ lệ dưới đây là mục tiêu thử nghiệm dành cho game này, không phải chuẩn bắt buộc của ngành.

## 1. Trải nghiệm và phạm vi

Vòng chơi: làm việc ở thị trấn/câu cá → tích lũy mua lô → nhà nhỏ + 4 ô → sản xuất/giao đơn → chọn mở đất, kho, chuồng hoặc xưởng → phát triển nghề và trang trí.

Ngày chơi dùng để cân: hai buổi, mỗi buổi 30 phút. Mua lô rẻ nhất sau khoảng 60–120 phút chơi tích cực, trải qua 2–4 buổi; không khóa bằng thời gian lịch. Người chơi chơi lâu có thể đạt sớm hơn. Kịch bản 15 và 60 phút/buổi phải được đo riêng.

Trước mua đất phải có việc làm sinh lời, mục tiêu nhiệm vụ và nội dung khám phá. Không để phần hướng dẫn nông trại chặn toàn bộ tiến trình tân thủ. Giữ lô 24 ô và cấp 4 ô sử dụng ngay khi mua. Giá vùng và công trình cần bảo đảm có lựa chọn, không yêu cầu người chơi mở tất cả các ô theo một thứ tự.

Trong đợt này: xu, cây, câu cá, đơn hàng, chăn nuôi, xưởng, khai hoang, thưởng và giao dịch NPC. Nội dung nghề/sưu tầm mới triển khai từng phần theo công dụng thực. Không triển khai chợ giao dịch giữa người chơi trong đợt đầu; chợ đó cần thiết kế cung cầu riêng.

## 2. Mục tiêu định lượng ban đầu

| Mốc | Mục tiêu thử nghiệm | Cách đo |
| --- | --- | --- |
| Hoạt động kiếm xu đầu tiên | Trong 5 phút sau tạo nhân vật | Bao gồm đi lại, nhận dụng cụ và giao diện |
| Mua lô đầu rẻ nhất | 60–120 phút chơi tích cực | Tính mọi thưởng được hiển thị cho tân thủ |
| Vụ đầu sau mua | Hoàn thành trong 5 phút | Không cần mở thêm ô hoặc vay vốn |
| Ô 5–8 | 15–30 phút tích lũy ròng mỗi ô | Theo thu nhập tại số ô/cấp hiện tại |
| Ô 9–12 | 30–60 phút mỗi ô | Có cạnh tranh chi tiêu cho kho/công trình |
| Ô 13–18 | 1–2 buổi 30 phút mỗi ô | Kèm mục tiêu công dụng mới |
| Ô 19–24 | Dài hơn vùng trước | Chốt sau khi đo; không tăng giá tùy ý |
| Nông trại 24 ô | Vẫn có công trình/nghề/sưu tầm | Không coi mở hết đất là hết nội dung |

Mốc 9–12 và 13–18 có thể chồng thời gian vì mô tả khác nhau; cần xem kết quả mô phỏng để làm đường tiến triển mượt. Không sử dụng cấp như đồng hồ ngày chơi.

## 3. Giai đoạn A — đóng nguồn tạo xu sai

### Giao dịch NPC

Tách rõ giá NPC bán và giá NPC thu mua. Với từng gói, tổng tiền thu mua phải thấp hơn tiền mua. Mức chênh mua thử 20–30%, chỉ chốt khi kiểm tra vai trò mua bổ sung cho đơn hàng. Không dùng chênh giá này cho chợ người chơi trong tương lai.

Chuyển bảng gói ven đường và giá vào config dùng chung; server lấy giá từ config, bỏ yêu cầu client cung cấp giá như bằng chứng. Kiểm tra quầy, khoảng cách và số lượng nguyên. Quy định mỗi quầy có hàng hữu hạn, thời điểm bổ sung rõ ràng nếu cần hàng rẻ theo sự kiện. Stock hữu hạn phải là tổng stock server, không reset khi reconnect.

Kiểm tra `sell_item`, `sell_product`, `sell_livestock_product`, `fishing_sell` về định danh, số lượng, tồn kho và cách thanh toán. Đặc biệt kiểm tra bán cá với amount lẻ: mã hiện tại chưa ép số nguyên như bán nông sản. Số xu và số vật phẩm phải luôn nguyên không âm. Không chỉ kiểm tra vòng mua/bán đơn; kiểm tra cả đường mua → chế biến → bán và mua → giao đơn → reset.

Nghiệm thu: không có chu trình thu xu vô hạn từ nguồn NPC không giới hạn; hai yêu cầu cùng tồn kho không bán quá số đang có; lỗi không thay số dư; thao tác ngoài quầy được xử lý đúng luật đã chọn.

### Thưởng tân thủ

Tổng thưởng xu tân thủ thông thường thử ở 10–20% giá lô rẻ nhất, phân phối theo việc hoàn thành. Thưởng dụng cụ/hạt không bán được có thể dùng để bảo đảm bắt đầu chơi. Lập danh sách tất cả code đang bật, điểm danh, nhiệm vụ, onboarding và sự kiện; code công khai phải được tính vào đường tiến triển nhanh nhất.

Không thu hồi xu đã nhận. Mã đã quảng bá còn hiệu lực cần giữ cam kết hoặc có thông báo thời hạn; giảm ngân sách áp dụng cho đợt mã tiếp theo. Tách nhiệm vụ trước mua đất khỏi nhiệm vụ nông trại để người mới có hướng đi.

Nghiệm thu: thưởng dự kiến không bỏ qua mốc mua lô; người không dùng code vẫn có đường tiến triển; claim lặp không nhận hai lần.

## 4. Giai đoạn B — config, đo lường và mô phỏng

Config mục tiêu: `shared/economyConfig.js` cho quy tắc chung; tiếp tục dùng `farmConfig.js`, `fishingConfig.js`, `landConfig.js`, `landExpansionConfig.js` cho từng hệ. Tách orders/recipes/roadside/reward khỏi literal trong `GameStore.js`. Giá và điều kiện chỉ do server quyết định. Phiên bản balance ghi trong kết quả mô phỏng và các biên nhận quan trọng. Không đổi luật đơn/production đang chạy khi đổi config.

Mỗi giao dịch ghi mã, người chơi, nguồn/sink, xu trước/sau, vật phẩm vào/ra, phiên bản config, thời gian; không ghi token. Dùng biên nhận/outbox để gắn log với thay đổi trạng thái đã commit. Đặt thời hạn lưu log thô; thống kê dài hạn không cần lưu mọi thao tác.

Simulator dùng config và luật dùng chung. Thời gian phải rời rạc: gieo → tưới → chờ → thu → bán; không chỉ dùng công thức xu/giờ. Bao gồm XP, mở cấp, vốn hạt, kho, chu kỳ vật nuôi, stock NPC, đi lại, bán cá, phiên chơi/offline, nhiệm vụ một lần, daily, tỷ lệ thất bại câu cá và lựa chọn chi tiêu.

Kịch bản: 15/30/60 phút mỗi buổi; tích cực/quay lại theo buổi; không code/có toàn bộ code; chuyên câu cá/chuyên cây/pha trộn; không mở rộng/mở ngay đủ tiền/ưu tiên công trình; bắt đầu 4/8/12/18/24 ô. Câu cá dùng nhiều seed để báo trung vị và P10/P90; thời gian thao tác được đo từ chơi thật rồi đưa vào simulator. Không tạo kết luận chắc chắn từ các giả định thao tác chưa đo.

Đầu ra: thời gian mua lô; vốn còn sau mua; xu ròng/buổi theo nguồn; chi phí/thời gian tới từng ô và công trình; tăng thu nhập sau mở; thời gian đầy kho; tốc độ XP; thời gian bị kẹt không đủ vốn.

Nghiệm thu: công thức audit và simulator khớp trong trường hợp đơn giản; thay config đổi kết quả; kết quả cùng seed tái lập; báo cáo nêu các giả định và phần chưa triển khai.

## 5. Giai đoạn C — cân nguồn thu trước mua đất

Câu cá: đo toàn chu trình từ quầy tới bờ, câu, kéo/thất bại, đầy thùng, quay về bán. Tính cost mồi cả lần thất bại, cần một lần và nâng dụng cụ. Không bắt buộc hao độ bền chỉ vì config có durability; chỉ thêm nếu tạo lựa chọn có ích và được mô phỏng.

Không mồi: ít tốn vốn, lợi nhuận ổn định; trùn: lợi ích thao tác hoặc tốc độ; mồi hiếm: phục vụ bộ sưu tập/đơn đặc biệt. Nếu một mồi chỉ làm giảm lợi nhuận và không có công dụng rõ thì chỉnh công dụng hoặc bỏ. Đừng chỉ kéo dài chờ cắn để giảm thu nhập.

Việc thị trấn: bổ sung số việc nhỏ hữu hạn theo buổi, có hành động thật và thưởng; giúp hàng xóm chỉ trả khi cây thực sự chuyển trạng thái, không trả cho click lặp. Nguồn giúp hàng xóm không được là đường duy nhất vì cần người khác online.

Chốt giá lô sau khi có đường tích lũy từ 180 xu, bao gồm dụng cụ và thưởng. Giữ khác biệt giá theo vị trí; không buộc tất cả lô cùng đạt mốc 1–2 ngày. Người mua bằng toàn bộ số dư vẫn nhận vốn vụ đầu hợp lệ, một lần, gắn giao dịch mua.

## 6. Giai đoạn D — sản xuất, đơn hàng và công trình

### Cây

Giữ giá bán hiện tại trong lượt mô phỏng đầu để biết nguồn sai lệch. Đánh giá sản lượng, vốn hạt, thời gian thao tác và độ dài vụ cùng nhau. Cây cấp cao phải có công dụng: ít thao tác hơn, đơn hàng, recipe hoặc thu nhập hợp lý; không bắt buộc mọi cây có xu/giờ tăng theo cấp.

### Đơn hàng

Thưởng xu thử bằng giá bán nguyên liệu cộng premium 10–25%; XP và vật liệu có ngân sách riêng. Giới hạn đơn đang hoạt động, có thời điểm bổ sung; cho bỏ đơn khó với chờ hợp lý. Không sinh đơn đòi tài sản chưa sở hữu trừ đơn mục tiêu được ghi rõ. Kiểm tra mua nguyên liệu để giao vẫn không thành nguồn xu vô hạn. Đơn đã nhận lưu phiên bản, điều kiện và thưởng.

### Xưởng

Recipe thử tạo giá trị bán cao hơn nguyên liệu 15–30%, trước khi tính chi phí khác; kiểm tra lợi nhuận sau mọi chi phí. Đây chỉ là vùng tìm kiếm, không phải giá phát hành. Xưởng có thời gian và hàng đợi giới hạn, chủ sở hữu, recipe theo cấp và diện tích đặt. Không tiêu nguyên liệu khi queue đầy. Tiến trình server tồn tại qua offline/restart; nhận sản phẩm một lần; kho đầy giữ sản phẩm ở xưởng.

### Vật nuôi và kho

Chuồng chiếm footprint; mua con giống và thức ăn giữ giá rõ ràng. Kiểm tra hoàn vốn từng loài và vai trò heo bán một lần so với gia cầm/sữa lặp. Quyết định số đợt sản phẩm offline được giữ; không tự bổ sung đợt feed miễn phí. Kho nâng để giảm thao tác, không phải yêu cầu trả tiền bắt buộc cho vụ đầu.

Nghiệm thu: công trình không chồng cây/nhà/lối đi; craft có mục tiêu kinh tế; mọi tiền/vật phẩm sản xuất đúng qua reconnect/restart; lựa chọn đầu tư có đánh đổi thực.

## 7. Giai đoạn E — khai hoang theo vùng

Giữ tọa độ 6×4 và quyền liền kề chung cạnh. Lập bản đồ vùng cố định; mỗi ô có regionId, cost và điều kiện, giá không đổi chỉ vì người chơi mở hướng khác. Mỗi vùng cần có giá trị dùng được: cây, chuồng, xưởng, hồ trưng bày hoặc sân. Không gọi tính năng là hoàn thành khi chỉ thêm nhãn vùng.

Tính giá bằng thu nhập ròng tại giai đoạn × thời gian tích lũy mục tiêu, sau đó chạy simulator toàn đường mở đất. Giá mỗi ô không tính trực tiếp theo thu nhập cá nhân, tránh trừng phạt người chơi hiệu quả. Nếu cần vật liệu, ưu tiên từ đơn/nghề có tiến độ bảo đảm; công bố rõ nguồn. Chưa thêm drop ngẫu nhiên chặn bắt buộc ở 4 ô đầu.

Giữ vốn hạt qua UI gợi ý; chỉ áp bắt buộc giữ vốn nếu mô phỏng cho thấy cần và giải thích rõ điều kiện. Không reset người cũ: ánh xạ ô cũ, giữ công trình/cây; quyền mở đất vượt 24 cần xử lý bằng quyền tương đương hoặc phương án chuyển đổi có kiểm kê trước khi phát hành.

Nghiệm thu: đủ 24 ô, giá đúng vùng, chọn được nhiều hướng, ô lỗi không trừ xu, spam/reconnect không trừ hai lần, save cũ không mất tài sản.

## 8. Giai đoạn F — ví casino và giờ reset

Tách ví bằng trường riêng và dịch vụ thanh toán riêng. Tài khoản casino có ngân sách cấp theo thiết kế, không đổi qua lại xu farm. Không tự chuyển toàn bộ số dư farm hiện tại. Hoàn tất/giữ luật các ván và escrow đang chạy trước chuyển đổi; có kế hoạch restart/recovery cho biên nhận cũ. Giao diện ghi rõ hai số dư.

Daily/điểm danh chọn giờ reset thống nhất UTC+7. Chuyển ngày cũ bằng trạng thái có phiên bản để người đã claim không nhận thêm hoặc mất một ngày do chuyển múi giờ. Kiểm tra mốc trước/sau nửa đêm và việc đổi ngày trong phiên online.

## 9. Chạy thử và phát hành

Thứ tự: A → B → C → D → E; F có thể phát triển sau B nhưng phát hành riêng khi đã kiểm tra migration. Chia thành các thay đổi nhỏ, mỗi phần có config, kiểm chứng và tài liệu đi cùng. Không phát hành bảng giá cho tính năng xưởng/đơn chưa có.

Chạy simulator trước, sau đó nhiều client trên database thử riêng. Kiểm tra thao tác hợp lệ, spam, thiếu xu, tồn kho, cạnh tranh ghi, reconnect, restart giữa commit và broadcast. Kiểm tra UI desktop/điện thoại về giá, điều kiện, cảnh báo vốn và thông báo lỗi.

Chạy thử nhóm nhỏ, thu ít nhất các kiểu chơi tích cực/quay lại/câu cá/nông trại; quan sát đủ 7 ngày để bao quát chu kỳ điểm danh. Nếu chưa có người thử, ghi rõ kết quả chỉ là simulator và QA nội bộ.

Chỉ số: trung vị/P10/P90 thời gian mua lô và mở ô, tỷ lệ bắt đầu vụ đầu, số lần hết vốn, nguồn tạo xu lớn nhất, xu ròng/buổi, công trình được chọn, vật phẩm chế biến được dùng, tỷ lệ mua-bán NPC. Không đánh giá thu nhập của người chơi bằng số dư đơn thuần.

Phát hành có phiên bản balance, snapshot/backup phục hồi cho migration và ghi thay đổi rõ. Không rollback nguyên trạng số dư sau khi người chơi đã giao dịch; cần công cụ sửa dữ liệu theo biên nhận nếu phát sinh lỗi. Không thu hồi tài sản đã mua chỉ vì giá mới thay đổi.

## 10. Điều kiện hoàn tất

- Không có vòng giao dịch NPC vô hạn và xu/vật phẩm luôn nguyên không âm.
- Đường chơi trước mua đất có nội dung và đạt nhịp thử nghiệm đã chọn.
- Vụ đầu có đủ vốn; 4 ô ban đầu tạo đường phát triển khả thi.
- Đơn/xưởng/vật nuôi là lựa chọn hữu ích, công trình chiếm diện tích thật.
- Giá vùng và tiến trình 24 ô được mô phỏng và kiểm tra chơi; có mục tiêu sau 24 ô.
- Thưởng một lần, daily, casino và nguồn thu lặp được thống kê rõ.
- Không mất/nhân đôi tài sản qua lỗi mạng hoặc restart; migration người cũ được kiểm kê.
- Báo cáo cuối phân biệt simulator, QA nhiều client và dữ liệu chơi thử thực tế.

Bước triển khai đầu: config giao dịch NPC + chặn amount lẻ + kiểm tra các vòng mua/bán/giao đơn, đồng thời đưa toàn bộ thưởng hiện hành vào báo cáo mô phỏng. Chưa đổi toàn bộ giá đất/cây cùng một lần.

## Tiến độ sau bước mô phỏng

Đã bổ sung ghi nhận câu cá phía server, outbox giao dịch và báo cáo hiệu chỉnh simulator. Hướng dẫn: [fishing-telemetry.md](fishing-telemetry.md). Chưa thu dữ liệu chơi thật; bước tiếp theo là chạy thử các buổi 15/30/60 phút rồi đối chiếu thời gian mua đất. Chưa áp dụng giá/thưởng của phương án thử offline.

Đã triển khai simulator trước mua đất và catalog thưởng trong `scripts/economy/preLandSimulation.js`. Có lệnh `npm run simulate:economy`, JSON/CSV và báo cáo ở `docs/economy-simulation/report.md`. Chạy 147 kịch bản × 32 seed, 8 buổi/seed, so sánh hiện tại với phương án thử offline. Giá/thưởng game hiện tại chưa đổi. Giai đoạn B còn mô phỏng sản xuất/khai hoang và đo telemetry thật; không coi phần này là hoàn tất toàn bộ mô phỏng kinh tế.

## Tiến độ mô phỏng nông trại

Đã bổ sung `npm run simulate:farm-economy`: 36 kịch bản về vốn còn lại, giữ vốn/mở ngay, buổi 15/30/60 phút và diện tích sản xuất. Báo cáo: [farm-expansion-simulation/report.md](farm-expansion-simulation/report.md). Tính năng suất 4 sản phẩm/ô, kho 20, cấp, liền kề và sinh trưởng offline; không cộng thưởng hoặc thu nhập công trình. Kịch bản tham chiếu đạt 24 ô trong khoảng 78 phút chơi, buổi thứ 3. Đây là giả định mô phỏng; chưa áp dụng giá mới và chưa hoàn tất mô phỏng chuồng/xưởng/đơn hàng.

## Thử giá và quy định diện tích

Có `npm run simulate:expansion-prices` so sánh giá hiện tại với hai bảng thử offline. Xem [expansion-price-trials/report.md](expansion-price-trials/report.md). `shared/farmBuildingConfig.js` quy định chuồng nhỏ/xưởng nhỏ 2 ô, chuồng lớn 4 ô và kiểm tra xoay/ranh giới/ô đã mở/đè cây. Chưa nối footprint vào giao dịch xây, UI hoặc mô hình thế giới; chuồng cũ và chế biến vẫn dùng luật hiện tại. Giá thử chưa áp dụng production.

## Xây chuồng có diện tích

Đã nối chọn vị trí chuồng trong bảng chăn nuôi với kiểm tra server và lưu `progress.farmBuildings`. Chuồng gà/vịt 2 ô, heo/bò/cừu 4 ô. Server từ chối đè cây/chuồng/ô khóa, lưu tiền và vị trí nguyên tử, khóa cùng thao tác ruộng; farm_action chặn ô có công trình. Bảng khai hoang và chọn vị trí hiển thị ô đã có chuồng. Kiểm tra MongoDB và build đạt. Chưa chuyển mô hình chuồng 3D khỏi khu chăn nuôi cũ; xưởng/chế biến chưa nối với footprint. Không reset dữ liệu trong bước này.

## Xưởng và tọa độ hiển thị

Đã nối footprint vào vị trí chuồng/vật nuôi trong OwnedHerd; chuồng cũ chưa có footprint giữ vị trí cũ. Xưởng nhỏ chiếm 2 ô, giá thử 300 xu trong farmBuildingConfig; xây qua UI chọn vị trí, kiểm tra ô/cây/overlap và lưu nguyên tử. Chế biến yêu cầu đã có xưởng. Public farm scope đồng bộ xưởng tới người chơi gần đó; mô hình xưởng cơ bản. Giá khai hoang vẫn giữ cấu hình hiện tại. Không reset dữ liệu. Chưa kiểm thử trực quan trong trình duyệt.

## Kiểm tra UI và chi phí cơ hội

Đã kiểm tra component chọn vị trí trong trình duyệt bằng trang building-placement-preview.html, dữ liệu thử trong bộ nhớ: xây chuồng 80 xu, xây xưởng 300 xu, khóa vùng trùng và trừ xu đúng. Đây chưa phải kiểm tra toàn bộ phiên game 3D/WebSocket. Báo cáo report:building-investment phân tích suất thu liên tục và chi phí cơ hội trong docs/building-investment/report.md; mọi công thức hiện mất xu so với bán nguyên liệu, chuồng kém cà rốt trên diện tích tương đương khi chăm liên tục. Chưa phải mô phỏng lịch hỗn hợp đầy đủ hoặc dữ liệu chơi thật.

## Thử giá chế biến

Có `npm run simulate:crafting-prices` và `npm run test:crafting-prices`: so sánh hiện tại với premium 10/20/30% trên giá nguyên liệu. Cận chi phí NPC theo đơn vị và kiểm tra 1–100 gói nguyên đều chặn lợi nhuận mua/chế biến/bán; vòng đầy đủ đơn/reset vẫn âm. Báo cáo docs/crafting-price-trials/report.md đề xuất premium20 để thử tiếp (72/96/288 xu). Chưa áp dụng production; số mẻ hoàn vốn chỉ tính 300 xu xây xưởng, chưa trừ đất và thời gian.

## Lịch sản xuất với xưởng

Có `simulate:workshop-farm` và `test:workshop-farm`: 192 cặp so sánh đất đã mở 4/8/12/24 ô, lúa mì/dâu, buổi 15/30/60 phút, thao tác 2,5/5 giây, bốn bảng giá. Một ngân sách thao tác chung, kho/tồn hàng/offline một vụ và 300 xu vốn xây. Báo cáo docs/workshop-farm-simulation/report.md. Premium20 chưa bảo đảm xưởng thắng giữ đất: trường hợp dâu 12 ô tham chiếu dương nhưng lúa mì âm, diện tích lớn còn bị nút thắt thao tác. Chưa đổi giá game; chưa mô phỏng thích nghi mọi lịch, XP, đi bộ, chuồng hoặc mở rộng đồng thời.

## Tổng kinh tế đúng cấu trúc nông trại

Đã bổ sung `simulate:combined-farm` và `test:combined-farm`: 60 kịch bản dùng chung ví, kho và ngân sách thao tác cho cây, đàn vật nuôi, chế biến, giao/reset đơn và khai hoang. Chuồng dùng khu riêng; không chiếm ô trồng. Chăn nuôi gọi applyLivestockAction thật. Báo cáo docs/combined-farm-simulation/report.md tách mọi nguồn thu/chi và các mốc mở ô. Giá current và premium20 được so sánh offline; chưa thay production. Mô hình sau hướng dẫn, không cộng thưởng nhiệm vụ/daily/quà/câu cá, chưa tính đi bộ hoặc người chơi bỏ thao tác. Tham chiếu tổng kinh tế đạt 24 ô khoảng 59–62 phút tích lũy, nhanh hơn chỉ trồng cây khoảng 78 phút.

## Thử giá khai hoang trên tổng kinh tế

Có `simulate:combined-expansion-prices` và `test:combined-expansion-prices`: current/paced/long trên 60 kiểu điều kiện mỗi bảng, tối đa 56 buổi. Chuồng khu riêng và toàn bộ ô đất dành trồng. Báo cáo docs/combined-expansion-price-trials/report.md ghi mốc tích lũy, buổi, khoảng cách từng lần mở và vốn hạt còn lại; giữ rõ mốc chưa đạt. Chưa chọn hoặc áp dụng giá production. Nhóm 5–8/9–12 được đối chiếu mục tiêu 15–30/30–60 phút mỗi ô, không gọi phân bố kịch bản là phân bố người chơi.

## Chỉnh nhịp ô 5–8

`simulate:early-expansion` chạy 240 kịch bản (4 bảng × 60 điều kiện), 14 buổi. Hàm expansionTrialConfig hỗ trợ giá từng lượt mở ô 5/6/7/8, không ép tọa độ hoặc hướng mở; nhóm sau giữ paced. Ứng viên early-a (2500/5000/6500/8000 xu) đạt mục tiêu 15–30 phút ở 211/240 lần mở, so với 139/240 ở giá phẳng. Không vi phạm vốn hạt; đây là độ bao phủ kịch bản, chưa phải dữ liệu người chơi. Báo cáo docs/early-expansion-refinement/report.md; chưa đổi production.

## Áp dụng giá khai hoang v2

Theo yêu cầu người dùng, đã áp dụng early-a vào shared/landExpansionConfig.js: 2500/5000/6500/8000 xu cho ô 5–8; 20000/60000/120000 cho các nhóm tiếp theo. Không sửa giá lô, cây, vật nuôi, chế biến hoặc thưởng. Save cũ giữ nguyên xu/ô. Các báo cáo thử trước đây là snapshot trước áp dụng, không đại diện config hiện tại; thử previous trong script đã tách giá cũ khỏi production. Chưa tự khởi động lại server đang chạy.

## Cảnh báo vốn khai hoang

LandExpansionPanel có bảng giá/số dư sau mua/vốn hạt/vốn thức ăn và xác nhận riêng khi vốn thấp. shared/landExpansionBudget.js chỉ tính tham khảo, không đổi giá/luật server hoặc chiếm ô trồng. Cây chưa đủ cấp quay về cà rốt; hạt miễn phí chỉ dùng cà rốt. Kiểm tra ngưỡng vừa đủ, thiếu một xu, đàn, hạt và không sửa tài khoản bằng test:land-expansion-budget.

## Áp dụng giá chế biến v2

Đã áp dụng premium20: bột 72, phô mai 96, mứt 288 xu trong NPC_TRADING_CONFIG v2. Bảng chế biến thêm bán từng sản phẩm, số lượng kho và giá bán; chế biến thiếu nguyên liệu bị vô hiệu hóa. Kiểm tra NPC/Mongo xác nhận không có vòng lãi mua-chế biến-bán, giá server và tranh chấp nguyên liệu. docs/crafting-balance.md mô tả thay đổi; audit code hiện tại ở docs/game-economy-current.json. Không thay raw prices, XP, input, quà hoặc thu hồi tài sản. Còn kiểm chứng nguồn thưởng/mua đất và chơi thật, không coi hoàn tất toàn bộ kinh tế.

## Audit thưởng và chống nhận lặp

`audit:reward-impact` kết hợp 12 điều kiện trước đất ×32 seed và 36 kịch bản sau hướng dẫn bật/tắt thưởng. Chuồng khu riêng, cùng ví/kho/thời gian; gọi claim nhiệm vụ và chăn nuôi thật. Cộng riêng attendance/legacy/main/daily và XP; không cộng lại hướng dẫn/mã quà vào vốn sau đất. docs/reward-impact/report.md: initial+mã+điểm danh ngày 1 =2180, đủ lô 2000 ngay; không mã có điểm danh vẫn khoảng28 phút mô phỏng. test:economy-rewards Mongo qua cho mọi nhóm thưởng, nhận lại và đồng thời. Đã chặn quest ID prototype/stat thiếu qua shared/questRewards.js, không đổi số tiền thưởng. Còn quyết định ngân sách quà/điểm danh và nhịp mua đất; chưa hoàn tất cân bằng toàn game.
