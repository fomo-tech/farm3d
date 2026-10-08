import React, { useEffect } from 'react';
import {
  Icon3dCrown,
  Icon3dBike,
  Icon3dGoldCoin,
  Icon3dStar,
  Icon3dCheck,
  Icon3dPartyPopper,
  Icon3dSparkleStar,
} from './icons3d/GameIcons3D.jsx';
import { farmAudio } from '../game/audio/FarmAudioSystem.js';

export function GraduationModal({ onClose }) {
  useEffect(() => {
    // Play celebratory sounds
    farmAudio.playFanfare();
    const bellTimer = setTimeout(() => {
      farmAudio.playBicycleBell();
    }, 700);
    return () => clearTimeout(bellTimer);
  }, []);

  return (
    <div className="pt-onboarding-backdrop celebration-backdrop" onClick={onClose}>
      <section
        className="pt-graduation-card"
        role="dialog"
        aria-modal="true"
        aria-label="Lễ tốt nghiệp tân thủ Play Together"
        onClick={e => e.stopPropagation()}
      >
        {/* Sunburst Rays Behind Trophy */}
        <div className="pt-sunburst-wrap">
          <div className="pt-sunburst-rays" />
        </div>

        {/* Animated Celebration Crown & Confetti */}
        <div className="pt-celebration-badge-wrap">
          <div className="pt-confetti-shower">
            <span className="pt-confetti-item c1"><Icon3dSparkleStar size={24} /></span>
            <span className="pt-confetti-item c2"><Icon3dPartyPopper size={28} /></span>
            <span className="pt-confetti-item c3"><Icon3dStar size={22} /></span>
            <span className="pt-confetti-item c4"><Icon3dSparkleStar size={20} /></span>
            <span className="pt-confetti-item c5"><Icon3dStar size={26} /></span>
            <span className="pt-confetti-item c6"><Icon3dPartyPopper size={24} /></span>
          </div>

          <div className="pt-trophy-podium">
            <div className="pt-trophy-ring">
              <Icon3dCrown size={56} />
            </div>
            <div className="pt-trophy-halo" />
          </div>
        </div>

        {/* Header Title */}
        <header className="pt-graduation-header">
          <div className="pt-grad-tag-pill">
            <Icon3dSparkleStar size={14} />
            <span>TỐT NGHIỆP KHÓA HUẤN LUYỆN TÂN THỦ</span>
            <Icon3dSparkleStar size={14} />
          </div>
          <h2>CHÚC MỪNG CƯ DÂN MỚI!</h2>
          <p>
            Bạn đã xuất sắc làm chủ quy trình gieo trồng và kinh tế nông trang!
            Quản Gia Oliver xin trân trọng trao tặng chứng nhận cư dân danh dự.
          </p>
        </header>

        {/* Grand Showcase: 3D Bicycle Spotlight */}
        <div className="pt-grad-bike-showcase">
          <div className="pt-bike-stage">
            <div className="pt-bike-icon-wrap">
              <Icon3dBike size={72} />
            </div>
            <div className="pt-bike-glow-platform" />
          </div>
          <div className="pt-bike-info">
            <div className="pt-bike-badge">PHẦN THƯỞNG ĐẶC BIỆT</div>
            <h3>Xe Đạp Thể Thao Play Together</h3>
            <p>Tốc độ di chuyển <strong>10 m/s</strong> (Nhanh gấp 1.5 lần đi bộ! Bấm phím R hoặc nút Chuông để bấm còi!)</p>
          </div>
        </div>

        {/* Unlocked Rewards Grid */}
        <div className="pt-graduation-rewards-grid">
          <div className="pt-grad-reward-item coins">
            <span className="pt-reward-icon"><Icon3dGoldCoin size={30} /></span>
            <div className="pt-reward-text">
              <b>+200 Xu Khởi Nghiệp</b>
              <small>Đã cộng thẳng vào ví</small>
            </div>
            <span className="pt-status-pill claimed">ĐÃ NHẬN</span>
          </div>

          <div className="pt-grad-reward-item xp">
            <span className="pt-reward-icon"><Icon3dStar size={30} /></span>
            <div className="pt-reward-text">
              <b>+80 XP Nông Dân</b>
              <small>Tăng nhanh cấp độ</small>
            </div>
            <span className="pt-status-pill claimed">ĐÃ NHẬN</span>
          </div>

          <div className="pt-grad-reward-item full-width unlock">
            <span className="pt-reward-icon"><Icon3dCheck size={30} /></span>
            <div className="pt-reward-text">
              <b>Tiếp Tục Phát Triển Nông Trại</b>
              <small>Làm nhiệm vụ chính tuyến, tích lũy xu và lên cấp để khai hoang, chế biến và nâng cấp nhà.</small>
            </div>
            <span className="pt-status-pill unlocked">SẴN SÀNG</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          className="pt-graduation-submit-btn"
          onClick={onClose}
        >
          <span className="pt-grad-btn-icon"><Icon3dBike size={26} /></span>
          <span className="pt-grad-btn-text">LÊN XE ĐẠP & KHÁM PHÁ VIBE CITY NGAY!</span>
          <span className="pt-grad-btn-arrow">➔</span>
        </button>
      </section>
    </div>
  );
}

