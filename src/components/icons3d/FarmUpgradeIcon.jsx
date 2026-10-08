import React from 'react';

export function FarmUpgradeIcon({asset, size = 48}) {
  return <img className="farm-upgrade-icon" src={`/assets/hud/farm-upgrade-v1/${asset}.webp`} width={size} height={size} alt="" aria-hidden="true" draggable="false" decoding="async"/>;
}
