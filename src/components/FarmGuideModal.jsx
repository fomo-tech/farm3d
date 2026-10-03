import React, { useState } from 'react';
import { ONBOARDING_STEPS } from '../game/economy/GameProgress.js';
import {
  Icon3dStamp,
  Icon3dManager,
  Icon3dCarrot,
  Icon3dBackpack,
  Icon3dShopCart,
  Icon3dOrdersBox,
  Icon3dModernCity,
  Icon3dBike,
  Icon3dRiceSpike,
  Icon3dStar,
  Icon3dSparkleStar,
  Icon3dCheck,
  Icon3dGoldCoin,
  Icon3dSeeds,
  Icon3dHoe,
  Icon3dWateringCan,
  Icon3dBasket,
} from './icons3d/GameIcons3D.jsx';

const GUIDE_TABS = [
  { id: 'stamp-book', label: 'Sổ Tân Thủ', icon: <Icon3dStamp size={20} /> },
  { id: 'barn', label: 'Kho Nông Sản', icon: <Icon3dBackpack size={20} /> },
  { id: 'shop', label: 'Cây Trồng & Shop', icon: <Icon3dShopCart size={20} /> },
  { id: 'orders', label: 'Đơn Hàng Xe Tải', icon: <Icon3dOrdersBox size={20} /> },
  { id: 'bus', label: 'Tuyến Xe Buýt', icon: <Icon3dModernCity size={20} /> },
  { id: 'vehicles', label: 'Phương Tiện', icon: <Icon3dBike size={20} /> },
];

export function FarmGuideModal({ progress, onClose, onResetTutorial }) {
  const [activeTab, setActiveTab] = useState('stamp-book');

  const onboarding = progress?.onboarding;
  const currentStep = onboarding?.step ?? 0;
  const isCompleted = onboarding?.completed;

  // The 5 Onboarding Stamp Missions
  const STAMP_MISSIONS = [
    {
      step: ONBOARDING_STEPS.MEET_ELDER,
      stepNumber: 1,
      title: 'Gặp Quản Gia Oliver',
      desc: 'Đến đài phun nước gặp Quản Gia để nhận gói quà khởi nghiệp tân thủ.',
      icon: <Icon3dManager size={32} />,
      reward: '+50 Xu · 3 Hạt Cà Rốt',
    },
    {
      step: ONBOARDING_STEPS.FIRST_PLANT,
      stepNumber: 2,
      title: 'Vụ Mùa Cà Rốt Đầu Tiên',
      desc: 'Thực hành 4 bước: Cuốc đất ➔ Gieo hạt ➔ Tưới nước ➔ Thu hoạch sau 8s.',
      icon: <Icon3dCarrot size={32} />,
      reward: 'Nông Sản Tươi · +40 XP',
    },
    {
      step: ONBOARDING_STEPS.EXPLAIN_SYSTEMS,
      stepNumber: 3,
      title: 'Học Kiến Thức Nông Trại',
      desc: 'Nắm vững 4 cơ chế vận hành: Sức chứa kho, Cửa hàng vật tư, Xe buýt & Xe tải.',
      icon: <Icon3dShopCart size={32} />,
      reward: 'Kiến Thức Vàng · +30 XP',
    },
    {
      step: ONBOARDING_STEPS.DELIVER_ORDER,
      stepNumber: 4,
      title: 'Giao Đơn Hàng Đầu Tiên',
      desc: 'Mở Bảng Đơn Hàng và giao 1 củ cà rốt tươi ngon cho Nhà Hàng Green Valley.',
      icon: <Icon3dOrdersBox size={32} />,
      reward: '+65 Xu Thưởng · +40 XP',
    },
    {
      step: ONBOARDING_STEPS.CLAIM_REWARD,
      stepNumber: 5,
      title: 'Tốt Nghiệp & Nhận Xe Đạp',
      desc: 'Gặp Quản Gia Oliver nhận chứng nhận cư dân ưu tú cùng Xe Đạp Thể Thao.',
      icon: <Icon3dBike size={32} />,
      reward: 'Xe Đạp Thể Thao (10m/s) + 200 Xu',
    },
  ];

  const completedCount = isCompleted
    ? 5
    : STAMP_MISSIONS.filter(m => currentStep > m.step).length;

  return (
    <div className="pt-onboarding-backdrop" onClick={onClose}>
      <section
        className="pt-guide-book-panel"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Sổ tay tân thủ Play Together"
      >
        {/* Book Header with Leather Accent */}
        <header className="pt-book-header">
          <div className="pt-book-title-wrap">
            <span className="pt-book-badge">
              <Icon3dSparkleStar size={14} />
              <span>SỔ TAY CƯ DÂN VIBE CITY</span>
              <Icon3dSparkleStar size={14} />
            </span>
            <h2>Hành Trình Du Lịch & Cẩm Nang Thung Lũng</h2>
          </div>
          <button type="button" className="pt-book-close-btn" onClick={onClose} aria-label="Đóng sổ tay">
            ✕
          </button>
        </header>

        {/* Tab Selection */}
        <div className="pt-book-tabs-bar">
          {GUIDE_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`pt-book-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="pt-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="pt-book-body">
          {/* TAB 1: STAMP BOOK */}
          {activeTab === 'stamp-book' && (
            <div className="pt-stamp-book-view">
              {/* Header Card with Progress */}
              <div className="pt-stamp-tracker-banner">
                <div className="pt-stamp-tracker-info">
                  <strong>TIẾN ĐỘ THU THẬP CON DẤU TÂN THỦ</strong>
                  <p>Hoàn thành chuỗi 5 bước hướng dẫn để nhận đầy đủ con dấu và Xe Đạp Thể Thao!</p>
                </div>
                <div className="pt-stamp-progress-pill">
                  <span className="pt-stamp-count">{completedCount}/5</span>
                  <span className="pt-stamp-label">CON DẤU</span>
                </div>
              </div>

              {/* Grid of 5 Stamp Cards */}
              <div className="pt-stamps-grid">
                {STAMP_MISSIONS.map(mission => {
                  const stepDone = isCompleted || currentStep > mission.step;
                  const stepActive = !isCompleted && currentStep === mission.step;
                  const stepLocked = !isCompleted && currentStep < mission.step;

                  return (
                    <div
                      key={mission.stepNumber}
                      className={`pt-stamp-card ${stepDone ? 'is-done' : ''} ${stepActive ? 'is-active' : ''} ${stepLocked ? 'is-locked' : ''}`}
                    >
                      {/* Left: Mission Chibi Icon */}
                      <div className="pt-stamp-card-icon">
                        {mission.icon}
                        <span className="pt-stamp-step-num">{mission.stepNumber}</span>
                      </div>

                      {/* Middle: Mission Details */}
                      <div className="pt-stamp-card-info">
                        <div className="pt-stamp-title-row">
                          <b>{mission.title}</b>
                          {stepActive && <span className="pt-tag-active">ĐANG THỰC HIỆN</span>}
                          {stepLocked && <span className="pt-tag-locked">CHƯA MỞ</span>}
                        </div>
                        <p>{mission.desc}</p>
                        <small className="pt-stamp-reward">
                          <Icon3dGoldCoin size={14} /> {mission.reward}
                        </small>
                      </div>

                      {/* Right: The Iconic Play Together Rubber Stamp */}
                      <div className="pt-stamp-seal-wrap">
                        {stepDone ? (
                          <div className="pt-rubber-stamp is-stamped">
                            <div className="pt-stamp-circle">
                              <span>HOÀN THÀNH</span>
                              <small>VIBE CITY</small>
                              <div className="pt-stamp-star">★</div>
                            </div>
                          </div>
                        ) : stepActive ? (
                          <div className="pt-stamp-slot active-slot">
                            <span>ĐI NGAY</span>
                          </div>
                        ) : (
                          <div className="pt-stamp-slot locked-slot">
                            <span>KHÓA</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Milestone Rewards Banner */}
              <div className="pt-milestone-banner">
                <div className="pt-milestone-item">
                  <div className="pt-mile-icon"><Icon3dGoldCoin size={22} /></div>
                  <div className="pt-mile-info">
                    <b>Cột mốc 1 Dấu</b>
                    <small>+50 Xu Khởi Nghiệp</small>
                  </div>
                  <span className={`pt-mile-status ${completedCount >= 1 ? 'done' : ''}`}>
                    {completedCount >= 1 ? '✓ ĐÃ NHẬN' : 'CHƯA ĐẠT'}
                  </span>
                </div>

                <div className="pt-milestone-arrow">➔</div>

                <div className="pt-milestone-item">
                  <div className="pt-mile-icon"><Icon3dCarrot size={22} /></div>
                  <div className="pt-mile-info">
                    <b>Cột mốc 3 Dấu</b>
                    <small>Thu hoạch cà rốt & Xu</small>
                  </div>
                  <span className={`pt-mile-status ${completedCount >= 3 ? 'done' : ''}`}>
                    {completedCount >= 3 ? '✓ ĐÃ NHẬN' : 'CHƯA ĐẠT'}
                  </span>
                </div>

                <div className="pt-milestone-arrow">➔</div>

                <div className="pt-milestone-item grand">
                  <div className="pt-mile-icon"><Icon3dBike size={26} /></div>
                  <div className="pt-mile-info">
                    <b>Cột mốc 5 Dấu (Tốt nghiệp)</b>
                    <small>Xe Đạp Thể Thao (10m/s) + 200 Xu</small>
                  </div>
                  <span className={`pt-mile-status ${isCompleted ? 'done' : ''}`}>
                    {isCompleted ? '✓ ĐÃ NHẬN' : 'CHƯA ĐẠT'}
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-book-footer-actions">
                <button
                  type="button"
                  className="pt-reset-tutorial-btn"
                  onClick={onResetTutorial}
                  title="Chơi lại toàn bộ chuỗi hướng dẫn tân thủ của Quản Gia Oliver"
                >
                  ↺ Chơi Lại Hướng Dẫn Tân Thủ
                </button>
                <button
                  type="button"
                  className="pt-book-confirm-btn"
                  onClick={onClose}
                >
                  Tiếp Tục Chơi →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: BARN */}
          {activeTab === 'barn' && (
            <div className="pt-guide-content-view">
              <div className="pt-guide-callout warning">
                <div className="pt-callout-icon">⚠️</div>
                <div>
                  <strong>Chú ý quan trọng: Khi Kho Đầy!</strong>
                  <p>
                    Nếu tổng số lượng nông sản và sản phẩm vượt quá sức chứa, bạn <strong>sẽ không thể thu hoạch thêm bất kỳ cây trồng hay trứng/sữa nào</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-guide-grid-details">
                <div className="pt-detail-card">
                  <b>Dung Lượng Ban Đầu</b>
                  <p>Kho cấp 1 có sức chứa <strong>20 vị trí</strong> (áp dụng cho mọi nông sản và sản phẩm chế biến).</p>
                </div>
                <div className="pt-detail-card">
                  <b>Cách Giải Quyết Kho Đầy</b>
                  <p>1. Mở menu <strong>Kho Đồ</strong> và bấm vào các nông sản để bán bớt lấy Xu.</p>
                  <p>2. Hoặc mở menu <strong>Đơn Hàng</strong> để đóng gói giao đơn cho dân làng.</p>
                </div>
                <div className="pt-detail-card">
                  <b>Nâng Cấp Kho</b>
                  <p>Mở menu <strong>Nâng Cấp</strong> ➔ Chọn “Nâng kho”. Mỗi cấp tăng thêm <strong>+20 vị trí chứa</strong>!</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHOP & CROPS */}
          {activeTab === 'shop' && (
            <div className="pt-guide-content-view">
              <p className="pt-guide-intro-text">
                Cửa hàng cung cấp các loại hạt giống chất lượng cao. Bạn có thể mở cửa hàng từ mục <strong>Thành Phố ➔ Vật Tư</strong> hoặc tại menu nông trại.
              </p>

              <div className="pt-crops-table">
                <div className="pt-crop-row-header">
                  <span>Cây Trồng</span>
                  <span>Cấp Mở Khóa</span>
                  <span>Giá Hạt</span>
                  <span>Thời Gian</span>
                  <span>Giá Bán Kho</span>
                </div>
                <div className="pt-crop-row">
                  <span>🥕 Cà rốt</span>
                  <span>Cấp 1</span>
                  <span>5 xu</span>
                  <span>1 phút (Vụ 1: 8s)</span>
                  <span>12 xu</span>
                </div>
                <div className="pt-crop-row">
                  <span>🌾 Lúa mì</span>
                  <span>Cấp 2</span>
                  <span>12 xu</span>
                  <span>3 phút</span>
                  <span>30 xu</span>
                </div>
                <div className="pt-crop-row">
                  <span>🍅 Cà chua</span>
                  <span>Cấp 3</span>
                  <span>20 xu</span>
                  <span>5 phút</span>
                  <span>52 xu</span>
                </div>
                <div className="pt-crop-row">
                  <span>🍓 Dâu tây</span>
                  <span>Cấp 5</span>
                  <span>45 xu</span>
                  <span>10 phút</span>
                  <span>120 xu</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="pt-guide-content-view">
              <div className="pt-guide-callout success">
                <div className="pt-callout-icon">📦</div>
                <div>
                  <strong>Bí Kíp Làm Giàu: Xe Tải Đơn Hàng</strong>
                  <p>Giao đơn hàng xe tải đem lại <strong>nhiều Xu và XP hơn gấp 3 lần</strong> so với việc bán lẻ từng món nông sản vào kho!</p>
                </div>
              </div>

              <div className="pt-guide-grid-details">
                <div className="pt-detail-card">
                  <b>Đơn Hàng Nhà Hàng Green Valley</b>
                  <p>Cần 1 Cà rốt · Thưởng 65 Xu & 40 XP. Đơn hàng tân thủ dễ nhất!</p>
                </div>
                <div className="pt-detail-card">
                  <b>Tiệm Bánh Bình Minh</b>
                  <p>Cần 4 Lúa mì · Thưởng 145 Xu & 70 XP. Phù hợp khi mở khóa lúa mì cấp 2.</p>
                </div>
                <div className="pt-detail-card">
                  <b>Chợ Thị Trấn Vibe City</b>
                  <p>Cần 2 Cà rốt + 3 Cà chua · Thưởng 220 Xu & 110 XP. Đơn hàng lợi nhuận cao nhất!</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BUS TRANSIT */}
          {activeTab === 'bus' && (
            <div className="pt-guide-content-view">
              <div className="pt-guide-grid-details">
                <div className="pt-detail-card">
                  <b>Tuyến Xe Buýt Nhanh 01</b>
                  <p>Xe buýt chạy vòng tròn liên tục quanh thị trấn, hoàn toàn miễn phí cho mọi cư dân!</p>
                </div>
                <div className="pt-detail-card">
                  <b>Các Điểm Dừng Chính</b>
                  <p>• Trạm Nông Trại Bình Minh</p>
                  <p>• Trạm Trung Tâm Thành Phố & Cửa Hàng</p>
                  <p>• Trạm Hồ Pha Lê & Điểm Câu Cá</p>
                  <p>• Trạm Bến Cảng Vibe Port</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VEHICLES */}
          {activeTab === 'vehicles' && (
            <div className="pt-guide-content-view">
              <div className="pt-guide-grid-details">
                <div className="pt-detail-card highlight-vehicle">
                  <b>🚲 Xe Đạp Thể Thao Play Together</b>
                  <p>Tốc độ: <strong>10 m/s</strong> (Nhanh hơn 43% so với đi bộ!). Nhận miễn phí khi hoàn thành toàn bộ nhiệm vụ tân thủ!</p>
                </div>
                <div className="pt-detail-card">
                  <b>🛵 Xe Máy Cub 50 Classic</b>
                  <p>Tốc độ: <strong>14 m/s</strong>. Tiếng máy nổ hoài niệm, di chuyển siêu nhanh trên đường nhựa.</p>
                </div>
                <div className="pt-detail-card">
                  <b>🚜 Máy Cày FarmTrac 3000</b>
                  <p>Tốc độ: <strong>8 m/s</strong>. Phương tiện chuyên dụng cho người làm nông chuyên nghiệp.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
