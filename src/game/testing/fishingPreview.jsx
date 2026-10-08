import {createRuntimeId} from '../runtime/BrowserRuntime.js';
import {getFishingConditions,fishingBiteBounds} from '../../../shared/fishingConditions.js';
// UI-only fixture. Does not contact production or award account inventory.
import React,{useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {FishingHUD} from '../../components/FishingHUD.jsx';
import {normalizeFishingState} from '../../../shared/fishingConfig.js';
import {advanceFishingSession, fishingFightProfile,normalizeCastInput,FISHING_GAME} from '../../../shared/fishingSession.js';
const params=new URLSearchParams(location.search);
const preset=params.get('state');
function Preview(){
 const current=useRef(normalizeFishingState({ownedRods:['rod_bamboo'],equippedRod:'rod_bamboo'}));
 if(!current.current.previewInitialized){current.current.previewInitialized=true;if(preset==='caught')current.current.fish.golden_carp={count:1,totalWeight:2.48,maxWeight:2.48};const now=Date.now();if(['waiting','bite','fighting'].includes(preset))current.current.pending={id:'ui-preview',phase:preset==='fighting'?'fighting':'waiting',biteAt:now+(preset==='bite'?-1000:3600000),expiresAt:preset==='bite'?now+FISHING_GAME.hookWindowMs-1000:now+7200000,rodId:'rod_bamboo',fishId:'golden_carp',tension:Number(params.get('tension')||58),pull:67,sequence:0,lastPulseAt:now+7200000,hookedAt:now-3500};if(current.current.pending?.phase==='fighting')current.current.pending.fightProfile=fishingFightProfile(current.current.pending);}
 const [fishing,setFishing]=useState(current.current),[caught,setCaught]=useState(preset==='caught'?{fishCaught:'golden_carp',rarity:'legendary',weight:2.48,value:85}:null),[status,setStatus]=useState('Fixture UI riêng · không ghi tài khoản · test Mongo chạy bằng script');
 const send=(action,payload)=>{
  if(preset){setStatus(`Đã thử ${action}`);return;}
  try{const result=advanceFishingSession(current.current,action,payload,{x:162,z:2});if(result.fishCaught)setCaught(result);if(result.fishEscaped)setStatus(result.fishEscaped);setFishing({...current.current});}
  catch(error){setStatus(error.message);}
 };
 const cast=(input={})=>{const {power,aim}=normalizeCastInput(input);setStatus(`Hướng ${aim} · lực ${Math.round(power*100)}%`);const now=Date.now();const bounds=fishingBiteBounds('lake',null,'rod_bamboo',now);const biteAt=now+Math.round((bounds.minMs+bounds.maxMs)/2);current.current.pending={conditionDay:bounds.dayKey,density:bounds.condition,id:createRuntimeId('event'),zone:'lake',x:162,z:2,phase:'waiting',rodId:'rod_bamboo',biteAt,expiresAt:biteAt+FISHING_GAME.hookWindowMs,fishId:'carp',weight:1.2,castPower:power,aim,castDistance:8*(.7+.3*power)};setFishing({...current.current});};
 return <main style={{height:'100dvh',background:'linear-gradient(#a5d4e5 0 25%,#79b3b8 25% 48%,#799553 48% 100%)',fontFamily:'system-ui',position:'relative'}}>
  <div style={{padding:24,color:'#183f50'}}><h1>Câu cá · dữ liệu thử</h1><p>{status}</p><p>F thả câu → chờ cá cắn → F giật cần. Mọi loài cá đều cần kéo; chú ý tín hiệu trước khi cá vùng.</p></div>
  <FishingHUD conditions={getFishingConditions()} fishing={fishing} connected={!params.has('offline')} water="lake" send={send} cast={cast} serverOffset={0} caught={caught} clearCaught={()=>setCaught(null)}/>
 </main>;
}
const previewRoot=import.meta.hot?.data.previewRoot||createRoot(document.querySelector('#root'));
if(import.meta.hot)import.meta.hot.data.previewRoot=previewRoot;
previewRoot.render(<Preview/>);
