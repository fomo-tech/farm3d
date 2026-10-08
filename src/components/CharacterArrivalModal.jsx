import React, { useState } from 'react';
import { getDefaultCustomization } from '../../shared/fashionConfig.js';
import { ArrivalAvatar } from './ArrivalAvatar.jsx';
import './CharacterArrival.css';
import './CharacterGameStyle.css';

function CheckIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DiceIcon({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#ffffff" stroke="currentColor" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="#ef4444" stroke="none" />
      <circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const CUTE_NICKNAMES = [
  'Bắp Non',
  'Bé Mây',
  'Mèo Ú',
  'Thỏ Trắng',
  'Gấu Dâu',
  'Cam Ngọt',
  'Khoai Tây',
  'Hạt Dẻ',
  'Đậu Nành',
  'Cà Rốt',
  'Cún Con',
  'Mầm Xanh',
  'Mochi Dẻo',
  'Bánh Bao',
  'Kẹo Bông',
  'Gấu Trúc',
  'Vịt Con',
  'Kem Dâu',
  'Trà Sữa',
  'Bơ Sáp',
];

const STARTER_SHIRT_COLORS = [
  { hex: '#f8fafc', name: 'Trắng Tinh' },
  { hex: '#fef08a', name: 'Vàng Kem' },
  { hex: '#fbbf24', name: 'Cam Nắng' },
  { hex: '#38bdf8', name: 'Xanh Biển' },
  { hex: '#f472b6', name: 'Hồng Phấn' },
  { hex: '#4ade80', name: 'Xanh Bơ' },
  { hex: '#a78bfa', name: 'Tím Nhạt' },
  { hex: '#334155', name: 'Xám Than' },
];

const HAIR_STYLES = [
  { id: 'hair_buzzcut', label: 'Đầu Đinh', desc: 'Gọn gàng' },
  { id: 'hair_high_ponytail', label: 'Đuôi Gà', desc: 'Buộc cao' },
  { id: 'classic', label: 'Tóc Ngắn', desc: 'Năng động' },
  { id: 'twintails', label: 'Hai Chùm', desc: 'Đáng yêu' },
  { id: 'bob', label: 'Tóc Bob', desc: 'Trẻ trung' },
  { id: 'wavy', label: 'Gợn Sóng', desc: 'Mềm mại' },
];

const HAIR_COLORS = [
  { hex: '#76503b', name: 'Nâu Hạt Dẻ' },
  { hex: '#f59e0b', name: 'Vàng Mơ' },
  { hex: '#262626', name: 'Đen Tuyền' },
  { hex: '#f472b6', name: 'Hồng Pastel' },
  { hex: '#38bdf8', name: 'Xanh Bạc Hà' },
];

const SKIN_SWATCHES = [
  { id: 'peach', hex: '#e6b08f', name: 'Đào Sáng' },
  { id: 'porcelain', hex: '#efc2ad', name: 'Trắng Sứ' },
  { id: 'honey', hex: '#c88962', name: 'Mật Ong' },
  { id: 'caramel', hex: '#9a6547', name: 'Bánh Mật' },
];

export function CharacterCreationModal({ defaultName = '', onSubmit, pending = false, error = '' }) {
  const [name, setName] = useState(defaultName || 'Bắp Non');
  const [gender, setGender] = useState(() => getDefaultCustomization().gender); // 'female' | 'male'
  const [shirtColor, setShirtColor] = useState('#f8fafc');
  const [selectedHair, setSelectedHair] = useState(() => getDefaultCustomization().hairStyle);
  const [selectedHairColor, setSelectedHairColor] = useState('#76503b');
  const [selectedSkinTone, setSelectedSkinTone] = useState('peach');
  const [activeTab, setActiveTab] = useState('shirt'); // 'shirt' | 'hair' | 'color'
  const [diceRolling, setDiceRolling] = useState(false);

  const handleRollDice = () => {
    setDiceRolling(true);
    setTimeout(() => {
      const randomName = CUTE_NICKNAMES[Math.floor(Math.random() * CUTE_NICKNAMES.length)];
      setName(randomName);
      setDiceRolling(false);
    }, 180);
  };

  const handleGenderSelect = (g) => {
    setGender(g);
    if (g === 'male' && selectedHair === 'twintails') {
      setSelectedHair('classic');
    } else if (g === 'female' && selectedHair === 'classic') {
      setSelectedHair('twintails');
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!name.trim() || pending) return;
    onSubmit({
      name: name.trim(),
      avatarIcon: 'starter',
      outfit: 'starter',
      outfitColor: shirtColor,
      gender,
      hair: selectedHair,
      hairColor: selectedHairColor,
      skinTone: selectedSkinTone,
    });
  };

  return (
    <div className="pt-onboarding-backdrop arrival-screen">
      <section className="pt-studio-card" role="dialog" aria-modal="true" aria-label="Tạo nhân vật Play Together">
        {/* Header */}
        <header className="pt-studio-header">
          <div className="pt-studio-badge">
            <span>KHỞI ĐẦU HÀNH TRÌNH</span>
          </div>
          <h2>Tạo Nhân Vật</h2>
          <p>Tùy chỉnh diện mạo ban đầu trước khi bước vào thị trấn</p>
        </header>

        {error && <div className="pt-creation-error-banner">{error}</div>}

        <div className="pt-studio-body">
          {/* Cột trái: Sân khấu 3D Podium */}
          <div className="pt-studio-podium-wrap">
            <ArrivalAvatar
              outfit="starter"
              color={shirtColor}
              gender={gender}
              hair={selectedHair}
              hairColor={selectedHairColor}
              skinTone={selectedSkinTone}
            />
            <p className="arrival-rotate-hint">Kéo chuột hoặc vuốt để xoay nhân vật</p>
            <div className="pt-podium-name-tag">
              <span className="pt-tag-role">Tân Cư Dân</span>
              <strong className="pt-tag-name">{name || 'Chưa đặt tên'}</strong>
            </div>
          </div>

          {/* Cột phải: Bảng điều khiển tùy chọn phong cách */}
          <div className="pt-studio-controls">
            {/* 1. Nhập tên nhân vật & Xúc xắc */}
            <div className="pt-input-block">
              <label htmlFor="chibi-name-input">TÊN NHÂN VẬT</label>
              <div className="pt-input-with-dice">
                <input
                  id="chibi-name-input"
                  type="text"
                  required
                  maxLength={18}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nhập tên riêng của bạn..."
                />
                <button
                  type="button"
                  className={`pt-dice-btn ${diceRolling ? 'is-rolling' : ''}`}
                  onClick={handleRollDice}
                  title="Gợi ý tên ngẫu nhiên"
                  aria-label="Xúc xắc chọn tên"
                >
                  <DiceIcon size={24} />
                </button>
              </div>
            </div>

            {/* 2. Chọn Giới Tính Nhanh (Clean UI, không dùng emoji) */}
            <div className="pt-gender-select">
              <label>GIỚI TÍNH</label>
              <div className="pt-gender-buttons">
                <button
                  type="button"
                  className={`pt-gender-btn pt-gender-female ${gender === 'female' ? 'selected' : ''}`}
                  onClick={() => handleGenderSelect('female')}
                >
                  <span className="pt-gender-label">NỮ</span>
                  {gender === 'female' && <CheckIcon size={16} className="pt-check-badge" />}
                </button>
                <button
                  type="button"
                  className={`pt-gender-btn pt-gender-male ${gender === 'male' ? 'selected' : ''}`}
                  onClick={() => handleGenderSelect('male')}
                >
                  <span className="pt-gender-label">NAM</span>
                  {gender === 'male' && <CheckIcon size={16} className="pt-check-badge" />}
                </button>
              </div>
            </div>

            {/* 3. Tab chuyển đổi: Áo Phông | Kiểu Tóc | Màu Sắc (Không dùng emoji) */}
            <div className="pt-studio-tabs">
              <button
                type="button"
                className={`pt-tab-btn ${activeTab === 'shirt' ? 'active' : ''}`}
                onClick={() => setActiveTab('shirt')}
              >
                Áo Phông
              </button>
              <button
                type="button"
                className={`pt-tab-btn ${activeTab === 'hair' ? 'active' : ''}`}
                onClick={() => setActiveTab('hair')}
              >
                Kiểu Tóc
              </button>
              <button
                type="button"
                className={`pt-tab-btn ${activeTab === 'color' ? 'active' : ''}`}
                onClick={() => setActiveTab('color')}
              >
                Màu Sắc
              </button>
            </div>

            {/* 4. Nội dung từng Tab */}
            <div className="pt-studio-tab-content">
              {/* Tab 1: Màu Áo Phông Tân Thủ (Chỉ có Áo Phông, không bán đồ thời trang tại bước tạo nhân vật) */}
              {activeTab === 'shirt' && (
                <div className="pt-shirt-colors-grid">
                  {STARTER_SHIRT_COLORS.map(item => (
                    <button
                      key={item.hex}
                      type="button"
                      className={`pt-shirt-card ${shirtColor === item.hex ? 'selected' : ''}`}
                      onClick={() => setShirtColor(item.hex)}
                    >
                      <div className="pt-shirt-swatch" style={{ backgroundColor: item.hex }} />
                      <span className="pt-shirt-name">{item.name}</span>
                      {shirtColor === item.hex && (
                        <span className="pt-card-check">
                          <CheckIcon size={12} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Tab 2: Kiểu Tóc Tân Thủ */}
              {activeTab === 'hair' && (
                <div className="pt-hairs-grid">
                  {HAIR_STYLES.map(h => (
                    <button
                      key={h.id}
                      type="button"
                      className={`pt-hair-card ${selectedHair === h.id ? 'selected' : ''}`}
                      onClick={() => setSelectedHair(h.id)}
                    >
                      <div className="pt-hair-preview-dot" style={{ backgroundColor: selectedHairColor }} />
                      <div className="pt-hair-info">
                        <strong>{h.label}</strong>
                        <span>{h.desc}</span>
                      </div>
                      {selectedHair === h.id && (
                        <span className="pt-card-check">
                          <CheckIcon size={12} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Tab 3: Bảng Màu Da & Màu Tóc */}
              {activeTab === 'color' && (
                <div className="pt-colors-container">
                  <div className="pt-color-section">
                    <span className="pt-section-title">MÀU DA CHIBI</span>
                    <div className="pt-colors-grid">
                      {SKIN_SWATCHES.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          className={`pt-color-bubble ${selectedSkinTone === s.id ? 'selected' : ''}`}
                          style={{ backgroundColor: s.hex }}
                          onClick={() => setSelectedSkinTone(s.id)}
                          title={s.name}
                          aria-label={`Màu da: ${s.name}`}
                        >
                          {selectedSkinTone === s.id && <CheckIcon size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-color-section">
                    <span className="pt-section-title">MÀU TÓC</span>
                    <div className="pt-colors-grid">
                      {HAIR_COLORS.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          className={`pt-color-bubble ${selectedHairColor === c.hex ? 'selected' : ''}`}
                          style={{ backgroundColor: c.hex }}
                          onClick={() => setSelectedHairColor(c.hex)}
                          title={c.name}
                          aria-label={`Màu tóc: ${c.name}`}
                        >
                          {selectedHairColor === c.hex && <CheckIcon size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Nút Khởi Hành Bắt Đầu Chơi (Thuần typography game, không emoji tên lửa) */}
            <button
              type="button"
              className="pt-studio-submit-btn"
              disabled={!name.trim() || pending}
              onClick={handleSubmit}
            >
              {pending ? 'Đang chuẩn bị vào thị trấn…' : 'VÀO THỊ TRẤN'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
