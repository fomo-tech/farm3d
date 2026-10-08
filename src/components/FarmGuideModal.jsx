import React, { useEffect, useRef, useState } from 'react';
import { ONBOARDING_STEPS, CROPS, ORDERS, barnCapacity, inventoryCount } from '../game/economy/GameProgress.js';
import { preLandJourney } from '../../shared/preLandJourney.js';
import { VEHICLE_LIST } from '../../shared/vehicleConfig.js';
import { FARM_CONFIG } from '../../shared/farmConfig.js';
import { ECONOMY_REWARD_CONFIG } from '../../shared/economyRewardConfig.js';
import { HudIcon } from './icons3d/HudIcon.jsx';
import './FarmGuide.css';
const TABS = [ ['journey','Bắt đầu','quest'], ['crops','Trồng trọt','seeds'], ['barn','Kho đồ','backpack'], ['orders','Đơn hàng','basket'], ['explore','Khám phá','map'], ['vehicles','Phương tiện','bike'] ];
const FARM_STEPS = [
  [ONBOARDING_STEPS.MEET_ELDER,'Gặp Quản Gia Oliver','Đến gặp Oliver để nhận hướng dẫn và hạt giống khởi nghiệp.','quest'],
  [ONBOARDING_STEPS.FIRST_PLANT,'Vụ mùa đầu tiên','Xới đất, gieo hạt, tưới nước rồi thu hoạch khi cây chín. Báo cáo kết quả với Oliver.','seeds'],
  [ONBOARDING_STEPS.EXPLAIN_SYSTEMS,'Học cách quản lý nông trại','Nghe Oliver hướng dẫn về kho, vật tư và các hoạt động trong thị trấn.','backpack'],
  [ONBOARDING_STEPS.DELIVER_ORDER,'Giao đơn đầu tiên','Chuẩn bị nông sản theo yêu cầu và giao tại bảng Đơn hàng.','basket'],
  [ONBOARDING_STEPS.CLAIM_REWARD,'Nhận quà tốt nghiệp','Gặp lại Oliver để hoàn tất hướng dẫn và nhận xe đạp.','bike'],
];
const START_STEPS = [ [1,'Chuẩn bị cần câu','Đến tiệm đồ câu, mua cần tre. Cần cơ bản dùng được không cần mồi.','fish'], [2,'Câu con cá đầu tiên','Đến hồ, thả câu và kéo khi cá cắn. Cá hiếm có thể cần kéo nhiều lần.','fish'], [3,'Bán cá lấy xu','Mang cá đến tiệm đồ câu hoặc Lão Ngư để bán.','coin'], [4,'Mua lô đất đầu tiên','Xem giá từng lô đất. Mua đất để bắt đầu trồng trọt.','land'] ];
const money = value => value.toLocaleString('vi-VN');
function Tip({ asset, title, children }) { return <article className="farm-guide-tip"><HudIcon asset={asset} size={40}/><div><h4>{title}</h4><p>{children}</p></div></article>; }
export function FarmGuideModal({ progress = {}, hasFarm = false, onClose, onResetTutorial, onNavigateStep }) {
  const [tab,setTab] = useState('journey');
  const [confirmReset,setConfirmReset] = useState(false);
  const panel = useRef(null), content = useRef(null), close = useRef(onClose); close.current = onClose;
  const journey = preLandJourney(progress);
  const completed = hasFarm && !!progress.onboarding?.completed;
  const step = hasFarm ? (progress.onboarding?.step ?? 0) : journey.step;
  const steps = hasFarm ? FARM_STEPS : START_STEPS;
  const done = completed ? steps.length : steps.filter(([value]) => step > value).length;
  useEffect(() => {
    const previous = document.activeElement;
    panel.current?.querySelector('button')?.focus();
    const keys = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current?.(); }
      if (event.key !== 'Tab') return;
      const controls = [...panel.current.querySelectorAll('button:not(:disabled),a[href],input')].filter(el => el.getClientRects().length);
      const first = controls[0], last = controls[controls.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown',keys,true);
    return () => { document.removeEventListener('keydown',keys,true); if (previous?.isConnected) previous.focus(); };
  },[]);
  const navigate = () => { onClose?.(); onNavigateStep?.(); };
  return <div className="farm-guide-overlay" onClick={event => { if (event.target === event.currentTarget) onClose?.(); }}>
    <section className="farm-guide" ref={panel} role="dialog" aria-modal="true" aria-labelledby="farm-guide-title">
      <header className="farm-guide-header"><span className="farm-guide-book-icon"><HudIcon asset="quest" size={49}/></span><div><small>HỌC CHƠI · KHÁM PHÁ · LẬP NGHIỆP</small><h2 id="farm-guide-title">Sổ tay nông dân</h2></div><button className="farm-guide-close" aria-label="Đóng sổ tay" onClick={onClose}>×</button></header>
      <div className="farm-guide-layout"><nav className="farm-guide-nav" aria-label="Chủ đề sổ tay">{TABS.map(([id,label,asset]) => <button key={id} aria-pressed={tab===id} onClick={() => { setTab(id); setConfirmReset(false); if (content.current) content.current.scrollTop=0; }}><HudIcon asset={asset} size={30}/><span>{label}</span><i aria-hidden="true">›</i></button>)}<div className="farm-guide-nav-note">Một chút mỗi ngày,<br/>nông trại thêm lớn.</div></nav>
      <div className="farm-guide-content" ref={content}>
        {tab==='journey' && <><div className="farm-guide-banner"><HudIcon asset={hasFarm?'seeds':'fish'} size={68}/><div><small>HÀNH TRÌNH CỦA BẠN</small><h3>{completed?'Sẵn sàng làm chủ nông trại':hasFarm?'Từ hạt giống đầu tiên':'Từ cần câu đến nông trại'}</h3><p>{completed?'Bạn đã hoàn thành hướng dẫn. Khám phá các mục bên cạnh để tìm mẹo chơi.':hasFarm?'Hoàn thành từng bước cùng Oliver để làm quen với nông trại.':journey.description}</p></div><strong>{done}<span>/{steps.length}</span><small>ĐÃ XONG</small></strong></div>
          <div className="farm-guide-progress" role="progressbar" aria-label="Tiến độ hướng dẫn" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done}><span style={{width:`${done/steps.length*100}%`}}/></div>
          <ol className="farm-guide-steps">{steps.map(([value,title,desc,asset],index) => { const state=completed||step>value?'done':step===value?'current':'later';return <li key={value} className={state}><div className="farm-guide-step-art"><HudIcon asset={asset} size={36}/><span>{index+1}</span></div><div className="farm-guide-step-copy"><small>{state==='done'?'Đã hoàn thành':state==='current'?'Đang thực hiện':'Bước tiếp theo'}</small><h4>{title}</h4><p>{desc}</p></div>{state==='current'&&onNavigateStep?<button className="farm-guide-go" onClick={navigate}>Đi ngay <span aria-hidden="true">›</span></button>:<span className="farm-guide-step-state" aria-hidden="true">{state==='done'?'✓':String(index+1).padStart(2,'0')}</span>}</li>;})}</ol>
          {hasFarm && <div className="farm-guide-reward"><HudIcon asset="bike" size={45}/><div><b>Quà hoàn thành hướng dẫn</b><p>Xe đạp · {money(ECONOMY_REWARD_CONFIG.onboarding.completion.coins)} xu · {ECONOMY_REWARD_CONFIG.onboarding.completion.xp} XP</p></div><span>{completed?'Đã hoàn thành':'Chờ bạn khám phá'}</span></div>}
        </>}
        {tab==='crops' && <><div className="farm-guide-heading"><small>GIEO HẠT HÔM NAY</small><h3>Chăm cây, đón vụ mùa</h3><p>Chọn hạt giống phù hợp với cấp nhân vật. Giá và thời gian dưới đây theo cấu hình game hiện tại.</p></div><div className="farm-guide-process">{['Xới đất','Gieo hạt','Tưới nước','Thu hoạch'].map((label,i)=><span key={label}><b>{i+1}</b>{label}</span>)}</div><div className="farm-guide-crops">{Object.values(CROPS).map(crop=><article key={crop.id}><header><span style={{background:crop.color}} aria-hidden="true"/><h4>{crop.name}</h4><small>Cấp {crop.level}</small></header><dl><div><dt>Hạt giống</dt><dd>{crop.seedCost} xu</dd></div><div><dt>Thời gian</dt><dd>{crop.growMs/60000} phút</dd></div><div><dt>Giá bán</dt><dd>{crop.sellPrice} xu</dd></div></dl></article>)}</div><Tip asset="seeds" title="Nhớ tưới nước">Cây lớn sau khi tưới, kể cả lúc bạn rời game. Vụ hướng dẫn chỉ mất 8 giây. Đóng cổng để bảo vệ mùa vụ: mỗi ô chỉ bị lấy 1/4 sản lượng, tối đa 6 lượt mỗi nông trại/ngày. Nông trại mới được bảo vệ 30 phút.</Tip></>}
        {tab==='barn' && <><div className="farm-guide-heading"><small>GỌN GÀNG ĐỂ THU HOẠCH</small><h3>Kho đồ của bạn</h3><p>Nông sản và sản phẩm dùng chung sức chứa kho.</p></div><div className="farm-guide-storage"><HudIcon asset="backpack" size={72}/><div><strong>{inventoryCount(progress)}<span> / {barnCapacity(progress)}</span></strong><p>vật phẩm đang cất trong kho</p></div></div><Tip asset="basket" title="Kho đầy thì làm gì?">Bán bớt nông sản trong Túi đồ hoặc dùng chúng để giao đơn hàng. Dọn chỗ trước khi thu hoạch thêm.</Tip><Tip asset="land" title="Tăng sức chứa">Mở Nông trại → Nâng cấp để nâng kho. Mỗi cấp tăng {FARM_CONFIG.buildings.barn.capacityPerLevel} chỗ chứa; tính năng mở sau hướng dẫn tân thủ.</Tip><Tip asset="wardrobe" title="Trang phục và dụng cụ">Túi đồ có các nhóm riêng để tìm đồ nhanh. Mở Thời trang để phối và mặc trang phục đã sở hữu.</Tip></>}
        {tab==='orders' && <><div className="farm-guide-heading"><small>NÔNG SẢN ĐẾN TAY DÂN LÀNG</small><h3>Giao đơn, nhận xu & XP</h3><p>Mở Nông trại → Đơn hàng. Kiểm tra đủ nguyên liệu rồi chọn giao đơn.</p></div><div className="farm-guide-orders">{ORDERS.map(order=><article key={order.id}><HudIcon asset="basket" size={43}/><div><h4>{order.title}</h4><p>{Object.entries(order.items).map(([id,count])=>`${count} ${CROPS[id]?.name||id}`).join(' · ')}</p><small>{order.coins} xu <span>·</span> {order.xp} XP</small></div></article>)}</div><Tip asset="coin" title="Xem phần thưởng trước khi giao">Mỗi đơn có yêu cầu và phần thưởng riêng. Nông sản được lấy từ kho khi giao đơn.</Tip></>}
        {tab==='explore' && <><div className="farm-guide-heading"><small>BÌNH MINH CHỜ BẠN</small><h3>Ra ngoài khám phá</h3><p>Mở bản đồ nhỏ để xem vị trí và các điểm đến trong thế giới.</p></div><Tip asset="fish" title="Hồ câu & tiệm đồ câu">Mua cần tại tiệm, ra hồ thả câu rồi mang cá đi bán để kiếm xu cho lô đất đầu tiên.</Tip><Tip asset="land" title="Chọn đất lập nghiệp">Xem giá lô bạn muốn mua, vị trí và số xu hiện có. Sau khi mua, bắt đầu với các ô trồng được mở.</Tip><Tip asset="shop" title="Cửa hàng vật tư">Mua hạt giống và vật tư phù hợp với cấp nhân vật. Kiểm tra giá trước khi mua.</Tip><Tip asset="quest" title="Điểm danh mỗi ngày">Mở Menu → Điểm danh để nhận quà. Badge trên menu báo khi còn quà; ngày mới bắt đầu lúc 07:00 giờ Việt Nam.</Tip><Tip asset="camera" title="Hai góc nhìn">Chọn Khám phá để nhìn về phía chân trời, Canh tác để quan sát ô đất từ trên cao trong Thiết lập.</Tip></>}
        {tab==='vehicles' && <><div className="farm-guide-heading"><small>ĐI XA HƠN MỖI NGÀY</small><h3>Chọn bạn đồng hành</h3><p>Mở Gọi xe để chọn phương tiện đã sở hữu. Giá dưới đây là giá trong danh mục game.</p></div><div className="farm-guide-vehicles">{VEHICLE_LIST.map(vehicle=><article key={vehicle.id}><span className="farm-guide-vehicle-art"><HudIcon asset={vehicle.id==='walk'?'sprint':'bike'} size={36}/></span><div><h4>{vehicle.name}</h4><p>{vehicle.category} · {vehicle.speed} m/s</p></div><small>{vehicle.id==='walk'?'Có sẵn':`${money(vehicle.cost)} xu`}</small></article>)}</div><Tip asset="bike" title="Xe đạp từ hành trình tân thủ">Hoàn thành hướng dẫn cùng Oliver để nhận xe đạp. Phương tiện chỉ dùng được khi đã sở hữu.</Tip></>}
      </div></div>
      <footer className="farm-guide-footer">{hasFarm&&onResetTutorial?<div>{confirmReset?<><span>Chơi lại chuỗi hướng dẫn?</span><button className="farm-guide-reset" onClick={onResetTutorial}>Chơi lại</button><button className="farm-guide-reset" onClick={()=>setConfirmReset(false)}>Hủy</button></>:<button className="farm-guide-reset" onClick={()=>setConfirmReset(true)}>Chơi lại hướng dẫn</button>}</div>:<span>Mở sổ tay bất cứ lúc nào từ Thiết lập</span>}<button className="farm-guide-primary" onClick={onClose}>Tiếp tục chơi</button></footer>
    </section>
  </div>;
}
