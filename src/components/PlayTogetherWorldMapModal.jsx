import React, { useState, useMemo } from 'react';
import './PlayTogetherWorldMapModal.css';
import './WorldMapGameStyle.css';
import { WorldMapSurface } from './WorldMapSurface.jsx';
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
} from './icons3d/GameIcons3D.jsx';

const VILLAGE_THEMES = {
  'binh-minh': {
    badge: '★ Thủ Phủ',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    highway: 'Quốc Lộ 86 · Trục Nam',
    sub: 'Đại lộ 8.5m & 24 lô nông trại trung tâm',
    Icon: Icon3dRiceSpike,
  },
  'hoa-mai': {
    badge: '★ Hoa Mai',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
    highway: 'Quốc Lộ 86 · Phía Tây',
    sub: 'Vườn mai rực rỡ, đất bãi bồi trù phú',
    Icon: Icon3dFlower,
  },
  'ven-song': {
    badge: '★ Ven Sông',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #cffafe, #a5f3fc)',
    highway: 'Quốc Lộ 86 · Phía Đông',
    sub: 'Sát bờ đại thấu sông, gió mát thanh bình',
    Icon: Icon3dCoast,
  },
  'doi-gio': {
    badge: '★ Đồi Gió',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    highway: 'Quốc Lộ 86 · Cực Tây',
    sub: 'Đồi cỏ thảo nguyên, cối xay gió thanh bình',
    Icon: Icon3dMill,
  },
  'an-nhien': {
    badge: '★ An Nhiên',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    highway: 'Quốc Lộ 86 · Cực Đông',
    sub: 'Thung lũng sinh thái, cỏ xanh rợp bóng',
    Icon: Icon3dSprout,
  },
  'moc-lan': {
    badge: '★ Mộc Lan',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
    highway: 'Quốc Lộ Bắc · Phía Tây',
    sub: 'Cổng làng trang nhã, hoa mộc lan ngát hương',
    Icon: Icon3dFlower,
  },
  'thanh-ha': {
    badge: '★ Thanh Hà',
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #fef9c3, #fef08a)',
    highway: 'Quốc Lộ Bắc · Trung Tây',
    sub: 'Làng gốm cổ truyền, đồng vàng trĩu hạt',
    Icon: Icon3dHouseCabin,
  },
  'phu-dien': {
    badge: '★ Phú Điền',
    color: '#16a34a',
    gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    highway: 'Trục Đô Thị - Cực Bắc',
    sub: 'Vựa lúa màu mỡ, đất đai phì nhiêu',
    Icon: Icon3dTractor,
  },
  'tan-loc': {
    badge: '★ Tân Lộc',
    color: '#0284c7',
    gradient: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
    highway: 'Quốc Lộ Bắc · Trung Đông',
    sub: 'Miền đất trù phú, đón vượng khí tài lộc',
    Icon: Icon3dGem,
  },
  'hai-van': {
    badge: '★ Hải Vân',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
    highway: 'Quốc Lộ Bắc · Cực Đông',
    sub: 'Mây vờn đỉnh núi, phong cảnh hùng vĩ',
    Icon: Icon3dStar,
  },
  'thu-phong': {
    badge: '★ Thu Phong',
    color: '#ea580c',
    gradient: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
    highway: 'Quốc Lộ Nam Ven Biển',
    sub: 'Lá phong nhuộm đỏ, làn gió biển dịu êm',
    Icon: Icon3dAutumn,
  },
  'huong-duong': {
    badge: '★ Hướng Dương',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    highway: 'Quốc Lộ Nam Ven Biển',
    sub: 'Vườn hoa hướng dương rực rỡ đón bình minh',
    Icon: Icon3dSun,
  },
};

const SPECIAL_DESTINATIONS = [
  {
    id: 'town',
    label: 'Quảng Trường Trung Tâm',
    category: 'city',
    badge: '★ Phố Thị',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #fdf2f8, #fce7f3)',
    highway: 'Tâm Điểm Bản Đồ (x: 0, z: 0)',
    sub: 'Đài phun nước, tiệm bánh, rạp phim & hội quán',
    Icon: Icon3dModernCity,
    ...TOWN_SPAWN,
  },
  {
    id: 'lake',
    label: 'Hồ Pha Lê & Bến Câu Cá',
    category: 'nature',
    badge: '★ Bến Thuyền',
    color: '#0284c7',
    gradient: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
    highway: 'Đại Lộ Phía Đông (x: 128, z: 2)',
    sub: 'Tiệm đồ câu Lão Ngư, chòi dã ngoại & bến thuyền',
    Icon: Icon3dFishingRodBamboo,
    x: 128,
    z: -2,
  },
  {
    id: 'beach',
    label: 'Bãi biển & Bến tàu',
    category: 'nature',
    badge: '★ Bờ Cát',
    color: '#0d9488',
    gradient: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
    highway: 'Quốc Lộ Nam (x: 0, z: 300)',
    sub: 'Ngọn hải đăng, ghế tắm nắng & bến tàu viễn dương',
    Icon: Icon3dCoast,
    x: 0,
    z: 300,
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
  const [selectedDestination,setSelectedDestination]=useState(null);
  const [mapZoom,setMapZoom]=useState(1);

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
        badge: '★ Làng Nông Trại',
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
        badge: isMyVillage ? `★ Lô ${myFarm.lotNumber} Của Bạn` : theme.badge,
        color: theme.color,
        gradient: theme.gradient,
        highway: theme.highway,
        sub: theme.sub,
        Icon: theme.Icon || Icon3dHouseCabin,
        x: v.gate.x,
        z: v.gate.z - 4,
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
      x: myFarm.x,
      z: myFarm.z - 6,
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

        <section className="world-map-overview" aria-label="Bản đồ thế giới"><WorldMapSurface playerCoord={playerCoord} myFarm={myFarm} destinations={allDestinations} selectedId={selectedDestination?.id} onSelect={setSelectedDestination} zoom={mapZoom}/><div className="map-zoom-controls"><button type="button" aria-label="Thu nhỏ bản đồ" disabled={mapZoom<=1} onClick={()=>setMapZoom(z=>Math.max(1,z-.5))}>−</button><button type="button" onClick={()=>setMapZoom(1)}>Toàn cảnh</button><button type="button" aria-label="Phóng to bản đồ" disabled={mapZoom>=3} onClick={()=>setMapZoom(z=>Math.min(3,z+.5))}>+</button></div>{selectedDestination&&<aside className="map-destination-preview"><b>{selectedDestination.label}</b><span>{Math.round(Math.hypot(selectedDestination.x-playerCoord.x,selectedDestination.z-playerCoord.z))} m · Phí được xác nhận trước khi đi</span><button type="button" onClick={()=>handleTravelClick(selectedDestination)}>Dịch chuyển</button><button type="button" aria-label="Bỏ chọn điểm đến" onClick={()=>setSelectedDestination(null)}>×</button></aside>}</section>
        {/* Home Farm Quick-Warp Banner (Play Together Recall VIP Card) */}
        {myFarm && (
          <div className="pt-map-home-banner">
            <div className="pt-map-home-info">
              <div className="pt-map-home-icon"><Icon3dHouseCabin size={28} /></div>
              <div>
                <div className="pt-map-home-title">
                  <span>Trang Trại Của Bạn</span>
                  <span className="pt-map-home-badge">Lô {myFarm.lotNumber}</span>
                </div>
                <div className="pt-map-home-sub">
                  Thuộc {myFarm.villageName} · Sân nhà khép kín hướng thẳng ra Quốc Lộ
                </div>
              </div>
            </div>
            <button
              type="button"
              className="pt-map-home-warp-btn"
              onClick={handleWarpHome}
              title="Về ngay trước cổng nông trại của bạn"
            >
              <span>VỀ NHÀ NGAY</span>
            </button>
          </div>
        )}

        {/* Radar Location Summary */}
        <div className="pt-map-radar-strip">
          <div className="pt-map-radar-title">
            <span className="pt-map-radar-dot" />
            <span>Vị trí hiện tại: <strong>{currentZone?.label || 'Quảng Trường Trung Tâm'}</strong></span>
          </div>
          <div className="pt-map-radar-summary">
            <span>Tọa độ: ({Math.round(playerCoord.x)}, {Math.round(playerCoord.z)})</span>
            <span>Bấm điểm đến để xem lựa chọn dịch chuyển</span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <nav className="pt-map-tabs">
          <button
            type="button"
            className={`pt-map-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => {
              farmAudio?.playPop?.();
              setActiveTab('all');
            }}
          >
            Tất Cả ({allDestinations.length})
          </button>
          <button
            type="button"
            className={`pt-map-tab ${activeTab === 'villages' ? 'active' : ''}`}
            onClick={() => {
              farmAudio?.playPop?.();
              setActiveTab('villages');
            }}
          >
            12 Làng Nông Trại (12)
          </button>
          <button
            type="button"
            className={`pt-map-tab ${activeTab === 'city' ? 'active' : ''}`}
            onClick={() => {
              farmAudio?.playPop?.();
              setActiveTab('city');
            }}
          >
            Đô Thị Phồn Hoa
          </button>
          <button
            type="button"
            className={`pt-map-tab ${activeTab === 'nature' ? 'active' : ''}`}
            onClick={() => {
              farmAudio?.playPop?.();
              setActiveTab('nature');
            }}
          >
            Biển & Hồ Câu Cá
          </button>
          {myFarm && (
            <button
              type="button"
              className={`pt-map-tab ${activeTab === 'my_farm' ? 'active' : ''}`}
              onClick={() => {
                farmAudio?.playPop?.();
                setActiveTab('my_farm');
              }}
            >
              Nông Trại Của Bạn
            </button>
          )}
        </nav>

        <div className="map-destination-list" aria-label="Điểm đến">{filteredDestinations.map(dest=><button type="button" key={dest.id} aria-pressed={selectedDestination?.id===dest.id} onClick={()=>setSelectedDestination(dest)}>{dest.Icon&&<dest.Icon size={20}/>}<span>{dest.label}</span><small>{Math.round(Math.hypot(dest.x-playerCoord.x,dest.z-playerCoord.z))} m</small></button>)}</div>
      </div>
    </div>
  );
}
