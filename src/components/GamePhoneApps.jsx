import { HudIcon } from './icons3d/HudIcon.jsx';

const APPS = [['city-jobs','quest','Công việc'],['friends','chat','Bạn bè'],['fashion','wardrobe','Tủ đồ'],['map','map','Bản đồ'],['settings','settings','Thiết lập']];
export function GamePhoneApps({ onOpen, questReady=false, dailyReady=false, cityMode = false }) {
  const apps = APPS;
  return <nav className="pt-phone-app-grid" aria-label="Ứng dụng trong game">
    {apps.map(([id,asset,label]) => <button type="button" key={id} className={`pt-app-bubble app-${id}`} onClick={()=>onOpen(id)}>
      <span className="pt-app-icon"><HudIcon asset={asset} size={48}/>{((id==='quests'&&questReady)||(id==='notice'&&dailyReady))&&<span className="pt-app-badge" aria-label="Có phần thưởng">!</span>}</span>
      <span>{label}</span>
    </button>)}
  </nav>;
}
