import { ONBOARDING_STEPS } from '../game/economy/GameProgress.js';

export function ElderDialogueModal({
  step,
  onClose,
  onClaimSeeds,
  onGoToPlot,
  onOpenOrders,
  onClaimBicycle,
  onOpenGuide,
  villageName = 'Làng Bình Minh',
}) {
  return (
    <div className="onboarding-backdrop" onClick={onClose}>
      <section className="elder-dialogue-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header with Elder Portrait */}
        <header className="elder-dialogue-header">
          <div className="elder-portrait-wrap">
            <span className="elder-avatar">👴</span>
            <span className="elder-hat-badge">🌾</span>
          </div>
          <div className="elder-title-wrap">
            <span className="elder-tag">NGƯỜI HƯỚNG DẪN TÂN THỦ</span>
            <h3>Bác Ba · Trưởng {villageName}</h3>
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
                  “Chào mừng cháu đã đến với <strong>{villageName}</strong>! Bác là Ba, trưởng làng nơi đây.
                  Mảnh đất này màu mỡ lắm, rất thích hợp cho những người trẻ tuổi chăm chỉ lập nghiệp.”
                </p>
                <p>
                  “Để cháu làm quen với công việc đồng áng, bác có món quà tân thủ: <strong>3 hạt giống cà rốt tươi ngon</strong> và <strong>50 xu khởi nghiệp</strong>. Hãy nhận lấy rồi ra ô ruộng kế bên xới đất và gieo hạt đầu tiên nhé!”
                </p>
              </div>

              <div className="starter-gift-box">
                <div className="gift-item">
                  <span className="gift-icon">🥕</span>
                  <div className="gift-info">
                    <b>3× Hạt Giống Cà Rốt</b>
                    <small>Gieo trồng hoàn toàn miễn phí</small>
                  </div>
                </div>
                <div className="gift-item">
                  <span className="gift-icon">🪙</span>
                  <div className="gift-info">
                    <b>+50 Xu Khởi Nghiệp</b>
                    <small>Vốn ban đầu cho nông dân</small>
                  </div>
                </div>
              </div>

              <button type="button" className="elder-action-btn primary" onClick={onClaimSeeds}>
                🌱 Nhận 3 Hạt Giống & Ra Ruộng Canh Tác →
              </button>
            </div>
          )}

          {step === ONBOARDING_STEPS.FIRST_PLANT && (
            <div className="dialogue-step step-farming-guide">
              <div className="speech-bubble">
                <p>
                  “Để bắt đầu vụ mùa đầu tiên, cháu hãy làm theo <strong>4 bước cơ bản</strong> sau:”
                </p>
              </div>

              <div className="guide-steps-list">
                <div className="guide-step-row">
                  <span className="step-num">1</span>
                  <span className="step-tool-icon">⛏️</span>
                  <div>
                    <b>Chọn Cuốc (Phím 2)</b>
                    <small>Bấm vào ô đất trống để xới đất thành luống</small>
                  </div>
                </div>
                <div className="guide-step-row">
                  <span className="step-num">2</span>
                  <span className="step-tool-icon">🌱</span>
                  <div>
                    <b>Chọn Hạt Giống (Phím 3)</b>
                    <small>Gieo hạt cà rốt miễn phí vào luống đất đã xới</small>
                  </div>
                </div>
                <div className="guide-step-row">
                  <span className="step-num">3</span>
                  <span className="step-tool-icon">💧</span>
                  <div>
                    <b>Chọn Bình Tưới (Phím 4)</b>
                    <small>Tưới nước để hạt nảy mầm và bắt đầu lớn</small>
                  </div>
                </div>
                <div className="guide-step-row">
                  <span className="step-num">4</span>
                  <span className="step-tool-icon">🧺</span>
                  <div>
                    <b>Chờ Chín & Thu Hoạch (Phím 5 hoặc E)</b>
                    <small>Đất thần kỳ của Bác Ba giúp cây đầu tiên lớn chỉ trong 8 giây!</small>
                  </div>
                </div>
              </div>

              <button type="button" className="elder-action-btn primary" onClick={onGoToPlot}>
                🌾 Đi Tới Ô Ruộng Canh Tác Ngay →
              </button>
            </div>
          )}

          {step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS && (
            <div className="dialogue-step step-systems-explained">
              <div className="speech-bubble">
                <p>
                  “Tuyệt vời lắm! Cháu đã thu hoạch củ cà rốt đầu tiên rất thuần thục!
                  Trước khi bán hàng, bác muốn cháu nắm vững <strong>4 cơ chế quan trọng nhất</strong> trong thung lũng:”
                </p>
              </div>

              <div className="systems-grid">
                <div className="system-card highlight-barn">
                  <span className="sys-icon">📦</span>
                  <b>Kho Nông Sản & Tránh Kho Đầy</b>
                  <p>
                    Kho ban đầu chứa tối đa <strong>20 món</strong>. Khi kho đầy, cháu <em>sẽ không thể thu hoạch thêm</em>!
                    Hãy giao đơn hàng, bán bớt nông sản hoặc dùng xu nâng cấp sức chứa kho tại mục 🔨 Nâng Cấp.
                  </p>
                </div>

                <div className="system-card highlight-shop">
                  <span className="sys-icon">🌱</span>
                  <b>Cửa Hàng Vật Tư (Shop)</b>
                  <p>
                    Nơi mua hạt giống cao cấp hơn như <strong>Lúa mì, Cà chua, Dâu tây</strong> khi cháu tăng cấp. Cây cấp càng cao thì thu nhập bán ra càng lớn!
                  </p>
                </div>

                <div className="system-card highlight-orders">
                  <span className="sys-icon">📋</span>
                  <b>Bảng Đơn Hàng (Orders)</b>
                  <p>
                    Dân làng rất thích nông sản sạch! Giao đơn hàng sẽ đem lại <strong>nhiều Xu và XP hơn gấp 3 lần</strong> so với bán lẻ trực tiếp vào kho!
                  </p>
                </div>

                <div className="system-card highlight-bus">
                  <span className="sys-icon">🚌</span>
                  <b>Tuyến Xe Buýt Tuyến 01 (Bus)</b>
                  <p>
                    Xe buýt chạy liên tục đưa cháu du hành giữa <strong>Nông Trại, Trung Tâm Thành Phố, Hồ Pha Lê</strong> và <strong>Bãi Biển</strong> hoàn toàn miễn phí.
                  </p>
                </div>
              </div>

              <button type="button" className="elder-action-btn primary" onClick={onOpenOrders}>
                📦 Mở Bảng Đơn Hàng & Giao Đơn Đầu Tiên →
              </button>
            </div>
          )}

          {step === ONBOARDING_STEPS.DELIVER_ORDER && (
            <div className="dialogue-step step-waiting-order">
              <div className="speech-bubble">
                <p>
                  “Bác vừa đăng đơn hàng <strong>‘Bếp nhà Hoa Mai’</strong> lên Bảng đơn hàng rồi đấy.
                  Họ đang cần 1 củ cà rốt tươi ngon của cháu!”
                </p>
                <p>
                  “Cháu hãy mở Bảng Đơn Hàng (biểu tượng 📦 ở menu bên phải) và bấm <strong>‘Giao đơn’</strong> để hoàn thành nhé!”
                </p>
              </div>

              <button type="button" className="elder-action-btn primary" onClick={onOpenOrders}>
                📦 Mở Bảng Đơn Hàng Ngay →
              </button>
            </div>
          )}

          {step === ONBOARDING_STEPS.CLAIM_REWARD && (
            <div className="dialogue-step step-graduation">
              <div className="speech-bubble">
                <p>
                  “Chúc mừng cháu! Cháu đã giao thành công đơn hàng đầu tiên và nắm trọn vẹn quy trình làm nông nghiệp hiện đại!”
                </p>
                <p>
                  “Như đã hứa, Bác Ba trao tặng cháu phần thưởng tốt nghiệp lớn nhất: <strong>Chiếc Xe Đạp Thể Thao 🚲</strong> giúp tăng tốc độ di chuyển lên 10m/s, cùng <strong>200 Xu khởi nghiệp</strong>! Kể từ giờ, cháu hoàn toàn tự do khám phá thế giới rộng lớn này!”
                </p>
              </div>

              <div className="reward-summary-box">
                <div className="reward-pill bike">
                  <span className="pill-icon">🚲</span>
                  <div className="pill-text">
                    <b>Xe Đạp Thể Thao</b>
                    <small>Tốc độ di chuyển 10 (Gấp 1.5x đi bộ)</small>
                  </div>
                </div>
                <div className="reward-pill coins">
                  <span className="pill-icon">🪙</span>
                  <div className="pill-text">
                    <b>+200 Xu Thưởng</b>
                    <small>Vốn mở rộng nông trại</small>
                  </div>
                </div>
                <div className="reward-pill xp">
                  <span className="pill-icon">⭐</span>
                  <div className="pill-text">
                    <b>+80 Điểm Kinh Nghiệm (XP)</b>
                    <small>Nâng cao cấp độ nông dân</small>
                  </div>
                </div>
              </div>

              <button type="button" className="elder-action-btn grand-reward" onClick={onClaimBicycle}>
                🚲 Nhận Xe Đạp & Tự Do Khám Phá Thung Lũng ✨
              </button>
            </div>
          )}

          {step >= ONBOARDING_STEPS.COMPLETED && (
            <div className="dialogue-step step-done">
              <div className="speech-bubble">
                <p>
                  “Chào cháu! Rất vui được gặp lại cháu. Cứ chăm chỉ gieo trồng, chăm sóc vật nuôi và giao các đơn hàng lớn nhé. Nông trại của cháu chắc chắn sẽ là niềm tự hào của cả Thung Lũng Bình Minh!”
                </p>
              </div>

              <div className="elder-tips-card">
                <b>💡 Lời khuyên của Bác Ba:</b>
                <ul>
                  <li>Nhớ kiểm tra kho thường xuyên để tránh đầy kho nông sản.</li>
                  <li>Bắt xe buýt tới Thành phố để ghé thăm Cửa hàng vật tư và Sòng bài may mắn.</li>
                  <li>Lên cấp cao hơn để mở khóa Lúa mì, Cà chua và Dâu tây thơm ngọt!</li>
                </ul>
              </div>

              <div className="elder-actions-row">
                <button type="button" className="elder-action-btn secondary" onClick={onOpenGuide}>
                  📖 Xem Lại Cẩm Nang Nông Trại
                </button>
                <button type="button" className="elder-action-btn primary" onClick={onClose}>
                  Cảm ơn Bác Ba! Cháu đi làm vườn đây 🌾
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
