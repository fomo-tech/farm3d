import React,{useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {FarmToolDock} from '../../components/FarmToolDock.jsx';
import {CropHarvestHUD} from '../../components/CropHarvestHUD.jsx';
import {LivestockActionHUD} from '../../components/LivestockActionHUD.jsx';
import {CROPS} from '../../../shared/farmConfig.js';
import '../../components/FarmHudPolish.css';
function Preview(){
 const [view,setView]=useState('crop'),[selected,setSelected]=useState('carrot'),[tool,setTool]=useState('hand');
 const readyAt=useRef(Date.now()+1799000),closed=useRef(false),[ready,setReady]=useState(false);
 const worldRef=useRef();worldRef.current={farming:{getSelectedCropInfo:()=>closed.current?null:{name:CROPS[selected].name,readyAt:readyAt.current,remainingMs:ready?0:Math.max(0,readyAt.current-Date.now()),progress:ready?1:.3,ready,isOwner:true},interactTile:()=>{closed.current=true;},set selectedCropTile(value){closed.current=!value;}}};
 return <main className="game-shell" style={{position:'relative',width:'100vw',height:'100dvh',overflow:'hidden',fontFamily:'system-ui',background:'#819c6a'}}>
 <iframe title="Chuồng 3D" src="/livestock-preview.html?view=herd" style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0,pointerEvents:'none'}}/>
 <nav style={{position:'absolute',top:12,left:12,display:'flex',gap:6}}>{['crop','ready','herd','chicken','pig','duck'].map(id=><button style={{padding:8,borderRadius:12,border:0}} key={id} onClick={()=>{closed.current=false;setView(id);setReady(id==='ready');}}>{id}</button>)}</nav>
 {['crop','ready'].includes(view)?<CropHarvestHUD worldRef={worldRef}/>:<LivestockActionHUD target={view==='herd'?{}:{id:'a',species:view}} animals={view==='herd'?[]:[{id:'a',species:view,productReadyAt:0}]} progress={{level:8,coins:5000,animalPens:{}}} connected onClose={()=>setView('crop')} onAction={()=>setView('crop')}/>}
 <FarmToolDock crops={CROPS} progress={{level:8,selectedCrop:selected,inventory:{carrot:8},barnLevel:1}} connected activeTool={tool} selectTool={setTool} chooseCrop={crop=>setSelected(crop.id)} openHerd={()=>setView('herd')} openInventory={()=>{}} onAutoWork={()=>{closed.current=false;setView('ready');setReady(true);}}/>
 <div style={{position:'absolute',bottom:25,left:15,width:90,height:90,borderRadius:'50%',background:'#ffffff40',border:'3px solid #ffffff80',display:'grid',placeItems:'center',pointerEvents:'none'}}><i style={{width:35,height:35,borderRadius:'50%',background:'#31aad2',border:'3px solid white'}}/></div>
 <div style={{position:'absolute',bottom:25,right:15,width:62,height:62,borderRadius:'50%',background:'#58bbd8',border:'3px solid white',display:'grid',placeItems:'center',color:'white',fontWeight:800,pointerEvents:'none'}}>Nhảy</div>
 </main>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
