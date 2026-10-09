import React from 'react';
export function TableHudIcon({name,muted=false}) {
  return <span className={`table-hud-icon${muted?' is-muted':''}`} aria-hidden="true"><img src={`/assets/hud/table-3d-v1/${name}.png`} alt="" width="36" height="36" draggable="false"/>{muted&&<span className="table-hud-mute-mark"/>}</span>;
}
