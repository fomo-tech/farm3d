import { FarmWorld } from '../world/FarmWorld.js';
const status=document.querySelector('#status');
let completed=0;
const world=new FarmWorld(document.querySelector('#game'),text=>status.textContent=text,{
 initialLocation:{x:0,y:0,z:0},graphicsQuality:'balanced',getPlayerFarmId:()=>null,getPlayerName:()=> 'Kiểm tra thoát kẹt',
 onReady:()=>{document.querySelectorAll('button').forEach(button=>button.disabled=false);status.textContent='World ready: vị trí cũ trong bồn nước đã được phục hồi';},
 onFatalError:message=>status.textContent=message,
});
document.querySelector('#restore').onclick=()=>{world.restorePlayerPosition({x:0,y:6,z:0});status.textContent='Đã khôi phục vị trí cũ trên bồn nước';};
document.querySelector('#unstuck').onclick=()=>{
 // Reproduce an already-trapped runtime avatar without modifying any account.
 world.player.root.position.set(0,0,0);
 world.player.moveTo({x:0,z:43},()=>status.textContent='Đã thoát collider và đi tới (0,43)');
};
document.querySelector('#walk').onclick=()=>{
 world.restorePlayerPosition({x:0,y:0,z:42});completed=0;
 const route=[[6,42],[0,42],[-6,42],[0,42],[0,48],[0,42],[0,36],[0,42]];
 const next=()=>{const point=route.shift();if(!point){status.textContent='PASS: đã đi và quay về từ cả bốn hướng';return;}world.player.moveTo({x:point[0],z:point[1]},()=>{completed++;next();});};next();
};
const timer=setInterval(()=>document.querySelector('#metrics').textContent=JSON.stringify({position:world.getPlayerState(),completedSegments:completed,boot:world.bootTimings},null,2),250);
addEventListener('pagehide',()=>{clearInterval(timer);world.dispose();},{once:true});
