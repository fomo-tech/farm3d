import { HudIcon } from './icons3d/HudIcon.jsx';
import { preLandJourney } from '../../shared/preLandJourney.js';
import React from 'react';
import './QuestTrackerPolish.css';
import { ONBOARDING_STEPS } from '../game/economy/GameProgress.js';


export function OnboardingHUD({
  progress,
  hasFarm = false,
  targetDistance,
  onOpenLand,
  onNavigateFishing,
  onNavigateTarget,
  onTalkToElder,
  onOpenOrders,
  onOpenMissions,
}) {
  const onboarding = progress?.onboarding;
  if (!onboarding || onboarding.completed) return null;

  const step = onboarding.step;

  let stepNumber = 2;
  let title = 'Gặp Oliver';
  let desc = 'Đến gặp Quản Gia nhận quà tân thủ';
  let actionText = 'ĐI!';
  let onAction = onTalkToElder;
  let avatarIcon = <HudIcon asset="quest" size={36} />;

  if (!hasFarm) {
    const guide = preLandJourney(progress);
    stepNumber = guide.step;
    title = guide.title;
    desc = guide.description;
    actionText = guide.target === 'land' ? 'XEM ĐẤT' : 'ĐI!';
    avatarIcon = <HudIcon asset="quest" size={36} />;
    onAction = guide.target === 'land' ? onOpenLand : () => onNavigateFishing?.(guide.target);
  } else if (step === ONBOARDING_STEPS.FIRST_PLANT) {
    stepNumber = 3;
    avatarIcon = <HudIcon asset="quest" size={36} />;
    actionText = 'ĐI!';
    onAction = onNavigateTarget;

    if (progress.stats?.planted === 0) {
      title = 'Gieo Cà Rốt';
      desc = 'Đến ruộng, xới đất rồi gieo hạt';
    } else if (progress.stats?.watered === 0) {
      title = 'Tưới Nước';
      desc = 'Dùng bình tưới nước cho ô gieo';
    } else if (progress.stats?.harvested === 0) {
      title = 'Thu Hoạch';
      desc = 'Thu hoạch khi cà rốt chín';
    } else {
      title = 'Báo Cáo Oliver';
      desc = 'Mang cà rốt về báo cáo Quản Gia';
      avatarIcon = <HudIcon asset="quest" size={36} />;
      actionText = 'GẶP!';
      onAction = onTalkToElder;
    }
  } else if (step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS) {
    stepNumber = 4;
    title = 'Mẹo Nông Trại';
    desc = 'Nghe Oliver chia sẻ kinh nghiệm';
    avatarIcon = <HudIcon asset="quest" size={36} />;
    actionText = 'NGHE!';
    onAction = onTalkToElder;
  } else if (step === ONBOARDING_STEPS.DELIVER_ORDER) {
    stepNumber = 5;
    title = 'Giao Đơn Xe Tải';
    desc = 'Giao đơn đầu tiên để học cách kiếm xu';
    avatarIcon = <HudIcon asset="quest" size={36} />;
    actionText = 'GIAO!';
    onAction = onOpenOrders;
  } else if (step === ONBOARDING_STEPS.CLAIM_REWARD) {
    stepNumber = 6;
    title = 'Nhận Xe Đạp!';
    desc = 'Gặp Oliver nhận quà tốt nghiệp & Xe Đạp';
    avatarIcon = <HudIcon asset="quest" size={36} />;
    actionText = 'NHẬN!';
    onAction = onTalkToElder;
  }

  const isNear = targetDistance != null && targetDistance <= 3.5;

  return (
    <aside className="pt-candy-quest-tracker pt-quest-ribbon-dock" aria-label="Nhiệm vụ tân thủ">
      {/* Sleek Play Together Compact Quest Card */}
      <div className="pt-quest-card">
        {/* Left: 3D Mission Avatar with Step Badge */}
        <div
          className="pt-quest-avatar-pod"
          onClick={onOpenMissions}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
          title="Xem danh sách nhiệm vụ"
        >
          <div className="pt-quest-avatar-inner">
            {avatarIcon}
          </div>
          <span className="pt-quest-step-badge">{stepNumber}/{hasFarm ? 6 : 4}</span>
        </div>

        {/* Center: Two-line Title & Guide Text with Distance Tag */}
        <div
          className="pt-quest-body"
          onClick={onAction}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
          title={`${title} - ${desc}`}
        >
          <div className="pt-quest-top-row">
            <strong className="pt-quest-title">{title}</strong>
            {targetDistance != null && (
              <span className={`pt-quest-dist-badge ${isNear ? 'is-arrived' : ''}`}>
                {isNear ? '✓' : `${Math.round(targetDistance)} m`}
              </span>
            )}
          </div>
        </div>

        {/* Right: Tactile 3D Candy Action Button */}
        <button
          type="button"
          className={`pt-quest-action-btn ${isNear ? 'is-ready-pulse' : ''}`}
          onClick={onAction}
          title={`${actionText}: ${desc}`}
          aria-label={actionText}
        >
          <span>{actionText}</span>
        </button>
      </div>
    </aside>
  );
}
