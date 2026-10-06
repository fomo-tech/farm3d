import { useState } from 'react';
import { Icon3dHoe, Icon3dSeeds, Icon3dWateringCan, Icon3dBasket, Icon3dHand, Icon3dChicken } from './icons3d/GameIcons3D.jsx';
import { farmBarnCapacity } from '../../shared/farmConfig.js';
import './FarmToolDock.css';

export function FarmToolDock({ crops, cropIcons, progress, connected, activeTool, selectTool, chooseCrop, openHerd, openInventory, onAutoWork }) {
  const [seedsOpen, setSeedsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const stored=Object.values(progress.inventory||{}).reduce((sum,value)=>sum+Number(value||0),0);
  const capacity=farmBarnCapacity(progress.barnLevel||0);
  const selected=crops[progress.selectedCrop];
  const tools=[['hand','Tương tác',Icon3dHand],['hoe','Cuốc',Icon3dHoe],['seed','Hạt giống',Icon3dSeeds],['water','Tưới nước',Icon3dWateringCan],['harvest','Thu hoạch',Icon3dBasket]];
  return <section className="farm-game-dock" aria-label="Công cụ nông trại">
    {seedsOpen && <div className="farm-seed-tray" aria-label="Chọn hạt giống">
      <header><div><b>HẠT GIỐNG</b><small>Đang chọn: {selected?.name||'Chưa chọn'}</small></div><button type="button" onClick={()=>setSeedsOpen(false)} aria-label="Đóng khay hạt">×</button></header>
      <div>{Object.values(crops).map(crop=><button type="button" key={crop.id} disabled={!connected||progress.level<crop.level} aria-pressed={progress.selectedCrop===crop.id} onClick={()=>{chooseCrop(crop);setSeedsOpen(false);}}><span className="farm-crop-art">{cropIcons?.[crop.id]||<Icon3dSeeds size={30}/>}</span><b>{crop.name}</b><small>{progress.level<crop.level?`Cấp ${crop.level}`:`${crop.seedCost} xu · ${Math.ceil(crop.growMs/60000)} phút`}</small>{progress.selectedCrop===crop.id&&<span className="farm-seed-check" aria-label="Đang chọn">✓</span>}</button>)}</div>
      <small role="status">{connected?'Chỉ trừ xu khi gieo':'Mất kết nối · chưa thể đổi hạt'}</small>
    </div>}
    {toolsOpen && <div className="farm-manual-tools" role="toolbar" aria-label="Công cụ thủ công">{tools.map(([id,label,Icon],index)=><button type="button" key={id} className="farm-tool-slot" aria-label={`${label} · phím ${index+1}`} aria-pressed={activeTool===id} title={`${label} · ${index+1}`} onClick={()=>{selectTool(id);setToolsOpen(false);}}><kbd>{index+1}</kbd><span className="farm-tool-icon"><Icon size={27}/></span><span className="farm-tool-label">{label}</span></button>)}</div>}
    <div className="farm-dock-row">
      <button type="button" className="farm-auto-work" disabled={!connected} onClick={onAutoWork} aria-label="Làm ruộng tự động, phím E"><Icon3dHand size={29}/><span><b>Làm ruộng</b><small>Tự chọn thao tác · E</small></span></button>
      <button type="button" className="farm-dock-seeds" aria-expanded={seedsOpen} aria-label={`Chọn hạt giống, hiện tại ${selected?.name||'chưa chọn'}`} onClick={()=>{setSeedsOpen(open=>!open);setToolsOpen(false);}}><span className="farm-dock-art">{cropIcons?.[progress.selectedCrop]||<Icon3dSeeds size={28}/>}</span><span>Hạt giống</span><small>{selected?.name||'Chọn hạt'}</small></button>
      <button type="button" className="farm-dock-more" aria-expanded={toolsOpen} onClick={()=>{setToolsOpen(open=>!open);setSeedsOpen(false);}}><Icon3dHoe size={25}/><span>Công cụ</span></button>
      <div className="farm-utility-slots"><button type="button" onClick={openHerd} aria-label="Mở vật nuôi" title="Vật nuôi"><Icon3dChicken size={25}/><span>Vật nuôi</span></button><button type="button" className={stored>=capacity?'farm-storage-full':''} onClick={openInventory} aria-label={`Mở kho ${stored}/${capacity}`} title={`Kho ${stored}/${capacity}`}><Icon3dBasket size={25}/><span>Kho</span><small>{stored}/{capacity}</small></button></div>
    </div>
  </section>;
}
