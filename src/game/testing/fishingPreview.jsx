// UI-only fixture. Does not contact production or award account inventory.
import React,{useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {FishingHUD} from '../../components/FishingHUD.jsx';
import {normalizeFishingState} from '../../../shared/fishingConfig.js';
import {advanceFishingSession} from '../../../shared/fishingSession.js';
function Preview(){
 const current=useRef(normalizeFishingState({ownedRods:['rod_bamboo'],equippedRod:'rod_bamboo'}));
 const [fishing,setFishing]=useState(current.current),[caught,setCaught]=useState(null),[status,setStatus]=useState('Fixture UI riêng · không ghi tài khoản · test Mongo chạy bằng script');
 const send=(action,payload)=>{
  try{const result=advanceFishingSession(current.current,action,payload,{x:162,z:2});if(result.fishCaught)setCaught(result);if(result.fishEscaped)setStatus(result.fishEscaped);setFishing({...current.current});}
  catch(error){setStatus(error.message);}
 };
 const cast=()=>{const now=Date.now();current.current.pending={id:crypto.randomUUID(),zone:'lake',x:162,z:2,phase:'waiting',rodId:'rod_bamboo',biteAt:now+2500,expiresAt:now+4900,fishId:'carp',weight:1.2};setFishing({...current.current});};
 return <main style={{height:'100dvh',background:'linear-gradient(160deg,#b9e5e2,#418baa)',fontFamily:'system-ui',position:'relative'}}>
  <div style={{padding:24,color:'#183f50'}}><h1>Kiểm thử câu cá</h1><p>{status}</p><p>F thả câu → chờ cá cắn → F giật cần. Cá hiếm mới cần giữ/thả để kéo.</p></div>
  <FishingHUD fishing={fishing} connected water="lake" send={send} cast={cast} serverOffset={0} caught={caught} clearCaught={()=>setCaught(null)}/>
 </main>;
}
createRoot(document.querySelector('#root')).render(<Preview/>);
