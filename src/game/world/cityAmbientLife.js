import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {CITY_TRAFFIC_OFFSETS} from '../../../shared/cityTraffic.js';
export function createCityAmbientLife(scene,root,materials){
 const cars=CITY_TRAFFIC_OFFSETS.map((offset,index)=>{
  const node=new TransformNode(`city-traffic-${index}`,scene);node.parent=root;
  const part=(name,size,x,y,z,material)=>{const m=MeshBuilder.CreateBox(name,size,scene);m.parent=node;m.position.set(x,y,z);m.material=material;m.isPickable=false;return m;};
  part('traffic-body',{width:1.65,height:.65,depth:3.4},0,.55,0,materials[index===3?'white':['blue','red','silver'][index]]);
  part('traffic-cabin',{width:1.4,height:.6,depth:1.7},0,1.05,-.1,materials.window);
  for(const x of [-.82,.82])for(const z of [-1.1,1.1])part('traffic-wheel',{width:.2,height:.5,depth:.5},x,.32,z,materials.tire);
  const beacons=[];
  if(index===3)for(const x of [-.35,.35])beacons.push(part('patrol-beacon',{width:.4,height:.16,depth:.3},x,1.45,0,materials[x<0?'red':'blue']));
  node.setEnabled(false);return {node,offset,beacons};
 });
 const people=Array.from({length:6},(_,i)=>{
  const node=new TransformNode(`city-pedestrian-${i}`,scene);node.parent=root;
  const body=MeshBuilder.CreateCylinder('pedestrian-body',{height:1.15,diameter:.42,tessellation:6},scene);body.parent=node;body.position.y=.8;body.material=materials[i%2?'navy':'gold'];
  const head=MeshBuilder.CreateSphere('pedestrian-head',{diameter:.4,segments:6},scene);head.parent=node;head.position.y=1.55;head.material=materials.sandstone;
  return node;
 });
 const signalLamps=scene.meshes.filter(m=>m.metadata?.citySignal);
 return {update(now,player){
  const snapshot=scene.metadata?.cityTraffic;
  for(const lamp of signalLamps){const {axis,color}=lamp.metadata.citySignal;lamp.material=snapshot?.signals?.[axis]===color?materials[color==='amber'?'gold':color]:materials.tire;}
  const smoothing=1-Math.exp(-12*Math.min(.1,scene.getEngine().getDeltaTime()/1000));
  for(const [index,{node,beacons}] of cars.entries()){
   const p=snapshot?.cars?.[index];if(!p){node.setEnabled(false);continue;}
   const first=!node.metadata?.received;node.metadata={received:true};node.setEnabled(!player||Math.hypot(player.x-p.x,player.z-p.z)<220);
   const factor=first?1:smoothing;node.position.x+=(p.x-node.position.x)*factor;node.position.z+=(p.z-node.position.z)*factor;node.position.y=.08;
   const turn=Math.atan2(Math.sin(p.yaw-node.rotation.y),Math.cos(p.yaw-node.rotation.y));node.rotation.y+=turn*factor;
   beacons.forEach((beacon,i)=>{beacon.material=p.siren?(Math.floor(now/180)%2===i?materials[i?'blue':'red']:materials.tire):materials.silver;});
  }
  people.forEach((node,i)=>{const phase=(now/1000*.8+i*9)%60,z=-30+(phase<30?phase:60-phase)*2;node.position.set(52,.08,z);node.rotation.y=phase<30?0:Math.PI;node.setEnabled(!player||Math.hypot(player.x-52,player.z-z)<120);if(player&&Math.hypot(player.x-52,player.z-z)<4){node.position.x=52.7;node.rotation.y=-Math.PI/2;}});
 }};
}
