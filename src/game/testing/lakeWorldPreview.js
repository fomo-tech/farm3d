import { FarmWorld } from '../world/FarmWorld.js';
import { VENUE_LAYOUT } from '../../../shared/venueLayout.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
const canvas=document.querySelector('#game'),status=document.querySelector('#status');
const buttons=[...document.querySelectorAll('button')];buttons.forEach(button=>button.disabled=true);
let world;
world=new FarmWorld(canvas,text=>status.textContent=text,{
  initialLocation:{x:122,y:0,z:2},graphicsQuality:'balanced',
  getPlayerName:()=> 'Kiểm tra hồ',getPlayerFarmId:()=>null,
  onReady:()=>{buttons.forEach(button=>button.disabled=false);status.textContent='Map thật · kiểm tra cục bộ, không ghi tài khoản';},
  onFatalError:message=>status.textContent=message,
});
document.querySelector('#dock').onclick=()=>world.player.moveTo(new Vector3(162,0,2));
document.querySelector('#door').onclick=()=>{
  const entrance=VENUE_LAYOUT.fishing.entrance;
  const route=[[122,2],[113,2],[113,-16],[entrance.x,entrance.z]];
  const next=()=>{const point=route.shift();if(point)world.player.moveTo(new Vector3(point[0],0,point[1]),next);};
  next();
};
document.querySelector('#enter').onclick=()=>world.enterVenue('fishing');
document.querySelector('#exit').onclick=()=>world.exitVenue();
document.querySelector('#overview').onclick=()=>{const camera=world.scene.activeCamera;camera.radius=90;camera.beta=.65;camera.alpha=Math.PI;};
document.querySelector('#audit').onclick=()=>{
  const meshes=world.scene.meshes.filter(mesh=>{
    if(!mesh.getTotalVertices())return false;
    mesh.computeWorldMatrix(true);
    const b=mesh.getBoundingInfo().boundingBox;
    return b.minimumWorld.x<142&&b.maximumWorld.x>124&&b.minimumWorld.z<4.4&&b.maximumWorld.z>-.4&&b.minimumWorld.y<3&&b.maximumWorld.y>.6;
  }).map(mesh=>({name:mesh.name,parent:mesh.parent?.name,enabled:mesh.isEnabled()}));
  document.querySelector('#report').textContent=JSON.stringify({approachObjects:meshes,world:world.getDebugState()},null,2);
};
const interval=setInterval(()=>{
  const p=world.player?.root.position;
  document.querySelector('#metrics').textContent=JSON.stringify({x:p?.x.toFixed(1),z:p?.z.toFixed(1),venue:world.currentVenue,
    fps:Math.round(world.engine.getFps()),boot:world.bootTimings,lake:world.openWorld?.romanticLake?.root.metadata},null,2);
},1000);
addEventListener('pagehide',()=>{clearInterval(interval);world.dispose();},{once:true});
