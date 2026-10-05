import React, { useState } from 'react';
import { CASINO_GAMES, CASINO_CONFIG } from '../../../../shared/casino/casinoConfig.js';
import { Die, Chip } from '../CasinoArt.jsx';

export function TaiXiuScreen({
  room,
  state,
  coins,
  isOpen,
  seconds,
  putBet,
  cancelBet,
  chip,
  setChip,
  isSpectator,
  player,
  round,
  onOpenHistory,
}) {
  const [squeezing, setSqueezing] = useState(false);
  const CHIP_VALUES = CASINO_CONFIG.chips;

  const result = round?.result;
  const dice = result?.dice || null;
  const isShaking = round?.phase === 'shaking';
  const isReveal = round?.phase === 'reveal' || round?.phase === 'result' || round?.phase === 'settling';

  const myBets = round?.bets || {};
  const totalMyBet = Object.values(myBets).reduce((a, b) => a + b, 0);

  // Thống kê soi cầu mini từ lịch sử bàn
  const miniHistory = (room?.history || []).slice(-12).map(h => {
    const d = h.dice || [];
    const sum = d.reduce((a, b) => a + b, 0);
    const isTriple = d.length === 3 && d[0] === d[1] && d[1] === d[2];
    return {
      total: sum,
      winner: isTriple ? 'triple' : (sum >= 11 ? 'tai' : 'xiu'),
      dice: d,
    };
  });

  return (
    <div className="pt-dedicated-game-stage pt-stage-taixiu">
      {/* 1. SÂN KHẤU LẮC XÚC XẮC & NẶN BÁT 3D */}
      <div className="pt-dice-arena-pod">
        <div className={`pt-bowl-dish-wrap ${isShaking ? 'shaking' : ''}`}>
          <div className="pt-golden-dish">
            <div className="dish-inner-ring" />
          </div>

          {dice && isReveal && (
            <div className={`pt-dice-trio ${squeezing ? 'squeezing' : 'revealed'}`}>
              {dice.map((d, i) => (
                <div key={i} className="dice-wrap-pop">
                  <Die value={d} size={58} />
                </div>
              ))}
            </div>
          )}

          {round?.phase === 'reveal' && !squeezing && (
            <button
              type="button"
              className="pt-candy-squeeze-btn"
              onClick={() => setSqueezing(true)}
            >
              NẶN BÁT MỞ QUÀ
            </button>
          )}

          {squeezing && (
            <button
              type="button"
              className="pt-open-all-btn"
              onClick={() => setSqueezing(false)}
            >
              MỞ HẾT
            </button>
          )}
        </div>

        {/* Kết quả ván */}
        {dice && isReveal && !squeezing && (
          <div className="pt-result-banner-pop">
            <span className="res-points">{result.total} ĐIỂM</span>
            <span className={`res-badge ${result.winner === 'tai' ? 'badge-tai' : result.winner === 'xiu' ? 'badge-xiu' : 'badge-bao'}`}>
              {result.winner === 'tai' ? 'TÀI' : result.winner === 'xiu' ? 'XỈU' : 'BÃO'}
            </span>
            <span className="res-sub">({result.isEven ? 'Chẵn' : 'Lẻ'})</span>
          </div>
        )}
      </div>

      {/* 2. BÀN CƯỢC TÀI XỈU SÒNG BÀI HOÀNG GIA */}
      <div className="pt-taixiu-felt-table">
        {/* CỬA TÀI (ĐỎ RỰC) */}
        <button
          type="button"
          className={`pt-bet-big-card bet-tai ${myBets.tai ? 'has-bet' : ''}`}
          disabled={!isOpen}
          onClick={() => putBet('tai')}
        >
          <div className="card-top-tag">TỶ LỆ 1:1</div>
          <div className="card-main-title">TÀI</div>
          <div className="card-points-range">11 – 17 ĐIỂM</div>
          {myBets.tai > 0 && (
            <div className="card-chip-stack">
              <Chip value={myBets.tai} size={42} />
              <span className="chip-val-label">{myBets.tai} xu</span>
            </div>
          )}
        </button>

        {/* CỘT CƯỢC PHỤ Ở GIỮA (CHẴN / BÃO / LẺ) */}
        {CASINO_GAMES['tai-xiu'].choices.includes('chan') && <div className="pt-bet-middle-subcolumn">
          <button
            type="button"
            className={`pt-sub-bet-pill ${myBets.chan ? 'has-bet' : ''}`}
            disabled={!isOpen}
            onClick={() => putBet('chan')}
          >
            <span className="sub-title">CHẴN</span>
            <small className="sub-ratio">1:1</small>
            {myBets.chan > 0 && <span className="sub-chip">{myBets.chan} xu</span>}
          </button>

          <button
            type="button"
            className={`pt-sub-bet-pill bet-bao ${myBets.any_triple ? 'has-bet' : ''}`}
            disabled={!isOpen}
            onClick={() => putBet('any_triple')}
          >
            <span className="sub-title">★ BÃO ★</span>
            <small className="sub-ratio">1:30</small>
            {myBets.any_triple > 0 && <span className="sub-chip">{myBets.any_triple} xu</span>}
          </button>

          <button
            type="button"
            className={`pt-sub-bet-pill ${myBets.le ? 'has-bet' : ''}`}
            disabled={!isOpen}
            onClick={() => putBet('le')}
          >
            <span className="sub-title">LẺ</span>
            <small className="sub-ratio">1:1</small>
            {myBets.le > 0 && <span className="sub-chip">{myBets.le} xu</span>}
          </button>
        </div>

        }
        {/* CỬA XỈU (XANH NGỌC) */}
        <button
          type="button"
          className={`pt-bet-big-card bet-xiu ${myBets.xiu ? 'has-bet' : ''}`}
          disabled={!isOpen}
          onClick={() => putBet('xiu')}
        >
          <div className="card-top-tag">TỶ LỆ 1:1</div>
          <div className="card-main-title">XỈU</div>
          <div className="card-points-range">4 – 10 ĐIỂM</div>
          {myBets.xiu > 0 && (
            <div className="card-chip-stack">
              <Chip value={myBets.xiu} size={42} />
              <span className="chip-val-label">{myBets.xiu} xu</span>
            </div>
          )}
        </button>
      </div>

      {/* 3. BẢNG SOI CẦU MINI */}
      {miniHistory.length > 0 && (
        <div className="pt-taixiu-soicau-bar" onClick={onOpenHistory} title="Bấm để xem lịch sử & cầu chi tiết">
          <span className="soicau-title">Soi Cầu:</span>
          <div className="soicau-dots-list">
            {miniHistory.map((h, i) => (
              <span
                key={i}
                className={`soi-dot ${h.winner === 'tai' ? 'dot-tai' : h.winner === 'xiu' ? 'dot-xiu' : 'dot-bao'}`}
                title={`Ván #${i + 1}: ${h.winner.toUpperCase()} (${h.total} điểm)`}
              >
                {h.winner === 'tai' ? 'T' : h.winner === 'xiu' ? 'X' : 'B'}
              </span>
            ))}
          </div>
          <span className="soicau-expand">Chi tiết ↗</span>
        </div>
      )}

      {/* 4. KHAY PHỈNH VÀ THAO TÁC CƯỢC */}
      <footer className="pt-screen-action-dock">
        <div className="pt-dock-left">
          <div className="pt-chip-selector-group">
            <span className="dock-label">Chọn phỉnh:</span>
            {CHIP_VALUES.map(val => (
              <button
                key={val}
                type="button"
                className={`pt-chip-btn ${chip === val ? 'selected' : ''}`}
                onClick={() => setChip(val)}
                title={`Chọn phỉnh ${val} xu`}
              >
                <Chip value={val} size={36} />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-dock-right">
          {totalMyBet > 0 && (
            <div className="pt-total-bet-pill">
              <span>Đã cược:</span>
              <strong>{totalMyBet} xu</strong>
            </div>
          )}
          {isOpen && totalMyBet > 0 && (
            <button
              type="button"
              className="pt-cancel-bet-btn"
              onClick={cancelBet}
            >
              Hủy Cược
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
