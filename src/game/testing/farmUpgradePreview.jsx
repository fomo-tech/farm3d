import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {FarmUpgradePanel} from '../../components/FarmUpgradePanel.jsx';
import {landUnlockQuote} from '../../../shared/landExpansionConfig.js';
import '../../styles.css';
import '../../game-ui.css';
function Preview(){
 const [selectedKey,onSelect]=useState('0:1');
 const [progress,setProgress]=useState({coins:12500,level:4,barnLevel:1,homeTier:1,unlockedTileKeys:['0:0','1:0','2:0','3:0'],inventory:{},freeSeeds:4});
 return <main className="game-shell"><div className="panel-backdrop"><section className="game-panel farm-upgrade-panel" role="dialog" aria-label="Nâng cấp nông trại"><header><div><small>MỞ RỘNG & NÂNG CẤP</small><h2>Nâng Cấp Nông Trại</h2></div><button aria-label="Đóng" onClick={()=>onSelect(null)}>✕</button></header><FarmUpgradePanel progress={progress} selectedKey={selectedKey} onSelect={onSelect} onUnlock={key=>setProgress(p=>{const q=landUnlockQuote(p,key);return q.error?p:{...p,coins:p.coins-q.cost,unlockedTileKeys:[...p.unlockedTileKeys,key]};})} connected ownsLand onUpgradeBarn={()=>setProgress(p=>({...p,barnLevel:p.barnLevel+1}))} onUpgradeHome={()=>setProgress(p=>({...p,homeTier:2}))}/></section></div></main>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
