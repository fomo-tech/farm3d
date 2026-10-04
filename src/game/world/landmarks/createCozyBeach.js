import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import '@babylonjs/core/Meshes/instancedMesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { BEACH_CONFIG } from '../../../../shared/beachConfig.js';
import { getWorldChunkStreamer } from '../WorldChunkStreamer.js';
import { createPromenadePaverTexture } from '../nature/StylizedWaterEngine.js';

export function createCozyBeach(scene, shadows, scheduler) {
  const root=new TransformNode('cozy-beach',scene), streamer=getWorldChunkStreamer(scene);
  const ownedMaterials=[], ownedTextures=[], unregister=[], signMaterials=new Map(), templates=new Map(); let disposed=false;
  const belongs=(point,zone)=>BEACH_CONFIG.zones.reduce((best,item)=>Math.hypot(point[0]-item.x,point[1]-item.z)<Math.hypot(point[0]-best.x,point[1]-best.z)?item:best,BEACH_CONFIG.zones[0]).id===zone.id;
  const mats=Object.fromEntries(Object.entries(BEACH_CONFIG.colors).map(([id,hex])=>{
    const mat=new StandardMaterial(`cozy-beach-${id}`,scene); mat.diffuseColor=Color3.FromHexString(hex); mat.specularColor=Color3.Black();
    ownedMaterials.push(mat); return [id,mat];
  }));
  const promenadePaverTex = createPromenadePaverTexture(scene, 256);
  if (promenadePaverTex && typeof promenadePaverTex.getClassName === 'function') {
    promenadePaverTex.uScale = 32;
    promenadePaverTex.vScale = 2;
    mats.stone.diffuseTexture = promenadePaverTex;
    mats.stone.diffuseColor = Color3.White();
    ownedTextures.push(promenadePaverTex);
  }
  function primitive(kind,name,options,color) {
    const key=JSON.stringify([kind,options,color]); let source=templates.get(key);
    if(!source) {
      source=MeshBuilder[kind](`beach-template-${templates.size}`,options,scene);
      source.parent=root;source.isVisible=false;source.isPickable=false;source.receiveShadows=true;source.material=mats[color];templates.set(key,source);
    }
    const instance=source.createInstance(`cozy-beach-${name}`);instance.isVisible=true;instance.isPickable=false;return instance;
  }
  function box(parent,name,x,y,z,w,h,d,color='wood',shadow=false) {
    const m=primitive('CreateBox',name,{width:w,height:h,depth:d},color);
    m.position.set(x,y,z); m.parent=parent;
    if(shadow) shadows?.addShadowCaster(m); return m;
  }
  function cylinder(parent,name,x,y,z,height,diameter,color,top=diameter) {
    const m=primitive('CreateCylinder',name,{height,diameterBottom:diameter,diameterTop:top,tessellation:8},color);
    m.position.set(x,y,z); m.parent=parent; return m;
  }
  function palm(parent,x,z,seed=0,simple=false) {
    const h=4.2+(seed%3)*.4;
    const trunk=cylinder(parent,'palm-trunk',x,h/2+.15,z,h,.38,'trunk',.24); trunk.rotation.z=.08*Math.sin(seed+1);
    if(simple) {
      const crown=primitive('CreateSphere','palm-lod',{diameter:3,segments:4},'palm');
      crown.scaling.y=.23; crown.position.set(x,h+.2,z); crown.parent=parent; return;
    }
    for(let i=0;i<6;i++) {
      const leaf=primitive('CreateSphere',`frond-${i}`,{diameter:1,segments:4},'palm');
      const a=i*Math.PI/3;
      leaf.scaling.set(.42,.14,2.3); leaf.rotation.set(.2,a,0); leaf.position.set(x+Math.sin(a)*.8,h+.1,z+Math.cos(a)*.8);
      leaf.parent=parent;
    }
  }
  function seat(parent,x,z,angle=0) {
    const node=new TransformNode('cozy-beach-seat',scene); node.position.set(x,0,z); node.rotation.y=angle; node.parent=parent;
    box(node,'seat',0,.48,0,2,.15,.7,'wood'); box(node,'back',0,.9,-.3,2,.65,.12,'wood');
    for(const side of [-1,1]) box(node,'leg',side*.75,.28,0,.13,.4,.55,'darkWood');
  }
  function sign(parent,text,x,y,z) {
    const board=box(parent,'sign',x,y,z,4,.95,.16,'wood');
    // No DynamicTexture allocation in headless tests or distant LOD.
    if (typeof document==='undefined') return board;
    let mat=signMaterials.get(text);
    if(!mat) {
      const tex=new DynamicTexture(`beach-sign-${text}`,{width:512,height:128},scene,false); ownedTextures.push(tex);
      tex.drawText(text,null,82,'bold 36px Arial','#423b31',BEACH_CONFIG.colors.cream,true);
      mat=new StandardMaterial(`beach-sign-text-${text}`,scene); mat.emissiveTexture=tex; mat.emissiveColor=Color3.Black(); mat.disableLighting=true; ownedMaterials.push(mat);signMaterials.set(text,mat);
    }
    const face=MeshBuilder.CreatePlane('cozy-beach-sign-face',{width:3.85,height:.85},scene);
    face.position.set(x,y,z-.086); face.parent=parent; face.material=mat; face.isPickable=false;
  }
  // Continuous ground-level route and pier survive detail swaps; no raised deck to walk through.
  box(root,'promenade',0,.18,328,2*(BEACH_CONFIG.coast.halfWidth+BEACH_CONFIG.sideBeach.pathOffset),.06,5,'stone');
  box(root,'entrance-path',0,.19,318,8,.06,16,'stone');
  const pier=BEACH_CONFIG.fishingPier;
  box(root,'fishing-pier',pier.x,pier.deckY-.03,(pier.landStart+pier.z)/2,pier.width,.06,pier.z-pier.landStart,'wood');
  for (const zone of BEACH_CONFIG.zones) {
    let detail=null, generation=0, cancelLoad=null;
    const lod=new TransformNode(`beach-${zone.id}-lod`,scene); lod.parent=root; lod.metadata={beachZone:zone.id,lod:true};
    for (const [i,p] of BEACH_CONFIG.palms.entries()) if (belongs(p,zone)) palm(lod,...p,i,true);
    if(zone.kind==='resort') for(const [x,z] of BEACH_CONFIG.loungers) cylinder(lod,'umbrella-lod',x,2.3,z,.65,3,'coral',.1);
    function* build(node) {
      for(const [i,p] of BEACH_CONFIG.palms.entries()) if(belongs(p,zone)) { palm(node,...p,i); yield; }
      if(zone.kind==='entrance') {
        for(const side of [-1,1]) cylinder(node,'entry-post',side*5,1.7,320,3,.24,'wood');
        sign(node,'BIỂN BÌNH MINH',0,2.9,320); yield;
        box(node,'coconut-counter',-22,.7,331,6,1.1,2,'wood',true);
        for(const side of [-1,1]) cylinder(node,'counter-post',-22+side*3,1.5,331,2.7,.18,'wood');
        box(node,'counter-canopy',-22,2.8,331,7,.16,3,'coral'); sign(node,'QUẦY DỪA',-22,2.2,329.9);
        [-23.2,-20.8].forEach((cx,cIdx)=>{ cylinder(node,`counter-coconut-${cIdx}`,cx,1.38,331,.28,.28,'trunk'); });
        cylinder(node,'counter-dispenser',-24.4,1.48,331,.55,.36,'blue'); yield;
      } else if(zone.kind==='promenade') {
        for (const offset of [-12,0,12]) { seat(node,zone.x+offset,331); yield; }
        for(const offset of [-18,18]) {
          cylinder(node,'lamp',zone.x+offset,1.3,329,2.3,.12,'darkWood');
          cylinder(node,'lamp-cap',zone.x+offset,2.5,329,.25,.45,'cream');
          cylinder(node,`pot-${zone.x+offset}`,zone.x+offset,.36,327.2,.4,.6,'stone');
          const bloom=primitive('CreateSphere',`bloom-${zone.x+offset}`,{diameter:.65,segments:4},'palm');
          bloom.position.set(zone.x+offset,.66,327.2); bloom.parent=node; yield;
        }
      } else if(zone.kind==='resort') {
        for(const [i,[x,z]] of BEACH_CONFIG.loungers.entries()) {
          cylinder(node,'umbrella-pole',x,1.2,z,2.2,.09,'wood');
          cylinder(node,'umbrella',x,2.4,z,.7,3.3,i%2?'blue':'coral',.08);
          box(node,'lounger-seat',x,.38,z+1,1.1,.15,2,'cream');
          const back=box(node,'lounger-back',x,.65,z+.2,1.1,.12,.9,'cream'); back.rotation.x=-.55;
          for(const side of [-1,1]) box(node,'lounger-leg',x+side*.42,.2,z+1,.12,.3,1.4,'wood');
          cylinder(node,`resort-table-${x}`,x-.8,.28,z+1,.35,.55,'wood');
          cylinder(node,`resort-cup-${x}`,x-.8,.52,z+1,.16,.12,i%2?'coral':'blue'); yield;
        }
        box(node,'sandcastle',55,.4,349,1.2,.55,1.2,'sand');
        [[-1,58,347,'blue'],[1,60,348,'coral']].forEach(([tilt,sx,sz,col],sIdx)=>{
          const sb=box(node,`surfboard-${sIdx}`,sx,1.1,sz,.45,2.2,.08,col);
          sb.rotation.z=tilt*.15; sb.rotation.y=.25;
        });
        const ball=primitive('CreateSphere','beach-ball',{diameter:.65,segments:8},'coral');
        ball.position.set(53.6,.45,348.2); ball.parent=node;
        const towel=box(node,'beach-towel',38,.22,347,1.4,.02,2.4,'coral');
        towel.rotation.y=.15; yield;
      } else if(zone.kind==='fishing') {
        sign(node,'BẾN CÂU BÌNH MINH',pier.x,2.1,341);
        box(node,'fishing-counter',-70,.7,343,4,1.1,2,'blue',true); yield;
        const npc=new TransformNode('beach-fisher',scene);npc.parent=node;npc.position.set(BEACH_CONFIG.vendor.x,.15,BEACH_CONFIG.vendor.z);
        cylinder(npc,'fisher-body',0,1,0,.9,.45,'blue');
        const head=primitive('CreateSphere','fisher-head',{diameter:.55,segments:8},'skin');head.parent=npc;head.position.y=1.68;
        cylinder(npc,'fisher-hat',0,2,0,.13,.75,'cream');
        for(const side of [-1,1]) { const eye=primitive('CreateSphere','fisher-eye',{diameter:.06,segments:4},'ink');eye.parent=npc;eye.position.set(side*.11,1.7,-.24); }
        sign(node,'ĐỒ CÂU · NHẤN E',-74.2,1.8,342);
        cylinder(node,'vendor-sign-post',-74.2,.9,342,1.6,.12,'wood'); yield;
        for(let z=345;z<=361;z+=4) { for(const side of [-1,1]) cylinder(node,'pier-post',pier.x+side*(pier.width/2-.1),.65,z,1,.14,'wood'); yield; }
        seat(node,-76,348); yield;
      } else if(zone.kind==='lookout') {
        seat(node,zone.x-4,zone.z-4); seat(node,zone.x+4,zone.z-4); yield;
        for(const i of [0,1,2]) { const rock=MeshBuilder.CreateSphere('cozy-beach-rock',{diameter:1.8,segments:4},scene); rock.position.set(zone.x+i*2,.4,zone.z+4); rock.scaling.y=.45; rock.material=mats.stone; rock.parent=node; rock.isPickable=false; yield; }
        cylinder(node,'lookout-pedestal',zone.x,.65,zone.z+1,1.3,.32,'stone');
        const scope=cylinder(node,'lookout-scope',zone.x,1.35,zone.z+1,.75,.14,'darkWood');
        scope.rotation.x=-Math.PI/6;
        sign(node,'GÓC NGẮM BIỂN',zone.x,1.7,zone.z-7); yield;
      }
    }
    const unload=()=>{ generation++; cancelLoad?.(); cancelLoad=null; detail?.dispose(); detail=null; };
    unregister.push(streamer.register(`beach:${zone.id}`,zone.x,zone.z,{
      detailDistance:BEACH_CONFIG.streaming.detailDistance, keepDistance:BEACH_CONFIG.streaming.keepDistance,
      showLod:()=>lod.setEnabled(true), hideLod:()=>lod.setEnabled(false), unload,
      load:()=>new Promise(resolve=>{
        if(disposed) return resolve(false);
        const token=++generation, node=new TransformNode(`beach-${zone.id}-detail`,scene); node.parent=root;
        node.metadata={beachZone:zone.id}; node.setEnabled(false);
        const iterator=build(node); let settled=false;
        cancelLoad=()=>{if(!settled){settled=true;iterator.return?.();node.dispose();resolve(false);}};
        function* work() {
          try {
            while(!disposed && token===generation && !scene.isDisposed) { const step=iterator.next(); if(step.done){detail=node;node.setEnabled(true);settled=true;cancelLoad=null;resolve(true);return;} yield; }
          } finally { if(!settled){settled=true;node.dispose();resolve(false);} }
        }
        const task=work();
        if(scheduler) scheduler.enqueue(task,1,`beach:${zone.id}`);
        else { const pump=()=>{if(task.next().done)return;setTimeout(pump,0);};pump(); }
      }),
    }));
  }
  const dispose=()=>{ if(disposed)return;disposed=true; for(const fn of unregister)fn();root.dispose(); for(const t of ownedTextures)t.dispose();for(const m of ownedMaterials)m.dispose(); };
  scene.onDisposeObservable.addOnce(dispose);
  return {root,dispose};
}
