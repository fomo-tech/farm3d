import React, { useState } from 'react';
import { CROPS } from '../game/economy/GameProgress.js';

export function OrderBulletinBoard({
  orders,
  progress,
  canFillOrder,
  onDeliverOrder,
  onResetOrders,
  onClose,
}) {
  const [truckDispatching, setTruckDispatching] = useState(false);
  const [lastDeliveredOrder, setLastDeliveredOrder] = useState(null);

  const completedCount = progress.completedOrders.length;
  const allCompleted = completedCount >= orders.length;

  const handleDeliver = (order) => {
    if (truckDispatching) return;
    setTruckDispatching(true);
    setLastDeliveredOrder(order);

    // Trigger delivery event and truck animation
    setTimeout(() => {
      onDeliverOrder(order);
    }, 600);

    setTimeout(() => {
      setTruckDispatching(false);
      setLastDeliveredOrder(null);
    }, 1800);
  };

  return (
    <div className="bulletin-backdrop" onClick={onClose}>
      <div className="bulletin-board" onClick={(e) => e.stopPropagation()}>
        {/* Wooden Frame Header */}
        <div className="bulletin-roof">
          <div className="roof-shingles" />
        </div>

        <div className="bulletin-header">
          <div className="bulletin-title">
            <span className="bulletin-icon">📦</span>
            <div>
              <h3>BẢNG ĐƠN HÀNG NÔNG TRẠI</h3>
              <p>Cung cấp nông sản tươi ngon cho thị trấn & nhận thưởng lớn!</p>
            </div>
          </div>
          <button className="bulletin-close-btn" type="button" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Truck Animation Banner */}
        <div className={`delivery-truck-lane ${truckDispatching ? 'active-dispatch' : ''}`}>
          <div className="truck-body">
            <div className="truck-cab">🚚</div>
            <div className="truck-exhaust">💨</div>
            {truckDispatching && lastDeliveredOrder && (
              <div className="truck-cargo-bubble">
                {Object.keys(lastDeliveredOrder.items).map(cropId => (
                  <span key={cropId}>{CROPS[cropId]?.icon || '📦'}</span>
                ))}
              </div>
            )}
          </div>
          <span className="truck-status-text">
            {truckDispatching
              ? 'Xe tải đang rồ ga chở hàng ra thị trấn…'
              : 'Xe tải giao hàng đang túc trực tại bến nông trại'}
          </span>
        </div>

        {/* 6 Parchment Order Sheets Grid */}
        <div className="order-parchment-grid">
          {orders.map((order, idx) => {
            const isDone = progress.completedOrders.includes(order.id);
            const canFill = canFillOrder(progress, order);

            return (
              <div
                key={order.id}
                className={`order-parchment-card ${isDone ? 'card-done' : ''} ${canFill && !isDone ? 'card-ready' : ''}`}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                {/* Red Push Pin */}
                <div className="pin-head" />

                <div className="parchment-top">
                  <span className="order-number">Đơn #{idx + 1}</span>
                  <span className="order-client">{order.title}</span>
                </div>

                <div className="parchment-items">
                  {Object.entries(order.items).map(([cropId, needed]) => {
                    const have = progress.inventory[cropId] || 0;
                    const cropInfo = CROPS[cropId] || { icon: '🌱', name: cropId };
                    const isEnough = have >= needed;

                    return (
                      <div key={cropId} className={`item-row ${isEnough ? 'item-ok' : 'item-missing'}`}>
                        <div className="item-name-group">
                          <span className="crop-ico">{cropInfo.icon}</span>
                          <span className="crop-lbl">{cropInfo.name}</span>
                        </div>
                        <span className="crop-qty">
                          <b>{have}</b>/{needed}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="parchment-rewards">
                  <span className="reward-pill coins">🪙 +{order.coins} xu</span>
                  {order.xp && <span className="reward-pill xp">⭐ +{order.xp} XP</span>}
                </div>

                <div className="parchment-footer">
                  {isDone ? (
                    <div className="stamp-completed">✓ ĐÃ GIAO</div>
                  ) : (
                    <button
                      type="button"
                      className={`btn-deliver ${canFill ? 'ready-pulse' : 'disabled'}`}
                      disabled={!canFill || truckDispatching}
                      onClick={() => handleDeliver(order)}
                    >
                      {canFill ? '🚀 Giao Hàng' : 'Chưa Đủ Hàng'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="bulletin-bottom-bar">
          <div className="delivery-stats">
            Tiến độ hôm nay: <b>{completedCount}/{orders.length} đơn</b>
          </div>

          {allCompleted && (
            <button
              type="button"
              className="btn-refresh-orders"
              disabled={progress.coins < 25}
              onClick={onResetOrders}
            >
              🔄 Nhận 6 đơn hàng mới (25 🪙)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
