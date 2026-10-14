import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import '../../gameStyles.js';
const review = new URLSearchParams(location.search).has('rotateReview');
if (review) {
 const sync = () => {
  const rotated = innerHeight > innerWidth;
  document.documentElement.classList.add('is-mobile-device');
  document.documentElement.classList.toggle('mobile-rotated', rotated);
  document.documentElement.classList.add('mobile-landscape');
  document.documentElement.style.setProperty('--game-viewport-width', `${rotated ? innerHeight : innerWidth}px`);
  document.documentElement.style.setProperty('--game-viewport-height', `${rotated ? innerWidth : innerHeight}px`);
 };
 sync(); window.addEventListener('resize', sync);
 if (import.meta.hot) import.meta.hot.dispose(() => window.removeEventListener('resize', sync));
}
import {GameStartScreen} from '../../components/GameStartScreen.jsx';
function StartPreview() {
 const [phase, setPhase] = useState(new URLSearchParams(location.search).get('phase') || (new URLSearchParams(location.search).has('loading') ? 'loading' : 'idle'));
 return <main id="game-viewport" className="game-shell pt-game-shell compact-game-hud hud-modal-open"><canvas className="game-canvas"/><GameStartScreen bootPhase={phase} bootProgress={{percentage:67,message:'Đang chuẩn bị vùng hiển thị…'}} playerName="Nông dân mới" playerLevel={1} googleLinked={new URLSearchParams(location.search).has('linked')} onRequestStart={()=>setPhase('loading')} /></main>;
}
createRoot(document.getElementById('root')).render(<StartPreview />);
