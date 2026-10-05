import { WORLD_LAYOUT } from '../game/world/worldLayout.js';
import { WORLD_VILLAGES } from '../../shared/villageLayout.js';
import { VENUE_LAYOUT } from '../../shared/venueLayout.js';

export function WorldMapSurface({playerCoord,myFarm,destinations=[],onSelect,selectedId,zoom=1}) {
  const x=value=>55+(value+720)/1440*890;
  const y=value=>555-(value+430)/1080*500;
  const centerX=Math.max(500/zoom,Math.min(1000-500/zoom,x(playerCoord.x)));
  const centerY=Math.max(300/zoom,Math.min(600-300/zoom,y(playerCoord.z)));
  return <svg viewBox={`${centerX-500/zoom} ${centerY-300/zoom} ${1000/zoom} ${600/zoom}`} role="group" aria-label="Bản đồ các khu đất, cửa hàng và vị trí của bạn">
    <defs>
      <linearGradient id="map-land" x2="0" y2="1"><stop stopColor="#c8d9aa"/><stop offset="1" stopColor="#a5c69b"/></linearGradient>
      <pattern id="map-grass" width="34" height="29" patternUnits="userSpaceOnUse"><path d="M5 9l2 -3 2 3M24 22l2 -3" fill="none" stroke="#7fa47b" strokeWidth="1" opacity=".3"/></pattern>
      <filter id="map-building-shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#244c3a" floodOpacity=".25"/></filter>
    </defs>
    <rect width="1000" height="600" rx="12" fill="url(#map-land)"/>
    <rect width="1000" height="600" rx="12" fill="url(#map-grass)"/>
    <path d="M0 16Q180 60 340 24T650 38T1000 12" fill="none" stroke="#e1e8bc" strokeWidth="25"/>
    <path d="M0 16Q180 60 340 24T650 38T1000 12" fill="none" stroke="#79b8c2" strokeWidth="18"/>
    <path d="M20 570Q180 525 310 565T620 566T980 540" fill="none" stroke="#b4cea5" strokeWidth="30"/>
    {WORLD_VILLAGES.map(v=><g key={v.id}>
      <rect x={x(v.x)-61} y={y(v.z)-58} width="122" height="110" rx="18" fill="#789773" opacity=".18"/>
      <path d={`M${x(v.x)} ${y(v.gate.z)}V${y(v.gate.z+190)}`} stroke="#899a8b" strokeWidth="10"/>
      <path d={`M${x(v.x)} ${y(v.gate.z)}V${y(v.gate.z+190)}`} stroke="#f3ead0" strokeWidth="7"/>
      {WORLD_LAYOUT.farms.filter(f=>f.villageId===v.id).map(f=><g key={f.id} filter="url(#map-building-shadow)"><rect x={x(f.x)-7} y={y(f.z)-6} width="14" height="12" rx="2" fill={f.id===myFarm?.id?'#f3bc42':'#f1e6c7'} stroke="#96a17e" strokeWidth=".6"/><rect x={x(f.x)-5} y={y(f.z)} width="10" height="4" fill="#6b9267"/><path d={`M${x(f.x)-5} ${y(f.z)-1}v-4h10v4Z`} fill={f.id===myFarm?.id?'#c58335':'#b77c60'}/><path d={`M${x(f.x)-6} ${y(f.z)-5}l6 -3 6 3Z`} fill="#d39c74"/></g>)}
      <rect x={x(v.x)-61} y={y(v.z)-83} width="122" height="22" rx="11" fill="#f7f5e8" stroke="#8fa18b"/>
      <text x={x(v.x)} y={y(v.z)-68} textAnchor="middle" fontSize="12" fontWeight="700" fill="#324b46">{v.name.replace('Làng ','')}</text>
    </g>)}
    <circle cx={x(0)} cy={y(0)} r="23" fill="#f3e7c8" stroke="#bba079" strokeWidth="3"/><circle cx={x(0)} cy={y(0)} r="10" fill="#80c3cc" stroke="#fff8de" strokeWidth="3"/>
    <text x={x(0)-35} y={y(0)-32} fontSize="13" fill="#233b39">Quảng trường</text>
    <ellipse cx={x(165)} cy={y(2)} rx="30" ry="21" fill="#6eafb8" stroke="#d7e6bf" strokeWidth="4"/>
    <text x={x(165)} y={y(2)-30} textAnchor="middle" fontSize="12" fill="#233b39" stroke="#e8eedc" strokeWidth="3" paintOrder="stroke">Hồ Pha Lê</text>
    {Object.values(VENUE_LAYOUT).map(v=><g key={v.label}><rect x={x(v.exterior.x)-5} y={y(v.exterior.z)-5} width="10" height="10" fill={v.color} stroke="#fff"/><title>{v.label}</title></g>)}
    {myFarm&&<g><circle cx={x(myFarm.x)} cy={y(myFarm.z)} r="10" fill="none" stroke="#e4a127" strokeWidth="3"/><title>Nông trại của bạn</title></g>}
    <g transform={`translate(${x(playerCoord.x)},${y(playerCoord.z)})`}><circle r="12" fill="#1e6682" stroke="#fff" strokeWidth="3"/><path d="M0 -8L6 6L0 3L-6 6Z" fill="#fff"/><path d="M12 0H35" stroke="#173e50" strokeWidth="2"/><rect x="35" y="-12" width="123" height="25" rx="5" fill="#173e50"/><text x="96" y="5" textAnchor="middle" fill="white" fontSize="12">Bạn đang ở đây</text></g>
    {destinations.map(d=><g key={d.id} role="button" tabIndex={0} aria-label={`Chọn ${d.label}`} aria-pressed={selectedId===d.id} onClick={()=>onSelect?.(d)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect?.(d);}}} style={{cursor:'pointer'}} transform={`translate(${x(d.x)},${y(d.z)})`}><circle r={selectedId===d.id?13:8} fill={selectedId===d.id?'#f4c254':'#fff5dd'} stroke="#315b64" strokeWidth="2"/><circle r="3" fill="#315b64"/><title>{d.label}</title></g>)}
    <g transform="translate(948 80)"><circle r="24" fill="#faf7e8" stroke="#8fa18b"/><path d="M0 -18L6 6L0 2L-6 6Z" fill="#315b64"/><text y="-29" textAnchor="middle" fontSize="12" fontWeight="700" fill="#233b39">BẮC</text></g>
    <g transform="translate(25 552)"><rect width="290" height="29" rx="8" fill="#f7f5e8" stroke="#8fa18b"/><circle cx="15" cy="15" r="5" fill="#1e6682"/><text x="25" y="19" fontSize="11" fill="#324b46">Bạn</text><rect x="70" y="10" width="10" height="10" fill="#f3bc42"/><text x="87" y="19" fontSize="11" fill="#324b46">Đất của bạn</text><circle cx="184" cy="15" r="5" fill="#79b8c2"/><text x="194" y="19" fontSize="11" fill="#324b46">Hồ nước</text></g>
  </svg>;
}
