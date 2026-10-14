import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getDefaultCustomization } from '../../shared/fashionConfig.js';
import { useInventoryMeshArt } from './useInventoryMeshArt.js';
import { STARTER_HAIR_IDS, STARTER_HAIR_COLORS } from '../../shared/starterAppearance.js';
import { ArrivalAvatar } from './ArrivalAvatar.jsx';
import './CharacterArrival.css';


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

const HAIR_STYLES = [
  { id: 'hair_buzzcut', label: 'Đầu Đinh', desc: 'Gọn gàng' },
  { id: 'hair_high_ponytail', label: 'Đuôi Gà', desc: 'Buộc cao' },
  { id: 'classic', label: 'Tóc Ngắn', desc: 'Năng động' },
  { id: 'twintails', label: 'Hai Chùm', desc: 'Đáng yêu' },
  { id: 'bob', label: 'Tóc Bob', desc: 'Trẻ trung' },
  { id: 'wavy', label: 'Gợn Sóng', desc: 'Mềm mại' },
];

const HAIR_COLORS = STARTER_HAIR_COLORS;

const SKIN_SWATCHES = [
  { id: 'peach', hex: '#e6b08f', name: 'Đào Sáng' },
  { id: 'porcelain', hex: '#efc2ad', name: 'Trắng Sứ' },
  { id: 'honey', hex: '#c88962', name: 'Mật Ong' },
  { id: 'caramel', hex: '#9a6547', name: 'Bánh Mật' },
];

export function CharacterCreationModal({ onSubmit, onCheckName, pending = false, error = '' }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState(() => getDefaultCustomization().gender); // 'female' | 'male'
  const shirtColor = '#f8fafc';
  const [selectedHair, setSelectedHair] = useState(() => getDefaultCustomization().hairStyle);
  const [selectedHairColor, setSelectedHairColor] = useState('#76503b');
  const [selectedSkinTone, setSelectedSkinTone] = useState('peach');
  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'hair' | 'color'
  const [diceRolling, setDiceRolling] = useState(false);
  const hairItems = useMemo(() => HAIR_STYLES.map(h => ({id:`starter-hair:${h.id}:${gender}:${selectedHairColor}`, itemId:STARTER_HAIR_IDS[h.id] || h.id, previewGender:gender, previewHairColor:selectedHairColor, previewHeadShot:true})), [gender, selectedHairColor]);
  const hairImages = useInventoryMeshArt(activeTab === 'hair', 'fashion', hairItems);

  const trimmedName = name.trim();
  const validName = trimmedName.length >= 3 && trimmedName.length <= 18;
  const [nameCheck, setNameCheck] = useState(null);
  const checker = useRef(onCheckName);
  checker.current = onCheckName;
  useEffect(() => {
    let cancelled = false;
    if (!validName || !checker.current) return;
    const timer = setTimeout(async () => {
      try {
        const result = await checker.current(trimmedName);
        if (!cancelled) setNameCheck({ name: trimmedName, ...result });
      } catch (error) {
        if (!cancelled) setNameCheck({ name: trimmedName, available: false, message: error.message });
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [trimmedName, validName]);
  const checkedName = nameCheck?.name === trimmedName ? nameCheck : null;
  const canSubmit = validName && (!onCheckName || checkedName?.available);
  const nameMessage = !trimmedName ? 'Tên cần từ 3 đến 18 ký tự' : !validName ? 'Tên cần từ 3 đến 18 ký tự' : onCheckName ? checkedName?.message || 'Đang kiểm tra tên…' : 'Tên hợp lệ';
  const tabTitle = { hair: 'Chọn kiểu tóc bạn yêu thích', color: 'Hoàn thiện diện mạo của bạn' }[activeTab];

  const handleRollDice = () => {
    setDiceRolling(true);
    setTimeout(() => {
      const randomName = CUTE_NICKNAMES[Math.floor(Math.random() * CUTE_NICKNAMES.length)];
      setName(randomName);
      setNameCheck(null);
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
    if (!canSubmit || pending) return;
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
      <div className="arrival-world-scenery" aria-hidden="true"><div className="arrival-cloud cloud-one"/><div className="arrival-cloud cloud-two"/><div className="arrival-hill hill-back"/><div className="arrival-hill hill-front"/></div>
      <section className="pt-studio-card" role="dialog" aria-modal="true" aria-labelledby="arrival-title" aria-busy={pending}>
        {/* Header */}
        <header className="pt-studio-header">
          <div className="pt-studio-badge">
            <span>VIBE CITY</span>
          </div>
          <h2 id="arrival-title">Tạo nhân vật</h2>
          <p className="arrival-step-label">{activeTab === 'identity' ? '01 · Đặt tên cư dân' : activeTab === 'hair' ? '02 · Chọn kiểu tóc' : '03 · Hoàn thiện diện mạo'}</p>
        </header>

        {error && <div className="pt-creation-error-banner" role="alert">{error}</div>}

        <div className="pt-studio-body">
          {/* Cột trái: Sân khấu 3D Podium */}
          <div className="pt-studio-podium-wrap">
            <span className="arrival-player-level">Lv. 1 <span>•</span> Nông dân mới</span>
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
              <span className="pt-tag-role">NÔNG DÂN VIBE CITY</span>
              <strong className="pt-tag-name">{name.trim() || 'Tên của bạn'}</strong>
            </div>
          </div>

          {/* Cột phải: Bảng điều khiển tùy chọn phong cách */}
          <form className="pt-studio-controls" onSubmit={handleSubmit}>
            <fieldset disabled={pending}>
            <div className="arrival-identity-panel" hidden={activeTab !== 'identity'}>
            {/* 1. Nhập tên nhân vật & Xúc xắc */}
            <div className="pt-input-block">
              <label htmlFor="chibi-name-input">TÊN NHÂN VẬT</label>
              <div className="pt-input-with-dice">
                <input
                  id="chibi-name-input"
                  type="text"
                  required
                  maxLength={18}
                  minLength={3}
                  autoComplete="off"
                  aria-describedby="arrival-name-help"
                  value={name}
                  onChange={e => { setName(e.target.value); setNameCheck(null); }}
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
              <small id="arrival-name-help" className="arrival-name-help"><span role="status" aria-live="polite">{nameMessage}</span><span>{name.length}/18</span></small>
            </div>

            {/* 2. Chọn Giới Tính Nhanh (Clean UI, không dùng emoji) */}
            <div className="pt-gender-select">
              <label>GIỚI TÍNH</label>
              <div className="pt-gender-buttons">
                <button
                  type="button"
                  className={`pt-gender-btn pt-gender-female ${gender === 'female' ? 'selected' : ''}`}
                  aria-pressed={gender === 'female'}
                  onClick={() => handleGenderSelect('female')}
                >
                  <span className="pt-gender-label">NỮ</span>
                  {gender === 'female' && <CheckIcon size={16} className="pt-check-badge" />}
                </button>
                <button
                  type="button"
                  className={`pt-gender-btn pt-gender-male ${gender === 'male' ? 'selected' : ''}`}
                  aria-pressed={gender === 'male'}
                  onClick={() => handleGenderSelect('male')}
                >
                  <span className="pt-gender-label">NAM</span>
                  {gender === 'male' && <CheckIcon size={16} className="pt-check-badge" />}
                </button>
              </div>
            </div>

            </div>
            {/* 3. Tab chuyển đổi: Áo Phông | Kiểu Tóc | Màu Sắc (Không dùng emoji) */}
            <div className="pt-studio-tabs" aria-label="Tạo nhân vật">
              <button type="button" className={`pt-tab-btn ${activeTab === 'identity' ? 'active' : ''}`} aria-pressed={activeTab === 'identity'} onClick={() => setActiveTab('identity')}>Nhân vật</button>
              <button
                type="button"
                className={`pt-tab-btn ${activeTab === 'hair' ? 'active' : ''}`}
                aria-pressed={activeTab === 'hair'}
                onClick={() => setActiveTab('hair')}
              >
                Kiểu Tóc
              </button>
              <button
                type="button"
                className={`pt-tab-btn ${activeTab === 'color' ? 'active' : ''}`}
                aria-pressed={activeTab === 'color'}
                onClick={() => setActiveTab('color')}
              >
                Màu Sắc
              </button>
            </div>

            {/* 4. Nội dung từng Tab */}
            <div className="pt-studio-tab-content" hidden={activeTab === 'identity'}>
              <div className="arrival-option-heading"><h3>{activeTab === 'hair' ? 'Kiểu tóc' : 'Da & màu tóc'}</h3><p>{tabTitle}</p></div>
              {/* Tab 2: Kiểu Tóc Tân Thủ */}
              {activeTab === 'hair' && (
                <div className="pt-hairs-grid">
                  {HAIR_STYLES.map(h => (
                    <button
                      key={h.id}
                      type="button"
                      className={`pt-hair-card ${selectedHair === h.id ? 'selected' : ''}`}
                      aria-pressed={selectedHair === h.id}
                      onClick={() => setSelectedHair(h.id)}
                    >
                      <div className="pt-hair-preview-dot">{hairImages[`starter-hair:${h.id}:${gender}:${selectedHairColor}`] && hairImages[`starter-hair:${h.id}:${gender}:${selectedHairColor}`] !== 'unavailable' ? <img src={hairImages[`starter-hair:${h.id}:${gender}:${selectedHairColor}`]} alt=""/> : <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="25" r="11" fill="#f4cfb3"/><path d="M9 25V18a11 11 0 0 1 22 0v7l-7-8-7 5-5-4z" fill={selectedHairColor}/></svg>}</div>
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
                    <span className="pt-section-title">MÀU DA</span>
                    <div className="pt-colors-grid">
                      {SKIN_SWATCHES.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          className={`pt-color-bubble ${selectedSkinTone === s.id ? 'selected' : ''}`}
                          style={{ backgroundColor: s.hex }}
                          aria-pressed={selectedSkinTone === s.id}
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
                          aria-pressed={selectedHairColor === c.hex}
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

            </fieldset>
            {/* 5. Nút Khởi Hành Bắt Đầu Chơi (Thuần typography game, không emoji tên lửa) */}
            <button
              className="pt-studio-submit-btn"
              type={activeTab === 'identity' ? 'button' : 'submit'}
              onClick={activeTab === 'identity' ? () => setActiveTab('hair') : undefined}
              disabled={!canSubmit || pending}
            >
              <span>{pending ? 'Đang chuẩn bị…' : activeTab === 'identity' ? 'Chọn diện mạo' : 'Bắt đầu hành trình'}</span><span aria-hidden="true">→</span>
            </button>
            <p className="arrival-footer-note">Khám phá · Kết bạn · Xây dựng nông trại</p>
          </form>
        </div>
      </section>
    </div>
  );
}
