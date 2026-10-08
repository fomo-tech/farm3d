import {RawTexture} from '@babylonjs/core/Materials/Textures/rawTexture.js';
import {Texture} from '@babylonjs/core/Materials/Textures/texture.js';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {Mesh} from '@babylonjs/core/Meshes/mesh.js';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData.js';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';
import {Color3} from '@babylonjs/core/Maths/math.color.js';
import {shoreTerrainLayout,shoreTerrainHeight} from './ShoreTerrain.js';
export function* createShoreTerrainSteps(scene,parent){
 const material=new StandardMaterial('shore-earth-slope',scene);material.diffuseColor=Color3.White();material.specularColor=Color3.Black();material.backFaceCulling=false;
 const grain=new Uint8Array(64*64*3);let seed=731;for(let i=0;i<4096;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;grain.fill(240+((seed>>>0)%15),i*3,i*3+3);}
 const texture=RawTexture.CreateRGBTexture(grain,64,64,scene,true,false,Texture.TRILINEAR_SAMPLINGMODE);texture.wrapU=texture.wrapV=Texture.WRAP_ADDRESSMODE;material.diffuseTexture=texture;
 parent.onDisposeObservable.addOnce(()=>{texture.dispose();material.dispose();});
 const layout=shoreTerrainLayout();
 const meshes=[];
 for(const [i,{id,positions,indices,colors}] of layout.entries()){
  const mesh=new Mesh(`shore-earth-${id}-${i}`,scene),data=new VertexData(),normals=[];
  VertexData.ComputeNormals(positions,indices,normals);for(let k=0;k<normals.length;k+=3)if(normals[k+1]<0){normals[k]*=-1;normals[k+1]*=-1;normals[k+2]*=-1;}
  data.uvs=[];for(let k=0;k<positions.length;k+=3)data.uvs.push(positions[k]/3,positions[k+2]/3);data.positions=positions;data.indices=indices;data.normals=normals;data.colors=colors;data.applyToMesh(mesh);mesh.hasVertexAlpha=true;mesh.material=material;mesh.parent=parent;mesh.isPickable=false;mesh.receiveShadows=true;mesh.metadata={shoreTerrain:true,waterBody:id};meshes.push(mesh);yield 'waterfront: bank strip';
 }
 const positions=[],colors=[],indices=[];
 for(const {edge,normal} of layout)for(let i=2;i<edge.length-2;i+=4){
  const p=edge[i],n=normal[i],v=Math.sin(p.x*12.99+p.z*78.23)*43758.54,noise=v-Math.floor(v);if(noise>.55)continue;
  const x=p.x+n.x*.7,z=p.z+n.z*.7,y=shoreTerrainHeight(x,z);if(y===null)continue;
  for(let blade=0;blade<5;blade++){
   const a=blade*2.4+noise*6,dx=Math.cos(a),dz=Math.sin(a),h=.3+noise*.45,index=positions.length/3;
   positions.push(x-dz*.07,y,z+dx*.07,x+dz*.07,y,z-dx*.07,x+dx*.2,y+h,z+dz*.2);
   colors.push(.32,.46,.18,1,.32,.46,.18,1,.56,.64,.3,1);indices.push(index,index+1,index+2);
  }
 }
 const grass=new Mesh('shore-earth-grass',scene),data=new VertexData(),normals=[];VertexData.ComputeNormals(positions,indices,normals);data.positions=positions;data.indices=indices;data.normals=normals;data.colors=colors;data.uvs=positions.filter((_,i)=>i%3!==1).map(v=>v/3);data.applyToMesh(grass);grass.material=material;grass.parent=parent;grass.isPickable=false;grass.metadata={shoreTerrain:true,shoreGrass:true};
 const quayPositions=[],quayNormals=[],quayColors=[],quayIndices=[];
 const template=MeshBuilder.CreateBox('quay-template',{size:1},scene),tp=template.getVerticesData('position'),tn=template.getVerticesData('normal'),ti=template.getIndices();template.dispose();
 // Follow each curve with staggered stone courses and a wider coping cap.
 for(const {edge,normal} of layout)for(let i=0;i<edge.length-1;i++){
  const a=edge[i],b=edge[i+1],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(len<.05)continue;
  const n=normal[i],steps=Math.ceil(len/1.35),unit=len/steps;
  for(let j=0;j<steps;j++){
   const t=(j+.5)/steps,x=a.x+dx*t,z=a.z+dz*t;
   const top=shoreTerrainHeight(x+n.x*.13,z+n.z*.13);if(top===null)continue;
   for(let row=0;row<3;row++){
    const shift=row===1?unit*.22:0,sx=x+dx/len*shift,sz=z+dz/len*shift;
    if(shoreTerrainHeight(sx+n.x*.13,sz+n.z*.13)===null)continue;
    const cap=row===2,h=cap?.13:(top-.12)/2;
    const width=unit-.035,depth=cap?.7:.24,angle=-Math.atan2(dz,dx),cs=Math.cos(angle),sn=Math.sin(angle),cx=sx+n.x*(cap?.32:.13),cy=cap?top+.04:.11+h*(row+.5),cz=sz+n.z*(cap?.32:.13),offset=quayPositions.length/3;
    const shade=((i*7+j*3+row)%5)*.018;
    for(let k=0;k<tp.length;k+=3){const vx=tp[k]*width,vz=tp[k+2]*depth;quayPositions.push(cx+vx*cs+vz*sn,cy+tp[k+1]*h,cz-vx*sn+vz*cs);quayNormals.push(tn[k]*cs+tn[k+2]*sn,tn[k+1],-tn[k]*sn+tn[k+2]*cs);quayColors.push((cap?.76:.62)+shade,(cap?.78:.66)+shade,(cap?.69:.61)+shade,1);}
    for(const index of ti)quayIndices.push(index+offset);
   }
  }
  if(i%8===0)yield 'waterfront: stone course';
 }
 if(quayIndices.length){const quay=new Mesh('shore-stone-quay',scene),qd=new VertexData();qd.positions=quayPositions;qd.normals=quayNormals;qd.colors=quayColors;qd.indices=quayIndices;qd.uvs=quayPositions.filter((_,i)=>i%3!==1).map(v=>v/3);qd.applyToMesh(quay);quay.material=material;quay.parent=parent;quay.isPickable=false;quay.receiveShadows=true;quay.metadata={shoreTerrain:true,stoneQuay:true};}
 return meshes;
}

export function createShoreTerrain(scene,parent){const steps=createShoreTerrainSteps(scene,parent);let result;do{result=steps.next();}while(!result.done);return result.value;}
