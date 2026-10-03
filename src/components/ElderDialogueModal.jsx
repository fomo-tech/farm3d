import { ONBOARDING_STEPS } from '../game/economy/GameProgress.js';
import {
  Icon3dManager,
  Icon3dCarrot,
  Icon3dGoldCoin,
  Icon3dHoe,
  Icon3dSeeds,
  Icon3dWateringCan,
  Icon3dBasket,
  Icon3dBackpack,
  Icon3dShopCart,
  Icon3dOrdersBox,
  Icon3dModernCity,
  Icon3dBike,
  Icon3dStar,
  Icon3dGuideBook,
} from './icons3d/GameIcons3D.jsx';

export function ElderDialogueModal({
  step,
  onClose,
  onClaimSeeds,
  onGoToPlot,
  onOpenOrders,
  onClaimBicycle,
  onOpenGuide,
  villageName = 'Thung Lũng Green Valley',
}) {
  return (
    <div className="onboarding-backdrop" onClick={onClose}>
      <section className="elder-dialogue-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header with Farm Manager Portrait */}
        <header className="elder-dialogue-header">
          <div className="elder-portrait-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon3dManager size={48} />
          </div>
          <div className="elder-title-wrap">
            <span className="elder-tag">QUẢN GIA TRANG TRẠI</span>
            <h3>Oliver · Quản Gia {villageName}</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </header>

        {/* Dynamic Step Content */}
        <div className="elder-dialogue-content">
          {step === ONBOARDING_STEPS.MEET_ELDER && (
            <div className="dialogue-step step-welcome">
              <div className="speech-bubble">
                <p>
                  “Chào mừng bạn đã đến với <strong>{villageName}</strong>! Tôi là Oliver, quản gia điều hành trang trại tại thung lũng xinh đẹp này.
                  Vùng đất trù phú này là nơi lý tưởng để xây dựng một điền trang thịnh vượng và kết nối cùng bạn bè khắp nơi!”
                </p>
                <p>
                  “Để bạn bắt đầu hành trình làm chủ nông trang, tôi xin gửi tặng món quà tân thủ: <strong>3 hạt giống cà rốt tươi ngon</strong> và <strong>50 xu khởi nghiệp</strong>. Hãy nhận lấy rồi ra ô ruộng kế bên xới đất và gieo hạt đầu tiên nhé!”
                </p>
              </div>

              <div className="starter-gift-box">
                <div className="gift-item seeds">
                  <span className="gift-icon" style={{ display: 'inline-flex' }}><Icon3dSeeds size={28} /></span>
                  <div>
                    <b>3x Hạt Cà Rốt Miễn Phí</b>
                    <small>Gieo trồng không tốn xu</small>
                  </div>
                </div>
                <div className="gift-item coins">
                  <span className="gift-icon" style={{ display: 'inline-flex' }}><Icon3dGoldCoin size={28} /></span>
                  <div>
                    <b>+50 Xu Khởi Nghiệp</b>
                    <small>Tiền mặt ban đầu</small>
                  </div>
                </div>
              </div>

              <button type="button" className="elder-action-btn primary" onClick={onClaimSeeds} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Icon3dSeeds size={22} />
                <span>Nhận Quà Tân Thủ & Bắt Đầu Gieo Trồng →</span>
              </button>
            </div>
          )}

          {step === ONBOARDING_STEPS.FIRST_PLANT && (
            <div className="dialogue-step step-plant-guide">
              <div className="speech-bubble">
                <p>
                  “Bạn đã có hạt giống trong tay! Giờ hãy bước tới ô ruộng cạnh nhà và thực hiện <strong>4 bước canh tác cơ bản</strong>:”
                </p>
              </div>

              <div className="farming-quick-steps">
                <div className="guide-step-row">
                  <span className="step-num">1</span>
                  <span className="step-tool-icon" style={{ display: 'inline-flex' }}><Icon3dHoe size={24} /></span>
                  <div>
                    <b>Xới Đất (Phím 2)</b>
                    <small>Dùng cuốc xới tơi xốp ô đất trồng</small>
                  </div>
                </div>
                <div className="guide-step-row">
                  <span className="step-num">2</span>
                  <span className="step-tool-icon" style={{ display: 'inline-flex' }}><Icon3dCarrot size={24} /></span>
                  <div>
                    <b>Gieo Hạt Cà Rốt (Phím 3)</b>
                    <small>Hạt đầu tiên hoàn toàn miễn phí!</small>
                  </div>
                </div>
                <div className="guide-step-row">
                  <span className="step-num">3</span>
                  <span className="step-tool-icon" style={{ display: 'inline-flex' }}><Icon3dWateringCan size={24} /></span>
                  <div>
                    <b>Tưới Nước Đầy Đủ (Phím 4)</b>
                    <small>Tưới nước giúp cây lớn nhanh gấp đôi</small>
                  </div>
                </div>
                <div className="guide-step-row">
                  <span className="step-num">4</span>
                  <span className="step-tool-icon" style={{ display: 'inline-flex' }}><Icon3dBasket size={24} /></span>
                  <div>
                    <b>Chờ Chín & Thu Hoạch (Phím 5 hoặc E)</b>
                    <small>Đất dinh dưỡng đặc biệt giúp cây đầu tiên lớn chỉ trong 8 giây!</small>
                  </div>
                </div>
              </div>

              <button type="button" className="elder-action-btn primary" onClick={onGoToPlot} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Icon3dHoe size={22} />
                <span>Đi Tới Ô Ruộng Canh Tác Ngay →</span>
              </button>
            </div>
          )}

          {step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS && (
            <div className="dialogue-step step-systems-explained">
              <div className="speech-bubble">
                <p>
                  “Tuyệt vời lắm! Bạn đã thu hoạch củ cà rốt đầu tiên rất thuần thục!
                  Trước khi giao thương, tôi muốn bạn nắm vững <strong>4 cơ chế quan trọng nhất</strong> trong thung lũng:”
                </p>
              </div>

              <div className="systems-grid">
                <div className="system-card highlight-barn">
                  <span className="sys-icon" style={{ display: 'inline-flex' }}><Icon3dBackpack size={26} /></span>
                  <b>Kho Nông Sản & Tránh Kho Đầy</b>
                  <p>
                    Kho ban đầu chứa tối đa <strong>20 món</strong>. Khi kho đầy, bạn <em>sẽ không thể thu hoạch thêm</em>!
                    Hãy giao đơn hàng, bán bớt nông sản hoặc dùng xu nâng cấp sức chứa kho tại mục Nâng Cấp.
                  </p>
                </div>

                <div className="system-card highlight-shop">
                  <span className="sys-icon" style={{ display: 'inline-flex' }}><Icon3dShopCart size={26} /></span>
                  <b>Cửa Hàng Vật Tư (Shop)</b>
                  <p>
                    Nơi mua hạt giống cao cấp hơn như <strong>Lúa mì, Cà chua, Dâu tây</strong> khi bạn tăng cấp. Cây cấp càng cao thì thu nhập bán ra càng lớn!
                  </p>
                </div>

                <div className="system-card highlight-orders">
                  <span className="sys-icon" style={{ display: 'inline-flex' }}><Icon3dOrdersBox size={26} /></span>
                  <b>Bảng Đơn Hàng & Xe Tải Giao Hàng</b>
                  <p>
                    Thị trấn rất ưa chuộng nông sản tươi! Giao đơn hàng xe tải sẽ đem lại <strong>nhiều Xu và XP hơn gấp 3 lần</strong> so với bán lẻ vào kho!
                  </p>
                </div>

                <div className="system-card highlight-bus">
                  <span className="sys-icon" style={{ display: 'inline-flex' }}><Icon3dModernCity size={26} /></span>
                  <b>Tuyến Xe Buýt Nhanh Tuyến 01</b>
                  <p>
                    Xe buýt chạy liên tục đưa bạn du hành giữa <strong>Nông Trại, Trung Tâm Thành Phố, Hồ Pha Lê</strong> và <strong>Bến Cảng</strong> hoàn toàn miễn phí.
                  </p>
                </div>
              </div>

              <button type="button" className="elder-action-btn primary" onClick={onOpenOrders} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Icon3dOrdersBox size={22} />
                <span>Mở Bảng Đơn Hàng & Giao Đơn Đầu Tiên →</span>
              </button>
            </div>
          )}

          {step === ONBOARDING_STEPS.DELIVER_ORDER && (
            <div className="dialogue-step step-waiting-order">
              <div className="speech-bubble">
                <p>
                  “Tôi vừa đăng đơn hàng <strong>‘Nhà Hàng Green Valley’</strong> lên Bảng đơn hàng rồi đấy.
                  Họ đang cần 1 củ cà rốt tươi ngon của bạn!”
                </p>
                <p>
                  “Bạn hãy mở Bảng Đơn Hàng (biểu tượng Hộp Đơn ở menu bên phải) và bấm <strong>‘Giao đơn’</strong> để hoàn thành nhé!”
                </p>
              </div>

              <button type="button" className="elder-action-btn primary" onClick={onOpenOrders} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Icon3dOrdersBox size={22} />
                <span>Mở Bảng Đơn Hàng Ngay →</span>
              </button>
            </div>
          )}

          {step === ONBOARDING_STEPS.CLAIM_REWARD && (
            <div className="dialogue-step step-graduation">
              <div className="speech-bubble">
                <p>
                  “Chúc mừng bạn! Bạn đã giao thành công đơn hàng đầu tiên và nắm trọn vẹn quy trình vận hành nông trang mạng xã hội hiện đại!”
                </p>
                <p>
                  “Như đã hứa, tôi xin trao tặng bạn phần thưởng tốt nghiệp lớn nhất: <strong>Chiếc Xe Đạp Thể Thao</strong> giúp tăng tốc độ di chuyển lên 10m/s, cùng <strong>200 Xu khởi nghiệp</strong>! Kể từ giờ, bạn hoàn toàn tự do khám phá và phát triển nông trại cùng bạn bè!”
                </p>
              </div>

              <div className="reward-summary-box">
                <div className="reward-pill bike">
                  <span className="pill-icon" style={{ display: 'inline-flex' }}><Icon3dBike size={26} /></span>
                  <div className="pill-text">
                    <b>Xe Đạp Thể Thao</b>
                    <small>Tốc độ di chuyển 10 (Gấp 1.5x đi bộ)</small>
                  </div>
                </div>
                <div className="reward-pill coins">
                  <span className="pill-icon" style={{ display: 'inline-flex' }}><Icon3dGoldCoin size={26} /></span>
                  <div className="pill-text">
                    <b>+200 Xu Thưởng</b>
                    <small>Vốn mở rộng nông trại</small>
                  </div>
                </div>
                <div className="reward-pill xp">
                  <span className="pill-icon" style={{ display: 'inline-flex' }}><Icon3dStar size={26} /></span>
                  <div className="pill-text">
                    <b>+80 Điểm Kinh Nghiệm (XP)</b>
                    <small>Nâng cao cấp độ nông dân</small>
                  </div>
                </div>
              </div>

              <button type="button" className="elder-action-btn grand-reward" onClick={onClaimBicycle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Icon3dBike size={24} />
                <span>Nhận Xe Đạp & Tự Do Khám Phá Thung Lũng</span>
              </button>
            </div>
          )}

          {step >= ONBOARDING_STEPS.COMPLETED && (
            <div className="dialogue-step step-done">
              <div className="speech-bubble">
                <p>
                  “Xin chào! Rất vui được gặp lại bạn. Hãy tiếp tục gieo trồng, chăm sóc vật nuôi và giao các đơn hàng xe tải lớn nhé. Nông trại của bạn chắc chắn sẽ là niềm tự hào của cả Thung Lũng Green Valley!”
                </p>
              </div>

              <div className="elder-tips-card">
                <b>Lời khuyên từ Quản Gia:</b>
                <ul>
                  <li>Nhớ kiểm tra kho thường xuyên để tránh đầy kho nông sản.</li>
                  <li>Bắt xe buýt tới Thành phố để ghé thăm Cửa hàng vật tư và Sòng bài may mắn.</li>
                  <li>Lên cấp cao hơn để mở khóa Lúa mì, Cà chua và Dâu tây thơm ngọt!</li>
                </ul>
              </div>

              <div className="elder-actions-row">
                <button type="button" className="elder-action-btn secondary" onClick={onOpenGuide} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Icon3dGuideBook size={20} />
                  <span>Xem Lại Cẩm Nang Nông Trại</span>
                </button>
                <button type="button" className="elder-action-btn primary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>Cảm ơn Quản Gia! Tôi đi làm vườn đây</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
