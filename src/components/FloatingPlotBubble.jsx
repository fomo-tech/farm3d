import { useEffect, useState } from 'react';

export function FloatingPlotBubble({
  world,
  activeTool,
  onApplyQuickTool,
}) {
  const [bubbleInfo, setBubbleInfo] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!world?.player || !world?.farming) return;
      const playerPos = world.player.root.position;

      // Find nearest plot tile
      let nearest = null;
      let minDistance = Infinity;

      for (const tile of world.farming.tiles) {
        const d = Math.hypot(tile.position.x - playerPos.x, tile.position.z - playerPos.z);
        if (d < minDistance) {
          minDistance = d;
          nearest = tile;
        }
      }

      if (minDistance <= 4.2 && nearest) {
        const key = world.farming.key(nearest);
        const data = world.farming.state[key] || { state: 'empty' };
        setBubbleInfo({
          tile: nearest,
          data,
          distance: minDistance,
        });
      } else {
        setBubbleInfo(null);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [world]);

  if (!bubbleInfo) return null;

  const { data, tile } = bubbleInfo;
  let icon = '⛏️';
  let label = 'Cuốc đất';
  let isRipe = false;

  if (data.state === 'empty') {
    icon = '⛏️';
    label = 'Làm đất';
  } else if (data.state === 'tilled') {
    icon = '🌱';
    label = 'Gieo hạt';
  } else if (data.state === 'planted') {
    icon = '💧';
    label = 'Tưới nước';
  } else if (data.state === 'watered') {
    icon = '🧺';
    label = 'Thu hoạch';
    isRipe = true;
  }

  const handleClick = () => {
    onApplyQuickTool?.(tile, data);
  };

  return (
    <div className={`floating-action-bubble ${isRipe ? 'ripe-pulse' : ''}`} onClick={handleClick}>
      <span className="bubble-icon">{icon}</span>
      <span className="bubble-label">{label}</span>
      <small className="bubble-hint">Chạm hoặc bấm E</small>
    </div>
  );
}
