import React, { useState } from 'react';
import { ONBOARDING_STEPS } from '../game/economy/GameProgress.js';
import {
  Icon3dManager,
  Icon3dOrdersBox,
  Icon3dBike,
  Icon3dStamp,
  Icon3dCarrot,
  Icon3dCompass,
  Icon3dSparkleStar,
} from './icons3d/GameIcons3D.jsx';

export function OnboardingHUD({
  progress,
  hasFarm = false,
  targetDistance,
  onOpenLand,
  onNavigateTarget,
  onTalkToElder,
  onOpenGuide,
  onOpenOrders,
}) {
  const [collapsed, setCollapsed] = useState(true);
  const onboarding = progress?.onboarding;
  if (!onboarding || onboarding.completed) return null;

  const step = onboarding.step;

  let stepNumber = 2;
  let title = 'Gặp Oliver';
  let desc = 'Đến đài phun nước trung tâm gặp Quản Gia nhận quà.';
  let targetName = 'Oliver';
  let actionText = 'ĐI!';
  let onAction = onTalkToElder;
  let avatarIcon = <Icon3dManager size={36} />;

  if (!hasFarm) {
    stepNumber = 1;
    title = 'Chọn đất đầu tiên';
    desc = 'Xem giá sau ưu đãi và chọn một lô đất vừa túi tiền.';
    targetName = 'Bản đồ đất';
    actionText = 'XEM ĐẤT';
    avatarIcon = <Icon3dCompass size={36} />;
    onAction = onOpenLand;
  } else if (step === ONBOARDING_STEPS.FIRST_PLANT) {
    stepNumber = 3;
    avatarIcon = <Icon3dCarrot size={36} />;
    targetName = 'Ruộng nhà';
    actionText = 'ĐI!';
    onAction = onNavigateTarget;

    if (progress.stats?.planted === 0) {
      title = 'Gieo Cà Rốt';
      desc = 'Đến ruộng, xới một ô đất rồi gieo hạt cà rốt.';
    } else if (progress.stats?.watered === 0) {
      title = 'Tưới Nước';
      desc = 'Chọn bình tưới và tưới ô vừa gieo.';
    } else if (progress.stats?.harvested === 0) {
      title = 'Thu Hoạch';
      desc = 'Cây chín sau khoảng 8 giây. Thu hoạch khi hiện biểu tượng sẵn sàng.';
    } else {
      title = 'Báo Cáo Oliver';
      desc = 'Mang cà rốt tươi ngon về báo cáo Quản Gia!';
      targetName = 'Oliver';
      avatarIcon = <Icon3dManager size={36} />;
      actionText = 'GẶP!';
      onAction = onTalkToElder;
    }
  } else if (step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS) {
    stepNumber = 4;
    title = 'Mẹo Nông Trại';
    desc = 'Nghe Oliver chia sẻ bí quyết làm giàu và vận tải.';
    targetName = 'Oliver';
    avatarIcon = <Icon3dManager size={36} />;
    actionText = 'NGHE!';
    onAction = onTalkToElder;
  } else if (step === ONBOARDING_STEPS.DELIVER_ORDER) {
    stepNumber = 5;
    title = 'Giao Đơn Xe Tải';
    desc = 'Mở Bảng Đơn Hàng giao cà rốt lấy Xu x3.';
    targetName = 'Bảng Đơn';
    avatarIcon = <Icon3dOrdersBox size={36} />;
    actionText = 'GIAO!';
    onAction = onOpenOrders;
  } else if (step === ONBOARDING_STEPS.CLAIM_REWARD) {
    stepNumber = 6;
    title = 'Nhận Xe Đạp!';
    desc = 'Gặp Oliver nhận chứng chỉ tốt nghiệp & Xe Đạp.';
    targetName = 'Oliver';
    avatarIcon = <Icon3dBike size={36} />;
    actionText = 'NHẬN!';
    onAction = onTalkToElder;
  }

  const isNear = targetDistance != null && targetDistance <= 3.5;

  return (
    <aside
      className={`pt-candy-quest-tracker ${collapsed ? 'is-collapsed' : ''}`}
      aria-label="Nhiệm vụ tân thủ"
    >
      {/* Collapsed Pill State */}
      {collapsed ? (
        <button
          type="button"
          className="pt-quest-collapsed-bubble"
          onClick={() => setCollapsed(false)}
          title="Mở bảng nhiệm vụ tân thủ"
          aria-label="Mở nhiệm vụ tân thủ"
        >
          <div className="pt-collapsed-avatar">
            {avatarIcon}
            <span className="pt-quest-step-badge">{stepNumber}/6</span>
          </div>
          <div className="pt-collapsed-text">
            <b>{title}</b>
            <small>{hasFarm && isNear ? 'Đã đến!' : hasFarm && targetDistance != null ? `${targetDistance}m` : targetName}</small>
          </div>
          <span className="pt-collapsed-expand-btn">▶</span>
        </button>
      ) : (
        /* Full Expanded Play Together Quest Card */
        <div className="pt-quest-card-frame">
          {/* Top Quest Header Bar */}
          <div className="pt-quest-header-strip">
            <div className="pt-quest-step-pill">
              <Icon3dSparkleStar size={12} />
              <span>Nhiệm Vụ Tân Thủ ({stepNumber}/6)</span>
            </div>

            <div className="pt-quest-top-actions">
              <button
                type="button"
                className="pt-quest-book-btn"
                onClick={onOpenGuide}
                title="Mở Sổ Tay Con Dấu Tân Thủ"
              >
                <Icon3dStamp size={16} />
                <span>Sổ Dấu</span>
              </button>

              <button
                type="button"
                className="pt-quest-fold-btn"
                onClick={() => setCollapsed(true)}
                title="Thu gọn"
                aria-label="Thu gọn widget"
              >
                —
              </button>
            </div>
          </div>

          {/* Main Quest Content Row */}
          <div className="pt-quest-content-row">
            {/* 3D Chibi Avatar with glowing ring */}
            <div className="pt-quest-avatar-pod">
              <div className="pt-quest-avatar-circle">
                {avatarIcon}
              </div>
              <span className="pt-quest-pod-badge">{stepNumber}</span>
            </div>

            {/* Quest Details & Distance Tag */}
            <div className="pt-quest-text-box">
              <div className="pt-quest-name-row">
                <strong className="pt-quest-name">{title}</strong>
                {targetDistance != null && (
                  <span className={`pt-quest-gps-pill ${isNear ? 'is-arrived' : ''}`}>
                    {isNear ? 'ĐÃ ĐẾN' : `${targetDistance}m`}
                  </span>
                )}
              </div>
              <p className="pt-quest-instruction">{desc}</p>
            </div>

            {/* Action GO! Button with 3D Bevel & Shine Sweep */}
            <button
              type="button"
              className={`pt-quest-action-btn ${isNear ? 'is-ready-pulse' : ''}`}
              onClick={onAction}
              title={actionText}
            >
              <div className="pt-action-shine" />
              <Icon3dCompass size={20} className="pt-action-compass-icon" />
              <span className="pt-action-label">{actionText}</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
