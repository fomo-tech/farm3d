import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {CasinoGames} from './components/CasinoGames.jsx';
// Development-only visual test. Uses the isolated live server, never fake snapshots.
function Playtest(){const[state,setState]=useState(null),[coins,setCoins]=useState(0),[connected,setConnected]=useState(false),[message,setMessage]=useState(''),[socket,setSocket]=useState(null);
 useEffect(()=>{const ws=new WebSocket('ws://127.0.0.1:18991');setSocket(ws);ws.onopen=()=>{setConnected(true);ws.send(JSON.stringify({type:'join',playerId:'player_casino_playtest_main',sessionToken:'isolated-casino-playtest',name:'Playtest'}));};ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==='casino_state')setState(m);if(m.type==='account_state'){setCoins(m.progress.coins);if(m.result?.casinoSettlement)setMessage(`Nhận ${m.result.casinoSettlement.reward} xu`);}if(m.type==='action_error'||m.type==='auth_error')setMessage(m.message);};ws.onclose=()=>setConnected(false);return()=>ws.close();},[]);
 return <CasinoGames state={state} coins={coins} connected={connected} inside={true} message={message} onAction={payload=>{setMessage('');socket?.send(JSON.stringify({type:'game_action',action:'casino',requestId:crypto.randomUUID(),payload}));}} onExit={()=>setMessage('Playtest riêng: quay về game chính tại /')}/>;
}
createRoot(document.getElementById('root')).render(<Playtest/>);
