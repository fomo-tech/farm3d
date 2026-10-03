import { ONBOARDING_STEPS } from '../game/economy/GameProgress.js';
import {
  Icon3dManager,
  Icon3dRiceSpike,
  Icon3dOrdersBox,
  Icon3dBike,
  Icon3dGuideBook,
} from './icons3d/GameIcons3D.jsx';

export function OnboardingHUD({
  progress,
  targetDistance,
  onNavigateTarget,
  onTalkToElder,
  onOpenGuide,
  onOpenOrders,
}) {
  const onboarding = progress?.onboarding;
  if (!onboarding || onboarding.completed) return null;

  const step = onboarding.step;

  let stepLabel = 'BƯỚC 1/5';
  let title = 'Gặp Quản Gia Oliver';
  let desc = 'Đến gặp Quản gia cạnh nông trại để nhận 3 hạt cà rốt miễn phí';
  let targetName = 'Quản Gia Oliver';
  let targetIcon = <Icon3dManager size={18} />;
  let actionText = 'Đi tới Quản Gia';
  let onAction = onTalkToElder;

  if (step === ONBOARDING_STEPS.FIRST_PLANT) {
    stepLabel = 'BƯỚC 2/5';
    title = 'Vụ Mùa Cà Rốt Đầu Tiên';
    targetName = 'Ô Ruộng';
    targetIcon = <Icon3dRiceSpike size={18} />;
    actionText = 'Đi tới ô ruộng';
    onAction = onNavigateTarget;

    if (progress.stats.planted === 0) {
      desc = '① Dùng Cuốc (phím 2) xới đất ➔ ② Gieo hạt cà rốt miễn phí (phím 3)';
    } else if (progress.stats.watered === 0) {
      desc = '③ Dùng Bình tưới (phím 4) tưới nước để hạt nảy mầm';
    } else if (progress.stats.harvested === 0) {
      desc = '④ Cây đang lớn nhanh! Chờ chín vàng rồi dùng Giỏ (phím 5) thu hoạch';
    } else {
      desc = 'Đã thu hoạch thành công! Quay lại gặp Quản Gia Oliver';
      targetName = 'Quản Gia Oliver';
      targetIcon = <Icon3dManager size={18} />;
      actionText = 'Gặp Quản Gia';
      onAction = onTalkToElder;
    }
  } else if (step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS) {
    stepLabel = 'BƯỚC 3/5';
    title = 'Học Kiến Thức Nông Trại';
    desc = 'Quản gia đang hướng dẫn về Kho đầy, Cửa hàng, Xe buýt và Đơn hàng';
    targetName = 'Quản Gia Oliver';
    targetIcon = <Icon3dManager size={18} />;
    actionText = 'Nói chuyện';
    onAction = onTalkToElder;
  } else if (step === ONBOARDING_STEPS.DELIVER_ORDER) {
    stepLabel = 'BƯỚC 4/5';
    title = 'Giao Đơn Hàng Đầu Tiên';
    desc = 'Mở Bảng Đơn Hàng và giao 1 củ cà rốt cho “Nhà Hàng Green Valley”';
    targetName = 'Bảng Đơn Hàng';
    targetIcon = <Icon3dOrdersBox size={18} />;
    actionText = 'Mở Đơn Hàng';
    onAction = onOpenOrders;
  } else if (step === ONBOARDING_STEPS.CLAIM_REWARD) {
    stepLabel = 'BƯỚC 5/5';
    title = 'Nhận Xe Đạp & Tốt Nghiệp';
    desc = 'Gặp Quản Gia Oliver để nhận Xe Đạp Thể Thao và mở khóa tự do khám phá!';
    targetName = 'Quản Gia Oliver';
    targetIcon = <Icon3dManager size={18} />;
    actionText = 'Nhận Xe Đạp';
    onAction = onTalkToElder;
  }

  return (
    <aside className="onboarding-hud-tracker" aria-label="Nhiệm vụ hướng dẫn tân thủ">
      <div className="hud-badge-row">
        <span className="hud-step-pill">{stepLabel}</span>
        {targetDistance != null && (
          <span className="hud-distance-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-flex' }}>{targetIcon}</span>
            <span>{targetName} · <b>{targetDistance}m</b></span>
          </span>
        )}
        <button
          type="button"
          className="hud-guide-btn"
          onClick={onOpenGuide}
          title="Mở Sổ Tay Nông Trại"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <Icon3dGuideBook size={16} />
          <span>Sổ tay</span>
        </button>
      </div>

      <div className="hud-title-row">
        <strong>{title}</strong>
      </div>

      <p className="hud-desc-text">{desc}</p>

      <div className="hud-action-row">
        <button
          type="button"
          className="hud-action-btn"
          onClick={onAction}
        >
          {actionText} →
        </button>
      </div>
    </aside>
  );
}
