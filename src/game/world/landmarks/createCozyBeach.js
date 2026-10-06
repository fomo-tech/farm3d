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
    const m=primitive('CreateCylinder',name,{height,diameterBottom:diameter,diameterTop:top,tessellation:12},color);
    m.position.set(x,y,z); m.parent=parent; return m;
  }
  function torus(parent,name,x,y,z,diameter,thickness,color,tessellation=14) {
    const m=primitive('CreateTorus',name,{diameter,thickness,tessellation},color);
    m.position.set(x,y,z); m.parent=parent; return m;
  }
  function sphere(parent,name,x,y,z,diameter,color,segments=8) {
    const m=primitive('CreateSphere',name,{diameter,segments},color);
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
    for(let c=0;c<3;c++) {
      const ca=(c*Math.PI*2)/3+0.3;
      sphere(parent,`coco-${c}`,x+Math.sin(ca)*.32,h-.06,z+Math.cos(ca)*.32,.34,'trunk',6);
    }
  }
  function seat(parent,x,z,angle=0) {
    const node=new TransformNode('cozy-beach-seat',scene); node.position.set(x,0,z); node.rotation.y=angle; node.parent=parent;
    box(node,'seat',0,.48,0,2,.15,.7,'wood'); box(node,'back',0,.9,-.3,2,.65,.12,'wood');
    for(const side of [-1,1]) box(node,'leg',side*.75,.28,0,.13,.4,.55,'darkWood');
  }
  function sign(parent,text,x,y,z,width=4,height=.95) {
    const board=box(parent,'sign',x,y,z,width,height,.16,'wood');
    if (typeof document==='undefined') return board;
    let mat=signMaterials.get(text);
    if(!mat) {
      const tex=new DynamicTexture(`beach-sign-${text}`,{width:512,height:128},scene,false); ownedTextures.push(tex);
      tex.drawText(text,null,82,'bold 36px Arial','#423b31',BEACH_CONFIG.colors.cream,true);
      mat=new StandardMaterial(`beach-sign-text-${text}`,scene); mat.emissiveTexture=tex; mat.emissiveColor=Color3.Black(); mat.disableLighting=true; ownedMaterials.push(mat);signMaterials.set(text,mat);
    }
    const face=MeshBuilder.CreatePlane('cozy-beach-sign-face',{width:width-.15,height:height-.1},scene);
    face.position.set(x,y,z-.086); face.parent=parent; face.material=mat; face.isPickable=false;
    return board;
  }
  // Continuous ground-level route and pier survive detail swaps; no raised deck to walk through.
  box(root,'promenade',0,.18,328,2*(BEACH_CONFIG.coast.halfWidth+BEACH_CONFIG.sideBeach.pathOffset),.06,5,'stone');
  box(root,'entrance-path',0,.19,318,8,.06,16,'stone');
  const pier=BEACH_CONFIG.fishingPier;
  box(root,'fishing-pier',pier.x,pier.deckY-.03,(pier.landStart+pier.z)/2,pier.width,.06,pier.z-pier.landStart,'wood');

  // Flock of seagulls cruising above the bay
  const seagullGroup=new TransformNode('beach-seagulls',scene); seagullGroup.parent=root;
  const seagulls=[];
  for(let s=0;s<4;s++) {
    const gBird=new TransformNode(`seagull-${s}`,scene); gBird.parent=seagullGroup;
    box(gBird,`gull-body-${s}`,0,0,0,.35,.22,.85,'white');
    for(const wSide of [-1,1]) {
      const wing=box(gBird,`gull-wing-${s}-${wSide}`,wSide*.65,.04,0,1.0,.03,.4,'white'); wing.rotation.z=wSide*.12;
      box(gBird,`gull-tip-${s}-${wSide}`,wSide*1.22,.06,0,.3,.03,.3,'ink');
    }
    box(gBird,`gull-beak-${s}`,0,-.04,.52,.1,.08,.22,'yellow');
    seagulls.push({node:gBird,angle:(s*Math.PI)/2,radius:40+s*6,speed:.28+s*.04,h:14+s*1.8});
  }
  const animObs=scene.onBeforeRenderObservable.add(()=>{
    const t=performance.now()*.001;
    for(const g of seagulls) {
      const a=g.angle+t*g.speed;
      g.node.position.set(Math.cos(a)*g.radius,g.h+Math.sin(t*1.5+g.angle)*.8,348+Math.sin(a)*(g.radius*.7));
      g.node.rotation.y=-a+Math.PI/2;
    }
  });
  unregister.push(()=>{ scene.onBeforeRenderObservable.remove(animObs); });

  for (const zone of BEACH_CONFIG.zones) {
    let detail=null, generation=0, cancelLoad=null;
    const lod=new TransformNode(`beach-${zone.id}-lod`,scene); lod.parent=root; lod.metadata={beachZone:zone.id,lod:true};
    for (const [i,p] of BEACH_CONFIG.palms.entries()) if (belongs(p,zone)) palm(lod,...p,i,true);
    if(zone.kind==='resort') for(const [x,z] of BEACH_CONFIG.loungers) cylinder(lod,'umbrella-lod',x,2.3,z,.65,3,'coral',.1);
    function* build(node) {
      for(const [i,p] of BEACH_CONFIG.palms.entries()) if(belongs(p,zone)) { palm(node,...p,i); yield; }
      if(zone.kind==='entrance') {
        // Cổng Chào Nhiệt Đới Play Together (Beach Welcome Gate)
        for(const side of [-1,1]) {
          cylinder(node,`gate-post-${side}`,side*6,2.0,320,4.0,.42,'wood');
          sphere(node,`gate-finial-${side}`,side*6,4.15,320,.62,'yellow');
        }
        box(node,'gate-arch-beam',0,3.85,320,12.6,.4,.36,'darkWood');
        sign(node,'SUNNY BEACH · BÃI BIỂN',0,3.85,320,6.4,1.15);
        sign(node,'BIỂN BÌNH MINH',0,2.5,320,4.0,.85);

        // Chuỗi cờ tam giác đuôi nheo đa sắc (Bunting flags)
        const flagColors=['yellow','pink','cyan','lime','orange','red','purple','yellow','cyan'];
        for(let f=0;f<9;f++) {
          const fx=-4.5+f*1.125, sag=Math.sin(((f+.5)/9)*Math.PI)*.42;
          const flag=box(node,`gate-flag-${f}`,fx,3.4-sag,320.04,.36,.36,.04,flagColors[f]);
          flag.rotation.z=Math.PI/4;
        }

        // Ván lướt sóng dựng cạnh cổng chào
        const surfL=box(node,'gate-surf-1',-5.4,1.1,319.6,.46,2.2,.08,'yellow'); surfL.rotation.set(.12,-.3,.15);
        const surfR=box(node,'gate-surf-2',5.4,1.1,319.6,.46,2.2,.08,'pink'); surfR.rotation.set(.12,.3,-.15);
        yield;

        // Quầy Nước Dừa & Tiki Bar (Giữ nguyên collider vị trí -22, 331)
        box(node,'coconut-counter',-22,.7,331,6,1.1,2,'wood',true);
        for(const side of [-1,1]) cylinder(node,'counter-post',-22+side*3,1.5,331,2.7,.18,'wood');
        box(node,'counter-canopy',-22,2.8,331,7,.16,3,'coral');
        box(node,'counter-thatch',-22,2.92,331,7.4,.08,3.4,'palm');
        sign(node,'QUẦY DỪA TIKI',-22,2.2,329.9,3.8,.8);
        [-23.2,-20.8].forEach((cx,cIdx)=>{ sphere(node,`counter-coconut-${cIdx}`,cx,1.38,331,.32,'trunk'); });
        cylinder(node,'counter-dispenser',-24.4,1.48,331,.55,.36,'blue');
        cylinder(node,'tiki-glass-1',-21.8,1.35,331.2,.22,.14,'pink');
        cylinder(node,'tiki-straw-1',-21.78,1.5,331.2,.24,.02,'yellow');
        cylinder(node,'tiki-glass-2',-22.6,1.35,331.2,.22,.14,'cyan');
        for(const stoolX of [-24,-22,-20]) {
          cylinder(node,`bar-stool-${stoolX}`,stoolX,.45,329.5,.45,.5,'wood');
          cylinder(node,`bar-cushion-${stoolX}`,stoolX,.7,329.5,.1,.54,'cream');
        }
        yield;
      } else if(zone.kind==='promenade') {
        for (const offset of [-12,0,12]) { seat(node,zone.x+offset,331); yield; }
        for(const offset of [-18,18]) {
          cylinder(node,'lamp',zone.x+offset,1.3,329,2.3,.12,'darkWood');
          cylinder(node,'lamp-cap',zone.x+offset,2.5,329,.25,.45,'cream');
          sphere(node,'lamp-bulb',zone.x+offset,2.35,329,.2,'gold');
          cylinder(node,`pot-${zone.x+offset}`,zone.x+offset,.36,327.2,.4,.6,'stone');
          const bloom=primitive('CreateSphere',`bloom-${zone.x+offset}`,{diameter:.65,segments:4},'palm');
          bloom.position.set(zone.x+offset,.66,327.2); bloom.parent=node;
          sphere(node,`flower-${zone.x+offset}`,zone.x+offset,.88,327.2,.25,'pink');
          yield;
        }

        // Xe Kem Bãi Biển Pastel (Play Together Ice Cream Cart) ở promenade-east
        if(zone.x>0) {
          const cartX=zone.x-20, cartZ=330;
          box(node,'ice-cart-body',cartX,.85,cartZ,2.4,.9,1.4,'pink');
          box(node,'ice-cart-top',cartX,1.34,cartZ,2.5,.12,1.5,'cream');
          torus(node,'ice-cart-wheel-l',cartX,.45,cartZ+.75,.85,.1,'wood');
          torus(node,'ice-cart-wheel-r',cartX,.45,cartZ-.75,.85,.1,'wood');
          box(node,'ice-cart-handle',cartX-1.3,1.05,cartZ,.35,.08,.9,'darkWood');
          cylinder(node,'ice-cart-pole',cartX+.6,2.0,cartZ,1.5,.08,'wood');
          cylinder(node,'ice-cart-umbrella',cartX+.6,2.8,cartZ,.6,2.5,'yellow',.1);
          cylinder(node,'ice-cart-cap',cartX+.6,3.12,cartZ,.15,.4,'pink',.05);
          sign(node,'KEM MÁT LẠNH 🍦',cartX,1.95,cartZ-.75,2.4,.65);
          cylinder(node,'ice-cone-1',cartX-.5,1.48,cartZ,.24,.12,'orange',.02);
          sphere(node,'ice-scoop-1',cartX-.5,1.62,cartZ,.18,'pink');
          cylinder(node,'ice-cone-2',cartX,1.48,cartZ,.24,.12,'orange',.02);
          sphere(node,'ice-scoop-2',cartX,1.62,cartZ,.18,'yellow');
          yield;
        }
      } else if(zone.kind==='resort') {
        // Cụm Dù Sọc & Ghế Tắm Nắng Rực Rỡ
        const umbrellaColors=['yellow','pink','cyan','orange'];
        for(const [i,[x,z]] of BEACH_CONFIG.loungers.entries()) {
          const uColor=umbrellaColors[i%umbrellaColors.length];
          cylinder(node,'umbrella-pole',x,1.3,z,2.4,.09,'wood');
          cylinder(node,'umbrella',x,2.5,z,.7,3.4,uColor,.08);
          cylinder(node,'umbrella-cap',x,2.88,z,.16,.5,'white',.05);
          box(node,'lounger-seat',x,.38,z+1,1.1,.15,2,'cream');
          const back=box(node,'lounger-back',x,.65,z+.2,1.1,.12,.9,'cream'); back.rotation.x=-.55;
          box(node,`lounger-pillow-${i}`,x,.72,z+.25,.85,.12,.38,uColor);
          for(const side of [-1,1]) box(node,'lounger-leg',x+side*.42,.2,z+1,.12,.3,1.4,'wood');
          cylinder(node,`resort-table-${x}`,x-.8,.28,z+1,.35,.55,'wood');
          cylinder(node,`resort-cup-${x}`,x-.8,.52,z+1,.2,.14,uColor);
          cylinder(node,`resort-straw-${x}`,x-.78,.66,z+1,.24,.02,'yellow');
          yield;
        }

        // Khăn tắm hoa văn trải trên cát
        const towel1=box(node,'beach-towel-1',28,.22,350,1.4,.02,2.4,'pink'); towel1.rotation.y=.2;
        const towel2=box(node,'beach-towel-2',40,.22,350,1.4,.02,2.4,'cyan'); towel2.rotation.y=-.15;

        // Phao Vịt Vàng Khổng Lồ (Giant Rubber Duck Float) sát mép nước
        const duck=new TransformNode('giant-duck-float',scene); duck.parent=node; duck.position.set(18,.28,358); duck.rotation.y=-.3;
        const duckBody=primitive('CreateSphere','duck-body',{diameter:2.2,segments:8},'yellow');
        duckBody.parent=duck; duckBody.scaling.set(1.2,.8,1.3); duckBody.position.set(0,.65,0);
        const duckTail=box(duck,'duck-tail',0,.9,-1.1,.5,.45,.5,'yellow'); duckTail.rotation.x=.5;
        cylinder(duck,'duck-neck',0,1.25,.65,.8,.65,'yellow');
        const duckHead=primitive('CreateSphere','duck-head',{diameter:1.15,segments:8},'yellow');
        duckHead.parent=duck; duckHead.position.set(0,1.8,.75);
        box(duck,'duck-beak',0,1.7,1.45,.52,.2,.5,'orange');
        for(const side of [-1,1]) {
          const eye=primitive('CreateSphere',`duck-eye-${side}`,{diameter:.16,segments:4},'ink');
          eye.parent=duck; eye.position.set(side*.42,1.9,1.15);
          const pupil=primitive('CreateSphere',`duck-pupil-${side}`,{diameter:.06,segments:4},'white');
          pupil.parent=duck; pupil.position.set(side*.44,1.93,1.2);
          const blush=primitive('CreateSphere',`duck-blush-${side}`,{diameter:.22,segments:4},'pink');
          blush.parent=duck; blush.position.set(side*.48,1.72,1.05); blush.scaling.set(.3,.8,.8);
        }
        yield;

        // Phao Hồng Hạc (Pink Flamingo Float)
        const fl=new TransformNode('flamingo-float',scene); fl.parent=node; fl.position.set(44,.28,358); fl.rotation.y=.4;
        const flRing=primitive('CreateTorus','flamingo-ring',{diameter:2.0,thickness:.62,tessellation:12},'pink');
        flRing.parent=fl; flRing.position.set(0,.35,0); flRing.rotation.x=Math.PI/2;
        const flNeck=cylinder(fl,'fl-neck',0,1.1,.7,1.1,.3,'pink'); flNeck.rotation.x=.2;
        const flHead=primitive('CreateSphere','fl-head',{diameter:.55,segments:6},'pink');
        flHead.parent=fl; flHead.position.set(0,1.85,.5);
        const flBeak=box(fl,'fl-beak',0,1.75,.76,.2,.2,.35,'ink'); flBeak.rotation.x=.4;
        for(const side of [-1,1]) {
          const flEye=primitive('CreateSphere',`fl-eye-${side}`,{diameter:.08,segments:4},'ink');
          flEye.parent=fl; flEye.position.set(side*.18,1.9,.6);
        }
        yield;

        // Sân Bóng Chuyền Bãi Biển (Beach Volleyball Court)
        const court=new TransformNode('beach-volleyball',scene); court.parent=node; court.position.set(3,0,345);
        const courtHW=4.0, courtHL=5.5;
        box(court,'vb-line-n',0,.22,courtHL,courtHW*2,.02,.12,'white');
        box(court,'vb-line-s',0,.22,-courtHL,courtHW*2,.02,.12,'white');
        box(court,'vb-line-w',-courtHW,.22,0,.12,.02,courtHL*2,'white');
        box(court,'vb-line-e',courtHW,.22,0,.12,.02,courtHL*2,'white');
        box(court,'vb-line-center',0,.22,0,courtHW*2,.02,.14,'white');
        for(const side of [-1,1]) {
          cylinder(court,`vb-pole-${side}`,side*(courtHW+.3),1.35,0,2.7,.16,'wood');
          sphere(court,`vb-pole-ball-${side}`,side*(courtHW+.3),2.75,0,.26,'yellow');
        }
        box(court,'vb-net',0,1.75,0,courtHW*2+.5,.85,.04,'cream');
        box(court,'vb-net-band',0,2.18,0,courtHW*2+.5,.08,.06,'red');
        const vbBall=primitive('CreateSphere','vb-ball',{diameter:.65,segments:8},'yellow');
        vbBall.parent=court; vbBall.position.set(1.2,.45,1.0);
        const vbRing=primitive('CreateTorus','vb-ring',{diameter:.66,thickness:.08,tessellation:10},'cyan');
        vbRing.parent=court; vbRing.position.set(1.2,.45,1.0); vbRing.rotation.x=Math.PI/4;
        yield;

        // Lâu Đài Cát Đồ Sộ & Đồ Chơi
        box(node,'sandcastle-core',55,.45,349,1.6,.65,1.6,'sand');
        cylinder(node,'sandcastle-spire',55,.95,349,.6,.7,'sand',.1);
        cylinder(node,'sandcastle-pole',55,1.4,349,.45,.03,'wood');
        box(node,'sandcastle-flag',55.18,1.45,349,.35,.2,.02,'red');
        for(const [dx,dz] of [[-.75,-.75],[.75,-.75],[-.75,.75],[.75,.75]]) {
          cylinder(node,'sc-corner',55+dx,.52,349+dz,.8,.42,'sand');
        }
        cylinder(node,'sc-bucket',56.4,.36,348.4,.38,.32,'yellow',.4);
        const spade=box(node,'sc-spade',56.8,.42,348.2,.1,.5,.03,'orange'); spade.rotation.z=-.3;
        for(const [sx,sz] of [[53,351],[35,352],[22,353]]) {
          const star1=box(node,`starfish-1-${sx}`,sx,.22,sz,.38,.04,.12,'orange');
          const star2=box(node,`starfish-2-${sx}`,sx,.22,sz,.12,.04,.38,'orange');
          star1.rotation.y=.4; star2.rotation.y=.4;
        }

        // Ván lướt sóng
        [[-1,58,347,'cyan'],[1,60,348,'pink']].forEach(([tilt,sx,sz,col],sIdx)=>{
          const sb=box(node,`surfboard-${sIdx}`,sx,1.1,sz,.45,2.2,.08,col);
          sb.rotation.z=tilt*.15; sb.rotation.y=.25;
        });
        yield;
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

        // Cọc cầu tàu & phao cứu sinh & đèn bão
        for(let z=345;z<=361;z+=4) {
          for(const side of [-1,1]) {
            const px=pier.x+side*(pier.width/2-.1);
            cylinder(node,'pier-post',px,.65,z,1,.14,'wood');
            if(z<361) box(node,`pier-rope-${z}-${side}`,px,.95,z+2,.05,.05,4,'darkWood');
          }
          yield;
        }
        for(const pz of [349,357]) {
          const buoyX=pier.x+(pier.width/2-.05);
          torus(node,`lifebuoy-ring-${pz}`,buoyX,.75,pz,.65,.15,'white');
          for(const rot of [0,Math.PI/2]) {
            const band=box(node,`lifebuoy-band-${pz}-${rot}`,buoyX,.75,pz,.16,.16,.06,'red');
            band.rotation.y=rot;
          }
        }
        for(const side of [-1,1]) {
          const lx=pier.x+side*(pier.width/2-.1);
          box(node,`pier-lantern-${side}`,lx,1.35,361,.25,.35,.25,'gold');
        }

        // Thuyền Đánh Cá Gỗ Nhỏ (Moored Boat)
        const boat=new TransformNode('fishing-boat',scene); boat.parent=node; boat.position.set(pier.x-4.5,.12,355); boat.rotation.y=.15;
        box(boat,'boat-hull',0,.35,0,2.0,.7,4.6,'cream');
        box(boat,'boat-bow',0,.45,2.5,1.6,.8,1.2,'cream');
        box(boat,'boat-trim-l',-.95,.72,.3,.12,.16,5.0,'blue');
        box(boat,'boat-trim-r',.95,.72,.3,.12,.16,5.0,'blue');
        box(boat,'boat-bench-1',0,.48,-.8,1.8,.1,.5,'wood');
        box(boat,'boat-bench-2',0,.48,1.0,1.8,.1,.5,'wood');
        cylinder(boat,'boat-oar',0,.76,.1,2.6,.06,'darkWood');
        box(node,'mooring-line',pier.x-2.5,.55,355,2.2,.04,.04,'darkWood');

        // Điểm gợn sóng câu cá
        torus(node,'fish-ripple-outer',pier.x,.08,367.5,2.4,.06,'white');
        torus(node,'fish-ripple-inner',pier.x,.08,367.5,1.3,.05,'white');
        seat(node,-76,348); yield;
      } else if(zone.kind==='lookout') {
        for(const i of [0,1,2,3]) {
          const rock=MeshBuilder.CreateSphere(`cozy-beach-rock-${i}`,{diameter:2.2+i*.4,segments:4},scene);
          rock.position.set(zone.x-2+i*2.2,.4,zone.z+2-(i%2)*2); rock.scaling.y=.45; rock.material=mats.stone; rock.parent=node; rock.isPickable=false;
          yield;
        }

        // NGỌN HẢI ĐĂNG VIỄN DƯƠNG PLAY TOGETHER (Red & White Striped Lighthouse)
        const lhX=zone.x+4, lhZ=zone.z+4;
        cylinder(node,'lh-base',lhX,.7,lhZ,1.4,5.4,'stone');
        cylinder(node,'lh-tier-1',lhX,2.0,lhZ,1.4,4.4,'white',4.0);
        cylinder(node,'lh-tier-2',lhX,3.4,lhZ,1.4,4.0,'red',3.6);
        cylinder(node,'lh-tier-3',lhX,4.8,lhZ,1.4,3.6,'white',3.2);
        cylinder(node,'lh-tier-4',lhX,6.2,lhZ,1.4,3.2,'red',2.8);
        cylinder(node,'lh-tier-5',lhX,7.6,lhZ,1.4,2.8,'white',2.4);
        cylinder(node,'lh-balcony',lhX,8.4,lhZ,.25,3.5,'darkWood');
        torus(node,'lh-railing',lhX,8.95,lhZ,3.4,.08,'darkWood');
        cylinder(node,'lh-lantern-room',lhX,9.4,lhZ,1.6,2.2,'gold',2.0);
        sphere(node,'lh-beacon-core',lhX,9.4,lhZ,.9,'yellow');
        cylinder(node,'lh-roof',lhX,10.6,lhZ,1.0,2.6,'red',.2);
        cylinder(node,'lh-spire',lhX,11.3,lhZ,.6,.1,'gold');
        sign(node,'HẢI ĐĂNG BÌNH MINH',lhX,1.9,lhZ-4.5,4.6,.95);

        // Kính viễn vọng ngắm biển
        cylinder(node,'lookout-pedestal',zone.x-3,.65,zone.z-1,1.3,.32,'stone');
        const scope=cylinder(node,'lookout-scope',zone.x-3,1.35,zone.z-1,.75,.14,'darkWood');
        scope.rotation.x=-Math.PI/6;

        seat(node,zone.x-6,zone.z-3);
        seat(node,zone.x-1,zone.z-5); yield;
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
