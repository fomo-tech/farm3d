import { useState } from 'react';
import { Icon3dNonLa, Icon3dRiceSpike, Icon3dFlower, Icon3dCap, Icon3dCrown, Icon3dHouseCabin, Icon3dMap, Icon3dCheck } from './icons3d/GameIcons3D.jsx';

const AVATAR_ICONS = [
  { id: 'farmer', icon: <Icon3dNonLa size={34} /> }, { id: 'farmer-rice', icon: <Icon3dRiceSpike size={34} /> },
  { id: 'farmer-flower', icon: <Icon3dFlower size={34} /> }, { id: 'farmer-cap', icon: <Icon3dCap size={34} /> },
  { id: 'farmer-royal', icon: <Icon3dCrown size={34} /> },
];
const STARTER_OUTFITS = [
  { id: 'starter', name: 'Áo phông mộc mạc', color: '#f8fafc', desc: 'Áo thun trắng & jeans đơn giản cho người mới đến' },
];

export function CharacterCreationModal({ defaultName = 'Nông Dân Mới', villages = [], defaultVillageId = '', onSubmit }) {
  const [name, setName] = useState(defaultName || 'Nông Dân Mới');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_ICONS[0].id);
  const [selectedOutfit, setSelectedOutfit] = useState(STARTER_OUTFITS[0].id);
  const [farmName, setFarmName] = useState('Vibe Farm');
  const [villageId, setVillageId] = useState(defaultVillageId);

  const handleStart = e => {
    e.preventDefault();
    const finalName = name.trim() || 'Nông Dân Mới';
    const finalFarm = farmName.trim() || 'Vibe Farm';
    const outfit = STARTER_OUTFITS.find(o => o.id === selectedOutfit) || STARTER_OUTFITS[0];
    if (!villageId) return;
    const village = villages.find(item => item.id === villageId);
    onSubmit({
      name: finalName,
      farmName: finalFarm,
      avatarIcon: selectedAvatar,
      outfit: outfit.id,
      outfitColor: outfit.color,
      villageId,
      villageName: village?.name || 'Làng mới',
    });
  };

  const currentOutfitObj = STARTER_OUTFITS.find(o => o.id === selectedOutfit) || STARTER_OUTFITS[0];

  return (
    <div className="onboarding-backdrop">
      <section className="character-creator-card" role="dialog" aria-modal="true">
        <div className="creator-header">
          <span className="creator-badge"><Icon3dNonLa size={18} /> CHÀO MỪNG NÔNG DÂN MỚI</span>
          <h2>Khởi Tạo Nhân Vật & Nông Trại</h2>
          <p>Thiết lập danh tính của bạn trước khi bước vào Vibe City</p>
        </div>

        <form onSubmit={handleStart} className="creator-body">
          {/* Left Preview Card */}
          <div className="creator-preview">
            <div
              className="preview-avatar-circle"
              style={{
                background: `radial-gradient(circle, #ffffff 10%, ${currentOutfitObj.color} 100%)`,
                boxShadow: `0 12px 30px ${currentOutfitObj.color}55`,
              }}
            >
              <span className="preview-emoji">{AVATAR_ICONS.find(item => item.id === selectedAvatar)?.icon}</span>
              <div className="preview-hat-glow" />
            </div>
            <strong className="preview-name">{name.trim() || 'Nông Dân Mới'}</strong>
            <span className="preview-farm"><Icon3dHouseCabin size={19} /> {farmName.trim() || 'Vibe Farm'}</span>
            <small className="preview-village"><Icon3dMap size={18} /> {villages.find(item => item.id === villageId)?.name || 'Chưa chọn làng'}</small>
            <small className="preview-outfit-tag" style={{ background: `${currentOutfitObj.color}33`, color: '#2b4728' }}>
              Trang phục: {currentOutfitObj.name}
            </small>
          </div>

          {/* Right Customization Form */}
          <div className="creator-controls">
            <div className="input-group">
              <label htmlFor="farmer-name-input">Tên Nông Dân</label>
              <input
                id="farmer-name-input"
                type="text"
                maxLength={20}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nhập tên của bạn..."
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="farm-name-input">Tên Nông Trại</label>
              <input
                id="farm-name-input"
                type="text"
                maxLength={24}
                value={farmName}
                onChange={e => setFarmName(e.target.value)}
                placeholder="Tên nông trại..."
                required
              />
            </div>

            <div className="input-group">
              <label>Chọn Làng Để Lập Nghiệp</label>
              {villages.length ? (
                <div className="village-selection-grid">
                  {villages.map(village => {
                    const full = village.available <= 0;
                    return (
                      <button
                        key={village.id}
                        type="button"
                        disabled={full}
                        className={`village-choice-btn ${villageId === village.id ? 'active' : ''}`}
                        onClick={() => setVillageId(village.id)}
                      >
                        <i><Icon3dHouseCabin size={27} /></i>
                        <span><b>{village.name}</b><small>{village.description}</small></span>
                        <em>{full ? 'Đã đầy' : village.provisional ? 'Đang cập nhật · có thể chọn' : `${village.available}/${village.capacity} lô trống`}</em>
                      </button>
                    );
                  })}
                </div>
              ) : <div className="village-loading">Đang tìm ngôi làng cho bạn…</div>}
            </div>

            <div className="input-group">
              <label>Chọn Biểu Tượng Đại Diện</label>
              <div className="avatar-selection-grid">
                {AVATAR_ICONS.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className={`avatar-choice-btn ${selectedAvatar === item.id ? 'active' : ''}`}
                    onClick={() => setSelectedAvatar(item.id)}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Chọn Trang Phục Khởi Đầu</label>
              <div className="outfit-selection-grid">
                {STARTER_OUTFITS.map(outfit => (
                  <button
                    key={outfit.id}
                    type="button"
                    className={`outfit-choice-btn ${selectedOutfit === outfit.id ? 'active' : ''}`}
                    onClick={() => setSelectedOutfit(outfit.id)}
                  >
                    <span className="outfit-swatch" style={{ background: outfit.color }} />
                    <div className="outfit-text">
                      <b>{outfit.name}</b>
                      <small>{outfit.desc}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="creator-submit-btn" disabled={!villageId}>
              <span>{villageId ? <><Icon3dCheck size={22} /> Nhận Nông Trại Và Vào Làng</> : 'Hãy chọn một làng'}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
