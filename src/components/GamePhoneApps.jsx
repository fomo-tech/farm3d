import { HudIcon } from './icons3d/HudIcon.jsx';

const APPS = [
  ['friends','chat','Bạn bè'], ['fortune','coin','May mắn'],
  ['inventory','backpack','Túi đồ'], ['fashion','wardrobe','Tủ đồ'],
  ['market','shop','Chợ'], ['quests','quest','Nhiệm vụ'],
  ['map','map','Bản đồ'], ['farm','land','Nông trại'],
  ['notice','basket','Điểm danh'], ['settings','settings','Thiết lập'],
];
export function GamePhoneApps({ onOpen, questReady=false, dailyReady=false }) {
  return <nav className="pt-phone-app-grid" aria-label="Ứng dụng trong game">
    {APPS.map(([id,asset,label]) => <button type="button" key={id} className={`pt-app-bubble app-${id}`} onClick={()=>onOpen(id)}>
      <span className="pt-app-icon"><HudIcon asset={asset} size={48}/>{((id==='quests'&&questReady)||(id==='notice'&&dailyReady))&&<span className="pt-app-badge" aria-label="Có phần thưởng">!</span>}</span>
      <span>{label}</span>
    </button>)}
  </nav>;
}
