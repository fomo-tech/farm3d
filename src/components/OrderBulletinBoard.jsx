import React, { useState } from 'react';
import { CROPS } from '../game/economy/GameProgress.js';
import {
  Icon3dOrdersBox,
  Icon3dCarrot,
  Icon3dRiceSpike,
  Icon3dTomato,
  Icon3dStrawberry,
  Icon3dSprout,
  Icon3dFlower,
  Icon3dGoldCoin,
  Icon3dStar,
  Icon3dCheck,
} from './icons3d/GameIcons3D.jsx';

function renderCropIcon(id, size = 20) {
  if (id === 'carrot') return <Icon3dCarrot size={size} />;
  if (id === 'wheat') return <Icon3dRiceSpike size={size} />;
  if (id === 'tomato') return <Icon3dTomato size={size} />;
  if (id === 'strawberry') return <Icon3dStrawberry size={size} />;
  return <Icon3dSprout size={size} />;
}

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
            <span className="bulletin-icon" style={{ display: 'inline-flex' }}>
              <Icon3dOrdersBox size={38} />
            </span>
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
            <div className="truck-cab" style={{ fontWeight: 800, fontSize: '12px', color: '#1e293b' }}>GIAO HÀNG</div>
            {truckDispatching && lastDeliveredOrder && (
              <div className="truck-cargo-bubble">
                {Object.keys(lastDeliveredOrder.items).map(cropId => (
                  <span key={cropId} style={{ display: 'inline-flex' }}>{renderCropIcon(cropId, 18)}</span>
                ))}
              </div>
            )}
          </div>
          <span className="truck-status-text">
            {truckDispatching
              ? 'Xe giao hàng đang vận chuyển nông sản ra thị trấn…'
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
                    const cropInfo = CROPS[cropId] || { name: cropId };
                    const isEnough = have >= needed;

                    return (
                      <div key={cropId} className={`item-row ${isEnough ? 'item-ok' : 'item-missing'}`}>
                        <div className="item-name-group">
                          <span className="crop-ico" style={{ display: 'inline-flex' }}>{renderCropIcon(cropId, 18)}</span>
                          <span className="crop-lbl">{cropInfo.name}</span>
                        </div>
                        <span className="crop-qty">
                          <b>{have}</b>/{needed}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="parchment-rewards" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="reward-pill coins" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Icon3dGoldCoin size={16} />
                    <span>+{order.coins} xu</span>
                  </span>
                  {order.xp && (
                    <span className="reward-pill xp" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Icon3dStar size={16} />
                      <span>+{order.xp} XP</span>
                    </span>
                  )}
                </div>

                <div className="parchment-footer">
                  {isDone ? (
                    <div className="stamp-completed" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Icon3dCheck size={16} />
                      <span>ĐÃ GIAO</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`btn-deliver ${canFill ? 'ready-pulse' : 'disabled'}`}
                      disabled={!canFill || truckDispatching}
                      onClick={() => handleDeliver(order)}
                    >
                      {canFill ? 'Giao Hàng' : 'Chưa Đủ Hàng'}
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
              Nhận 6 đơn hàng mới (25 xu)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

