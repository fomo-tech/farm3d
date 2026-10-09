import { TableHudIcon } from '../TableHudIcon.jsx';
import React, { useState } from 'react';
import {baiCaoScore} from '../../../../shared/casino/baiCaoRules.js';
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
  const myResult=result?.players?.find(entry=>entry.playerId===player);
  const myScore=hand.length===3?baiCaoScore(hand):null;
  const bankerScore=result?.banker?.length===3?baiCaoScore(result.banker):null;
  const scoreText=score=>score?.faces?'Ba Tây':`${score?.point??0} nút`;
  const flip=()=>{if(round?.phase!=='playing'||isSpectator||revealed)return;setRevealed(true);onAct({kind:'reveal'});};
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
            <span className="pot-label">CƯỢC CỦA BẠN / VÁN</span>
            <strong className="pot-amount">
              {(room?.stake || 10).toLocaleString('vi-VN')} xu
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

      <section className="baicao-banker" aria-label="Nhà cái hệ thống">
        <header><b>NHÀ CÁI HỆ THỐNG</b><span>{bankerScore?scoreText(bankerScore):'Mở bài khi kết thúc ván'}</span></header>
        <div className="baicao-banker-cards">{[0,1,2].map(i=><PlayingCard key={i} id={result?.banker?.[i]} small/>)}</div>
        <p>Mỗi người so nút với nhà cái · thắng nhận 2× cược · hòa hoàn cược</p>
      </section>

      {/* 2. KHU VỰC 3 LÁ BÀI CỦA NGƯỜI CHƠI */}
      <div className="pt-baicao-hand-stage">
        <span className="baicao-hand-label">BÀI CỦA BẠN</span>
        <div className="pt-baicao-fanned-cards">
          {hand.length > 0 ? (
            hand.map((cardId, i) => (
              <div
                key={i}
                className={`baicao-card-slot animate-card-fly-${i + 1} ${revealed ? 'is-revealed' : 'is-facedown'}`}
                onClick={flip}
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
        {hand.length > 0 && !revealed && round?.phase === 'playing' && !isSpectator && (
          <button
            type="button"
            className="pt-flip-cards-cta-btn"
            onClick={flip}
          >
            <TableHudIcon name="flip"/> Lật bài
          </button>
        )}

        {/* Badge xếp hạng nút */}
        {myScore && (revealed || myResult) && <div className="pt-baicao-score-badge">
          <Icon3dSparkleStar size={18}/><strong>{scoreText(myScore)}</strong>
          {myResult&&<span>{myResult.outcome==='win'?'Thắng nhà cái':myResult.outcome==='tie'?'Hòa nhà cái':'Thua nhà cái'} · {myResult.outcome==='win'?`Nhận ${myResult.reward} xu`:myResult.outcome==='tie'?`Hoàn ${myResult.reward} xu`:`Mất ${room.stake} xu`}</span>}
        </div>}

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
            <span>Ván này</span>
            <strong>{room?.stake || 10} xu/ván</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
