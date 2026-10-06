import React, { useState, useMemo } from 'react';
import './PlayTogetherWorldMapModal.css';
import './WorldMapGameStyle.css';
import { WorldMapSurface, ALL_MAP_DESTINATIONS } from './WorldMapSurface.jsx';
import { farmAudio } from '../game/audio/FarmAudioSystem.js';
import { WORLD_LAYOUT } from '../game/world/worldLayout.js';
import { WORLD_VILLAGES } from '../../shared/villageLayout.js';
import { TOWN_SPAWN } from '../../shared/playerSpawn.js';
import {
  Icon3dHouseCabin,
  Icon3dSprout,
  Icon3dRiceSpike,
  Icon3dMill,
  Icon3dFlower,
  Icon3dTractor,
  Icon3dGem,
  Icon3dAutumn,
  Icon3dSun,
  Icon3dModernCity,
  Icon3dFishingRodBamboo,
  Icon3dCoast,
  Icon3dCityBus,
  Icon3dStar,
  Icon3dMap,
} from './icons3d/GameIcons3D.jsx';

const RAW_VILLAGE_THEMES = {
  'binh-minh': {
    badge: 'Thủ Phủ',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    highway: 'Quốc Lộ 86 · Trục Nam',
    sub: 'Đại lộ 8.5m & 24 lô nông trại trung tâm',
    Icon: Icon3dRiceSpike,
  },
  'hoa-mai': {
    badge: 'Hoa Mai',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
    highway: 'Quốc Lộ 86 · Phía Tây',
    sub: 'Vườn mai rực rỡ, đất bãi bồi trù phú',
    Icon: Icon3dFlower,
  },
  'ven-song': {
    badge: 'Ven Sông',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #cffafe, #a5f3fc)',
    highway: 'Quốc Lộ 86 · Phía Đông',
    sub: 'Sát bờ đại thấu sông, gió mát thanh bình',
    Icon: Icon3dCoast,
  },
  'doi-gio': {
    badge: 'Đồi Gió',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    highway: 'Quốc Lộ 86 · Cực Tây',
    sub: 'Đồi cỏ thảo nguyên, cối xay gió thanh bình',
    Icon: Icon3dMill,
  },
  'an-nhien': {
    badge: 'An Nhiên',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    highway: 'Quốc Lộ 86 · Cực Đông',
    sub: 'Thung lũng sinh thái, cỏ xanh rợp bóng',
    Icon: Icon3dSprout,
  },
  'moc-lan': {
    badge: 'Mộc Lan',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
    highway: 'Quốc Lộ Bắc · Phía Tây',
    sub: 'Cổng làng trang nhã, hoa mộc lan ngát hương',
    Icon: Icon3dFlower,
  },
  'thanh-ha': {
    badge: 'Thanh Hà',
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #fef9c3, #fef08a)',
    highway: 'Quốc Lộ Bắc · Trung Tây',
    sub: 'Làng gốm cổ truyền, đồng vàng trĩu hạt',
    Icon: Icon3dHouseCabin,
  },
  'phu-dien': {
    badge: 'Phú Điền',
    color: '#16a34a',
    gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    highway: 'Trục Đô Thị - Cực Bắc',
    sub: 'Vựa lúa màu mỡ, đất đai phì nhiêu',
    Icon: Icon3dTractor,
  },
  'tan-loc': {
    badge: 'Tân Lộc',
    color: '#0284c7',
    gradient: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
    highway: 'Quốc Lộ Bắc · Trung Đông',
    sub: 'Miền đất trù phú, đón vượng khí tài lộc',
    Icon: Icon3dGem,
  },
  'hai-van': {
    badge: 'Hải Vân',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
    highway: 'Quốc Lộ Bắc · Cực Đông',
    sub: 'Mây vờn đỉnh núi, phong cảnh hùng vĩ',
    Icon: Icon3dStar,
  },
  'thu-phong': {
    badge: 'Thu Phong',
    color: '#ea580c',
    gradient: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
    highway: 'Quốc Lộ Nam Ven Biển',
    sub: 'Lá phong nhuộm đỏ, làn gió biển dịu êm',
    Icon: Icon3dAutumn,
  },
  'huong-duong': {
    badge: 'Hướng Dương',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    highway: 'Quốc Lộ Nam Ven Biển',
    sub: 'Vườn hoa hướng dương rực rỡ đón bình minh',
    Icon: Icon3dSun,
  },
};

// Aliases covering both standard names and suffixed layout IDs (e.g. an-nhien-005)
const VILLAGE_THEMES = {
  ...RAW_VILLAGE_THEMES,
  'an-nhien-005': RAW_VILLAGE_THEMES['an-nhien'],
  'moc-lan-006': RAW_VILLAGE_THEMES['moc-lan'],
  'thanh-ha-007': RAW_VILLAGE_THEMES['thanh-ha'],
  'phu-dien-008': RAW_VILLAGE_THEMES['phu-dien'],
  'tan-loc-009': RAW_VILLAGE_THEMES['tan-loc'],
  'hai-van-010': RAW_VILLAGE_THEMES['hai-van'],
  'thu-phong-011': RAW_VILLAGE_THEMES['thu-phong'],
  'huong-duong-012': RAW_VILLAGE_THEMES['huong-duong'],
};

const SPECIAL_DESTINATIONS = [
  {
    id: 'town',
    label: 'Đô Thị (Trung Tâm)',
    category: 'city',
    badge: 'Quảng Trường',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #fdf2f8, #fce7f3)',
    highway: 'Quảng Trường Vibe City (x: 0, z: 18)',
    sub: 'Cửa hàng vật tư, tiệm may, gara xe & hội quán',
    Icon: Icon3dModernCity,
    x: 0,
    z: 18,
  },
  {
    id: 'farms',
    label: 'Làng Nông Trại',
    category: 'village',
    badge: '12 Làng',
    color: '#16a34a',
    gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    highway: 'Quốc Lộ 86 · Trục Nam (x: 0, z: 86)',
    sub: '288 lô đất nông trại, vựa lúa & hoa màu',
    Icon: Icon3dRiceSpike,
    x: 0,
    z: 86,
  },
  {
    id: 'lake',
    label: 'Hồ Pha Lê',
    category: 'nature',
    badge: 'Bến Câu Cá',
    color: '#0284c7',
    gradient: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
    highway: 'Tiệm Đồ Câu Lão Ngư (x: 126, z: 2)',
    sub: 'Cần trúc, nơm lờ, mồi câu & bến thuyền dã ngoại',
    Icon: Icon3dFishingRodBamboo,
    x: 126,
    z: 2,
  },
  {
    id: 'beach',
    label: 'Bãi Biển Bình Minh',
    category: 'nature',
    badge: 'Bờ Cát & Bến Tàu',
    color: '#0d9488',
    gradient: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
    highway: 'Quốc Lộ Nam (x: 0, z: 320)',
    sub: 'Ngọn hải đăng, ghế tắm nắng & bến tàu viễn dương',
    Icon: Icon3dCoast,
    x: 0,
    z: 320,
  },
];

export default function PlayTogetherWorldMapModal({
  isOpen,
  onClose,
  onTravel,
  session,
  playerCoord = { x: 0, z: 0 },
  currentZone,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [mapZoom, setMapZoom] = useState(1);

  // 1. Determine player's owned farm
  const myFarm = useMemo(() => {
    if (!session?.farmId) return null;
    const farm = WORLD_LAYOUT.farms.find(f => f.id === session.farmId);
    if (!farm) return null;
    const village = WORLD_VILLAGES.find(v => v.id === farm.villageId);
    return {
      ...farm,
      villageName: village?.name || farm.villageId,
      villageGate: village?.gate,
      lotNumber: farm.lotNumber || (parseInt(farm.id.replace('farm_', ''), 10) % 24 || 24),
    };
  }, [session?.farmId]);

  // 2. Build full destination list
  const allDestinations = useMemo(() => {
    const list = [];

    // 12 Villages
    WORLD_VILLAGES.forEach(v => {
      const theme = VILLAGE_THEMES[v.id] || {
        badge: 'Làng Nông Trại',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        highway: 'Tuyến Giao Thông Liên Làng',
        sub: '24 lô đất nông trại khép kín',
        Icon: Icon3dHouseCabin,
      };

      const isMyVillage = myFarm && myFarm.villageId === v.id;
      const isHere = currentZone?.id === v.id;
      const dist = Math.round(Math.hypot(v.gate.x - playerCoord.x, v.gate.z - playerCoord.z));

      list.push({
        id: v.id,
        label: v.name,
        category: 'village',
        badge: isMyVillage ? `Lô ${myFarm.lotNumber} Của Bạn` : theme.badge,
        color: theme.color,
        gradient: theme.gradient,
        highway: theme.highway,
        sub: theme.sub,
        Icon: theme.Icon || Icon3dHouseCabin,
        x: v.gate.x,
        z: v.gate.z,
        isMyVillage,
        isHere,
        distance: dist,
      });
    });

    // Special landmarks
    SPECIAL_DESTINATIONS.forEach(s => {
      const isHere = currentZone?.id === s.id;
      const dist = Math.round(Math.hypot(s.x - playerCoord.x, s.z - playerCoord.z));
      list.push({
        ...s,
        isHere,
        distance: dist,
      });
    });

    return list;
  }, [myFarm, currentZone, playerCoord]);

  // 3. Filter destinations by tab and search
  const filteredDestinations = useMemo(() => {
    let result = allDestinations;

    if (activeTab === 'villages') {
      result = result.filter(d => d.category === 'village');
    } else if (activeTab === 'city') {
      result = result.filter(d => d.category === 'city');
    } else if (activeTab === 'nature') {
      result = result.filter(d => d.category === 'nature');
    } else if (activeTab === 'my_farm') {
      result = result.filter(d => d.isMyVillage);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        d => d.label.toLowerCase().includes(q) || d.badge.toLowerCase().includes(q) || d.sub.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allDestinations, activeTab, searchTerm]);

  if (!isOpen) return null;

  const handleTravelClick = dest => {
    farmAudio?.playBusHorn?.();
    onTravel?.(dest);
    onClose?.();
  };

  const handleWarpHome = () => {
    if (!myFarm) return;
    farmAudio?.playBusHorn?.();
    onTravel?.({
      id: 'farm',
      label: `Nông Trại Của Bạn (${myFarm.villageName} - Lô ${myFarm.lotNumber})`,
      x: myFarm.x + 6,
      z: myFarm.z - 4,
    });
    onClose?.();
  };

  return (
    <div className="pt-map-backdrop" onClick={onClose}>
      <div className="pt-map-modal" onClick={e => e.stopPropagation()}>
        {/* Play Together Top Candy Header */}
        <header className="pt-map-header">
          <div>
            <div className="pt-map-header-ribbon">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icon3dCityBus size={18} /> HỆ THỐNG XE BUÝT THUNG LŨNG 12 LÀNG</span>
            </div>
            <div className="pt-map-title-row">
              <h2 className="pt-map-title">BẢN ĐỒ THẾ GIỚI 3D</h2>
            </div>
            <p className="pt-map-subtitle">
              Xem vị trí hiện tại · chọn điểm đến để dịch chuyển có phí
            </p>
          </div>
          <button
            type="button"
            className="pt-map-close-btn"
            onClick={() => {
              farmAudio?.playPop?.();
              onClose?.();
            }}
            aria-label="Đóng bản đồ"
            title="Đóng bản đồ"
          >
            ×
          </button>
        </header>

        {/* 3D Interactive Map Overview Section */}
        <section className="world-map-overview" aria-label="Bản đồ thế giới">
          <WorldMapSurface
            playerCoord={playerCoord}
            myFarm={myFarm}
            destinations={allDestinations}
            selectedId={selectedDestination?.id}
            selectedDestination={selectedDestination}
            onSelect={dest => {
              farmAudio?.playPop?.();
              setSelectedDestination(dest);
            }}
            zoom={mapZoom}
          />

          {/* Floating Top Controls Bar: Zoom (Left) & Category Filters (Right) */}
          <div className="map-top-hud">
            {/* Candy Zoom Buttons */}
            <div className="map-zoom-controls">
              <button
                type="button"
                className="map-zoom-btn"
                aria-label="Thu nhỏ bản đồ"
                disabled={mapZoom <= 1}
                onClick={() => {
                  farmAudio?.playPop?.();
                  setMapZoom(z => Math.max(1, +(z - 0.5).toFixed(1)));
                }}
              >
                −
              </button>
              <button
                type="button"
                className="map-zoom-btn map-zoom-reset"
                onClick={() => {
                  farmAudio?.playPop?.();
                  setMapZoom(1);
                }}
                title="Đặt lại toàn cảnh"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>{Math.round(mapZoom * 100)}%</span>
              </button>
              <button
                type="button"
                className="map-zoom-btn"
                aria-label="Phóng to bản đồ"
                disabled={mapZoom >= 3}
                onClick={() => {
                  farmAudio?.playPop?.();
                  setMapZoom(z => Math.min(3, +(z + 0.5).toFixed(1)));
                }}
              >
                +
              </button>
            </div>

            {/* Floating Category Filter Pills */}
            <nav className="map-floating-tabs" aria-label="Bộ lọc địa danh">
              <button
                type="button"
                className={`map-floating-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => {
                  farmAudio?.playPop?.();
                  setActiveTab('all');
                }}
              >
                Tất Cả ({allDestinations.length})
              </button>
              <button
                type="button"
                className={`map-floating-tab ${activeTab === 'villages' ? 'active' : ''}`}
                onClick={() => {
                  farmAudio?.playPop?.();
                  setActiveTab('villages');
                }}
              >
                12 Làng (12)
              </button>
              <button
                type="button"
                className={`map-floating-tab ${activeTab === 'city' ? 'active' : ''}`}
                onClick={() => {
                  farmAudio?.playPop?.();
                  setActiveTab('city');
                }}
              >
                Đô Thị
              </button>
              <button
                type="button"
                className={`map-floating-tab ${activeTab === 'nature' ? 'active' : ''}`}
                onClick={() => {
                  farmAudio?.playPop?.();
                  setActiveTab('nature');
                }}
              >
                Biển & Hồ
              </button>
            </nav>
          </div>

          {/* Play Together Floating Destination Preview Card */}
          {selectedDestination && (
            <aside className="map-destination-preview">
              <div
                className="map-preview-icon-frame"
                style={{
                  background:
                    selectedDestination.gradient ||
                    (selectedDestination.isCustom
                      ? 'linear-gradient(135deg, #ffe4e6, #fecdd3)'
                      : 'linear-gradient(135deg, #e0f2fe, #bae6fd)'),
                }}
              >
                {selectedDestination.Icon ? (
                  <selectedDestination.Icon size={30} />
                ) : selectedDestination.isCustom ? (
                  <Icon3dMap size={30} />
                ) : (
                  <Icon3dHouseCabin size={30} />
                )}
              </div>
              <div className="map-preview-info">
                <div className="map-preview-tag-row">
                  <span
                    className="map-preview-badge"
                    style={
                      selectedDestination.isCustom
                        ? { background: '#f43f5e', color: '#ffffff', borderColor: '#e11d48' }
                        : {}
                    }
                  >
                    {selectedDestination.badge}
                  </span>
                  <span className="map-preview-distance" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Icon3dCityBus size={13} />
                    <span>{Math.round(Math.hypot(selectedDestination.x - playerCoord.x, selectedDestination.z - playerCoord.z))}m</span>
                  </span>
                </div>
                <div className="map-preview-title">{selectedDestination.label}</div>
                <div className="map-preview-sub">{selectedDestination.sub || selectedDestination.highway}</div>
              </div>
              <div className="map-preview-actions">
                <button
                  type="button"
                  className="map-preview-warp-btn"
                  onClick={() => handleTravelClick(selectedDestination)}
                  title="Dịch chuyển ngay đến địa điểm này"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Icon3dCityBus size={18} />
                  <span>DỊCH CHUYỂN NGAY</span>
                </button>
                <button
                  type="button"
                  className="map-preview-close-btn"
                  aria-label="Bỏ chọn điểm đến"
                  onClick={() => {
                    farmAudio?.playPop?.();
                    setSelectedDestination(null);
                  }}
                >
                  ×
                </button>
              </div>
            </aside>
          )}
        </section>

        {/* Unified Bottom Game Dock: Location, Quick Home Warp & Landmark Strip */}
        <footer className="pt-map-bottom-dock">
          <div className="pt-map-radar-strip">
            <div className="pt-map-radar-title">
              <span className="pt-map-radar-dot" />
              <span>Vị trí hiện tại: <strong>{currentZone?.label || 'Thị Trấn Vibe City'}</strong></span>
              <span className="pt-map-coord-badge">({Math.round(playerCoord.x)}, {Math.round(playerCoord.z)})</span>
            </div>

            {myFarm && (
              <button
                type="button"
                className="pt-map-home-warp-btn"
                onClick={handleWarpHome}
                title={`Về ngay trước cổng nông trại của bạn (${myFarm.villageName} - Lô ${myFarm.lotNumber})`}
              >
                <Icon3dHouseCabin size={18} />
                <span>VỀ NHÀ (LÔ {myFarm.lotNumber})</span>
              </button>
            )}
          </div>

          {/* Quick-Travel Landmark Capsule Strip (Compact Horizontal Row) */}
          <div className="map-capsule-strip" aria-label="Điểm đến nhanh">
            {filteredDestinations.map(dest => {
              const isSelected = selectedDestination?.id === dest.id;
              const dist = Math.round(Math.hypot(dest.x - playerCoord.x, dest.z - playerCoord.z));

              return (
                <button
                  type="button"
                  key={dest.id}
                  className={`map-capsule-item ${isSelected ? 'is-selected' : ''} ${dest.isHere ? 'is-here' : ''} ${dest.isMyVillage ? 'is-my-farm' : ''}`}
                  onClick={() => {
                    farmAudio?.playPop?.();
                    setSelectedDestination(dest);
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: dest.color || '#0284c7',
                      display: 'inline-block',
                      flexShrink: 0,
                      boxShadow: '0 0 4px rgba(0,0,0,0.2)',
                    }}
                  />
                  <span className="map-capsule-name">{dest.label.replace('Làng ', '')}</span>
                  <span className="map-capsule-dist">{dist}m</span>
                </button>
              );
            })}
          </div>
        </footer>
      </div>
    </div>
  );
}
