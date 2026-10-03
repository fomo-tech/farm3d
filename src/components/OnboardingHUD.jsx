import React, { useState } from 'react';
import { ONBOARDING_STEPS } from '../game/economy/GameProgress.js';
import {
  Icon3dManager,
  Icon3dOrdersBox,
  Icon3dBike,
  Icon3dGuideBook,
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
  let title = 'Gặp Oliver';
  let targetName = 'Oliver';
  let actionText = 'GO!';
  let onAction = onTalkToElder;
  let avatarIcon = <Icon3dManager size={32} />;

  if (step === ONBOARDING_STEPS.FIRST_PLANT) {
    stepNumber = 2;
    avatarIcon = <Icon3dCarrot size={32} />;
    targetName = 'Ruộng';
    actionText = 'ĐI!';
    onAction = onNavigateTarget;

    if (progress.stats.planted === 0) {
      title = 'Gieo Cà Rốt (0/1)';
    } else if (progress.stats.watered === 0) {
      title = 'Tưới Nước (0/1)';
    } else if (progress.stats.harvested === 0) {
      title = 'Thu Hoạch (0/1)';
    } else {
      title = 'Báo Cáo Oliver';
      targetName = 'Oliver';
      avatarIcon = <Icon3dManager size={32} />;
      onAction = onTalkToElder;
    }
  } else if (step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS) {
    stepNumber = 3;
    title = 'Mẹo Nông Trại';
    targetName = 'Oliver';
    avatarIcon = <Icon3dManager size={32} />;
    actionText = 'NGHE';
    onAction = onTalkToElder;
  } else if (step === ONBOARDING_STEPS.DELIVER_ORDER) {
    stepNumber = 4;
    title = 'Giao Đơn (0/1)';
    targetName = 'Bảng Đơn';
    avatarIcon = <Icon3dOrdersBox size={32} />;
    actionText = 'GIAO';
    onAction = onOpenOrders;
  } else if (step === ONBOARDING_STEPS.CLAIM_REWARD) {
    stepNumber = 5;
    title = 'Nhận Xe Đạp!';
    targetName = 'Oliver';
    avatarIcon = <Icon3dBike size={32} />;
    actionText = 'NHẬN!';
    onAction = onTalkToElder;
  }

  return (
    <aside
      className={`pt-candy-quest-widget ${collapsed ? 'is-collapsed' : ''}`}
      aria-label="Nhiệm vụ tân thủ"
    >
      {/* 3D Chibi Avatar Capsule */}
      <div
        className="pt-quest-avatar-wrap"
        onClick={() => setCollapsed(prev => !prev)}
        title="Bấm để thu gọn / mở rộng"
      >
        <div className="pt-quest-avatar-circle">
          {avatarIcon}
        </div>
        <span className="pt-quest-step-dot">{stepNumber}</span>
      </div>

      {!collapsed ? (
        <div className="pt-quest-body">
          {/* Main Short Title */}
          <div className="pt-quest-title-row">
            <strong className="pt-quest-title">{title}</strong>
          </div>

          {/* Sub Meta: Distance + Book button */}
          <div className="pt-quest-meta-row">
            {targetDistance != null ? (
              <span className={`pt-quest-dist ${targetDistance <= 3 ? 'is-near' : ''}`}>
                📍 {targetDistance <= 3 ? 'Đã đến' : `${targetDistance}m`}
              </span>
            ) : (
              <span className="pt-quest-dist">📍 {targetName}</span>
            )}

            <button
              type="button"
              className="pt-quest-book-btn"
              onClick={onOpenGuide}
              title="Mở Sổ Tay Tân Thủ"
            >
              <Icon3dGuideBook size={14} />
              <span>Sổ tay</span>
            </button>

            <button
              type="button"
              className="pt-quest-toggle-btn"
              onClick={() => setCollapsed(true)}
              title="Thu nhỏ"
              aria-label="Thu nhỏ"
            >
              ▾
            </button>
          </div>
        </div>
      ) : (
        /* Collapsed minimal state */
        <div className="pt-quest-collapsed-label" onClick={() => setCollapsed(false)}>
          <span>{title}</span>
        </div>
      )}

      {/* Action Button: Chunky Play Together GO button */}
      <button
        type="button"
        className="pt-quest-go-btn"
        onClick={onAction}
        title={actionText}
      >
        <span className="pt-go-btn-glow" />
        <span className="pt-go-btn-icon">
          <Icon3dFootsteps size={16} />
        </span>
        <span className="pt-go-btn-text">{actionText}</span>
      </button>
    </aside>
  );
}
