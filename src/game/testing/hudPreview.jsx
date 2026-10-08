import {useGameNotifications} from '../../hooks/useGameNotifications.js';
import {LeaderboardModal} from '../../components/LeaderboardModal.jsx';
import {GameConfirm,GameToast} from '../../components/GameFeedback.jsx';
import {LandMarket} from '../../components/LandMarket.jsx';
import {FISHING_CONFIG} from '../../../shared/fishingConfig.js';
import {getFishingConditions} from '../../../shared/fishingConditions.js';
import {MissionBoard} from '../../components/MissionBoard.jsx';
import {QUESTS} from '../economy/GameProgress.js';
import {FishingShopModal} from '../../components/FishingShopModal.jsx';
import { FarmSuppliesModal } from '../../components/FarmSuppliesModal.jsx';
import { CasinoLobby } from '../../components/casino/CasinoLobby.jsx';
import '../../components/casino.css';
import { RoadsideShopModal } from '../../components/RoadsideShopModal.jsx';
import { VehicleShowroom } from '../../components/VehicleShowroom.jsx';
import { VEHICLE_LIST } from '../../../shared/vehicleConfig.js';
import { FarmGuideModal } from '../../components/FarmGuideModal.jsx';
import { FarmSettingsModal } from '../../components/FarmSettingsModal.jsx';
import { useDailyAttendance } from '../../hooks/useDailyAttendance.js';
import React, {useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import '../../styles.css';
import '../../components/CompactGameHud.css';
import {GameHudTopbar} from '../../components/GameHudTopbar.jsx';
import {OnboardingHUD} from '../../components/OnboardingHUD.jsx';
import {FarmMinimap} from '../../components/FarmMinimap.jsx';
import {HudContextAction} from '../../components/HudContextAction.jsx';
import {AvatarChatBar} from '../../components/chat/AvatarChatBar.jsx';
import {VehicleQuickMenu} from '../../components/VehicleQuickMenu.jsx';
import {HudIcon} from '../../components/icons3d/HudIcon.jsx';
import {loadProgress} from '../economy/GameProgress.js';
import PlayTogetherWorldMapModal from '../../components/PlayTogetherWorldMapModal.jsx';
import {PlayTogetherInventoryModal} from '../../components/PlayTogetherInventoryModal.jsx';
import {FashionBoutiqueModal} from '../../components/FashionBoutiqueModal.jsx';
import {PlazaEventNoticeModal} from '../../components/PlazaEventNoticeModal.jsx';
const initial=loadProgress(); initial.onboarding.characterCreated=true; initial.onboarding.step=1;initial.coins=1248;initial.gems=15;
const params=new URLSearchParams(location.search);
if(params.has('mobileReview')) {
 const syncReviewOrientation = () => {
  document.documentElement.classList.add('is-mobile-device');
  document.documentElement.classList.toggle('mobile-portrait', innerHeight > innerWidth);
  document.documentElement.classList.toggle('mobile-landscape', innerHeight <= innerWidth);
 };
 syncReviewOrientation(); window.addEventListener('resize', syncReviewOrientation);
 if(import.meta.hot) import.meta.hot.dispose(() => window.removeEventListener('resize', syncReviewOrientation));
}

const number=(key,fallback)=>{const raw=params.get(key);const value=raw===null?fallback:Number(raw);return Number.isFinite(value)?value:fallback;};
const mapState={x:number('mapX',0),z:number('mapZ',320),yaw:number('mapYaw',0)};
const mapHome=params.has('mapHome')?{id:'preview-home',label:'Nông trại của bạn',x:300,z:182}:null;
const mapGoal=params.has('mapGoal')?{id:'preview-goal',label:'Tiệm đồ câu',x:116.9,z:-16}:null;
function Preview(){
 const notices=useGameNotifications(params.has('notificationDemo'));
 const [questsOpen,setQuestsOpen]=useState(params.has('questsDemo'));const [questsTracked,setQuestsTracked]=useState(null);const [questsProgress,setQuestsProgress]=useState({...initial,onboarding:{...initial.onboarding,completed:!params.has('questsLocked')},unlockedPlots:params.has('questsLocked')?0:4,stats:{...initial.stats,harvested:3,planted:2,watered:1},missions:undefined});const [questsReward,setQuestsReward]=useState(null);
 const [feedbackConfirm,setFeedbackConfirm]=useState(params.has('feedbackDemo'));const [feedbackToast,setFeedbackToast]=useState(params.has('feedbackDemo')?'Sẵn sàng chọn nơi xây dựng nông trại.':'');
 const [landOpen,setLandOpen]=useState(params.has('landDemo'));
 const demoLots=Array.from({length:12},(_,index)=>({farmId:`farm_${String(index+1).padStart(6,'0')}`,lot:index+1,villageId:index<6?'binh-minh':'sen-hong',villageName:index<6?'Làng Bình Minh':'Làng Sen Hồng',price:6000+index*350,distance:420-index*25,available:!(params.has('landOwned')&&index===0),ownerId:params.has('landOwned')&&index===0?'demo-owner':null,userName:params.has('landOwned')&&index===0?'Nông dân vui vẻ':null}));
 const [fishingOpen,setFishingOpen]=useState(params.has('fishingShopDemo'));const [fishingProgress,setFishingProgress]=useState({...initial,fishing:{ownedRods:['rod_bamboo'],equippedRod:'rod_bamboo',bait:{bait_worm:10},fish:params.has('fishGalleryDemo')?Object.fromEntries(Object.values(FISHING_CONFIG.fish).map(fish=>[fish.id,{count:1,totalWeight:fish.weight[0],maxWeight:fish.weight[0]}])):{},collection:params.has('fishGalleryDemo')?Object.fromEntries(Object.values(FISHING_CONFIG.fish).map(fish=>[fish.id,{count:1,totalWeight:fish.weight[0],maxWeight:fish.weight[0]}])):{},stats:{},ownedTools:{}}});
 const [suppliesOpen,setSuppliesOpen]=useState(params.has('suppliesDemo'));const [suppliesProgress,setSuppliesProgress]=useState({...initial,level:params.has('suppliesLow')?1:5,coins:params.has('suppliesPoor')?2:1248,freeSeeds:params.has('suppliesFree')?3:0});
 const [loungeOpen,setLoungeOpen]=useState(params.has('loungeDemo'));const [loungeSound,setLoungeSound]=useState(false);
 const [marketOpen,setMarketOpen]=useState(params.has('marketDemo'));const [marketProgress,setMarketProgress]=useState({...initial,coins:params.has('marketPoor')?40:1248,inventory:params.has('marketFull')?{carrot:20}:{carrot:3,wheat:2,tomato:1}});
 const [dealerOpen,setDealerOpen]=useState(params.has('dealerDemo'));const [dealerOwned,setDealerOwned]=useState(['walk','bike']);const [dealerCurrent,setDealerCurrent]=useState('walk');const [dealerCoins,setDealerCoins]=useState(1248);
 const [guideOpen,setGuideOpen]=useState(params.has('guideDemo'));
 const [accountConfirm,setAccountConfirm]=useState(null);
 const [rankingOpen,setRankingOpen]=useState(params.has('rankingDemo'));
 const [settingsOpen,setSettingsOpen]=useState(params.has('settingsDemo'));const [muted,setMuted]=useState(false);const [quality,setQuality]=useState('ultra');const [camera,setCamera]=useState('explore');
 const [noticeRewards,setNoticeRewards]=useState({daily:[],codes:[]});const [noticeOpen,setNoticeOpen]=useState(params.has("noticeDemo"));const [fashionOpen,setFashionOpen]=useState(false);const [bagOpen,setBagOpen]=useState(false);const [status,setStatus]=useState('');const [mapOpen,setMapOpen]=useState(false);const [progress]=useState(initial);const world=useRef({getPlayerState:()=>mapState});
 const attendance=useDailyAttendance(noticeRewards.daily);
 const signal=label=>()=>setStatus(label);
 return <main className={`game-shell pt-game-shell compact-game-hud ${mapOpen||bagOpen||fashionOpen||noticeOpen||settingsOpen||guideOpen||dealerOpen||marketOpen||loungeOpen||suppliesOpen||fishingOpen||questsOpen?'hud-modal-open':''}`} style={{height:'100dvh',background:'linear-gradient(#a5d4e5 0 24%,#77b3c9 24% 29%,#cfbe88 29% 36%,#789451 36% 100%)'}}>
 <div aria-hidden="true" style={{position:"absolute",inset:0,background:"linear-gradient(#a5d4e5 0 24%,#77b3c9 24% 29%,#cfbe88 29% 36%,#789451 36% 100%)"}} />
 <div aria-hidden="true" style={{position:'absolute',inset:'36% 0 auto',height:24,background:'#acaa92',borderBottom:'8px solid #666e56'}} />
 {accountConfirm && <GameConfirm title={`${accountConfirm}?`} message="Bản xem thử: không thay đổi tài khoản hoặc xoá dữ liệu." confirmLabel={accountConfirm} asset={accountConfirm === "Đăng xuất" ? "logout" : "quest"} onCancel={()=>setAccountConfirm(null)} onConfirm={()=>setAccountConfirm(null)}/> }
 {rankingOpen&&<LeaderboardModal leaderboard={params.has('rankingEmpty')?[]:Array.from({length:12},(_,i)=>({playerId:`rank-${i}`,name:['Bơ Nhỏ','Nắng Mai','Mây Trắng','An Nhiên','Nông dân Bình Minh','Gió Hạ'][i%6],progress:{level:22-i,xp:25480-i*1650,homeTier:1+i%4}}))} myPlayer={{playerId:'rank-4',name:'Nông dân Bình Minh',progress:{level:18,xp:18880,homeTier:1}}} onVisitFarm={id=>setStatus(`Xem hồ sơ thử: ${id}`)} onAddFriend={id=>setStatus(`Kết bạn thử: ${id}`)} onClose={()=>setRankingOpen(false)}/>}
 <GameHudTopbar progress={progress} name="Người chơi mới" notifications dailyReward={!attendance.claimedToday} onMissions={()=>setQuestsOpen(true)} onProfile={signal('Hồ sơ')} onShop={signal('Cửa hàng')} onInventory={()=>setBagOpen(true)} onFashion={()=>setFashionOpen(true)} onCamera={signal('Đổi góc nhìn')} onPhone={()=>params.has("settingsDemo")?setSettingsOpen(true):setNoticeOpen(true)} />
 <OnboardingHUD progress={progress} targetDistance={mapGoal?Math.round(Math.hypot(mapGoal.x-mapState.x,mapGoal.z-mapState.z)):304} onNavigateFishing={signal('Chỉ đường đến tiệm câu')} onOpenMissions={signal('Sổ nhiệm vụ')} />
 <nav className="mission-hud-links" aria-label="Nhiệm vụ"><button aria-current="step" onClick={signal('Hành trình tân thủ')}><HudIcon asset="seeds" size={26}/><span>Tân thủ</span></button><button onClick={()=>setQuestsOpen(true)}><HudIcon asset="quest" size={26}/><span>Chính tuyến</span></button><button onClick={()=>setQuestsOpen(true)}><HudIcon asset="basket" size={26}/><span>Hằng ngày</span></button></nav>
 <FarmMinimap worldRef={world} farmTarget={mapHome} objectiveTarget={mapGoal} onOpenMap={()=>setMapOpen(true)} />
 <PlayTogetherWorldMapModal isOpen={mapOpen} onClose={()=>setMapOpen(false)} onTravel={d=>{setStatus(`Dịch chuyển thử: ${d.label}`);setMapOpen(false);}} worldRef={world} playerCoord={mapState} objectiveTarget={mapGoal} session={{farmId:params.has('mapHome')?'farm_000027':null}} coins={progress.coins}/>
 <PlayTogetherInventoryModal isOpen={bagOpen} onClose={()=>setBagOpen(false)} progress={params.has("marketDemo")?marketProgress:params.has("bagDemo")?{...progress,barnLevel:2,inventory:{carrot:8,wheat:12,tomato:5,strawberry:3,pumpkin:2,melon:1},ownedOutfits:["starter"],fishing:{ownedRods:["rod_bamboo"],equippedRod:"rod_bamboo",bait:{},fish:{}}}:progress} onUseItem={item=>setStatus(`Thử thao tác: ${item.name}`)} onOpenFashion={()=>setFashionOpen(true)}/>
 {fashionOpen && <FashionBoutiqueModal currentCustomization={progress.customization} ownedItems={progress.ownedCustomization||[]} coins={progress.coins} onClose={()=>setFashionOpen(false)} onSaveAndEquip={()=>{setStatus("Đã thử lưu trang phục");setFashionOpen(false);}}/>}
 {noticeOpen && <PlazaEventNoticeModal onClose={()=>setNoticeOpen(false)} connected={params.has('noticeConnected')} rewardState={noticeRewards} rewardNotice={status} onNavigateVenue={venue=>setStatus(`Ghé thăm thử: ${venue}`)} onClaimDailyReward={()=>setNoticeRewards(prev=>({...prev,daily:[new Date().toISOString().slice(0,10)]}))} onRedeemCode={code=>setStatus(`Mã đã nhập: ${code} (dữ liệu thử)`)}/>}
 {settingsOpen && <FarmSettingsModal name="Nông dân Bình Minh" level={7} googleLinked={params.has("settingsLinked")} isMuted={muted} onToggleAudio={()=>setMuted(v=>!v)} graphicsQuality={quality} onGraphicsChange={setQuality} cameraViewMode={camera} onCameraChange={()=>setCamera(v=>v==="explore"?"farm":"explore")} onLogout={()=>setAccountConfirm("Đăng xuất")} onDelete={()=>setAccountConfirm("Xoá tài khoản")} onGuide={()=>{setSettingsOpen(false);setGuideOpen(true);}} onClose={()=>setSettingsOpen(false)}/> }
 {guideOpen && <FarmGuideModal progress={params.has("guideFarm")?{...progress,onboarding:{...progress.onboarding,step:2}}:progress} hasFarm={params.has("guideFarm")} onClose={()=>setGuideOpen(false)} onNavigateStep={()=>setStatus("Dẫn đường thử")} onResetTutorial={()=>{setGuideOpen(false);setStatus("Chơi lại hướng dẫn thử");}}/>}
 {dealerOpen && <VehicleShowroom vehicles={VEHICLE_LIST} owned={dealerOwned} current={dealerCurrent} coins={dealerCoins} connected={!params.has("dealerOffline")} onClose={()=>setDealerOpen(false)} onBuy={vehicle=>{if(!dealerOwned.includes(vehicle.id)){setDealerCoins(v=>v-vehicle.cost);setDealerOwned(v=>[...v,vehicle.id]);}setDealerCurrent(vehicle.id);}}/>}
 {marketOpen && <RoadsideShopModal progress={marketProgress} connected={!params.has("marketOffline")} pending={params.has("marketPending")} onClose={()=>setMarketOpen(false)} onBuyOffer={offer=>setMarketProgress(p=>({...p,coins:p.coins-offer.price,inventory:{...p.inventory,[offer.crop]:(p.inventory[offer.crop]||0)+offer.amount}}))} onVisitShop={()=>setStatus("Dẫn đường tới quầy thử")} onOpenInventory={()=>{setMarketOpen(false);setBagOpen(true);}}/>}
 {loungeOpen && <CasinoLobby coins={1248} rooms={[{id:"demo-open",game:"tai-xiu",name:"Bàn giao lưu",stake:10,occupied:2,seats:8},{id:"demo-private",game:"tai-xiu",name:"Bàn bạn bè",stake:50,occupied:1,seats:8,private:true}]} connected={!params.has("loungeOffline")} inside={!params.has("loungeOutside")} sound={loungeSound} onToggleSound={()=>setLoungeSound(v=>!v)} onExit={()=>setLoungeOpen(false)} onJoin={()=>setStatus("Thử vào bàn")} onCreateRoom={()=>setStatus("Thử tạo bàn")} onQuickPlay={()=>setStatus("Thử vào bàn nhanh")}/> }
 {questsOpen&&<MissionBoard progress={questsProgress} legacyQuests={QUESTS} connected={!params.has('questsOffline')} initialTab={params.get('questTab')||'main'} trackedMission={questsTracked} rewardEvent={questsReward} onClose={()=>setQuestsOpen(false)} onTrack={(kind,id)=>setQuestsTracked(p=>p?.id===id&&p.kind===kind?null:{kind,id})} onNavigate={m=>setStatus(`Dẫn đường thử: ${m.title}`)} onClaim={(kind,m)=>{setQuestsProgress(p=>({...p,missions:{...p.missions,[kind]:{...p.missions?.[kind],claimed:[...(p.missions?.[kind]?.claimed||[]),m.id]}}}));setQuestsReward({sequence:Date.now(),kind,id:m.id,title:m.title,coins:m.coins,xp:m.xp});}} onClaimLegacy={m=>setQuestsProgress(p=>({...p,claimedQuests:[...(p.claimedQuests||[]),m.id]}))}/>}
 {feedbackConfirm&&<GameConfirm title="Mua lô đất đầu tiên?" message="Làng Bình Minh · Lô 1. Nhận nhà nhỏ và 4 ô trồng khởi đầu." price={6000} asset="land" confirmLabel="Mua đất" onCancel={()=>{setFeedbackConfirm(false);setFeedbackToast('Đã hủy thao tác. Bạn có thể chọn lô khác.');}} onConfirm={()=>{setFeedbackConfirm(false);setFeedbackToast('Đã mua đất thành công! Nông trại đã sẵn sàng.');}}/>}
 {feedbackToast&&<GameToast message={feedbackToast} onClose={()=>setFeedbackToast('')}/>}

 {landOpen&&<div className="panel-backdrop"><section className="game-panel land-game-panel" role="dialog" aria-modal="true" aria-label="Đất đai"><header><div><small>VĂN PHÒNG ĐẤT ĐAI</small><h2>Mua đất & Quyền sử dụng</h2></div><button aria-label="Đóng đất đai" onClick={()=>setLandOpen(false)}>×</button></header><LandMarket lots={demoLots} playerId="demo-owner" ownsLand={params.has('landOwned')} coins={7200} pending={false} onBuy={()=>setStatus('Mua thử · không ghi tài khoản')} onVisit={()=>setStatus('Đến làng thử')}/></section></div>}
 {fishingOpen && <FishingShopModal conditions={getFishingConditions()} progress={fishingProgress} connected={!params.has('fishingOffline')} onClose={()=>setFishingOpen(false)} onSellAll={()=>setStatus('Bán cá thử')} onAction={(action,{id})=>{setStatus(`Thử ${action}: ${id||'không mồi'}`);if(action==='fishing_equip')setFishingProgress(p=>({...p,fishing:{...p.fishing,...(id?.startsWith('rod_')?{equippedRod:id}:{equippedBait:id})}}));}}/>}
 {suppliesOpen && <FarmSuppliesModal progress={suppliesProgress} connected={!params.has("suppliesOffline")} onChooseCrop={crop=>setSuppliesProgress(p=>({...p,selectedCrop:crop.id}))} onClose={()=>setSuppliesOpen(false)}/> }
 <VehicleQuickMenu vehicles={[{id:'walk',name:'Đi bộ',speed:4,icon:<HudIcon mobile asset="sprint"/>},{id:'bike',name:'Xe đạp',speed:8,icon:<HudIcon asset="bike"/>}]} owned={['bike']} current="walk" connected onSelect={signal('Chọn phương tiện')} />
 <HudContextAction action={{label:'Chọn đất nông trại',hint:'Xem các lô đất đang bán',onClick:signal('Mở chợ đất')}} />
 <div className="world-action-controls pt-action-bubbles"><button className="pt-action-bubble pt-jump-bubble" aria-label="Nhảy" onClick={signal('Nhảy')}><HudIcon mobile asset="jump"/><b>Nhảy</b></button><button className="pt-action-bubble pt-run-bubble" aria-label="Chạy" onClick={signal('Chạy')}><HudIcon mobile asset="sprint"/><b>Chạy</b></button></div>
 <div className="virtual-joystick pt-joystick" role="group" aria-label="Điều khiển di chuyển"><span className="pt-joystick-knob">●</span></div>
 <AvatarChatBar onSendChat={()=>setStatus('Đã gửi chat thử')} />
 {params.has('notificationDemo')&&<><div style={{position:'absolute',left:'50%',top:'55%',transform:'translateX(-50%)',display:'flex',gap:8}}><button onClick={()=>{for(let i=0;i<20;i++)notices.setStatus('Đang đi tới ô đất…');}}>Di chuyển liên tục</button><button onClick={()=>{notices.setStatus('Đã nhận 100 xu!');notices.setStatus('Đang gieo cà rốt…');notices.setStatus('Đã nhận 100 xu!');}}>Nhận thưởng</button><button onClick={()=>notices.setStatus('Lỗi: Không đủ xu.')} >Thiếu xu</button></div>{notices.toast&&<GameToast message={notices.toast.message} kind={notices.toast.kind} onClose={notices.dismissToast}/>}</>}
 <output style={{position:'absolute',top:'45%',left:'50%',transform:'translateX(-50%)',padding:12,color:'#243c4c',background:status?'#fff':'transparent',borderRadius:12}}>{status}</output>
 </main>;
}
const previewRoot=import.meta.hot?.data.previewRoot || createRoot(document.getElementById('root'));
if(import.meta.hot)import.meta.hot.dispose(data=>{data.previewRoot=previewRoot;});
previewRoot.render(<Preview/>);
