import { useState } from 'react';
import { Icon3dHoe, Icon3dSeeds, Icon3dWateringCan, Icon3dBasket, Icon3dHand, Icon3dChicken } from './icons3d/GameIcons3D.jsx';
import { farmBarnCapacity } from '../../shared/farmConfig.js';
import './FarmToolDock.css';

export function FarmToolDock({ crops, cropIcons, progress, connected, activeTool, selectTool, chooseCrop, openHerd, openInventory }) {
  const [seedsOpen, setSeedsOpen] = useState(false);
  const stored=Object.values(progress.inventory||{}).reduce((sum,value)=>sum+Number(value||0),0);
  const capacity=farmBarnCapacity(progress.barnLevel||0);
  const selected=crops[progress.selectedCrop];
  const tools=[['hand','Tương tác',Icon3dHand],['hoe','Cuốc',Icon3dHoe],['seed','Hạt giống',Icon3dSeeds],['water','Tưới nước',Icon3dWateringCan],['harvest','Thu hoạch',Icon3dBasket]];
  return <section className="farm-game-dock" aria-label="Công cụ nông trại">
    {seedsOpen && <div className="farm-seed-tray" aria-label="Chọn hạt giống">
      <header><div><b>CHỌN HẠT</b><small>Hạt đang dùng: {selected?.name||'Chưa chọn'}</small></div><button type="button" onClick={()=>setSeedsOpen(false)} aria-label="Đóng khay hạt">×</button></header>
      <div>{Object.values(crops).map(crop=><button type="button" key={crop.id} disabled={!connected||progress.level<crop.level} aria-pressed={progress.selectedCrop===crop.id} onClick={()=>chooseCrop(crop)}><span className="farm-crop-art">{cropIcons?.[crop.id]||<Icon3dSeeds size={30}/>}</span><b>{crop.name}</b><small>{progress.level<crop.level?`Khóa · cấp ${crop.level}`:`${crop.seedCost} xu / ô · ${Math.ceil(crop.growMs/60000)} phút`}</small>{progress.selectedCrop===crop.id&&<span className="farm-seed-check" aria-label="Đang chọn">✓</span>}</button>)}</div>
      <small role="status">{connected?'Xu chỉ trừ khi gieo':'Mất kết nối · chưa thể đổi hạt'}</small>
    </div>}
    <div className="farm-dock-row">
      <div className="farm-game-slots" role="toolbar" aria-label="Công cụ canh tác">{tools.map(([id,label,Icon],index)=><button type="button" key={id} className={`farm-tool-slot farm-tool-${id}`} aria-label={`${label}${id==='seed'&&selected?` ${selected.name}`:''} · phím ${index+1}`} aria-pressed={activeTool===id} aria-expanded={id==='seed'?seedsOpen:undefined} title={`${label} · ${index+1}`} onClick={()=>{selectTool(id);setSeedsOpen(id==='seed'?!seedsOpen:false);}}><kbd>{index+1}</kbd><span className="farm-tool-icon">{id==='seed'&&cropIcons?.[progress.selectedCrop]?cropIcons[progress.selectedCrop]:<Icon size={30}/>}</span><span className="farm-tool-label">{['Dùng','Cuốc','Hạt','Tưới','Gặt'][index]}</span>{id==='seed'&&<span className="farm-tool-chevron">⌃</span>}</button>)}</div>
      <div className="farm-utility-slots"><button type="button" onClick={openHerd} aria-label="Mở vật nuôi" title="Vật nuôi"><Icon3dChicken size={25}/><span>Vật nuôi</span></button><button type="button" className={stored>=capacity?'farm-storage-full':''} onClick={openInventory} aria-label={`Mở kho ${stored}/${capacity}`} title={`Kho ${stored}/${capacity}`}><Icon3dBasket size={25}/><span>Kho</span><small>{stored}/{capacity}</small></button></div>
    </div>
  </section>;
}
