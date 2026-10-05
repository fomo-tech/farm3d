import React from 'react';
import { CASINO_SYMBOLS } from '../../../../shared/casino/casinoConfig.js';
import { SymbolArt, Chip } from '../CasinoArt.jsx';

export function BauCuaScreen({
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
  const CHIP_VALUES = [10, 20, 50, 100, 500];

  const result = round?.result;
  const symbols = result?.symbols || null;
  const isShaking = round?.phase === 'shaking';
  const isReveal = round?.phase === 'reveal' || round?.phase === 'result' || round?.phase === 'settling';

  const myBets = round?.bets || {};
  const totalMyBet = Object.values(myBets).reduce((a, b) => a + b, 0);

  // Đếm số lần xuất hiện của mỗi linh vật trong kết quả
  const symbolCounts = (symbols || []).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="pt-dedicated-game-stage pt-stage-baucua">
      {/* 1. SÂN KHẤU LẮC ĐĨA GỖ DÂN GIAN BẦU CUA */}
      <div className="pt-baucua-shaker-pod">
        <div className={`pt-wooden-dish-wrap ${isShaking ? 'shaking' : ''}`}>
          <div className="pt-wood-dish-base">
            <div className="wood-grain-rim" />
          </div>

          {symbols && isReveal && (
            <div className="pt-baucua-trio-results">
              {symbols.map((sym, i) => (
                <div key={i} className="baucua-result-tile animate-pop-in">
                  <SymbolArt symbol={sym} size={54} />
                  <span className="res-sym-name">{CASINO_SYMBOLS[sym]?.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {symbols && isReveal && (
          <div className="pt-baucua-result-summary">
            {Object.entries(symbolCounts).map(([sym, count]) => (
              <span key={sym} className="sym-match-chip">
                {CASINO_SYMBOLS[sym]?.name} ×{count}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. BÀN CƯỢC 6 Ô LINH VẬT KHỔ LỚN */}
      <div className="pt-baucua-tiles-grid">
        {Object.keys(CASINO_SYMBOLS).map(key => {
          const betAmount = myBets[key] || 0;
          const isWinning = symbols?.includes(key);
          const winCount = symbolCounts[key] || 0;

          return (
            <button
              key={key}
              type="button"
              className={`pt-folk-animal-tile ${isWinning ? 'winning' : ''} ${betAmount > 0 ? 'has-bet' : ''}`}
              disabled={!isOpen}
              onClick={() => putBet(key)}
            >
              {isWinning && winCount > 0 && (
                <div className="winning-badge-star">
                  ⭐ ×{winCount}
                </div>
              )}

              <div className="tile-art-container">
                <SymbolArt symbol={key} size={64} />
              </div>

              <div className="tile-text-info">
                <strong className="tile-vietnamese-name">{CASINO_SYMBOLS[key].name}</strong>
                <small className="tile-payout-rate">Ăn theo số mặt về</small>
              </div>

              {betAmount > 0 && (
                <div className="tile-placed-chip-bubble">
                  <Chip value={betAmount} size={36} />
                  <span className="bubble-val">{betAmount} xu</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. KHAY PHỈNH VÀ THAO TÁC CƯỢC */}
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
              <span>Tổng cược:</span>
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
