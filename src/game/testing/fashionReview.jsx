import React from 'react';
import {createRoot} from 'react-dom/client';
import {TOPS,BOTTOMS,SHOES} from '../../../shared/fashionConfig.js';
import {useInventoryMeshArt} from '../../components/useInventoryMeshArt.js';
const group=new URLSearchParams(location.search).get('group')||'tops';
const catalog={tops:TOPS,bottoms:BOTTOMS,shoes:SHOES}[group]||TOPS;
const items=catalog.map(item=>({id:`customization:${item.id}`,itemId:item.id,previewGender:'female'}));
function Review(){const images=useInventoryMeshArt(true,'fashion',items);return <main style={{background:'#e8eff1',padding:18,fontFamily:'system-ui',color:'#25394c',minHeight:'100vh'}}><h1 style={{fontSize:22,margin:'0 0 12px'}}>Trang phục nữ · {catalog.length} món</h1><nav style={{marginBottom:12}}><a href="?group=tops">Áo</a> · <a href="?group=bottoms">Quần / váy</a> · <a href="?group=shoes">Giày</a></nav><div style={{display:'grid',gridTemplateColumns:'repeat(8,minmax(0,1fr))',gap:8}}>{catalog.map(item=><article key={item.id} style={{background:'white',borderRadius:14,padding:6,textAlign:'center'}}><div style={{height:135}}>{images[`customization:${item.id}`]&&<img src={images[`customization:${item.id}`]} alt={item.name} style={{width:'100%',height:'100%',objectFit:'contain'}}/>}</div><b style={{fontSize:11}}>{item.name}</b></article>)}</div></main>};
createRoot(document.getElementById('root')).render(<Review/>);
