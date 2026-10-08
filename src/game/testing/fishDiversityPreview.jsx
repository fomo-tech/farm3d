import React from 'react';
import {createRoot} from 'react-dom/client';
import {FISHING_CONFIG} from '../../../shared/fishingConfig.js';
import {useInventoryMeshArt} from '../../components/useInventoryMeshArt.js';
const fish=Object.values(FISHING_CONFIG.fish),items=fish.map(f=>({id:`diversity-${f.id}`,itemId:f.id}));
function Preview(){const images=useInventoryMeshArt(true,'fish',items);return <main style={{background:'#eef1e2',padding:18,fontFamily:'system-ui',color:'#425c53',minHeight:'100vh',boxSizing:'border-box'}}><h1 style={{margin:'0 0 12px',fontSize:22}}>21 loài cá · Mỗi mẻ câu một bất ngờ</h1><div style={{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',gap:10}}>{fish.map(f=><article key={f.id} style={{background:'#fff9ed',borderRadius:18,textAlign:'center',padding:'8px 5px'}}><div style={{height:130}}>{images[`diversity-${f.id}`]&&<img style={{width:'100%',height:'100%',objectFit:'contain'}} src={images[`diversity-${f.id}`]} alt={f.name}/>}</div><b style={{fontSize:13}}>{f.name}</b><p style={{fontSize:11,margin:'4px 0'}}>{f.weight[0]}–{f.weight[1]} kg</p></article>)}</div></main>};createRoot(document.getElementById('root')).render(<Preview/>);
