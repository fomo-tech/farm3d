import React, { useState } from 'react';
import { PlayingCard } from '../CasinoArt.jsx';
import { Icon3dCrownRibbon, Icon3dSparkleStar } from '../../icons3d/GameIcons3D.jsx';

export function BaiCaoScreen({
  room,
  state,
  coins,
  isOpen,
  seconds,
  isSpectator,
  player,
  round,
  onAct,
}) {
  const [revealed, setRevealed] = useState(false);

  const hand = round?.hand || [];
  const result = round?.result;
  const isDealing = round?.phase === 'dealing';
  const isReady = !round || round?.phase === 'waiting';

  const mySeatIndex = (room?.seatList || []).findIndex(s => s?.playerId === player);
  const mySeat = mySeatIndex >= 0 ? room.seatList[mySeatIndex] : null;

  const handleToggleReady = () => {
    onAct({ kind: 'ready', ready: !mySeat?.ready });
  };

  return (
    <div className="pt-dedicated-game-stage pt-stage-baicao">
      {/* 1. KHU VỰC POT CƯỢC CHUNG VÀ BỘ BÀI GIỮA BÀN */}
      <div className="pt-baicao-center-pot">
        <div className="pot-chip-vault">
          <span className="pot-crown-icon"><Icon3dCrownRibbon size={24} /></span>
          <div className="pot-info">
            <span className="pot-label">TIỀN THƯỞNG BÀN</span>
            <strong className="pot-amount">
              {((room?.seatList || []).filter(Boolean).length * (room?.stake || 10)).toLocaleString('vi-VN')} xu
            </strong>
          </div>
        </div>

        {isDealing && (
          <div className="pt-dealing-deck-animation">
            <div className="deck-card deck-card-1" />
            <div className="deck-card deck-card-2" />
            <div className="deck-card deck-card-3" />
            <span className="dealing-text">Đang chia bài 3 lá…</span>
          </div>
        )}
      </div>

      {/* 2. KHU VỰC 3 LÁ BÀI CỦA NGƯỜI CHƠI */}
      <div className="pt-baicao-hand-stage">
        <div className="pt-baicao-fanned-cards">
          {hand.length > 0 ? (
            hand.map((cardId, i) => (
              <div
                key={i}
                className={`baicao-card-slot animate-card-fly-${i + 1} ${revealed ? 'is-revealed' : 'is-facedown'}`}
                onClick={() => setRevealed(true)}
              >
                {revealed || round?.phase === 'result' || round?.phase === 'settling' ? (
                  <PlayingCard id={cardId} size="lg" />
                ) : (
                  <div className="playing-card card-facedown-royal" title="Chạm để lật bài">
                    <div className="facedown-ornament">◆</div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="pt-baicao-waiting-cards">
              <span className="waiting-card-ghost" />
              <span className="waiting-card-ghost" />
              <span className="waiting-card-ghost" />
            </div>
          )}
        </div>

        {/* Nút lật bài */}
        {hand.length > 0 && !revealed && round?.phase !== 'result' && (
          <button
            type="button"
            className="pt-flip-cards-cta-btn"
            onClick={() => setRevealed(true)}
          >
            LẬT BÀI / XEM NÚT
          </button>
        )}

        {/* Badge xếp hạng nút */}
        {result?.rank && (revealed || round?.phase === 'result') && (
          <div className="pt-baicao-score-badge animate-badge-pop">
            <span className="score-crown"><Icon3dSparkleStar size={18} /></span>
            <div className="score-details">
              <strong className="score-title">{result.rank}</strong>
              <small className="score-detail">{result.detail || 'So nút bài cào'}</small>
            </div>
          </div>
        )}
      </div>

      {/* 3. ĐIỀU KHIỂN SẴN SÀNG & VÀO BÀN */}
      <footer className="pt-screen-action-dock">
        <div className="pt-dock-left">
          {mySeat && isReady && (
            <button
              type="button"
              className={`pt-ready-action-btn ${mySeat.ready ? 'is-ready' : ''}`}
              onClick={handleToggleReady}
            >
              {mySeat.ready ? '✓ BẠN ĐÃ SẴN SÀNG' : 'BẤM SẴN SÀNG ĐỂ CHIA BÀI'}
            </button>
          )}
          {isSpectator && (
            <span className="spectator-tip">
              Đang xem · Bấm Tham gia chơi để tự vào bàn
            </span>
          )}
        </div>

        <div className="pt-dock-right">
          <div className="table-stake-info-pill">
            <span>Mức cược:</span>
            <strong>{room?.stake || 10} xu/ván</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
