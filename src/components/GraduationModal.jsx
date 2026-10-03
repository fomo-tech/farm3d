import {
  Icon3dCrown,
  Icon3dBike,
  Icon3dGoldCoin,
  Icon3dStar,
  Icon3dCheck,
} from './icons3d/GameIcons3D.jsx';

export function GraduationModal({ onClose }) {
  return (
    <div className="onboarding-backdrop celebration-backdrop">
      <section className="graduation-card" role="dialog" aria-modal="true">
        {/* Animated Celebration Badge */}
        <div className="celebration-badge-wrap">
          <div className="confetti-particles">
            <span className="particle p1" style={{ display: 'inline-flex' }}><Icon3dStar size={16} /></span>
            <span className="particle p2" style={{ display: 'inline-flex' }}><Icon3dStar size={14} /></span>
            <span className="particle p3" style={{ display: 'inline-flex' }}><Icon3dStar size={18} /></span>
            <span className="particle p4" style={{ display: 'inline-flex' }}><Icon3dStar size={14} /></span>
            <span className="particle p5" style={{ display: 'inline-flex' }}><Icon3dStar size={16} /></span>
          </div>
          <div className="trophy-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon3dCrown size={48} />
          </div>
        </div>

        <header className="graduation-header">
          <span className="grad-tag">HOÀN THÀNH ONBOARDING</span>
          <h2>CHÚC MỪNG TỐT NGHIỆP!</h2>
          <p>Bạn đã hoàn thành xuất sắc toàn bộ khóa huấn luyện nông dân từ Quản Gia Oliver</p>
        </header>

        {/* Unlocked Rewards Showcase */}
        <div className="graduation-rewards-grid">
          <div className="grad-reward-item highlight-bike">
            <span className="reward-icon" style={{ display: 'inline-flex' }}><Icon3dBike size={32} /></span>
            <div className="reward-text">
              <b>Xe Đạp Thể Thao (Đã Trang Bị)</b>
              <small>Tăng tốc độ di chuyển lên 10m/s quanh thung lũng</small>
            </div>
            <em className="status-tag">ĐÃ NHẬN</em>
          </div>

          <div className="grad-reward-item">
            <span className="reward-icon" style={{ display: 'inline-flex' }}><Icon3dGoldCoin size={32} /></span>
            <div className="reward-text">
              <b>+200 Xu Khởi Nghiệp</b>
              <small>Đã cộng thẳng vào số dư của bạn</small>
            </div>
            <em className="status-tag">ĐÃ NHẬN</em>
          </div>

          <div className="grad-reward-item">
            <span className="reward-icon" style={{ display: 'inline-flex' }}><Icon3dStar size={32} /></span>
            <div className="reward-text">
              <b>+80 XP Nông Dân</b>
              <small>Tăng nhanh cấp độ nông trại</small>
            </div>
            <em className="status-tag">ĐÃ NHẬN</em>
          </div>

          <div className="grad-reward-item highlight-unlocks">
            <span className="reward-icon" style={{ display: 'inline-flex' }}><Icon3dCheck size={32} /></span>
            <div className="reward-text">
              <b>Quyền Tự Do Khám Phá Toàn Diện</b>
              <small>Mở khóa Xưởng Chế Biến, Nâng Cấp Kho/Đất, Xe Buýt & Sòng Bài</small>
            </div>
            <em className="status-tag active">MỞ KHÓA</em>
          </div>
        </div>

        <button type="button" className="graduation-submit-btn" onClick={onClose}>
          <span>Bắt Đầu Tự Do Khám Phá Thung Lũng Bình Minh →</span>
        </button>
      </section>
    </div>
  );
}

