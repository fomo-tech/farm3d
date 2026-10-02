import { ONBOARDING_STEPS } from '../game/economy/GameProgress.js';

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
  let title = 'Gặp Bác Ba (Trưởng Làng)';
  let desc = 'Đến gặp trưởng làng cạnh ruộng để nhận 3 hạt cà rốt miễn phí';
  let targetName = 'Bác Ba';
  let targetIcon = '👴';
  let actionText = 'Đi tới Bác Ba';
  let onAction = onTalkToElder;

  if (step === ONBOARDING_STEPS.FIRST_PLANT) {
    stepLabel = 'BƯỚC 2/5';
    title = 'Vụ Mùa Cà Rốt Đầu Tiên';
    targetName = 'Ô Ruộng';
    targetIcon = '🌾';
    actionText = 'Đi tới ô ruộng';
    onAction = onNavigateTarget;

    if (progress.stats.planted === 0) {
      desc = '① Dùng Cuốc (phím 2) xới đất ➔ ② Gieo hạt cà rốt miễn phí (phím 3)';
    } else if (progress.stats.watered === 0) {
      desc = '③ Dùng Bình tưới (phím 4) tưới nước để hạt nảy mầm';
    } else if (progress.stats.harvested === 0) {
      desc = '④ Cây đang lớn nhanh! Chờ chín vàng rồi dùng Giỏ (phím 5) thu hoạch';
    } else {
      desc = 'Đã thu hoạch thành công! Quay lại gặp Bác Ba';
      targetName = 'Bác Ba';
      targetIcon = '👴';
      actionText = 'Gặp Bác Ba';
      onAction = onTalkToElder;
    }
  } else if (step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS) {
    stepLabel = 'BƯỚC 3/5';
    title = 'Học Kiến Thức Nông Trại';
    desc = 'Bác Ba đang dặn dò về Kho đầy, Cửa hàng, Xe buýt và Đơn hàng';
    targetName = 'Bác Ba';
    targetIcon = '👴';
    actionText = 'Nói chuyện';
    onAction = onTalkToElder;
  } else if (step === ONBOARDING_STEPS.DELIVER_ORDER) {
    stepLabel = 'BƯỚC 4/5';
    title = 'Giao Đơn Hàng Đầu Tiên';
    desc = 'Mở Bảng Đơn Hàng 📦 và giao 1 củ cà rốt cho “Bếp nhà Hoa Mai”';
    targetName = 'Bảng Đơn Hàng';
    targetIcon = '📦';
    actionText = 'Mở Đơn Hàng';
    onAction = onOpenOrders;
  } else if (step === ONBOARDING_STEPS.CLAIM_REWARD) {
    stepLabel = 'BƯỚC 5/5';
    title = 'Nhận Xe Đạp & Tốt Nghiệp';
    desc = 'Gặp Bác Ba để nhận Xe Đạp Thể Thao 🚲 và mở khóa tự do khám phá!';
    targetName = 'Bác Ba';
    targetIcon = '👴';
    actionText = 'Nhận Xe Đạp';
    onAction = onTalkToElder;
  }

  return (
    <aside className="onboarding-hud-tracker" aria-label="Nhiệm vụ hướng dẫn tân thủ">
      <div className="hud-badge-row">
        <span className="hud-step-pill">{stepLabel}</span>
        {targetDistance != null && (
          <span className="hud-distance-pill">
            {targetIcon} {targetName} · <b>{targetDistance}m</b>
          </span>
        )}
        <button
          type="button"
          className="hud-guide-btn"
          onClick={onOpenGuide}
          title="Mở cẩm nang giải thích kho, shop, xe buýt, đơn hàng"
        >
          📖 Cẩm Nang
        </button>
      </div>

      <div className="hud-main-content">
        <div className="hud-text-col">
          <strong className="hud-title">{title}</strong>
          <span className="hud-desc">{desc}</span>
        </div>

        <button type="button" className="hud-navigate-btn" onClick={onAction}>
          <span>{actionText} →</span>
        </button>
      </div>
    </aside>
  );
}
