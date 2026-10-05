import React, { useMemo } from 'react';
import { CASINO_SYMBOLS } from '../../../shared/casino/casinoConfig.js';
import { SymbolArt } from './CasinoArt.jsx';

export function CasinoHistory({ game, history = [], onClose }) {
  // Thống kê Tài Xỉu Soi Cầu
  const taiXiuStats = useMemo(() => {
    if (game !== 'tai-xiu') return null;
    let taiCount = 0;
    let xiuCount = 0;
    let tripleCount = 0;
    const rounds = history.map(h => {
      const res = h.result || {};
      const total = res.total || 10;
      const triple = !!res.triple;
      const winner = res.winner || (triple ? 'triple' : total > 10 ? 'tai' : 'xiu');
      if (triple) tripleCount++;
      else if (winner === 'tai') taiCount++;
      else xiuCount++;
      return { id: h.id, total, winner, dice: res.dice || [1, 2, 3], triple };
    });
    const totalRounds = rounds.length || 1;
    return {
      rounds,
      taiCount,
      xiuCount,
      tripleCount,
      taiPercent: Math.round((taiCount / totalRounds) * 100),
      xiuPercent: Math.round((xiuCount / totalRounds) * 100),
      triplePercent: Math.round((tripleCount / totalRounds) * 100),
    };
  }, [game, history]);

  // Thống kê Bầu Cua tần suất linh vật
  const bauCuaStats = useMemo(() => {
    if (game !== 'bau-cua') return null;
    const counts = { bau: 0, cua: 0, tom: 0, ca: 0, ga: 0, nai: 0 };
    let totalDice = 0;
    history.forEach(h => {
      const symbols = h.result?.symbols || [];
      symbols.forEach(s => {
        if (counts[s] !== undefined) {
          counts[s]++;
          totalDice++;
        }
      });
    });
    return { counts, totalDice };
  }, [game, history]);

  return (
    <div className="pt-sub-modal-backdrop" onClick={onClose}>
      <div className="pt-sub-modal-dialog pt-history-dialog" onClick={e => e.stopPropagation()}>
        <header className="pt-sub-modal-header">
          <div className="pt-modal-title-wrap">
            <span className="pt-title-icon">📊</span>
            <h3>SOI CẦU & LỊCH SỬ PHIÊN ĐẤU</h3>
          </div>
          <button type="button" className="pt-candy-close-sm" onClick={onClose}>✕</button>
        </header>

        <div className="pt-sub-modal-body">
          {/* Thống kê Tài Xỉu */}
          {game === 'tai-xiu' && taiXiuStats && (
            <section className="pt-history-section">
              <h4 className="pt-section-title">🎯 Tỷ Lệ Xuất Hiện ({history.length} phiên gần nhất)</h4>
              <div className="pt-stat-meter-box">
                <div className="pt-meter-labels">
                  <span className="meter-tai">🔴 Tài: {taiXiuStats.taiCount} ({taiXiuStats.taiPercent}%)</span>
                  <span className="meter-triple">🟡 Bão: {taiXiuStats.tripleCount} ({taiXiuStats.triplePercent}%)</span>
                  <span className="meter-xiu">🔵 Xỉu: {taiXiuStats.xiuCount} ({taiXiuStats.xiuPercent}%)</span>
                </div>
                <div className="pt-meter-track">
                  <div className="track-tai" style={{ width: `${taiXiuStats.taiPercent}%` }} />
                  <div className="track-triple" style={{ width: `${taiXiuStats.triplePercent}%` }} />
                  <div className="track-xiu" style={{ width: `${taiXiuStats.xiuPercent}%` }} />
                </div>
              </div>

              {/* Lưới chấm Soi Cầu 50 phiên */}
              <div className="pt-soi-dots-grid">
                {taiXiuStats.rounds.map((r, i) => (
                  <div
                    key={r.id || i}
                    className={`pt-cau-dot ${r.triple ? 'dot-triple' : r.winner === 'tai' ? 'dot-tai' : 'dot-xiu'}`}
                    title={`Ván #${r.id || i + 1}: ${r.triple ? 'Bão' : r.winner === 'tai' ? 'Tài' : 'Xỉu'} (${r.total}đ)`}
                  >
                    <span>{r.triple ? 'B' : r.winner === 'tai' ? 'T' : 'X'}</span>
                    <small>{r.total}</small>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Thống kê Bầu Cua */}
          {game === 'bau-cua' && bauCuaStats && (
            <section className="pt-history-section">
              <h4 className="pt-section-title">🏮 Tần Suất 6 Linh Vật Dân Gian</h4>
              <div className="pt-baucua-stat-cards">
                {Object.keys(CASINO_SYMBOLS).map(key => {
                  const c = bauCuaStats.counts[key] || 0;
                  const pct = bauCuaStats.totalDice > 0 ? Math.round((c / bauCuaStats.totalDice) * 100) : 0;
                  return (
                    <div key={key} className="pt-baucua-stat-tile">
                      <div className="stat-tile-art">
                        <SymbolArt symbol={key} size={42} />
                      </div>
                      <div className="stat-tile-text">
                        <strong>{CASINO_SYMBOLS[key].name}</strong>
                        <span>{c} lần ({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Bảng danh sách các ván đấu chi tiết */}
          <section className="pt-history-section">
            <h4 className="pt-section-title">📜 Chi Tiết Từng Phiên Đấu</h4>
            {history.length === 0 ? (
              <div className="pt-history-empty">Chưa có lịch sử ván đấu nào ở bàn này.</div>
            ) : (
              <div className="pt-history-table-container">
                <table className="pt-arcade-table">
                  <thead>
                    <tr>
                      <th>Phiên</th>
                      <th>Thời gian</th>
                      <th>Kết quả</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => {
                      const res = h.result || {};
                      const timeStr = h.at ? new Date(h.at).toLocaleTimeString('vi-VN') : `#${idx + 1}`;
                      let outcomeLabel = '—';
                      let detailLabel = '—';

                      if (game === 'tai-xiu') {
                        outcomeLabel = res.triple ? 'BÃO' : res.winner === 'tai' ? 'TÀI' : 'XỈU';
                        detailLabel = `${res.total || 0} điểm · [${(res.dice || []).join(', ')}]`;
                      } else if (game === 'bau-cua') {
                        outcomeLabel = (res.symbols || []).map(s => CASINO_SYMBOLS[s]?.name || s).join(', ');
                        detailLabel = `3 xúc xắc`;
                      } else if (game === 'bai-cao') {
                        outcomeLabel = res.winner || 'Ván xong';
                        detailLabel = res.detail || 'So điểm 3 lá';
                      } else {
                        outcomeLabel = res.winner ? `Thắng: ${res.winner}` : 'Kết thúc';
                        detailLabel = res.reason || 'Tiến Lên';
                      }

                      return (
                        <tr key={h.id || idx}>
                          <td><code>#{String(h.id || idx + 1).slice(-6)}</code></td>
                          <td>{timeStr}</td>
                          <td>
                            <span className={`pt-result-badge badge-${String(outcomeLabel).toLowerCase()}`}>
                              {outcomeLabel}
                            </span>
                          </td>
                          <td>{detailLabel}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
