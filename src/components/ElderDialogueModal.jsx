import React from 'react';
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
  Icon3dGuideBook,
  Icon3dSparkleStar,
} from './icons3d/GameIcons3D.jsx';

export function ElderDialogueModal({
  step,
  onClose,
  onClaimSeeds,
  onGoToPlot,
  onOpenOrders,
  onClaimBicycle,
  onOpenGuide,
  villageName = 'Vibe City',
}) {
  return (
    <div className="pt-dialogue-overlay" onClick={onClose}>
      <section
        className="pt-dialogue-bar-card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Hội thoại Quản Gia Oliver"
      >
        {/* Left Side: Huge Oliver 3D Chibi Peeking Portrait */}
        <div className="pt-dialogue-npc-wrap">
          <div className="pt-dialogue-npc-halo" />
          <div className="pt-dialogue-npc-portrait">
            <Icon3dManager size={92} />
          </div>
          <div className="pt-dialogue-npc-badge">
            <Icon3dSparkleStar size={13} />
            <span>QUẢN GIA</span>
          </div>
        </div>

        {/* Right Side: Dialogue Body */}
        <div className="pt-dialogue-main">
          {/* Header Bar */}
          <div className="pt-dialogue-header">
            <div className="pt-dialogue-speaker">
              <h3>Oliver · Quản Gia {villageName}</h3>
              <span className="pt-dialogue-tag">Cẩm nang cư dân mới</span>
            </div>
            <button
              type="button"
              className="pt-dialogue-close-btn"
              onClick={onClose}
              aria-label="Đóng hội thoại"
            >
              ✕
            </button>
          </div>

          {/* Dynamic Content Per Step */}
          <div className="pt-dialogue-speech-box">
            {step === ONBOARDING_STEPS.MEET_ELDER && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Chào mừng bạn đã đặt chân đến <strong>{villageName}</strong>! Tôi là Oliver, người quản gia sẽ đồng hành cùng bạn xây dựng nông trang thịnh vượng!”
                </p>
                <p className="pt-dialogue-text">
                  “Hãy nhận lấy món quà tân thủ: <strong>3 hạt giống cà rốt may mắn</strong> cùng <strong>50 xu khởi nghiệp</strong>. Mau ra ô đất cạnh nhà xới đất và gieo mầm nhé!”
                </p>

                {/* Glow Starter Gift Cards */}
                <div className="pt-dialogue-gifts-row">
                  <div className="pt-gift-pill seeds">
                    <span className="pt-gift-icon"><Icon3dSeeds size={32} /></span>
                    <div className="pt-gift-text">
                      <b>3x Hạt Cà Rốt Miễn Phí</b>
                      <small>Cây trồng khởi đầu</small>
                    </div>
                  </div>
                  <div className="pt-gift-pill coins">
                    <span className="pt-gift-icon"><Icon3dGoldCoin size={32} /></span>
                    <div className="pt-gift-text">
                      <b>+50 Xu Khởi Nghiệp</b>
                      <small>Tiền mặt ban đầu</small>
                    </div>
                  </div>
                </div>

                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn primary"
                    onClick={onClaimSeeds}
                  >
                    <Icon3dSeeds size={22} />
                    <span>Nhận Quà & Bắt Đầu Gieo Trồng →</span>
                  </button>
                </div>
              </div>
            )}

            {step === ONBOARDING_STEPS.FIRST_PLANT && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Hạt giống đã sẵn sàng trong túi đồ! Bạn hãy bước tới ô ruộng và thực hiện <strong>4 bước canh tác cơ bản</strong>:”
                </p>

                {/* 4-Step Farming Flow */}
                <div className="pt-farming-steps-row">
                  <div className="pt-farm-step-chip">
                    <span className="pt-chip-num">1</span>
                    <Icon3dHoe size={24} />
                    <div>
                      <b>Xới Đất</b>
                      <small>Phím 2</small>
                    </div>
                  </div>
                  <div className="pt-farm-step-chip">
                    <span className="pt-chip-num">2</span>
                    <Icon3dCarrot size={24} />
                    <div>
                      <b>Gieo Hạt</b>
                      <small>Phím 3</small>
                    </div>
                  </div>
                  <div className="pt-farm-step-chip">
                    <span className="pt-chip-num">3</span>
                    <Icon3dWateringCan size={24} />
                    <div>
                      <b>Tưới Nước</b>
                      <small>Phím 4</small>
                    </div>
                  </div>
                  <div className="pt-farm-step-chip highlight">
                    <span className="pt-chip-num">4</span>
                    <Icon3dBasket size={24} />
                    <div>
                      <b>Thu Hoạch</b>
                      <small>Chỉ 8 giây!</small>
                    </div>
                  </div>
                </div>

                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn primary"
                    onClick={onGoToPlot}
                  >
                    <Icon3dHoe size={22} />
                    <span>Đi Tới Ô Ruộng Canh Tác Ngay →</span>
                  </button>
                </div>
              </div>
            )}

            {step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Tuyệt vời! Bạn thu hoạch củ cà rốt đầu tiên rất cừ khôi! Hãy ghi nhớ <strong>4 cơ chế vàng</strong> sau đây:”
                </p>

                {/* 4 Systems Cards */}
                <div className="pt-systems-chips-grid">
                  <div className="pt-system-chip barn">
                    <span className="pt-sys-icon"><Icon3dBackpack size={24} /></span>
                    <div>
                      <b>Tránh Kho Đầy</b>
                      <p>Sức chứa 20 món. Đầy kho sẽ không thể thu hoạch thêm, hãy bán bớt hoặc giao đơn!</p>
                    </div>
                  </div>
                  <div className="pt-system-chip shop">
                    <span className="pt-sys-icon"><Icon3dShopCart size={24} /></span>
                    <div>
                      <b>Cửa Hàng Hạt Giống</b>
                      <p>Lên cấp để mở khóa thêm Lúa Mì, Cà Chua, Dâu Tây đem lại nhiều tiền hơn!</p>
                    </div>
                  </div>
                  <div className="pt-system-chip orders">
                    <span className="pt-sys-icon"><Icon3dOrdersBox size={24} /></span>
                    <div>
                      <b>Xe Tải Đơn Hàng</b>
                      <p>Giao đơn xe tải đem lại nhiều Xu và XP gấp 3 lần so với bán lẻ vào kho!</p>
                    </div>
                  </div>
                  <div className="pt-system-chip bus">
                    <span className="pt-sys-icon"><Icon3dModernCity size={24} /></span>
                    <div>
                      <b>Tuyến Xe Buýt Miễn Phí</b>
                      <p>Đưa bạn du ngoạn giữa Nông Trại, Phố Xá, Hồ Pha Lê và Bến Cảng tức thì!</p>
                    </div>
                  </div>
                </div>

                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn primary"
                    onClick={onOpenOrders}
                  >
                    <Icon3dOrdersBox size={22} />
                    <span>Mở Bảng Đơn Hàng & Giao Đơn Đầu Tiên →</span>
                  </button>
                </div>
              </div>
            )}

            {step === ONBOARDING_STEPS.DELIVER_ORDER && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Tôi vừa đăng đơn hàng <strong>‘Nhà Hàng Green Valley’</strong> lên Bảng đơn hàng cho bạn rồi đấy!”
                </p>
                <p className="pt-dialogue-text">
                  “Họ đang cần 1 củ cà rốt tươi ngon của bạn. Bấm nút dưới đây để giao đơn và nhận thù lao nhé!”
                </p>

                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn primary"
                    onClick={onOpenOrders}
                  >
                    <Icon3dOrdersBox size={22} />
                    <span>Mở Bảng Đơn Hàng Ngay →</span>
                  </button>
                </div>
              </div>
            )}

            {step === ONBOARDING_STEPS.CLAIM_REWARD && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Xuất sắc! Bạn đã giao thành công đơn hàng và tốt nghiệp khóa hướng dẫn tân thủ!”
                </p>
                <p className="pt-dialogue-text">
                  “Như đã hứa, phần thưởng lớn nhất dành cho bạn: <strong>Chiếc Xe Đạp Thể Thao Play Together</strong> (tốc độ 10m/s) cùng <strong>200 Xu</strong>!”
                </p>

                {/* Bike Reward Pill */}
                <div className="pt-reward-showcase-pill">
                  <span className="pt-showcase-icon"><Icon3dBike size={36} /></span>
                  <div className="pt-showcase-text">
                    <b>Xe Đạp Thể Thao Play Together (Đã Trang Bị)</b>
                    <small>Tăng tốc độ di chuyển gấp 1.5 lần + 200 Xu + 80 XP</small>
                  </div>
                </div>

                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn grand"
                    onClick={onClaimBicycle}
                  >
                    <Icon3dBike size={24} />
                    <span>Nhận Xe Đạp & Tự Do Khám Phá Vibe City →</span>
                  </button>
                </div>
              </div>
            )}

            {step >= ONBOARDING_STEPS.COMPLETED && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Rất vui được gặp lại bạn! Nông trại của bạn đang phát triển rất tốt. Hãy tiếp tục gieo trồng, nuôi thú và giao đơn hàng cùng bạn bè nhé!”
                </p>
                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn secondary"
                    onClick={onOpenGuide}
                  >
                    <Icon3dGuideBook size={20} />
                    <span>Mở Sổ Tay Nông Trại</span>
                  </button>
                  <button
                    type="button"
                    className="pt-dialogue-action-btn primary"
                    onClick={onClose}
                  >
                    <span>Tiếp Tục Chơi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
