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
  Icon3dTrophyCup,
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
  onOpenMissions,
}) {
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
    <aside className="pt-candy-quest-tracker pt-quest-ribbon-dock" aria-label="Nhiệm vụ tân thủ">
      {/* Sleek Play Together Quest Ribbon Banner */}
      <div className="pt-quest-ribbon">
        {/* Left: 3D NPC / Item Avatar Pod with Step Badge */}
        <div
          className="pt-quest-ribbon-avatar"
          onClick={onOpenMissions}
          role="button"
          tabIndex={0}
          title="Xem danh sách nhiệm vụ"
        >
          <div className="pt-quest-avatar-circle">
            {avatarIcon}
          </div>
          <span className="pt-quest-step-pill-mini">{stepNumber}/6</span>
        </div>

        {/* Center: Quest Goal & Distance Tag */}
        <div
          className="pt-quest-ribbon-body"
          onClick={onOpenMissions}
          role="button"
          tabIndex={0}
          title={`${title} - ${desc} (Bấm để xem chi tiết)`}
        >
          <strong className="pt-quest-title-text">{title}</strong>
          {targetDistance != null && (
            <span className={`pt-quest-dist-chip ${isNear ? 'is-arrived' : ''}`}>
              {isNear ? 'ĐÃ ĐẾN' : `${targetDistance}m`}
            </span>
          )}
        </div>

        {/* Right: Glossy 3D Candy Action Button */}
        <button
          type="button"
          className={`pt-quest-action-candy-btn ${isNear ? 'is-ready-pulse' : ''}`}
          onClick={onAction}
          title={`${actionText}: ${desc}`}
          aria-label={actionText}
        >
          <span className="pt-action-candy-text">{actionText}</span>
        </button>

        {/* Satellite Stamp Book Button */}
        <button
          type="button"
          className="pt-quest-stamp-mini-btn"
          onClick={onOpenGuide}
          title="Sổ Tay Con Dấu Tân Thủ"
          aria-label="Sổ Tay Con Dấu Tân Thủ"
        >
          <Icon3dStamp size={16} />
        </button>
      </div>
    </aside>
  );
}
