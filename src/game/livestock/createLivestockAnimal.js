import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';

// All animals face -Z, with feet grounded at local Y=0.
export function createLivestockAnimal(scene, root, species, material) {
  const colors = {cream:'#fff5df',dark:'#32352e',pink:'#efa5a2',nose:'#d97c83',orange:'#e8a13d',wool:'#f5eedc',brown:'#76513d'};
  const sphere=(name,size,pos,color,parent=root,segments=10)=>{
    const mesh=MeshBuilder.CreateSphere(`${root.name}-${name}`,{diameterX:size[0],diameterY:size[1],diameterZ:size[2],segments},scene);
    mesh.position.set(...pos);mesh.material=material(color);mesh.parent=parent;mesh.isPickable=false;mesh.receiveShadows=false;return mesh;
  };
  const node=(name,pos,parent=root)=>{const n=new TransformNode(`${root.name}-${name}`,scene);n.position.set(...pos);n.parent=parent;return n;};
  const tube=(name,points,radius,color,parent=root)=>{const m=MeshBuilder.CreateTube(`${root.name}-${name}`,{path:points.map(p=>new Vector3(...p)),radius,tessellation:6,cap:3},scene);m.material=material(color);m.parent=parent;m.isPickable=false;return m;};
  const legs=[], wings=[];
  let body,head,tail;
  const eyes=(x,y,z,parent,size=.075)=>[-1,1].forEach((side,i)=>{
    sphere(`eye-${i}`,[size,size*1.15,size*.64],[x*side,y,z],colors.dark,parent,8);
    sphere(`eye-glint-${i}`,[size*.3,size*.3,size*.2],[x*side-.012,y+.018,z-size*.3],colors.cream,parent,6);
  });
  const quadLegs=(x,z,height,color,hoof)=>[-1,1].forEach(side=>[-1,1].forEach(end=>{
    const joint=node(`leg-joint-${legs.length}`,[x*side,height,z*end]);
    sphere('leg',[.16,height+.06,.17],[0,-height/2,0],color,joint,8);
    sphere('hoof',[.18,.12,.21],[0,-height+.06,-.015],hoof,joint,8);legs.push(joint);
  }));
  const birdFeet=()=>[-1,1].forEach(side=>{
    const joint=node(`leg-joint-${legs.length}`,[side*.14,.22,0]);
    sphere('leg',[.065,.2,.07],[0,-.08,0],colors.orange,joint,8);
    if(species==='duck') sphere('webbed-foot',[.19,.055,.25],[0,-.19,-.07],colors.orange,joint,8);
    else for(const toe of [-1,0,1]) tube('toe',[[0,-.18,0],[toe*.055,-.19,-.15]],.022,colors.orange,joint);
    legs.push(joint);
  });
  if(species==='chicken'||species==='duck'){
    const duck=species==='duck';root.scaling.setAll(duck?.66:.62);
    const plumage=duck?'#fff0bd':colors.cream;
    body=sphere('body',[.67,.64,.89],[0,.5,.05],plumage);
    head=node('head',[0,duck?.87:.91,-.34]);
    sphere('head-shape',[.46,.48,.46],[0,0,0],plumage,head,12);
    eyes(.16,.055,-.185,head,.075);
    if(duck){
      sphere('flat-bill',[.31,.095,.3],[0,-.07,-.28],colors.orange,head);
      [-1,1].forEach(s=>sphere('bill-nostril',[.024,.018,.03],[s*.065,-.015,-.3],colors.brown,head,6));
    }else{
      for(let i=0;i<3;i++)sphere('comb-lobe',[.11,.16+i*.025,.14],[0,.25,-.13+i*.105],'#d95743',head,8);
      sphere('wattle',[.1,.16,.11],[0,-.18,-.16],'#d95743',head,8);
      const beak=MeshBuilder.CreateCylinder(`${root.name}-beak`,{height:.22,diameterBottom:.16,diameterTop:0,tessellation:6},scene);
      beak.parent=head;beak.position.set(0,-.04,-.29);beak.rotation.x=-Math.PI/2;beak.material=material(colors.orange);beak.isPickable=false;
    }
    [-1,1].forEach((side,i)=>{const pivot=node(`wing-${i}`,[side*.31,.56,.06]);sphere('wing-shape',[.16,.35,.55],[side*.015,-.06,.04],duck?'#f8dea0':'#eedfc5',pivot);wings.push(pivot);});
    tail=node('tail',[0,.61,.43]);
    for(let i=0;i<3;i++){const feather=sphere('tail-feather',[.15,.34,.22],[(i-1)*.085,.07,0],plumage,tail,8);feather.rotation.x=.5;feather.rotation.z=(i-1)*.22;}
    birdFeet();
  }else if(species==='pig'){
    root.scaling.setAll(.84);
    body=sphere('body',[.86,.7,1.08],[0,.59,.06],colors.pink,root,12);
    head=node('head',[0,.73,-.48]);sphere('head-shape',[.63,.56,.55],[0,0,0],colors.pink,head,12);
    sphere('snout',[.38,.27,.2],[0,-.08,-.28],colors.nose,head);
    [-1,1].forEach((side,i)=>{
      sphere(`nostril-${i}`,[.047,.065,.025],[side*.085,-.075,-.38],'#9d515b',head,8);
      const ear=sphere(`ear-${i}`,[.19,.28,.13],[side*.23,.23,.015],colors.pink,head);ear.rotation.z=side*-.32;ear.rotation.x=-.3;
      sphere('inner-ear',[.1,.16,.035],[side*.23,.25,-.047],colors.nose,head,8);
    });
    eyes(.205,.08,-.22,head,.083);
    quadLegs(.27,.32,.31,colors.pink,'#96635d');
    tail=node('tail',[0,.67,.57]);
    const curl=Array.from({length:21},(_,i)=>{const a=i/20*Math.PI*3;return [Math.cos(a)*.075,Math.sin(a)*.075,i/20*.2];});tube('curly-tail',curl,.025,colors.nose,tail);
  }else if(species==='sheep'){
    root.scaling.setAll(.86);
    body=sphere('body',[.88,.76,1.12],[0,.65,.05],colors.wool,root,12);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;sphere(`wool-${i}`,[.43,.4,.48],[Math.cos(a)*.31,.69+Math.sin(a)*.21,i%2?.28:-.19],colors.wool,root,8);}
    head=node('head',[0,.88,-.6]);sphere('face',[.44,.52,.5],[0,0,0],'#655e51',head);
    sphere('forelock',[.48,.26,.4],[0,.24,.015],colors.wool,head);
    eyes(.14,.055,-.23,head,.08);
    [-1,1].forEach((side,i)=>{const ear=sphere(`ear-${i}`,[.29,.12,.17],[side*.3,.1,0],'#827765',head);ear.rotation.z=-side*.25;sphere('ear-inner',[.17,.045,.08],[side*.31,.13,-.04],'#c4a798',head,8);});
    sphere('nose',[.11,.07,.06],[0,-.16,-.25],colors.dark,head,8);
    quadLegs(.26,.32,.34,'#655e51',colors.dark);
    tail=sphere('tail',[.2,.24,.22],[0,.7,.62],colors.wool);
  }else{
    root.scaling.setAll(1);
    const bodySize=[.88,.79,1.25],bodyPos=[0,.74,.08];
    body=sphere('body',bodySize,bodyPos,colors.cream,root,16);
    // Surface-conforming patches avoid the protruding balls used for old cow spots.
    const patch=(name,theta,phi,spreadT,spreadP)=>{
      const positions=[],normals=[],indices=[];const steps=16,rings=5;
      const point=(t,p)=>{const n=new Vector3(Math.sin(p)*Math.cos(t),Math.cos(p),Math.sin(p)*Math.sin(t));positions.push(bodyPos[0]+n.x*(bodySize[0]/2+.012),bodyPos[1]+n.y*(bodySize[1]/2+.012),bodyPos[2]+n.z*(bodySize[2]/2+.012));normals.push(n.x,n.y,n.z);};
      point(theta,phi);
      for(let r=1;r<=rings;r++)for(let i=0;i<steps;i++){const a=i/steps*Math.PI*2,wobble=1+.12*Math.sin(a*3);point(theta+Math.cos(a)*spreadT*wobble*r/rings,phi+Math.sin(a)*spreadP*wobble*r/rings);}
      for(let i=0;i<steps;i++)indices.push(0,1+i,1+(i+1)%steps);
      for(let r=1;r<rings;r++)for(let i=0;i<steps;i++){const a=1+(r-1)*steps+i,b=1+(r-1)*steps+(i+1)%steps,c=1+r*steps+i,d=1+r*steps+(i+1)%steps;indices.push(a,c,b,b,c,d);}
      const mesh=new Mesh(`${root.name}-${name}`,scene);const data=new VertexData();data.positions=positions;data.normals=normals;data.indices=indices;data.applyToMesh(mesh);mesh.parent=root;mesh.material=material(colors.brown);mesh.material.backFaceCulling=false;mesh.isPickable=false;
    };
    patch('flank-spot-left',Math.PI,1.35,.57,.52);patch('flank-spot-right',0,1.7,.6,.5);patch('back-spot',.3,.4,.65,.28);
    head=node('head',[0,1.01,-.65]);sphere('head-shape',[.59,.58,.57],[0,0,0],colors.cream,head,12);
    sphere('snout',[.46,.28,.28],[0,-.12,-.27],'#eab3a6',head);
    eyes(.195,.055,-.235,head,.085);
    [-1,1].forEach((side,i)=>{
      sphere('nostril',[.055,.04,.028],[side*.12,-.1,-.407],'#9d7068',head,8);
      const ear=sphere('ear',[.28,.14,.19],[side*.36,.15,.02],colors.brown,head);ear.rotation.z=side*-.25;
      const horn=MeshBuilder.CreateCylinder(`${root.name}-horn-${i}`,{height:.23,diameterBottom:.1,diameterTop:.025,tessellation:8},scene);horn.parent=head;horn.position.set(side*.2,.35,.02);horn.rotation.z=-side*.3;horn.material=material('#dfcba0');horn.isPickable=false;
    });
    quadLegs(.28,.39,.41,colors.cream,colors.dark);
    sphere('udder',[.32,.2,.3],[0,.35,.27],'#eab3a6');
    sphere('bell',[.13,.15,.12],[0,.57,-.64],'#e4b34a');
    tail=node('tail',[0,.85,.71]);tube('tail-stem',[[0,0,0],[.02,-.19,.05],[.025,-.42,.08]],.032,colors.cream,tail);sphere('tail-tuft',[.12,.19,.13],[.025,-.44,.08],colors.brown,tail,8);
  }
  root.metadata={...(root.metadata||{}),species,meshVersion:2};
  return {head,body,tail,wings,legs,isBird:species==='chicken'||species==='duck',snout:null};
}
