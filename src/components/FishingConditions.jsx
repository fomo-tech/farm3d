import {HudIcon} from './icons3d/HudIcon.jsx';
import './FishingConditions.css';
const shortDate=key=>key?`${key.slice(8,10)}/${key.slice(5,7)}`:'';
export function FishingDensityBadge({conditions,water,pending}){
 const density=pending?.density||conditions?.zones?.[water];
 if(!density)return <div className="fish-density-loading">Đang xem tình hình cá hôm nay…</div>;
 return <div className={`fish-density-badge density-${density.density}`}><HudIcon asset="fish" size={25}/><div><b>{density.name} · {density.label}</b><small>Bản tin {shortDate(pending?.conditionDay||conditions?.dayKey)} · {density.density==='high'?'Cá cắn nhanh hơn':density.density==='low'?'Cần kiên nhẫn chờ phao':'Nhịp cá cắn bình thường'}</small></div></div>;
}
export function FishingConditionsBoard({conditions}){
 if(!conditions)return <p className="fish-density-loading" role="status">Đang xem tình hình cá hôm nay…</p>;
 return <section className="fishing-conditions-board" aria-label="Mật độ cá hôm nay"><header><div><b>Bản tin cá hôm nay</b><small>{shortDate(conditions.dayKey)} · Làm mới lúc 00:00 giờ Việt Nam</small></div><HudIcon asset="fish" size={32}/></header><div className="fishing-conditions-zones">{Object.values(conditions.zones).map(zone=><article key={zone.id} className={`density-${zone.density}`}><i aria-hidden="true"/><div><b>{zone.name}</b><small>{zone.label}</small></div><span>{zone.density==='high'?'Cắn nhanh':zone.density==='low'?'Chờ lâu hơn':'Ổn định'}</span></article>)}</div><p>Vùng nhiều cá có thời gian chờ ngắn hơn. Mồi câu vẫn giúp cá cắn nhanh.</p></section>;
}
