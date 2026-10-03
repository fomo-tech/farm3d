import { useState } from 'react';
import {
  Icon3dBackpack,
  Icon3dShopCart,
  Icon3dOrdersBox,
  Icon3dModernCity,
  Icon3dBike,
  Icon3dCarrot,
  Icon3dRiceSpike,
  Icon3dSprout,
  Icon3dFlower,
  Icon3dLotus,
  Icon3dCoast,
  Icon3dWalk,
  Icon3dCub50,
  Icon3dTractor,
  Icon3dHammer,
} from './icons3d/GameIcons3D.jsx';

const GUIDE_TABS = [
  { id: 'barn', label: 'Kho Nông Sản', icon: <Icon3dBackpack size={18} />, title: 'Cơ Chế Kho Chứa & Xử Lý Kho Đầy' },
  { id: 'shop', label: 'Cửa Hàng', icon: <Icon3dShopCart size={18} />, title: 'Cửa Hàng Vật Tư & Cây Trồng' },
  { id: 'orders', label: 'Đơn Hàng', icon: <Icon3dOrdersBox size={18} />, title: 'Bảng Đơn Hàng & Kiếm Tiền Hiệu Quả' },
  { id: 'bus', label: 'Tuyến Xe Buýt', icon: <Icon3dModernCity size={18} />, title: 'Hệ Thống Xe Buýt & Thế Giới Mở' },
  { id: 'vehicles', label: 'Phương Tiện', icon: <Icon3dBike size={18} />, title: 'Phương Tiện & Tốc Độ Di Chuyển' },
];

export function FarmGuideModal({ onClose, onResetTutorial }) {
  const [activeTab, setActiveTab] = useState('barn');

  return (
    <div className="onboarding-backdrop" onClick={onClose}>
      <section className="farm-guide-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="guide-header">
          <div>
            <small>CẨM NANG NÔNG THÔN BÌNH MINH</small>
            <h2>Hướng Dẫn Vận Hành Nông Trại</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </header>

        {/* Tab Selection */}
        <div className="guide-tab-bar">
          {GUIDE_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`guide-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span style={{ display: 'inline-flex' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="guide-body">
          {activeTab === 'barn' && (
            <div className="guide-content-view">
              <div className="guide-callout warning">
                <div>
                  <strong>Chú ý quan trọng: Khi Kho Đầy!</strong>
                  <p>
                    Nếu tổng số lượng nông sản và sản phẩm vượt quá sức chứa, bạn <strong>sẽ không thể thu hoạch thêm bất kỳ cây trồng hay trứng/sữa nào</strong>.
                  </p>
                </div>
              </div>

              <div className="guide-grid-details">
                <div className="detail-card">
                  <b>Dung Lượng Ban Đầu</b>
                  <p>Kho cấp 1 có sức chứa <strong>20 vị trí</strong> (áp dụng cho mọi nông sản và sản phẩm chế biến).</p>
                </div>
                <div className="detail-card">
                  <b>Cách Giải Quyết Kho Đầy</b>
                  <p>1. Mở menu <strong>Kho Đồ</strong> và bấm vào các nông sản để bán bớt lấy Xu.</p>
                  <p>2. Hoặc mở menu <strong>Đơn Hàng</strong> để đóng gói giao đơn cho dân làng.</p>
                </div>
                <div className="detail-card">
                  <b>Nâng Cấp Kho</b>
                  <p>Mở menu <strong>Nâng Cấp</strong> ➔ Chọn “Nâng kho”. Mỗi cấp tăng thêm <strong>+20 vị trí chứa</strong>!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shop' && (
            <div className="guide-content-view">
              <p className="guide-intro-text">
                Cửa hàng cung cấp các loại hạt giống chất lượng cao. Bạn có thể mở cửa hàng từ mục <strong>Thành Phố ➔ Vật Tư</strong> hoặc tại menu nông trại.
              </p>

              <div className="crops-table">
                <div className="crop-row-header">
                  <span>Cây Trồng</span>
                  <span>Cấp Mở Khóa</span>
                  <span>Giá Hạt</span>
                  <span>Giá Bán</span>
                  <span>Thời Gian Lớn</span>
                </div>
                <div className="crop-row">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icon3dCarrot size={20} /> Cà rốt</span>
                  <span>Cấp 1</span>
                  <span>5 xu</span>
                  <span className="profit">+12 xu</span>
                  <span>1 phút</span>
                </div>
                <div className="crop-row">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icon3dRiceSpike size={20} /> Lúa mì</span>
                  <span>Cấp 2</span>
                  <span>12 xu</span>
                  <span className="profit">+30 xu</span>
                  <span>3 phút</span>
                </div>
                <div className="crop-row">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icon3dSprout size={20} /> Cà chua</span>
                  <span>Cấp 3</span>
                  <span>20 xu</span>
                  <span className="profit">+52 xu</span>
                  <span>5 phút</span>
                </div>
                <div className="crop-row">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icon3dFlower size={20} /> Dâu tây</span>
                  <span>Cấp 5</span>
                  <span>45 xu</span>
                  <span className="profit">+120 xu</span>
                  <span>10 phút</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="guide-content-view">
              <div className="guide-callout success">
                <div>
                  <strong>Bí quyết sinh lời cao nhất!</strong>
                  <p>
                    Luôn ưu tiên giữ nông sản để <strong>giao đơn hàng</strong> thay vì bán trực tiếp từ kho. Mỗi đơn hàng đem lại tiền thưởng Xu gấp 1.5x đến 2x cùng lượng lớn điểm kinh nghiệm (XP)!
                  </p>
                </div>
              </div>

              <div className="guide-grid-details">
                <div className="detail-card">
                  <b>Cách Giao Đơn</b>
                  <p>Bấm biểu tượng <strong>Đơn Hàng</strong> ở thanh menu bên phải. Nếu đủ nguyên liệu, nút sẽ sáng màu xanh để bạn bấm giao hàng.</p>
                </div>
                <div className="detail-card">
                  <b>Làm Mới Đơn Hàng</b>
                  <p>Sau khi hoàn thành tất cả đơn trên bảng, bạn có thể dùng 25 xu để nhận ngay một đợt 3 đơn hàng mới toanh!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bus' && (
            <div className="guide-content-view">
              <p className="guide-intro-text">
                Tuyến xe buýt Tuyến 01 là phương tiện công cộng miễn phí kết nối 4 khu vực trọng điểm của Thung Lũng Bình Minh:
              </p>

              <div className="guide-grid-details">
                <div className="detail-card">
                  <b style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon3dRiceSpike size={20} /> Nông Trại Hoa Mai</b>
                  <p>Khu vực trang trại cá nhân, ô đất canh tác, chuồng gà bò và cối xay.</p>
                </div>
                <div className="detail-card">
                  <b style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon3dModernCity size={20} /> Trung Tâm Thành Phố</b>
                  <p>Quảng trường, cửa hàng vật tư, tiệm thời trang, đại lý xe và sòng bài may mắn.</p>
                </div>
                <div className="detail-card">
                  <b style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon3dLotus size={20} /> Hồ Pha Lê</b>
                  <p>Cầu gỗ và đầm sen hữu tình, địa điểm lý tưởng để thư giãn.</p>
                </div>
                <div className="detail-card">
                  <b style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon3dCoast size={20} /> Bãi Biển Bình Minh</b>
                  <p>Bờ biển cát trắng, chợ cá ven biển và ngọn hải đăng cổ kính.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="guide-content-view">
              <div className="guide-grid-details">
                <div className="detail-card">
                  <b style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon3dWalk size={20} /> Đi Bộ (Mặc định)</b>
                  <p>Tốc độ: <strong>7 m/s</strong> · Miễn phí</p>
                </div>
                <div className="detail-card highlight-vehicle">
                  <b style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon3dBike size={20} /> Xe Đạp Thể Thao</b>
                  <p>Tốc độ: <strong>10 m/s</strong> (Nhanh hơn 43%) · <em>Phần thưởng tốt nghiệp Onboarding từ Quản Gia Oliver!</em></p>
                </div>
                <div className="detail-card">
                  <b style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon3dCub50 size={20} /> Xe Máy Điện</b>
                  <p>Tốc độ: <strong>14 m/s</strong> (Gấp đôi đi bộ) · Mua tại Đại Lý Xe với giá 900 xu.</p>
                </div>
                <div className="detail-card">
                  <b style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon3dTractor size={20} /> Máy Kéo Nông Trại</b>
                  <p>Tốc độ: <strong>18 m/s</strong> · Phương tiện nhanh và mạnh mẽ nhất thung lũng!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="guide-footer">
          {onResetTutorial && (
            <button type="button" className="replay-tutorial-btn" onClick={onResetTutorial}>
              Chơi lại Luồng Hướng Dẫn Tân Thủ
            </button>
          )}
          <button type="button" className="guide-close-action" onClick={onClose}>
            Đã Hiểu · Đóng Cẩm Nang
          </button>
        </footer>
      </section>
    </div>
  );
}

