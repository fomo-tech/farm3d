import React, { useState } from 'react';
import { ArrivalAvatar } from './ArrivalAvatar.jsx';
import './CharacterArrival.css';
import {
  Icon3dNonLa,
  Icon3dShirt,
  Icon3dFlower,
  Icon3dCap,
  Icon3dCrown,
  Icon3dDice,
  Icon3dGoldCoin,
  Icon3dCarrot,
  Icon3dPartyPopper,
  Icon3dSparkleStar,
  Icon3dCheck,
  Icon3dModernCity,
  Icon3dVillageGate,
} from './icons3d/GameIcons3D.jsx';

const CUTE_NICKNAMES = [
  'Bắp Non',
  'Bé Mây',
  'Mèo Ú Nông Dân',
  'Thỏ Bảy Màu',
  'Gấu Dâu Tây',
  'Cam Ngọt',
  'Bánh Tiêu',
  'Khoai Tây Mini',
  'Hạt Dẻ Cười',
  'Bé Đậu Nành',
  'Cà Rốt Tí Hon',
  'Cún Con Vui Vẻ',
  'Mầm Xanh',
  'Chôm Chôm',
  'Trà Sữa Trân Châu',
  'Bơ Sáp Béo Ngậy',
  'Dưa Hấu Đỏ',
  'Mochi Dẻo',
  'Củ Cải Trắng',
  'Gà Con Lon Ton',
  'Bánh Bao Nóng',
  'Kẹo Bông Gòn',
  'Xoài Cát Mini',
  'Kem Dâu Tây',
  'Gấu Trúc Kaia',
  'Nông Dân Triệu Phú',
  'Chủ Vườn Tí Hon',
  'Chú Heo Đáng Yêu',
];

const OUTFITS_LIST = [
  { id: 'starter', name: 'Áo phông mộc mạc', icon: <Icon3dShirt size={28} />, defaultColor: '#f8fafc', desc: 'Trẻ trung, năng động' },
  { id: 'farmer', name: 'Nông dân Bình Minh', icon: <Icon3dNonLa size={28} />, defaultColor: '#f1b445', desc: 'Yếm cam làm vườn' },
  { id: 'rose', name: 'Hoa Hồng Dịu Dàng', icon: <Icon3dFlower size={28} />, defaultColor: '#e87994', desc: 'Ngọt ngào, thanh lịch' },
  { id: 'lake', name: 'Hồ Pha Lê', icon: <Icon3dCap size={28} />, defaultColor: '#5f91c8', desc: 'Thể thao dạo hồ' },
  { id: 'royal', name: 'Hoàng Gia Kaia', icon: <Icon3dCrown size={28} />, defaultColor: '#8a72b8', desc: 'Quý phái, sang trọng' },
];

const HEADWEAR_LIST = [
  { id: 'nonla', name: 'Nón Lá Việt Nam', icon: <Icon3dNonLa size={26} /> },
  { id: 'cap', name: 'Mũ Lưỡi Trai', icon: <Icon3dCap size={26} /> },
  { id: 'crown', name: 'Vương Miện Vàng', icon: <Icon3dCrown size={26} /> },
  { id: 'flower', name: 'Cài Hoa Xinh', icon: <Icon3dFlower size={26} /> },
];

const COLOR_SWATCHES = [
  { hex: '#f1b445', name: 'Vàng Nắng' },
  { hex: '#e87994', name: 'Hồng Dâu' },
  { hex: '#5f91c8', name: 'Xanh Biển' },
  { hex: '#8a72b8', name: 'Tím Mộng Mơ' },
  { hex: '#4ade80', name: 'Xanh Bạc Hà' },
  { hex: '#f8fafc', name: 'Trắng Mây' },
];

export function CharacterCreationModal({ defaultName = '', onSubmit, pending = false, error = '' }) {
  const [step, setStep] = useState('studio'); // 'studio' | 'ticket'
  const [name, setName] = useState(defaultName || 'Bắp Non');
  const [selectedOutfit, setSelectedOutfit] = useState('starter');
  const [selectedColor, setSelectedColor] = useState('#f8fafc');
  const [selectedHeadwear, setSelectedHeadwear] = useState('none');
  const [activeTab, setActiveTab] = useState('outfit'); // 'outfit' | 'headwear' | 'color'
  const [diceRolling, setDiceRolling] = useState(false);

  const handleRollDice = () => {
    setDiceRolling(true);
    setTimeout(() => {
      const randomName = CUTE_NICKNAMES[Math.floor(Math.random() * CUTE_NICKNAMES.length)];
      setName(randomName);
      setDiceRolling(false);
    }, 250);
  };

  const handleOutfitChange = (outfit) => {
    setSelectedOutfit(outfit.id);
    setSelectedColor(outfit.defaultColor);
  };

  const handleCompleteStudio = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep('ticket');
  };

  const handleFinalSubmit = () => {
    onSubmit({
      name: name.trim(),
      avatarIcon: selectedOutfit,
      outfit: selectedOutfit,
      outfitColor: selectedColor,
      headwear: selectedHeadwear,
    });
  };

  return (
    <div className="pt-onboarding-backdrop arrival-screen arrival-starter-only">
      {step === 'studio' && (
        <section className="pt-studio-card" role="dialog" aria-modal="true" aria-label="Studio thiết kế nhân vật">
          {/* Header */}
          <div className="pt-studio-header">
            <div className="pt-studio-badge">
              <Icon3dSparkleStar size={20} />
              <span>VIBE CITY · CƯ DÂN MỚI</span>
              <Icon3dPartyPopper size={20} />
            </div>
            <h2>Xin chào, bạn mới!</h2>
            <p>Đặt tên và bắt đầu với trang phục cơ bản. Bạn có thể mua đồ mới sau này.</p>
          </div>

          <div className="pt-studio-body">
            {/* Left: 3D Character Preview Podium */}
            <div className="pt-studio-podium-wrap">
              <ArrivalAvatar outfit={selectedOutfit} color={selectedColor} />
              <div className="pt-podium-stage" hidden style={{display:'none'}}>
                <div
                  className="pt-podium-chibi-avatar"
                  style={{
                    boxShadow: `0 14px 30px ${selectedColor}66, inset 0 2px 4px rgba(255, 255, 255, 0.8)`,
                    borderColor: selectedColor,
                  }}
                >
                  <div className="pt-podium-headwear">
                    {selectedHeadwear === 'nonla' && <Icon3dNonLa size={44} />}
                    {selectedHeadwear === 'cap' && <Icon3dCap size={44} />}
                    {selectedHeadwear === 'crown' && <Icon3dCrown size={44} />}
                    {selectedHeadwear === 'flower' && <Icon3dFlower size={44} />}
                  </div>
                  <div className="pt-podium-outfit-icon">
                    {selectedOutfit === 'starter' && <Icon3dShirt size={48} />}
                    {selectedOutfit === 'farmer' && <Icon3dNonLa size={48} />}
                    {selectedOutfit === 'rose' && <Icon3dFlower size={48} />}
                    {selectedOutfit === 'lake' && <Icon3dCap size={48} />}
                    {selectedOutfit === 'royal' && <Icon3dCrown size={48} />}
                  </div>
                </div>
                {/* 3D Circular Pedestal */}
                <div className="pt-podium-base" />
              </div>
              <p className="arrival-rotate-hint">↔ Kéo nhân vật để xoay</p>

              {/* Character Identity Strip */}
              <div className="pt-podium-name-tag">
                <span className="pt-tag-role">Nông Dân Mới Đến</span>
                <strong className="pt-tag-name">{name || 'Chưa đặt tên'}</strong>
              </div>
            </div>

            {/* Right: Customization Controls */}
            <div className="pt-studio-controls">
              {/* Name Input with Lucky Dice */}
              <div className="pt-input-block">
                <label htmlFor="chibi-name-input">TÊN NHÂN VẬT CỦA BẠN</label>
                <div className="pt-input-with-dice">
                  <input
                    id="chibi-name-input"
                    type="text"
                    required
                    maxLength={18}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nhập biệt danh cute…"
                  />
                  <button
                    type="button"
                    className={`pt-dice-btn ${diceRolling ? 'is-rolling' : ''}`}
                    onClick={handleRollDice}
                    title="Gợi ý tên ngẫu nhiên siêu ngộ nghĩnh!"
                    aria-label="Xúc xắc chọn tên ngẫu nhiên"
                  >
                    <Icon3dDice size={28} />
                  </button>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="pt-studio-tabs" hidden style={{display:'none'}}>
                <button
                  type="button"
                  className={`pt-tab-btn ${activeTab === 'outfit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('outfit')}
                >
                  <Icon3dShirt size={18} />
                  <span>Trang Phục</span>
                </button>
                {false && <button
                  type="button"
                  className={`pt-tab-btn ${activeTab === 'headwear' ? 'active' : ''}`}
                  onClick={() => setActiveTab('headwear')}
                >
                  <Icon3dNonLa size={18} />
                  <span>Nón Mũ</span>
                </button>}
                <button
                  type="button"
                  className={`pt-tab-btn ${activeTab === 'color' ? 'active' : ''}`}
                  onClick={() => setActiveTab('color')}
                >
                  <span className="pt-tab-color-dot" style={{ background: selectedColor }} />
                  <span>Màu Sắc</span>
                </button>
              </div>

              {/* Tab Panel Content */}
              <div className="pt-studio-tab-content">
                {activeTab === 'outfit' && (
                  <div className="pt-options-grid">
                    {OUTFITS_LIST.filter(item => item.id === 'starter').map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className={`pt-option-card ${selectedOutfit === item.id ? 'selected' : ''}`}
                        onClick={() => handleOutfitChange(item)}
                      >
                        <div className="pt-option-icon">{item.icon}</div>
                        <b>{item.name}</b>
                        <small>{item.desc}</small>
                        {selectedOutfit === item.id && <span className="pt-card-check"><Icon3dCheck size={14} /></span>}
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'headwear' && (
                  <div className="pt-options-grid headwear-grid">
                    {HEADWEAR_LIST.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className={`pt-option-card ${selectedHeadwear === item.id ? 'selected' : ''}`}
                        onClick={() => setSelectedHeadwear(item.id)}
                      >
                        <div className="pt-option-icon">{item.icon}</div>
                        <b>{item.name}</b>
                        {selectedHeadwear === item.id && <span className="pt-card-check"><Icon3dCheck size={14} /></span>}
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'color' && (
                  <div className="pt-colors-grid">
                    {COLOR_SWATCHES.map(swatch => (
                      <button
                        key={swatch.hex}
                        type="button"
                        className={`pt-color-bubble ${selectedColor === swatch.hex ? 'selected' : ''}`}
                        style={{ backgroundColor: swatch.hex }}
                        onClick={() => setSelectedColor(swatch.hex)}
                        title={swatch.name}
                      >
                        {selectedColor === swatch.hex && <Icon3dCheck size={18} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <p>Bạn chưa có đất hoặc nhà. Sau khi vào thị trấn, khám phá các làng và dùng xu mua lô đất phù hợp. Đất gần trung tâm có giá cao hơn.</p>
              <button
                type="button"
                className="pt-studio-submit-btn"
                disabled={!name.trim()}
                onClick={handleCompleteStudio}
              >
                Tiếp tục →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 2: Kaia Resident ID & Bus Arrival Ticket */}
      {step === 'ticket' && (
        <section className="pt-ticket-card" role="dialog" aria-modal="true" aria-label="Thẻ cư dân Kaia">
          <div className="pt-ticket-stamp">CƯ DÂN MỚI</div>

          <div className="pt-ticket-inner">
            {/* Header */}
            <div className="pt-ticket-header">
              <div className="pt-ticket-logo">
                <Icon3dVillageGate size={28} />
                <div>
                  <h3>THẺ CƯ DÂN THUNG LŨNG KAIA</h3>
                  <small>XÁC NHẬN THÔNG TIN NHÂN VẬT</small>
                </div>
              </div>
            </div>

            {/* Resident Card Details */}
            <div className="pt-ticket-profile-strip">
              <div
                className="pt-ticket-avatar"
                style={{ borderColor: selectedColor, background: `${selectedColor}22` }}
              >
                {selectedHeadwear === 'nonla' && <Icon3dNonLa size={38} />}
                {selectedHeadwear === 'cap' && <Icon3dCap size={38} />}
                {selectedHeadwear === 'crown' && <Icon3dCrown size={38} />}
                {selectedHeadwear === 'flower' && <Icon3dFlower size={38} />}
              </div>
              <div className="pt-ticket-info">
                <div className="pt-ticket-name-row">
                  <span className="label">TÊN CƯ DÂN:</span>
                  <strong>{name}</strong>
                </div>
                <div className="pt-ticket-role-row">
                  <span className="label">CHỨC DANH:</span>
                  <b>Nông Dân Tập Sự · Cấp 1</b>
                </div>
                <div className="pt-ticket-village-row">
                  <span className="label">ĐIỂM ĐẾN:</span>
                  <span>Quảng Trường Trung Tâm Thung Lũng</span>
                </div>
              </div>
            </div>

            {/* Welcome Starter Gifts */}
            <div className="pt-starter-gift-box" hidden style={{display:'none'}}>
              <span className="pt-gift-label">QUÀ TÂN THỦ CHÀO MỪNG:</span>
              <div className="pt-gift-items">
                <div className="pt-gift-pill coins">
                  <Icon3dGoldCoin size={22} />
                  <span>180 Xu Khởi Nghiệp</span>
                </div>
                <div className="pt-gift-pill seeds">
                  <Icon3dCarrot size={20} />
                  <span>3 Hạt Cà Rốt Đột Biến</span>
                </div>
              </div>
            </div>

            {/* Quick Tip from Elder Oliver */}
            <div className="pt-ticket-elder-note">
              <span>Gặp Oliver tại quảng trường để bắt đầu hướng dẫn. Bạn cần tự mua đất; lô đất mua thành công sẽ đứng tên bạn, gồm 12 ô trồng, một chuồng và một nhà nhỏ cấp 1.</span>
            </div>

            {/* Actions */}
            {error && <p role="alert" style={{color:'#b42318'}}>{error}</p>}
            <div className="pt-ticket-actions">
              <button
                type="button"
                className="pt-ticket-back-btn"
                disabled={pending}
                onClick={() => setStep('studio')}
              >
                ← Chỉnh sửa lại
              </button>
              <button
                type="button"
                className="pt-ticket-enter-btn"
                disabled={pending}
                onClick={handleFinalSubmit}
              >
                <Icon3dPartyPopper size={24} />
                <span>{pending ? 'ĐANG TẠO NHÂN VẬT…' : 'TẠO NHÂN VẬT & VÀO THỊ TRẤN'}</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
