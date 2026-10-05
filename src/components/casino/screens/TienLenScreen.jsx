import React, { useState } from 'react';
import { suggestTienLenPlay, smartSortTienLen } from '../../../../shared/casino/tienLenRules.js';
import { PlayingCard } from '../CasinoArt.jsx';
import { Icon3dSparkleStar, Icon3dLightningBolt } from '../../icons3d/GameIcons3D.jsx';

export function TienLenScreen({
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
  const [selectedCards, setSelectedCards] = useState([]);
  const [customHand, setCustomHand] = useState(null);

  const rawHand = round?.hand || [];
  const hand = customHand || rawHand;
  const myTurn = round?.turn === player;

  const toggleCard = cardId => {
    setSelectedCards(prev =>
      prev.includes(cardId) ? prev.filter(c => c !== cardId) : [...prev, cardId]
    );
  };

  const handleSmartSort = () => {
    const sorted = smartSortTienLen(hand);
    setCustomHand(sorted);
  };

  const handleSuggest = () => {
    const trick = round?.trick?.cards || [];
    const suggestion = suggestTienLenPlay(hand, trick);
    if (suggestion && suggestion.length > 0) {
      setSelectedCards(suggestion);
    }
  };

  const handlePlayCards = () => {
    if (selectedCards.length > 0) {
      onAct({ kind: 'play', cards: selectedCards, roundId: round?.id });
      setSelectedCards([]);
      setCustomHand(null);
    }
  };

  const handlePass = () => {
    onAct({ kind: 'pass', roundId: round?.id });
    setSelectedCards([]);
  };

  const trick = round?.table;

  return (
    <div className="pt-dedicated-game-stage pt-stage-tienlen">
      {/* 1. KHU VỰC BÀI ĐÃ ĐÁNH Ở TRUNG TÂM BÀN (CENTER TRICK) */}
      <div className="pt-tienlen-trick-stage">
        {trick?.cards && trick.cards.length > 0 ? (
          <div className="pt-active-trick-pod animate-trick-pop">
            <div className="trick-author-tag">
              <span>Đã đánh bởi:</span>
              <strong>{trick.playerName || 'Đối thủ'}</strong>
            </div>
            <div className="trick-cards-row">
              {trick.cards.map((c, i) => (
                <div key={i} className="trick-card-wrap">
                  <PlayingCard id={c} size="md" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-empty-trick-pod">
            <span className="trick-sparkle"><Icon3dSparkleStar size={18} /></span>
            <span>Vòng đánh mới · Bạn có quyền đánh bất kỳ bộ nào</span>
          </div>
        )}
      </div>

      {/* 2. DOCK QUẠT 13 LÁ BÀI DƯỚI ĐÁY MÀN HÌNH */}
      <div className="pt-tienlen-hand-dock">
        {myTurn && (
          <div className="pt-turn-notification-badge animate-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon3dLightningBolt size={18} /> ĐẾN LƯỢT BẠN ĐÁNH BÀI
          </div>
        )}

        <div className="pt-cards-hand-fan">
          {hand.map((cardId, index) => {
            const isSelected = selectedCards.includes(cardId);
            return (
              <div
                key={cardId}
                className={`tienlen-hand-card-slot ${isSelected ? 'is-selected' : ''}`}
                style={{
                  '--card-index': index,
                  '--total-cards': hand.length,
                }}
                onClick={() => toggleCard(cardId)}
              >
                <PlayingCard
                  id={cardId}
                  selected={isSelected}
                  size="lg"
                />
              </div>
            );
          })}
        </div>

        {/* Thanh công cụ thao tác đánh bài */}
        <div className="pt-tienlen-action-bar">
          <div className="action-bar-left">
            <button
              type="button"
              className="pt-tool-btn btn-smart-sort"
              onClick={handleSmartSort}
              title="Tự động xếp bài theo sảnh, đôi, ba cây, rác"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <Icon3dLightningBolt size={16} /> XẾP BÀI
            </button>
            <button
              type="button"
              className="pt-tool-btn btn-hint"
              onClick={handleSuggest}
              disabled={!myTurn}
              title="Gợi ý bộ bài đè được tụ giữa bàn"
            >
              GỢI Ý
            </button>
          </div>

          <div className="action-bar-right">
            <button
              type="button"
              className="pt-tool-btn btn-pass-turn"
              onClick={handlePass}
              disabled={!myTurn}
            >
              BỎ LƯỢT
            </button>
            <button
              type="button"
              className="pt-play-cards-cta-btn"
              onClick={handlePlayCards}
              disabled={!myTurn || selectedCards.length === 0}
            >
              ĐÁNH BÀI ({selectedCards.length} lá)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
