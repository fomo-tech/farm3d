import { useEffect, useState } from 'react';
import {
  Icon3dHoe,
  Icon3dSeeds,
  Icon3dWateringCan,
  Icon3dBasket,
} from './icons3d/GameIcons3D.jsx';

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
  let icon = <Icon3dHoe size={32} />;
  let label = 'Cuốc đất';
  let isRipe = false;

  if (data.state === 'empty') {
    icon = <Icon3dHoe size={32} />;
    label = 'Làm đất';
  } else if (data.state === 'tilled') {
    icon = <Icon3dSeeds size={32} />;
    label = 'Gieo hạt';
  } else if (data.state === 'planted') {
    icon = <Icon3dWateringCan size={32} />;
    label = 'Tưới nước';
  } else if (data.state === 'watered') {
    icon = <Icon3dBasket size={32} />;
    label = 'Thu hoạch';
    isRipe = true;
  }

  const handleClick = () => {
    onApplyQuickTool?.(tile, data);
  };

  return (
    <div className={`floating-action-bubble ${isRipe ? 'ripe-pulse' : ''}`} onClick={handleClick}>
      <span className="bubble-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <span className="bubble-label">{label}</span>
      <small className="bubble-hint">Chạm hoặc bấm E</small>
    </div>
  );
}

