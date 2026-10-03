import React, { useState } from 'react';
import { ONBOARDING_STEPS } from '../game/economy/GameProgress.js';
import {
  Icon3dManager,
  Icon3dRiceSpike,
  Icon3dOrdersBox,
  Icon3dBike,
  Icon3dGuideBook,
  Icon3dSparkleStar,
  Icon3dCarrot,
  Icon3dFootsteps,
} from './icons3d/GameIcons3D.jsx';

export function OnboardingHUD({
  progress,
  targetDistance,
  onNavigateTarget,
  onTalkToElder,
  onOpenGuide,
  onOpenOrders,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const onboarding = progress?.onboarding;
  if (!onboarding || onboarding.completed) return null;

  const step = onboarding.step;

  let stepNumber = 1;
  let stepLabel = 'BƯỚC 1/5';
  let title = 'Gặp Quản Gia Oliver';
  let desc = 'Đến gặp Quản gia cạnh đài phun nước để nhận quà tân thủ!';
  let targetName = 'Quản Gia Oliver';
  let targetIcon = <Icon3dManager size={26} />;
  let actionText = 'ĐI NGAY!';
  let onAction = onTalkToElder;
  let avatarIcon = <Icon3dManager size={40} />;

  if (step === ONBOARDING_STEPS.FIRST_PLANT) {
    stepNumber = 2;
    stepLabel = 'BƯỚC 2/5';
    title = 'Vụ Cà Rốt Đầu Tiên';
    targetName = 'Ô Ruộng Canh Tác';
    targetIcon = <Icon3dRiceSpike size={24} />;
    actionText = 'RA RUỘNG!';
    onAction = onNavigateTarget;
    avatarIcon = <Icon3dCarrot size={40} />;

    if (progress.stats.planted === 0) {
      desc = 'Dùng Cuốc (phím 2) xới đất ➔ Gieo hạt Cà rốt miễn phí (phím 3)';
    } else if (progress.stats.watered === 0) {
      desc = 'Dùng Bình tưới (phím 4) tưới nước mát lành để hạt mầm nảy nở!';
    } else if (progress.stats.harvested === 0) {
      desc = 'Cà rốt đang lớn nhanh! Chờ chín vàng rồi dùng Giỏ (phím 5) thu hoạch';
    } else {
      desc = 'Đã thu hoạch củ cà rốt đầu tiên! Mau quay lại gặp Quản Gia Oliver';
      targetName = 'Quản Gia Oliver';
      targetIcon = <Icon3dManager size={24} />;
      actionText = 'BÁO CÁO!';
      onAction = onTalkToElder;
      avatarIcon = <Icon3dManager size={40} />;
    }
  } else if (step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS) {
    stepNumber = 3;
    stepLabel = 'BƯỚC 3/5';
    title = 'Học Kiến Thức Nông Trại';
    desc = 'Nghe Quản gia chia sẻ bí kíp: Kho hàng, Cửa hàng, Xe buýt & Đơn hàng!';
    targetName = 'Quản Gia Oliver';
    targetIcon = <Icon3dManager size={24} />;
    actionText = 'LẮNG NGHE!';
    onAction = onTalkToElder;
    avatarIcon = <Icon3dManager size={40} />;
  } else if (step === ONBOARDING_STEPS.DELIVER_ORDER) {
    stepNumber = 4;
    stepLabel = 'BƯỚC 4/5';
    title = 'Giao Đơn Hàng Đầu Tiên';
    desc = 'Mở Bảng Đơn Hàng và giao 1 củ cà rốt cho Nhà Hàng Green Valley';
    targetName = 'Bảng Đơn Hàng';
    targetIcon = <Icon3dOrdersBox size={24} />;
    actionText = 'GIAO ĐƠN!';
    onAction = onOpenOrders;
    avatarIcon = <Icon3dOrdersBox size={40} />;
  } else if (step === ONBOARDING_STEPS.CLAIM_REWARD) {
    stepNumber = 5;
    stepLabel = 'BƯỚC 5/5';
    title = 'Nhận Xe Đạp & Tốt Nghiệp!';
    desc = 'Gặp Quản Gia Oliver để nhận Xe Đạp Thể Thao và tự do vi vu Vibe City!';
    targetName = 'Quản Gia Oliver';
    targetIcon = <Icon3dBike size={24} />;
    actionText = 'NHẬN XE!';
    onAction = onTalkToElder;
    avatarIcon = <Icon3dBike size={40} />;
  }

  return (
    <aside className={`pt-candy-quest-widget ${collapsed ? 'is-collapsed' : ''}`} aria-label="Nhiệm vụ hướng dẫn tân thủ Play Together">
      {/* 3D Chibi Avatar Capsule */}
      <div className="pt-quest-avatar-wrap" onClick={() => setCollapsed(prev => !prev)} title="Nhấn để thu gọn / mở rộng">
        <div className="pt-quest-avatar-circle">
          {avatarIcon}
        </div>
        <span className="pt-quest-step-dot">{stepNumber}</span>
      </div>

      {!collapsed ? (
        <div className="pt-quest-body">
          {/* Top Row: Step Pill + Distance Chip + Stamp Book Button */}
          <div className="pt-quest-meta-row">
            <span className="pt-quest-badge">
              <Icon3dSparkleStar size={13} />
              <span>{stepLabel}</span>
            </span>

            {targetDistance != null && (
              <span className={`pt-quest-distance-chip ${targetDistance <= 3 ? 'is-near' : ''}`}>
                <span className="pt-dist-icon">📍</span>
                <span>{targetName} · <b>{targetDistance <= 3 ? 'Đã đến!' : `${targetDistance}m`}</b></span>
              </span>
            )}

            <button
              type="button"
              className="pt-quest-book-btn"
              onClick={onOpenGuide}
              title="Mở Sổ Tay Tân Thủ (Đóng Dấu Nhiệm Vụ)"
            >
              <Icon3dGuideBook size={16} />
              <span>Sổ tay</span>
              <span className="pt-quest-notif-dot" />
            </button>

            <button
              type="button"
              className="pt-quest-toggle-btn"
              onClick={() => setCollapsed(true)}
              title="Thu nhỏ khung nhiệm vụ"
              aria-label="Thu nhỏ"
            >
              ▾
            </button>
          </div>

          {/* Title Row */}
          <div className="pt-quest-title-row">
            <strong className="pt-quest-title">{title}</strong>
          </div>

          {/* Description */}
          <p className="pt-quest-desc">{desc}</p>

          {/* Action Row: Big Play Together GO Button */}
          <div className="pt-quest-action-row">
            <button
              type="button"
              className="pt-quest-go-btn"
              onClick={onAction}
            >
              <span className="pt-go-btn-glow" />
              <span className="pt-go-btn-icon">
                <Icon3dFootsteps size={20} />
              </span>
              <span className="pt-go-btn-text">{actionText}</span>
              <span className="pt-go-btn-arrow">➔</span>
            </button>
          </div>
        </div>
      ) : (
        /* Collapsed mini bar */
        <div className="pt-quest-mini-bar" onClick={() => setCollapsed(false)}>
          <div className="pt-mini-info">
            <span className="pt-mini-badge">{stepLabel}</span>
            <strong className="pt-mini-title">{title}</strong>
          </div>
          <button
            type="button"
            className="pt-mini-go-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
          >
            {actionText}
          </button>
        </div>
      )}
    </aside>
  );
}

