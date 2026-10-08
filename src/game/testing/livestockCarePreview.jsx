import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {LivestockPanel} from '../../components/LivestockPanel.jsx';
import {LivestockRefresh} from '../../components/LivestockRefresh.jsx';
import {applyLivestockAction} from '../../../shared/livestockActions.js';
import '../../../src/styles.css';
import '../../../src/game-ui.css';
function Preview(){const now=Date.now();const [player,setPlayer]=useState(()=>({progress:{coins:12500,barnLevel:2,xp:0,stats:{animalsFed:0},inventory:{egg:2,milk:1},animalPens:{chicken:true,duck:true,pig:true,cow:true,sheep:true}},livestock:[{id:'a',species:'chicken',fedAt:0,productReadyAt:0},{id:'b',species:'chicken',fedAt:now-30000,productReadyAt:now+60000},{id:'c',species:'chicken',fedAt:now-100000,productReadyAt:now-10000},{id:'d',species:'pig',fedAt:now-700000,productReadyAt:now-10000},{id:'e',species:'cow',fedAt:0,productReadyAt:0}]}));return <main className="game-shell"><div className="panel-backdrop"><section className="game-panel livestock-game-panel" role="dialog" aria-label="Chuồng trại"><header><div><small>NÔNG TRẠI VUI VẺ</small><h2>Chuồng Trại & Thú Nuôi</h2></div><button aria-label="Đóng" onClick={()=>location.href='/livestock-preview.html'}>✕</button></header><LivestockRefresh>{now=><LivestockPanel progress={player.progress} animals={player.livestock} focus={{species:'chicken',id:'a'}} now={now} connected onAction={(action,payload)=>{const next=structuredClone(player);applyLivestockAction(next,action,payload);setPlayer(next);}}/>}</LivestockRefresh></section></div></main>;}
createRoot(document.getElementById('root')).render(<Preview/>);
