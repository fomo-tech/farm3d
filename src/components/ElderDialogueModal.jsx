import React from 'react';
import { ONBOARDING_STEPS } from '../game/economy/GameProgress.js';
import {
  Icon3dManager,
  Icon3dGoldCoin,
  Icon3dSeeds,
  Icon3dBike,
  Icon3dGuideBook,
  Icon3dOrdersBox,
  Icon3dHoe,
  Icon3dSparkleStar,
  Icon3dBackpack,
  Icon3dShopCart,
  Icon3dDeliveryTruck,
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
        {/* Left Side: Oliver 3D Chibi Peeking Portrait */}
        <div className="pt-dialogue-npc-wrap">
          <div className="pt-dialogue-npc-halo" />
          <div className="pt-dialogue-npc-portrait">
            <Icon3dManager size={86} />
          </div>
          <div className="pt-dialogue-npc-badge">
            <Icon3dSparkleStar size={13} />
            <span>OLIVER</span>
          </div>
        </div>

        {/* Right Side: Dialogue Body */}
        <div className="pt-dialogue-main">
          {/* Header Bar */}
          <div className="pt-dialogue-header">
            <div className="pt-dialogue-speaker">
              <h3>Quản Gia Oliver · {villageName}</h3>
              <span className="pt-dialogue-tag">Cư dân mới</span>
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

          {/* Dynamic Content Per Step - Single Punchy Dialogue */}
          <div className="pt-dialogue-speech-box">
            {step === ONBOARDING_STEPS.MEET_ELDER && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Chào bạn mới! Tặng bạn <strong>3 hạt giống cà rốt</strong> và <strong>50 xu khởi nghiệp</strong> này!”
                </p>

                {/* 3D Gift Pills */}
                <div className="pt-dialogue-gifts-row">
                  <div className="pt-gift-pill seeds">
                    <span className="pt-gift-icon"><Icon3dSeeds size={28} /></span>
                    <b>3 Hạt Cà Rốt</b>
                  </div>
                  <div className="pt-gift-pill coins">
                    <span className="pt-gift-icon"><Icon3dGoldCoin size={28} /></span>
                    <b>+50 Xu Khởi Nghiệp</b>
                  </div>
                </div>

                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn primary"
                    onClick={onClaimSeeds}
                  >
                    <Icon3dSeeds size={20} />
                    <span>Nhận Quà & Làm Ruộng ➔</span>
                  </button>
                </div>
              </div>
            )}

            {step === ONBOARDING_STEPS.FIRST_PLANT && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Hạt giống đã sẵn sàng! Mau ra ô ruộng trước nhà xới đất và gieo hạt nhé!”
                </p>

                {/* 4 Micro Farming Steps */}
                <div className="pt-farming-steps-row">
                  <div className="pt-farm-step-chip">
                    <span className="pt-chip-num">1</span>
                    <span>Xới đất (phím 2)</span>
                  </div>
                  <div className="pt-farm-step-chip">
                    <span className="pt-chip-num">2</span>
                    <span>Gieo hạt (phím 3)</span>
                  </div>
                  <div className="pt-farm-step-chip">
                    <span className="pt-chip-num">3</span>
                    <span>Tưới nước (phím 4)</span>
                  </div>
                  <div className="pt-farm-step-chip highlight">
                    <span className="pt-chip-num">4</span>
                    <span>Thu hoạch (8s)</span>
                  </div>
                </div>

                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn primary"
                    onClick={onGoToPlot}
                  >
                    <Icon3dHoe size={20} />
                    <span>Ra Ruộng Canh Tác ➔</span>
                  </button>
                </div>
              </div>
            )}

            {step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Cà rốt tươi ngon quá! Cùng mở <strong>Bảng Đơn Hàng</strong> để giao xe tải kiếm bộn tiền nhé!”
                </p>

                {/* 3 Quick Benefit Chips */}
                <div className="pt-systems-chips-row">
                  <span className="pt-sys-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Icon3dBackpack size={16} /> Kho 20 chỗ</span>
                  <span className="pt-sys-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Icon3dShopCart size={16} /> Shop hạt giống</span>
                  <span className="pt-sys-tag highlight" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Icon3dDeliveryTruck size={16} /> Đơn hàng x3 Xu & XP</span>
                </div>

                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn primary"
                    onClick={onOpenOrders}
                  >
                    <Icon3dOrdersBox size={20} />
                    <span>Mở Bảng Đơn Hàng ➔</span>
                  </button>
                </div>
              </div>
            )}

            {step === ONBOARDING_STEPS.DELIVER_ORDER && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Nhà Hàng Green Valley đang cần 1 củ cà rốt của bạn. Giao đơn để nhận thù lao nào!”
                </p>

                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn primary"
                    onClick={onOpenOrders}
                  >
                    <Icon3dOrdersBox size={20} />
                    <span>Giao Đơn Ngay ➔</span>
                  </button>
                </div>
              </div>
            )}

            {step === ONBOARDING_STEPS.CLAIM_REWARD && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Xuất sắc! Chúc mừng bạn tốt nghiệp! Nhận ngay <strong>Xe Đạp Thể Thao</strong> để tự do vi vu!”
                </p>

                {/* Bike Showcase */}
                <div className="pt-reward-showcase-pill">
                  <span className="pt-showcase-icon"><Icon3dBike size={36} /></span>
                  <div className="pt-showcase-text">
                    <b>Xe Đạp Thể Thao Play Together</b>
                    <small>Tốc độ 10m/s + 200 Xu + 80 XP</small>
                  </div>
                </div>

                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn grand"
                    onClick={onClaimBicycle}
                  >
                    <Icon3dBike size={22} />
                    <span>Nhận Xe Đạp & Tốt Nghiệp ➔</span>
                  </button>
                </div>
              </div>
            )}

            {step >= ONBOARDING_STEPS.COMPLETED && (
              <div className="pt-step-content">
                <p className="pt-dialogue-text">
                  “Chào bạn! Hãy tiếp tục trồng trọt, câu cá và dạo phố cùng bạn bè nhé!”
                </p>
                <div className="pt-dialogue-actions">
                  <button
                    type="button"
                    className="pt-dialogue-action-btn secondary"
                    onClick={onOpenGuide}
                  >
                    <Icon3dGuideBook size={18} />
                    <span>Mở Sổ Tay</span>
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
