import React, { useState, useMemo } from 'react';
import { CASINO_CONFIG, CASINO_GAMES } from '../../../shared/casino/casinoConfig.js';
import { Die, PlayingCard, SymbolArt } from './CasinoArt.jsx';
import { casinoAudio } from '../../game/casino/casinoAudio.js';
import {
  Icon3dDice,
  Icon3dGoldCoin,
  Icon3dCrownRibbon,
  Icon3dAudioOn,
  Icon3dAudioOff,
} from '../icons3d/GameIcons3D.jsx';

const GAME_META = {
  'tai-xiu': {
    name: 'TÀI XỈU SIC BO',
    icon: <Icon3dDice size={32} />,
    badge: 'HOT NHẤT · 3 XÚC XẮC',
    colorGrad: 'linear-gradient(135deg, rgba(220, 38, 38, 0.85) 0%, rgba(234, 88, 12, 0.85) 100%)',
    borderCol: '#fca5a5',
    subDesc: 'Đoán Tài / Xỉu / Chẵn / Lẻ / Bão 1:30 · Nặn bát 3D hồi hộp',
    typeTag: 'Xúc xắc Sic Bo 3D',
  },
  'bau-cua': {
    name: 'BẦU CUA TÔM CÁ',
    icon: <SymbolArt symbol="crab" size={32} />,
    badge: 'DÂN GIAN · 6 LINH VẬT',
    colorGrad: 'linear-gradient(135deg, rgba(5, 150, 105, 0.85) 0%, rgba(13, 148, 136, 0.85) 100%)',
    borderCol: '#6ee7b7',
    subDesc: 'Bầu, Cua, Tôm, Cá, Gà, Nai · Thưởng đậm tới 3x tiền cược',
    typeTag: 'Lễ hội dân gian 3D',
  },
  'bai-cao': {
    name: 'BÀI CÀO 3 LÁ',
    icon: <PlayingCard rank="A" suit="♠" small />,
    badge: 'BÀI TÂY · ĐỐI KHÁNG',
    colorGrad: 'linear-gradient(135deg, rgba(37, 99, 235, 0.85) 0%, rgba(79, 70, 229, 0.85) 100%)',
    borderCol: '#93c5fd',
    subDesc: '3 lá so nút với Nhà cái · Sáp, Liêng, Ba Tây ăn trọn ván',
    typeTag: 'Bài Tây 3 lá 3D',
  },
  'tien-len': {
    name: 'TIẾN LÊN MIỀN NAM',
    icon: <Icon3dCrownRibbon size={32} />,
    badge: 'CHIẾN THUẬT · 4 NGƯỜI',
    colorGrad: 'linear-gradient(135deg, rgba(124, 45, 18, 0.85) 0%, rgba(153, 27, 27, 0.85) 100%)',
    borderCol: '#fbcfe8',
    subDesc: '13 lá sát phạt · Chặt heo ăn tiền tươi · Xếp bài thông minh',
    typeTag: 'Tiến Lên đếm lá 3D',
  },
};

export function CasinoLobby({
  coins = 0,
  rooms = [],
  connected = true,
  inside = true,
  sound = false,
  onToggleSound,
  onExit,
  onJoin,
  onCreateRoom,
  onQuickPlay,
  onSelectGame,
  defaultGame = null,
  quickPlaying = false,
}) {
  const [selectedGame, setSelectedGame] = useState(defaultGame || 'tai-xiu');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalRoom, setJoinModalRoom] = useState(null);

  // Form tạo phòng mới
  const [createName, setCreateName] = useState('');
  const [createStake, setCreateStake] = useState(10);
  const [createPassword, setCreatePassword] = useState('');
  const [joinPassword, setJoinPassword] = useState('');

  // Lọc danh sách phòng theo game đã chọn
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => room.game === selectedGame);
  }, [rooms, selectedGame]);

  const handleGameSelect = gameKey => {
    casinoAudio.playChip();
    setSelectedGame(gameKey);
    onSelectGame?.(gameKey);
  };

  const handleQuickPlayClick = () => {
    casinoAudio.playChip();
    onQuickPlay(selectedGame);
  };

  const handleCreateSubmit = e => {
    e.preventDefault();
    casinoAudio.playChip();
    onCreateRoom({
      game: selectedGame,
      name: createName.trim() || CASINO_GAMES[selectedGame]?.name || 'Bàn giải trí',
      stake: Number(createStake) || 10,
      password: createPassword.trim(),
    });
    setCreateModalOpen(false);
    setCreatePassword('');
    setCreateName('');
  };

  const handleJoinClick = room => {
    casinoAudio.playChip();
    if (room.private) {
      setJoinModalRoom(room);
      setJoinPassword('');
    } else {
      onJoin(room.id);
    }
  };

  const handleJoinSubmit = e => {
    e.preventDefault();
    if (!joinModalRoom) return;
    casinoAudio.playChip();
    onJoin(joinModalRoom.id, joinPassword.trim());
    setJoinModalRoom(null);
    setJoinPassword('');
  };

  const curMeta = GAME_META[selectedGame] || GAME_META['tai-xiu'];

  return (
    <div className="pt-casino-lobby-hud">
      {/* 1. PLAY TOGETHER TOP HUD BAR */}
      <header className="pt-ingame-top-hud">
        <div className="pt-top-left-actions">
          <button
            type="button"
            className="pt-candy-pill-btn btn-leave-table"
            onClick={() => {
              casinoAudio.playChip();
              onExit?.();
            }}
            title="Thoát giao diện sảnh để dạo chơi tự do"
          >
            <span className="btn-icon">⤺</span>
            <span>DẠO CHƠI 3D</span>
          </button>

          <div className="pt-table-info-pill">
            <span className="pill-badge-game">HỘI QUÁN KAIA</span>
            <span className="pill-table-name">Chọn trò chơi hoặc tiến lại gần 4 bàn 3D</span>
          </div>
        </div>

        <div className="pt-top-right-wallet">
          <div className="pt-candy-wallet-pill">
            <span className="pt-coin-icon"><Icon3dGoldCoin size={20} /></span>
            <strong>{Number(coins || 0).toLocaleString('vi-VN')}</strong>
            <small>Xu</small>
          </div>

          <button
            type="button"
            className="pt-candy-action-circle-btn"
            onClick={() => {
              casinoAudio.playChip();
              onToggleSound?.();
            }}
            title={sound ? 'Tắt âm' : 'Bật âm'}
          >
            {sound ? <Icon3dAudioOn size={20} /> : <Icon3dAudioOff size={20} />}
          </button>
        </div>
      </header>

      {/* 2. KHU VỰC KHÔNG GIAN 3D TRUNG TÂM (HOÀN TOÀN NHÌN THẤY PHÒNG 3D) */}
      <div className="pt-lobby-center-hint">
        <div className="pt-game-spotlight-pill" style={{ borderColor: curMeta.borderCol }}>
          <span className="spotlight-icon">{curMeta.icon}</span>
          <div className="spotlight-text">
            <strong>{curMeta.name}</strong>
            <p>{curMeta.subDesc}</p>
          </div>
        </div>
      </div>

      {/* 3. DOCK CHỌN TRÒ CHƠI ARCADE DƯỚI ĐÁY MÀN HÌNH */}
      <footer className="pt-lobby-bottom-kiosk">
        <div className="pt-game-cards-carousel">
          {Object.entries(GAME_META).map(([key, meta]) => {
            const isSelected = selectedGame === key;
            const count = rooms.filter(r => r.game === key).length;

            return (
              <button
                type="button"
                aria-pressed={isSelected}
                key={key}
                className={`pt-arcade-game-card ${isSelected ? 'is-selected' : ''}`}
                style={{
                  background: isSelected ? meta.colorGrad : 'rgba(15, 23, 42, 0.75)',
                  borderColor: isSelected ? meta.borderCol : 'rgba(255, 255, 255, 0.15)',
                }}
                onClick={() => handleGameSelect(key)}
              >
                <div className="card-top-row">
                  <span className="card-badge">{meta.badge}</span>
                  <span className="card-rooms-count">{count} bàn</span>
                </div>
                <div className="card-center-icon">{meta.icon}</div>
                <h3 className="card-game-title">{meta.name}</h3>
                <small className="card-type-tag">{meta.typeTag}</small>
              </button>
            );
          })}
        </div>

        {/* Nút hành động chính chuẩn Play Together */}
        <div className="pt-kiosk-action-bar">
          <button
            type="button"
            className="pt-candy-cta-btn btn-quick-play"
            onClick={handleQuickPlayClick}
            disabled={!connected || !inside || quickPlaying}
          >
            {quickPlaying ? 'Đang vào bàn…' : 'CHƠI NGAY'}
          </button>

          <button
            type="button"
            className="pt-candy-pill-btn btn-view-rooms"
            onClick={() => {
              casinoAudio.playChip();
              setDrawerOpen(v => !v);
            }}
          >
            Danh Sách Bàn ({filteredRooms.length})
          </button>

          <button
            type="button"
            className="pt-candy-pill-btn btn-create-room"
            onClick={() => {
              casinoAudio.playChip();
              setCreateModalOpen(true);
            }}
          >
            Tạo Bàn Riêng
          </button>
        </div>
      </footer>

      {/* 4. DRAWER DANH SÁCH BÀN SLIDE-IN TỪ BÊN PHẢI (KHÔNG CHE MÀN HÌNH 3D) */}
      {drawerOpen && (
        <aside className="pt-lobby-side-drawer">
          <div className="drawer-header">
            <div className="drawer-title-group">
              <span className="drawer-icon">{curMeta.icon}</span>
              <h3>DANH SÁCH BÀN: {curMeta.name}</h3>
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setDrawerOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="drawer-rooms-list">
            {filteredRooms.length === 0 ? (
              <div className="drawer-empty-state">
                <p>Chưa có bàn chơi nào đang mở cho trò này.</p>
                <button
                  type="button"
                  className="pt-candy-cta-btn"
                  onClick={handleQuickPlayClick}
                >
                  Tạo & Vào Bàn Mới Ngay
                </button>
              </div>
            ) : (
              filteredRooms.map(r => (
                <div key={r.id} className="drawer-room-row">
                  <div className="room-row-info">
                    <strong>{r.name}</strong>
                    <div className="room-row-meta">
                      <span>Cược: {r.stake} xu</span>
                      <span>{r.occupied || 1}/{r.seats || 4} người</span>
                      {r.private && <span className="room-private-lock">Có mật khẩu</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="pt-candy-sit-btn"
                    onClick={() => handleJoinClick(r)}
                  >
                    VÀO BÀN
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      {/* 5. FORM TẠO BÀN NHỎ (GỌN GÀNG, KHÔNG PHẢI FULLSCREEN MODAL) */}
      {createModalOpen && (
        <div className="pt-sub-modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <div className="pt-sub-modal-dialog" onClick={e => e.stopPropagation()}>
            <header className="pt-sub-modal-header">
              <h3>TẠO BÀN CHƠI: {curMeta.name}</h3>
              <button type="button" onClick={() => setCreateModalOpen(false)}>✕</button>
            </header>
            <form onSubmit={handleCreateSubmit} className="pt-create-room-form">
              <label>
                <span>Tên bàn:</span>
                <input
                  type="text"
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  placeholder={`Bàn ${curMeta.name} VIP`}
                  maxLength={30}
                />
              </label>

              <label>
                <span>Mức cược tối thiểu:</span>
                <select value={createStake} onChange={e => setCreateStake(Number(e.target.value))}>
                  <option value={10}>10 xu (Tập sự)</option>
                  <option value={20}>20 xu (Tiêu chuẩn)</option>
                  <option value={50}>50 xu (Cao cấp)</option>
                  <option value={100}>100 xu (Đại gia)</option>
                  <option value={500}>500 xu (VIP)</option>
                </select>
              </label>

              <label>
                <span>Mật khẩu phòng (Để trống nếu mở công khai):</span>
                <input
                  type="password"
                  value={createPassword}
                  onChange={e => setCreatePassword(e.target.value)}
                  placeholder="Mật khẩu riêng tư (tùy chọn)"
                />
              </label>

              <div className="pt-form-submit-row">
                <button type="button" className="btn-cancel" onClick={() => setCreateModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="pt-candy-cta-btn">
                  TẠO & VÀO BÀN NGAY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL NHẬP PASSWORD CHO BÀN PRIVATE */}
      {joinModalRoom && (
        <div className="pt-sub-modal-backdrop" onClick={() => setJoinModalRoom(null)}>
          <div className="pt-sub-modal-dialog" onClick={e => e.stopPropagation()}>
            <header className="pt-sub-modal-header">
              <h3>NHẬP MẬT KHẨU PHÒNG</h3>
              <button type="button" onClick={() => setJoinModalRoom(null)}>✕</button>
            </header>
            <form onSubmit={handleJoinSubmit} className="pt-create-room-form">
              <p>Bàn <strong>{joinModalRoom.name}</strong> yêu cầu mật khẩu để tham gia.</p>
              <label>
                <span>Mật khẩu:</span>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={e => setJoinPassword(e.target.value)}
                  placeholder="Nhập mã PIN hoặc mật khẩu..."
                  autoFocus
                />
              </label>
              <div className="pt-form-submit-row">
                <button type="button" className="btn-cancel" onClick={() => setJoinModalRoom(null)}>
                  Hủy
                </button>
                <button type="submit" className="pt-candy-cta-btn">
                  XÁC NHẬN VÀO BÀN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
