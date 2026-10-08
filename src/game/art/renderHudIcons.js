import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { Camera } from '@babylonjs/core/Cameras/camera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';

// Authoring tool only: bake genuine 3D objects once, ship PNGs without a runtime renderer.
export async function renderHudIcons() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const engine = new Engine(canvas, true, { alpha: true, preserveDrawingBuffer: true });
  engine.setSize(256, 256);
  const output = {};
  try {
    for (const name of ['coin','gem','backpack','wardrobe','camera','phone','bike','quest','chat','emote','sprint','jump','land','hand','fish','gate','basket','seeds']) {
      const scene = new Scene(engine); scene.clearColor = new Color4(0,0,0,0);
      const camera = new ArcRotateCamera('camera', 1.30, 1.29, 5, new Vector3(0,0,0), scene);
      camera.mode = Camera.ORTHOGRAPHIC_CAMERA; camera.orthoLeft = camera.orthoBottom = -1.08; camera.orthoRight = camera.orthoTop = 1.08;
      const fill = new HemisphericLight('fill', new Vector3(0,1,0),scene); fill.intensity=.84; fill.groundColor=new Color3(.28,.30,.35);
      const key = new DirectionalLight('key',new Vector3(.7,-1.5,-1.2),scene); key.intensity=.65;
      const material = (color) => { const m = new StandardMaterial(color,scene); m.diffuseColor=Color3.FromHexString(color);m.specularColor=new Color3(.22,.22,.22);m.specularPower=40; return m; };
      const palette = { gold:material('#eda633'), blue:material('#54b1d6'), navy:material('#2b455b'), cream:material('#f5eee0'), green:material('#63a087'), red:material('#ed8057') };
      const ball=(p,s,mat)=>{const m=MeshBuilder.CreateSphere('ball',{diameter:2,segments:16},scene);m.position.set(...p);m.scaling.set(...s);m.material=palette[mat];return m;};
      const box=(p,s,mat)=>{const m=MeshBuilder.CreateBox('box',{size:1},scene);m.position.set(...p);m.scaling.set(...s);m.material=palette[mat];return m;};
      const rounded=(p,scale,mat,power=.30)=>{
        const positions=[],indices=[],normals=[];const lat=24,lon=48;
        const signed=(n)=>Math.sign(n)*Math.abs(n)**power;
        for(let i=0;i<=lat;i++){const theta=.0001+i/lat*(Math.PI-.0002);for(let j=0;j<=lon;j++){const phi=j/lon*Math.PI*2;positions.push(scale[0]*signed(Math.sin(theta))*signed(Math.cos(phi)),scale[1]*signed(Math.cos(theta)),scale[2]*signed(Math.sin(theta))*signed(Math.sin(phi)));}}
        for(let i=0;i<lat;i++)for(let j=0;j<lon;j++){const a=i*(lon+1)+j,b=a+lon+1;indices.push(a,b,a+1,a+1,b,b+1);}
        VertexData.ComputeNormals(positions,indices,normals);const data=new VertexData();Object.assign(data,{positions,indices,normals});const m=new Mesh('rounded',scene);data.applyToMesh(m);m.position.set(...p);m.material=palette[mat];return m;
      };
      const plate=(outline,depth,mat)=>{
        const positions=[],indices=[],normals=[];const n=outline.length;
        for(const z of [-depth,depth])for(const [x,y]of outline)positions.push(x,y,z);
        for(let j=0;j<n;j++){const a=j,b=(j+1)%n;indices.push(a,b,a+n,b,b+n,a+n);}
        for(const [r,rev]of [[0,false],[1,true]]){const c=positions.length/3;positions.push(0,0,r===0?-depth:depth);for(let j=0;j<n;j++){const a=r*n+j,b=r*n+(j+1)%n;indices.push(c,rev?b:a,rev?a:b);}}
        VertexData.ComputeNormals(positions,indices,normals);const data=new VertexData();Object.assign(data,{positions,indices,normals});const m=new Mesh('plate',scene);data.applyToMesh(m);m.material=palette[mat];return m;
      };
      const shirt=()=>{
        const torso=rounded([0,-.08,0],[.35,.51,.16],'blue',.25);
        const left=rounded([-.43,.24,0],[.27,.20,.16],'blue',.28);left.rotation.z=.55;
        const right=rounded([.43,.24,0],[.27,.20,.16],'blue',.28);right.rotation.z=-.55;
        Mesh.MergeMeshes([torso,left,right],true,true);
        const collar=ring([0,.42,.14],.29,.060,'cream');collar.scaling.y=.55;
        rounded([0,.43,.13],[.11,.035,.025],'navy',.45);
        rod([-.27,-.52,.16],[.27,-.52,.16],.016,'cream');
      };
      const ring=(p,d,t,mat)=>{const m=MeshBuilder.CreateTorus('ring',{diameter:d,thickness:t,tessellation:32},scene);m.position.set(...p);m.rotation.x=Math.PI/2;m.material=palette[mat];return m;};
      const rod=(a,b,r,mat)=>{const start=Vector3.FromArray(a),end=Vector3.FromArray(b); const m=MeshBuilder.CreateCylinder('rod',{height:Vector3.Distance(start,end),diameter:r*2,tessellation:12},scene);m.position=start.add(end).scale(.5);const dir=end.subtract(start).normalize();m.rotation.z=-Math.atan2(dir.x,dir.y);m.rotation.x=Math.atan2(dir.z,Math.hypot(dir.x,dir.y));m.material=palette[mat];return m;};
      if(name==='coin'){const m=MeshBuilder.CreateCylinder('coin',{height:.24,diameter:1.58,tessellation:64},scene);m.rotation.x=Math.PI/2;m.material=palette.gold;ring([0,0,.145],1.36,.08,'cream');rounded([0,0,.15],[.51,.51,.045],'gold',.85);const star=plate(Array.from({length:10},(_,j)=>{const a=Math.PI/2+j*Math.PI/5,r=j%2?.16:.33;return [Math.cos(a)*r,Math.sin(a)*r];}),.025,'cream');star.position.z=.22;}
      if(name==='gem'){const m=MeshBuilder.CreatePolyhedron('gem',{type:1,size:.70},scene);m.scaling.y=.8;m.material=palette.blue;}
      if(name==='backpack'){rounded([0,-.01,0],[.53,.65,.26],'red',.42);for(const x of [-.43,.43]){rounded([x,-.08,-.18],[.09,.48,.12],'navy',.55);}ring([0,.58,-.04],.34,.075,'navy');rounded([0,-.25,.27],[.40,.24,.10],'gold',.36);rod([-.29,-.08,.38],[.29,-.08,.38],.018,'cream');rounded([0,.16,.28],[.12,.13,.025],'cream',.25);ball([0,.17,.32],[.055,.065,.018],'gold');}
      if(name==='wardrobe')shirt();
      if(name==='camera'){rounded([0,-.06,0],[.67,.42,.25],'blue',.28);rounded([-.38,.33,-.03],[.20,.13,.16],'navy',.32);rounded([.41,.36,.02],[.11,.06,.10],'red',.35);ring([.12,-.07,.30],.73,.12,'cream');ring([.12,-.07,.35],.55,.10,'navy');ball([.12,-.07,.40],[.20,.20,.045],'blue');ball([.06,.01,.44],[.07,.045,.012],'cream');rounded([-.42,.15,.27],[.12,.075,.025],'cream');}
      if(name==='phone'){rounded([0,0,0],[.43,.73,.13],'cream',.23);rounded([0,.015,.13],[.355,.59,.025],'navy',.20);rounded([0,.045,.16],[.315,.50,.015],'blue',.23);for(const x of [-.16,.16])for(const y of [-.17,.16])rounded([x,y,.19],[.10,.10,.02],y>0?'gold':'cream',.40);rounded([0,.61,.14],[.09,.025,.015],'navy');ball([0,-.62,.14],[.045,.045,.015],'navy');}
      if(name==='bike'){for(const x of [-.56,.56]){ring([x,-.32,0],.66,.08,'navy');rod([x-.26,-.32,0],[x+.26,-.32,0],.025,'cream');}for(const [a,b] of [[[-.56,-.32,0],[-.18,.30,0]],[[-.18,.30,0],[.10,-.32,0]],[[.10,-.32,0],[-.56,-.32,0]],[[.10,-.32,0],[.39,.30,0]],[[.39,.30,0],[.56,-.32,0]],[[-.18,.30,0],[.39,.30,0]]])rod(a,b,.055,'red');box([-.18,.39,0],[.34,.08,.18],'navy');rod([.39,.30,0],[.34,.55,0],.045,'navy');box([.35,.56,0],[.26,.07,.12],'navy');}
      if(name==='quest'){rounded([0,0,0],[.57,.71,.09],'gold',.25);rounded([0,-.025,.10],[.46,.58,.025],'cream',.20);rounded([0,.59,.14],[.24,.10,.055],'navy',.45);for(const y of [.27,-.04,-.35]){rod([-.32,y,.14],[-.25,y-.07,.14],.027,'green');rod([-.25,y-.07,.14],[-.14,y+.09,.14],.027,'green');rounded([.16,y,.14],[.19,.028,.015],'navy');}}
      if(name==='chat'){ball([0,.12,0],[.83,.56,.23],'cream');box([-.39,-.40,0],[.26,.30,.23],'cream');for(const x of [-.35,0,.35])ball([x,.12,.23],[.07,.07,.035],'navy');}
      if(name==='emote'){ball([0,0,0],[.73,.73,.27],'gold');for(const x of [-.25,.25])ball([x,.17,.25],[.065,.09,.04],'navy');const m=ring([0,-.12,.24],.55,.065,'navy');m.scaling.y=.6;box([0,.04,.27],[.64,.30,.045],'gold');}
      if(name==='sprint'||name==='jump'){
        const shoe=(x,y,z)=>{rounded([x,y,z],[.50,.11,.25],'gold',.35);rounded([x,y+.15,z],[.45,.19,.23],'cream',.40);rounded([x-.25,y+.30,z],[.14,.21,.20],'blue',.35);for(const dx of [-.05,.07,.19])rod([x+dx,y+.29,z+.18],[x+dx+.08,y+.13,z+.23],.025,'navy');};
        if(name==='sprint'){shoe(.15,-.21,.10);shoe(-.12,.23,-.22);for(const y of [-.35,-.1,.15])rod([-.90,y,0],[-.65,y,0],.035,'blue');}
        else {shoe(0,-.45,.08);rod([0,.10,-.10],[0,.69,-.10],.075,'blue');rod([-.22,.45,-.10],[0,.69,-.10],.075,'blue');rod([.22,.45,-.10],[0,.69,-.10],.075,'blue');}
      }
      if(name==='land'){box([0,-.37,0],[1.46,.17,1.04],'green');box([0,.02,0],[.87,.68,.65],'cream');const roof=box([0,.44,0],[.97,.16,.84],'red');roof.rotation.z=.18;box([0,-.10,.35],[.22,.41,.06],'navy');}
      if(name==='hand'){ball([0,0,0],[.40,.46,.17],'cream');for(const x of [-.26,-.08,.10,.28])ball([x,.40,0],[.09,.28,.11],'cream');ball([-.43,-.05,0],[.15,.25,.13],'cream');box([0,-.49,0],[.62,.16,.24],'blue');}
      if(name==='fish'){ball([.08,0,0],[.59,.34,.20],'blue');const m=box([-.61,0,0],[.33,.50,.16],'gold');m.rotation.z=.7;ball([.40,.10,.19],[.045,.045,.025],'navy');}
      if(name==='gate'){for(const x of [-.65,.65])box([x,0,0],[.15,1.40,.17],'navy');for(const y of [-.34,.34])box([0,y,0],[1.38,.14,.17],'gold');for(const x of [-.30,0,.30])box([x,0,0],[.10,.81,.12],'gold');}
      if(name==='basket'){ball([0,-.17,0],[.69,.42,.39],'gold');ring([0,.19,0],1.05,.10,'red').rotation.x=0;const handle=ring([0,.36,0],.87,.08,'navy');handle.scaling.y=.8;}
      if(name==='seeds'){ball([0,-.19,0],[.49,.48,.24],'gold');for(const sign of [-1,1]){const leaf=ball([sign*.22,.47,0],[.30,.12,.10],'green');leaf.rotation.z=sign*.40;}rod([0,.10,0],[0,.52,0],.045,'green');}
      await scene.whenReadyAsync();scene.render();output[name]=canvas.toDataURL('image/png');scene.dispose();
    }
  } finally { engine.dispose(); }
  return output;
}
