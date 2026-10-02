import { useState } from 'react';
import { CROPS } from '../game/economy/GameProgress.js';

const MARKET_OFFERS = [
  { id: 'off_1', seller: 'Hợp tác xã', crop: 'carrot', amount: 5, price: 50, tag: 'Bán chạy' },
  { id: 'off_2', seller: 'Hợp tác xã', crop: 'wheat', amount: 4, price: 100, tag: 'Giá rẻ' },
  { id: 'off_3', seller: 'Hợp tác xã', crop: 'tomato', amount: 3, price: 135, tag: 'Tươi ngon' },
  { id: 'off_4', seller: 'Hợp tác xã', crop: 'strawberry', amount: 2, price: 210, tag: 'Đặc sản' },
];

export function RoadsideShopModal({ progress, onBuyOffer, onClose }) {
  const [tab, setTab] = useState('gazette'); // 'gazette' | 'my_shop'
  const [offers, setOffers] = useState(MARKET_OFFERS);

  const handleBuy = offer => {
    if (progress.coins < offer.price) return;
    setOffers(prev => prev.filter(o => o.id !== offer.id));
    onBuyOffer?.(offer);
  };

  return (
    <div className="onboarding-backdrop" onClick={onClose}>
      <section className="roadside-shop-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Striped Canopy Roof Header */}
        <div className="shop-canopy-stripe">
          <div className="shop-title-wrap">
            <span className="shop-icon">🏪</span>
            <div>
              <small>CHỢ NÔNG DÂN HOA MAI</small>
              <h2>Gian Hàng Ven Đường</h2>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>

        {/* Tab selection */}
        <div className="shop-tab-bar">
          <button
            type="button"
            className={`shop-tab-btn ${tab === 'gazette' ? 'active' : ''}`}
            onClick={() => setTab('gazette')}
          >
            📰 Tạp Chí Rao Vặt Thung Lũng
          </button>
          <button
            type="button"
            className={`shop-tab-btn ${tab === 'my_shop' ? 'active' : ''}`}
            onClick={() => setTab('my_shop')}
          >
            📦 Quầy Hàng Của Bạn
          </button>
        </div>

        {/* Tab Content */}
        <div className="shop-content-area">
          {tab === 'gazette' && (
            <div className="offers-grid">
              {offers.length === 0 ? (
                <div className="empty-shop-notice">
                  <span>🧺</span>
                  <p>Hôm nay cả chợ đã bán hết sạch hàng! Hãy quay lại sau nhé.</p>
                </div>
              ) : (
                offers.map(offer => {
                  const cropObj = CROPS[offer.crop] || CROPS.carrot;
                  const canAfford = progress.coins >= offer.price;

                  return (
                    <div key={offer.id} className="market-crate-card">
                      <span className="crate-seller-tag">{offer.seller}</span>
                      <div className="crate-crop-display">
                        <span className="crate-crop-icon">{cropObj.icon}</span>
                        <b className="crate-crop-name">{cropObj.name} × {offer.amount}</b>
                      </div>
                      <div className="crate-bottom-row">
                        <span className="crate-price">🪙 {offer.price}</span>
                        <button
                          type="button"
                          className="crate-buy-btn"
                          disabled={!canAfford}
                          onClick={() => handleBuy(offer)}
                        >
                          {canAfford ? 'Mua ngay' : 'Thiếu xu'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === 'my_shop' && (
            <div className="my-shop-crates">
              <div className="my-shop-intro">
                <p>Đặt nông sản từ kho của bạn lên thùng gỗ để bán cho hàng xóm ghé thăm:</p>
              </div>
              <div className="my-crates-grid">
                {Object.entries(progress.inventory)
                  .filter(([key, count]) => count > 0 && CROPS[key])
                  .map(([cropId, count]) => {
                    const crop = CROPS[cropId];
                    return (
                      <div key={cropId} className="my-stock-crate">
                        <span className="my-crate-icon">{crop.icon}</span>
                        <b>{crop.name}</b>
                        <small>Có: {count} củ trong kho</small>
                        <span className="my-crate-val">Giá thị trường: {crop.sellPrice * 2} xu</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <footer className="shop-footer">
          <span>Số dư của bạn: <b>🪙 {progress.coins.toLocaleString('vi-VN')} xu</b></span>
        </footer>
      </section>
    </div>
  );
}
