import React, { useEffect, useState } from 'react';

let rewardListeners = [];

export function emitReward(reward) {
  // reward: { id, text, icon, color, x, y }
  rewardListeners.forEach(listener => listener(reward));
}

export function FloatingRewards() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const handleNewReward = (reward) => {
      const newItem = {
        id: Math.random().toString(36).slice(2),
        text: reward.text,
        icon: reward.icon || '🪙',
        color: reward.color || '#f59e0b',
        x: reward.x ?? window.innerWidth / 2 + (Math.random() * 80 - 40),
        y: reward.y ?? window.innerHeight / 2 + (Math.random() * 60 - 30),
      };

      setItems(prev => [...prev, newItem]);

      setTimeout(() => {
        setItems(prev => prev.filter(item => item.id !== newItem.id));
      }, 1600);
    };

    rewardListeners.push(handleNewReward);
    return () => {
      rewardListeners = rewardListeners.filter(l => l !== handleNewReward);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="floating-rewards-container" pointer-events="none">
      {items.map(item => (
        <div
          key={item.id}
          className="floating-reward-pop"
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
            '--glow-color': item.color,
          }}
        >
          <span className="reward-icon">{item.icon}</span>
          <span className="reward-text" style={{ color: item.color }}>{item.text}</span>
          <span className="reward-sparkles">✨</span>
        </div>
      ))}
    </div>
  );
}
