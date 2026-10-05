import React, { useState, useMemo } from 'react';
import { CASINO_CONFIG, CASINO_GAMES, CASINO_SYMBOLS, QUICK_CHAT } from '../../../shared/casino/casinoConfig.js';
import { suggestTienLenPlay, smartSortTienLen } from '../../../shared/casino/tienLenRules.js';
import { CasinoHistory } from './CasinoHistory.jsx';
import { TaiXiuScreen } from './screens/TaiXiuScreen.jsx';
import { BauCuaScreen } from './screens/BauCuaScreen.jsx';
import { BaiCaoScreen } from './screens/BaiCaoScreen.jsx';
import { TienLenScreen } from './screens/TienLenScreen.jsx';
import { casinoAudio } from '../../game/casino/casinoAudio.js';
import {
  Icon3dGoldCoin,
  Icon3dNoticeBoard,
  Icon3dHeartBubble,
  Icon3dAudioOn,
  Icon3dAudioOff,
} from '../icons3d/GameIcons3D.jsx';

const PHASES = {
  waiting: 'Chờ người chơi sẵn sàng',
  open: 'Mời đặt cược',
  closed: 'Đã khóa cược',
  shaking: 'Đang lắc xúc xắc…',
  reveal: 'Mở kết quả',
  settling: 'Đang trả thưởng',
  result: 'Kết quả ván',
  dealing: 'Đang chia bài…',
  playing: 'Đang đấu trí',
  funding: 'Đang giữ cược',
};

// Vị trí các ghế ngồi quanh chu vi màn hình 3D (Play Together Seated HUD Ring)
export function CasinoTable({
  room,
  state,
  coins = 0,
  connected = true,
  inside = true,
  sound = false,
  onToggleSound,
  onAct,
  onReturnLobby,
  seconds = 0,
  quickPlaying = false,
  onQuickPlay,
}) {
  const [chip, setChip] = useState(10);
  const [selectedCards, setSelectedCards] = useState([]);
  const [squeezing, setSqueezing] = useState(false);
  const [customHand, setCustomHand] = useState(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const player = state?.viewerId;
  const round = room?.round;
  const game = room?.game || 'tai-xiu';
  const gameCfg = CASINO_GAMES[game] || {};
  const rawHand = round?.hand || [];
  const hand = customHand || rawHand;
  const myTurn = round?.turn === player;

  // Xác định ghế của người chơi
  const storedSeatIndex = room?.seatList ? room.seatList.findIndex(s => s?.playerId === player) : -1;
  const mySeat = storedSeatIndex >= 0 ? room.seatList[storedSeatIndex] : null;
  const isSpectator = !mySeat;

  const participating =
    round?.participating ??
    (!!round && (!['bai-cao', 'tien-len'].includes(game) || Object.hasOwn(round.counts || {}, player)));

  const isOpen = connected && inside && round?.phase === 'open' && seconds > 0 && !!mySeat && participating;

  // Đặt cược với âm thanh chip clink
  const putBet = (choice, amount = chip) => {
    if (isOpen && coins >= amount) {
      casinoAudio.playChip();
      onAct({ kind: 'bet', choice, amount, roundId: round?.id });
    }
  };

  // Hủy cược
  const cancelBet = () => {
    if (isOpen) {
      casinoAudio.playChip();
      onAct({ kind: 'cancel', roundId: round?.id });
    }
  };

  // Tiến Lên Miền Nam - Chọn lá bài
  const toggleCard = cardId => {
    casinoAudio.playCardFlip();
    setSelectedCards(prev =>
      prev.includes(cardId) ? prev.filter(c => c !== cardId) : [...prev, cardId]
    );
  };

  // Tiến Lên - Gợi ý đánh
  const handleSuggest = () => {
    const hint = suggestTienLenPlay(hand, round?.trick?.cards);
    if (hint && hint.length > 0) {
      casinoAudio.playCardFlip();
      setSelectedCards(hint);
    }
  };

  // Tiến Lên - Xếp bài thông minh
  const handleSmartSort = () => {
    if (rawHand.length > 0) {
      casinoAudio.playCardFlip();
      const sorted = smartSortTienLen(rawHand);
      setCustomHand(sorted);
    }
  };

  // Tiến Lên - Đánh bài
  const handlePlayCards = () => {
    if (myTurn && selectedCards.length > 0) {
      casinoAudio.playCardFlip();
      onAct({ kind: 'play', cards: selectedCards, roundId: round?.id });
      setSelectedCards([]);
    }
  };

  // Tiến Lên - Bỏ lượt
  const handlePass = () => {
    if (myTurn) {
      onAct({ kind: 'pass', roundId: round?.id });
    }
  };

  // Sẵn sàng (Ready)
  const handleToggleReady = () => {
    casinoAudio.playChip();
    onAct({ kind: 'ready', ready: !mySeat?.ready });
  };

  // Ngồi vào ghế
  const handleSit = seatIndex => {
    casinoAudio.playChip();
    onAct({ kind: 'seat', seat: seatIndex });
  };

  // Gửi tin nhắn nhanh
  const sendChat = text => {
    onAct({ kind: 'chat', message: QUICK_CHAT.indexOf(text) });
    setChatDrawerOpen(false);
  };

  return (
    <div className={`pt-casino-in-game-hud ${isSpectator ? 'is-spectator' : 'is-seated'}`}>
      {/* 1. PLAY TOGETHER TOP IN-GAME HUD BAR */}
      <header className="pt-ingame-top-hud">
        <div className="pt-top-left-actions">
          <button
            type="button"
            className="pt-candy-pill-btn btn-leave-table"
            onClick={() => {
              casinoAudio.playChip();
              onReturnLobby();
            }}
            title="Rời bàn về sảnh"
          >
            <span className="btn-icon">⤺</span>
            <span>RỜI BÀN</span>
          </button>

          <div className="pt-table-info-pill">
            <span className="pill-badge-game">{gameCfg.name || 'SÒNG BÀI'}</span>
            <span className="pill-table-name">{room?.name}</span>
            <span className="pill-stake">{room?.stake} xu/cược</span>
          </div>
        </div>

        {/* Phase & Countdown Banner ở chính giữa màn hình */}
        <div className="pt-top-center-status">
          <div className={`pt-phase-countdown-capsule phase-${round?.phase || 'waiting'}`}>
            {round?.phase === 'open' && <span className="pt-countdown-dot-pulse" />}
            <span className="phase-text">{PHASES[round?.phase || 'waiting'] || 'Đang đồng bộ ván'}</span>
            {seconds > 0 && round && (
              <span className="timer-badge">{seconds}s</span>
            )}
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
              setHistoryOpen(true);
            }}
            title="Xem Lịch Sử & Soi Cầu"
          >
            <Icon3dNoticeBoard size={20} />
          </button>

          <button
            type="button"
            className={`pt-candy-action-circle-btn ${chatDrawerOpen ? 'active' : ''}`}
            onClick={() => {
              casinoAudio.playChip();
              setChatDrawerOpen(v => !v);
            }}
            title="Chat Nhanh Biểu Cảm"
          >
            <Icon3dHeartBubble size={20} />
          </button>

          <button
            type="button"
            className="pt-candy-action-circle-btn"
            onClick={() => {
              casinoAudio.playChip();
              onToggleSound();
            }}
            title={sound ? 'Tắt âm' : 'Bật âm'}
          >
            {sound ? <Icon3dAudioOn size={20} /> : <Icon3dAudioOff size={20} />}
          </button>
        </div>
      </header>

      {/* Spectator Notification Toast */}
      {isSpectator && (
        <div className="pt-spectator-floating-ribbon">
          <span>Đang xem · Chọn chỗ ngồi để tham gia</span>
        </div>
      )}

      {/* Quick Chat Bubble Picker */}
      {chatDrawerOpen && (
        <div className="pt-quick-chat-popover">
          <div className="chat-popover-header">
            <span>CHỌN CÂU NÓI NHANH</span>
            <button type="button" onClick={() => setChatDrawerOpen(false)}>✕</button>
          </div>
          <div className="chat-phrases-grid">
            {QUICK_CHAT.map((phrase, i) => (
              <button
                key={i}
                type="button"
                className="chat-phrase-btn"
                onClick={() => sendChat(phrase)}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. CHU VI GHẾ NGỒI XUNG QUANH BÀN 3D (PLAY TOGETHER SEAT RING) */}
      <details className="pt-hud-seats-ring">
        <summary>Chỗ ngồi · {(room?.seatList || []).filter(Boolean).length}/{room?.seatList?.length || 0}</summary>
        <div className="pt-seat-picker-list">
        {(room?.seatList || []).map((seat, idx) => {
          const isMe = seat?.playerId === player;
          const isTurn = round?.turn === seat?.playerId;

          return (
            <div
              key={idx}
              className={`pt-seat-pod ${seat ? 'occupied' : 'empty'} ${isMe ? 'is-me' : ''} ${isTurn ? 'is-turn' : ''}`}
            >
              {seat ? (
                <div className="pt-player-bubble">
                  <div className="pt-player-avatar">
                    <span className="avatar-letter">{seat.name ? seat.name.charAt(0).toUpperCase() : 'P'}</span>
                    {seat.ready && <span className="pt-ready-stamp" title="Đã sẵn sàng">✓</span>}
                    {isTurn && <div className="pt-turn-glow" />}
                  </div>
                  <div className="pt-player-nametag">
                    <strong>{isMe ? 'Bạn' : seat.name}</strong>
                    {seat.coins !== undefined && <small>{seat.coins} xu</small>}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="pt-candy-sit-btn"
                  onClick={event => {
                    handleSit(idx);
                    event.currentTarget.closest('details')?.removeAttribute('open');
                  }}
                  title={`Ngồi vào ghế số ${idx + 1}`}
                >
                  <span>+ Ngồi ghế {idx + 1}</span>
                </button>
              )}
            </div>
          );
        })}
        </div>
      </details>

      {/* 3. DOCK ĐIỀU KHIỂN & ĐẶT CƯỢC RIÊNG CHO TỪNG GAME (DOCK ĐÁY MÀN HÌNH) */}
      <div className="pt-ingame-bottom-dock">
        {isSpectator && (
          <button type="button" className="pt-ready-action-btn" onClick={onQuickPlay} disabled={!connected || !inside || quickPlaying}>
            {quickPlaying ? 'Đang tìm chỗ…' : 'Tham gia chơi'}
          </button>
        )}
        {mySeat && (!round || round.phase === 'waiting') && (
          <button type="button" className="pt-ready-action-btn" onClick={handleToggleReady} disabled={!connected || !inside}>
            {mySeat.ready ? '✓ Đã sẵn sàng · Chờ người chơi' : 'Sẵn sàng chơi'}
          </button>
        )}
        {mySeat && (!round || round.phase === 'waiting') && (
          <small className="pt-waiting-requirement">Cần {gameCfg.minPlayers} người sẵn sàng để bắt đầu · Hiện có {(room?.seatList || []).filter(seat => seat?.ready).length}</small>
        )}
        {game === 'tai-xiu' && (
          <TaiXiuScreen
            room={room}
            state={state}
            coins={coins}
            isOpen={isOpen}
            seconds={seconds}
            putBet={putBet}
            cancelBet={cancelBet}
            chip={chip}
            setChip={setChip}
            isSpectator={isSpectator}
            player={player}
            round={round}
            onOpenHistory={() => setHistoryOpen(true)}
          />
        )}

        {game === 'bau-cua' && (
          <BauCuaScreen
            room={room}
            state={state}
            coins={coins}
            isOpen={isOpen}
            seconds={seconds}
            putBet={putBet}
            cancelBet={cancelBet}
            chip={chip}
            setChip={setChip}
            isSpectator={isSpectator}
            player={player}
            round={round}
            onOpenHistory={() => setHistoryOpen(true)}
          />
        )}

        {game === 'bai-cao' && (
          <BaiCaoScreen
            room={room}
            state={state}
            coins={coins}
            isOpen={isOpen}
            seconds={seconds}
            isSpectator={isSpectator}
            player={player}
            round={round}
            onAct={onAct}
          />
        )}

        {game === 'tien-len' && (
          <TienLenScreen
            room={room}
            state={state}
            coins={coins}
            isOpen={isOpen}
            seconds={seconds}
            isSpectator={isSpectator}
            player={player}
            round={round}
            onAct={onAct}
          />
        )}
      </div>

      {/* 4. DRAWER SOI CẦU & LỊCH SỬ PHIÊN ĐẤU SLIDE-IN TỪ BÊN PHẢI */}
      {historyOpen && (
        <CasinoHistory
          game={game}
          history={room?.history || []}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  );
}
