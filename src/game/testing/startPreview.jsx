import React from 'react';
import {createRoot} from 'react-dom/client';
import '../../styles.css';
import {GameStartScreen} from '../../components/GameStartScreen.jsx';
createRoot(document.getElementById('root')).render(<GameStartScreen bootPhase={new URLSearchParams(window.location.search).has("loading") ? "loading" : "idle"} bootProgress={{percentage:67,message:"Đang chuẩn bị vùng hiển thị…"}} playerName="Nông dân mới" playerLevel={1} googleLinked={new URLSearchParams(window.location.search).has('linked')} onRequestStart={()=>{}} />);
