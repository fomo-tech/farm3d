import { fishForm, FISH_FORMS, FISH_SIZE_SCALE, caughtFishScale } from '../../../shared/fishAppearance.js';
import {fishingNibbleState} from '../../../shared/fishingConditions.js';
import {fishingFightState} from '../../../shared/fishingSession.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { PointLight } from '@babylonjs/core/Lights/pointLight.js';
import { FARM_CONFIG } from '../config.js';
import { FISHING_CONFIG } from '../../../shared/fishingConfig.js';
import { buildHumanMesh } from './buildHumanMesh.js';
import { createVehicleRigs } from './createVehicleRigs.js';
import { VEHICLE_MOTION, approachVehicleSpeed } from './vehicleMotion.js';
import { applyVehiclePose } from './applyVehiclePose.js';
import { avatarAppearance } from '../../../shared/avatarAppearance.js';

export function createFishingRig(scene, root, human) {
  const bobberMaterial = new StandardMaterial('local-fishing-bobber-material', scene);
  bobberMaterial.diffuseColor = Color3.FromHexString('#ef4444');
  bobberMaterial.emissiveColor = Color3.FromHexString('#fb7185').scale(0.22);
  bobberMaterial.specularColor = Color3.White();
  const bobber = MeshBuilder.CreateSphere('local-fishing-bobber', { diameter: 0.28, segments: 12 }, scene);
  bobber.material = bobberMaterial;
  bobber.setEnabled(false);

  const floatWhite = new StandardMaterial('fishing-float-white', scene);
  floatWhite.diffuseColor = Color3.FromHexString('#fff9e8');
  floatWhite.emissiveColor = Color3.FromHexString('#fff9e8').scale(.25);
  const floatBand = MeshBuilder.CreateTorus('fishing-float-band', {diameter:.27, thickness:.065, tessellation:16}, scene);
  floatBand.parent=bobber; floatBand.material=floatWhite;
  const floatStem = MeshBuilder.CreateCylinder('fishing-float-stem', {height:.32, diameter:.045, tessellation:8}, scene);
  floatStem.parent=bobber; floatStem.position.y=.23; floatStem.material=floatWhite;
  const floatTip = MeshBuilder.CreateSphere('fishing-float-tip', {diameter:.085, segments:8}, scene);
  floatTip.parent=bobber; floatTip.position.y=.40; floatTip.material=bobberMaterial;
  const ripples = Array.from({length:3}, (_,i)=>{
    const material=new StandardMaterial(`fishing-ripple-material-${i}`,scene);
    material.diffuseColor=Color3.FromHexString('#d6faff');
    material.emissiveColor=Color3.FromHexString('#a9e9ef').scale(.35);
    material.disableLighting=true; material.alpha=.5;
    const mesh=MeshBuilder.CreateTorus(`fishing-water-ripple-${i}`,{diameter:.48,thickness:.018,tessellation:24},scene);
    mesh.material=material;mesh.isPickable=false;mesh.setEnabled(false);
    return mesh;
  });
  const drops=Array.from({length:6},(_,i)=>{
    const mesh=MeshBuilder.CreateSphere(`fishing-water-drop-${i}`,{diameter:.065,segments:6},scene);
    mesh.material=floatWhite;mesh.isPickable=false;mesh.setEnabled(false);return mesh;
  });
  let landingTime=0;
  const hideWaterEffects=()=>{ripples.forEach(mesh=>mesh.setEnabled(false));drops.forEach(mesh=>mesh.setEnabled(false));};
  const updateWaterEffects=delta=>{
    landingTime=Math.max(0,landingTime-delta);
    const active=['waiting','bite','reel'].includes(phase);
    if(!active){hideWaterEffects();return;}
    const nibbling=phase==='waiting'&&fishingNibbleState(timeUntilBiteMs);
    const strong=phase==='bite'||landingTime>0;
    const speed=strong?1.5:nibbling?1:.45;
    ripples.forEach((mesh,i)=>{
      const age=(elapsed*speed+i/3)%1;
      const radius=(strong?1.3:nibbling?.85:.55)*age+.35;
      mesh.position.set(bobber.position.x,target.y+.10+i*.003,bobber.position.z);
      mesh.scaling.set(radius,1,radius);
      mesh.material.alpha=(1-age)*(strong?.75:nibbling?.55:.3);
      mesh.setEnabled(true);
    });
    drops.forEach((mesh,i)=>{
      mesh.setEnabled(strong);
      if(!strong)return;
      const age=(elapsed*1.8+i*.13)%1,angle=i*Math.PI/3;
      const radius=.12+age*.5;
      mesh.position.set(bobber.position.x+Math.cos(angle)*radius,target.y+.12+Math.sin(age*Math.PI)*.38,bobber.position.z+Math.sin(angle)*radius);
      mesh.scaling.set(.7,1.4*(1-age)+.4,.7);
    });
  };

  const silhouetteMaterial = new StandardMaterial('fishing-shadow-material', scene);
  silhouetteMaterial.diffuseColor = Color3.FromHexString('#082e51');
  silhouetteMaterial.emissiveColor = Color3.FromHexString('#082e51').scale(0.28);
  silhouetteMaterial.alpha = 0.8;
  silhouetteMaterial.backFaceCulling = false;
  const silhouette = MeshBuilder.CreateSphere('fishing-fish-shadow', {diameter:1,segments:12}, scene);
  silhouette.scaling.set(.18,.016,.52);
  silhouette.material = silhouetteMaterial;
  silhouette.setEnabled(false);
  const shadowTail = MeshBuilder.CreateSphere('fishing-shadow-tail',{diameter:1,segments:8},scene);
  shadowTail.scaling.set(.16,.012,.13);shadowTail.material=silhouetteMaterial;shadowTail.setEnabled(false);
  const splashMaterial = new StandardMaterial('fishing-bite-splash-material',scene);
  splashMaterial.diffuseColor=Color3.FromHexString('#e4fbff');
  splashMaterial.emissiveColor=Color3.FromHexString('#91edff').scale(.45);
  splashMaterial.alpha=.85;
  const splash=MeshBuilder.CreateTorus('fishing-bite-splash',{diameter:.4,thickness:.035,tessellation:20},scene);
  splash.material=splashMaterial;splash.setEnabled(false);
  const alertMaterial=new StandardMaterial('fishing-bite-alert-material',scene);
  alertMaterial.diffuseColor=Color3.White();alertMaterial.emissiveColor=Color3.White();alertMaterial.disableLighting=true;
  const biteAlert=MeshBuilder.CreatePlane('fishing-bite-alert',{width:.10,height:.30},scene);
  biteAlert.billboardMode=Mesh.BILLBOARDMODE_ALL;biteAlert.material=alertMaterial;biteAlert.setEnabled(false);
  const biteAlertDot=MeshBuilder.CreateSphere('fishing-bite-alert-dot',{diameter:.12,segments:8},scene);
  biteAlertDot.material=alertMaterial;biteAlertDot.setEnabled(false);

  // =========================================================================
  // NÂNG CẤP MESH CÁ CHIBI PLAY TOGETHER (CUTE EXPRESSIVE CARTOON FISH)
  // - Đôi mắt to tròn Anime long lanh ánh sao, má hồng đào Chibi dễ thương
  // - Miệng cười nhỏ xinh ngộ nghĩnh, viền vây đuôi uốn lượn xòe mềm mại
  // - Vương miện vàng Hoàng gia (Play Together Crown) đính ngọc quý cho cá Huyền thoại
  // - Vân sọc, hoa văn đốm và râu cá trê chuyển động sống động
  // =========================================================================
  const caughtMaterial = new StandardMaterial('caught-fish-material', scene);
  caughtMaterial.diffuseColor = Color3.FromHexString('#f59e0b');
  caughtMaterial.ambientColor = Color3.FromHexString('#f59e0b').scale(0.4);
  caughtMaterial.emissiveColor = Color3.FromHexString('#f59e0b').scale(0.18);
  caughtMaterial.specularColor = new Color3(0.35, 0.35, 0.35);
  caughtMaterial.specularPower = 32;

  const caughtRoot = new TransformNode('caught-fish', scene);

  // Thân cá tròn bầu bĩnh Chibi (Cute Chubby Body)
  const body = MeshBuilder.CreateSphere('caught-fish-body', { diameter: 1, segments: 16 }, scene);
  body.scaling.set(.48, .22, .18);
  body.material = caughtMaterial;
  body.parent = caughtRoot;

  // Đuôi cá thon thả uốn lượn (Wavy Caudal Tail)
  const tail = MeshBuilder.CreateSphere('caught-fish-tail', { diameter: 1, segments: 12 }, scene);
  tail.position.x = -.27;
  tail.scaling.set(.19, .11, .07);
  tail.material = caughtMaterial;
  tail.parent = caughtRoot;

  // Cánh quạt vây đuôi cá xòe rộng duyên dáng (Fan-shaped Tail Lobes)
  const tailLobes = [];
  for (const side of [-1, 1]) {
    const lobe = MeshBuilder.CreateSphere(`caught-fish-tail-lobe-${side}`, { diameter: 1, segments: 10 }, scene);
    lobe.position.set(-.36, side * .05, 0);
    lobe.rotation.z = side * .45;
    lobe.scaling.set(.14, .085, .04);
    lobe.material = caughtMaterial;
    lobe.parent = caughtRoot;
    tailLobes.push(lobe);
  }

  const rayDisc=MeshBuilder.CreateCylinder('caught-fish-ray-disc',{height:.07,diameterTop:.75,diameterBottom:.70,tessellation:4},scene);
  rayDisc.parent=caughtRoot;rayDisc.material=caughtMaterial;rayDisc.rotation.y=Math.PI/4;rayDisc.scaling.set(.9,1,1.15);rayDisc.setEnabled(false);
  const pufferSpikes=Array.from({length:10},(_,i)=>{
    const mesh=MeshBuilder.CreateCylinder(`caught-fish-puffer-spike-${i}`,{height:.11,diameterTop:0,diameterBottom:.05,tessellation:5},scene);
    const angle=i*Math.PI/5;mesh.position.set(Math.cos(angle)*.17,Math.sin(angle)*.16,(i%2?1:-1)*.12);mesh.rotation.z=angle-Math.PI/2;mesh.parent=caughtRoot;mesh.material=floatWhite;mesh.setEnabled(false);return mesh;
  });
  // Mắt Anime tròn xoe long lanh chuẩn Play Together (Cute Glossy Anime Eyes)
  const eyeWhiteMat = new StandardMaterial('caught-fish-eye-white-mat', scene);
  eyeWhiteMat.diffuseColor = Color3.White();
  eyeWhiteMat.emissiveColor = Color3.White().scale(0.2);

  const eyeMaterial = new StandardMaterial('caught-fish-eye-material', scene);
  eyeMaterial.diffuseColor = Color3.FromHexString('#0f172a'); // Đồng tử đen tuyền sâu thẳm

  const blushMaterial = new StandardMaterial('caught-fish-blush-mat', scene);
  blushMaterial.diffuseColor = Color3.FromHexString('#f472b6');
  blushMaterial.emissiveColor = Color3.FromHexString('#f472b6').scale(0.3);
  blushMaterial.alpha = 0.85;

  const eyes = [];
  const eyeScleras = [];
  const gleams = [];
  const gleams2 = [];
  const blushes = [];

  for (const side of [-1, 1]) {
    // Tròng trắng mắt
    const eyeWhite = MeshBuilder.CreateSphere(`caught-fish-eye-sclera-${side}`, { diameter: .075, segments: 10 }, scene);
    eyeWhite.position.set(.26, .065, side * .138);
    eyeWhite.scaling.set(1.0, 1.15, 0.45);
    eyeWhite.material = eyeWhiteMat;
    eyeWhite.parent = caughtRoot;
    eyeScleras.push(eyeWhite);

    // Con ngươi to tròn đáng yêu
    const eye = MeshBuilder.CreateSphere(`caught-fish-eye-${side}`, { diameter: .058, segments: 10 }, scene);
    eye.position.set(.263, .065, side * .143);
    eye.scaling.set(0.9, 1.05, 0.4);
    eye.material = eyeMaterial;
    eye.parent = caughtRoot;
    eyes.push(eye);

    // Điểm sáng lấp lánh chính (Primary sparkle)
    const gleam = MeshBuilder.CreateSphere(`caught-fish-eye-gleam-${side}`, { diameter: .022, segments: 8 }, scene);
    gleam.position.set(.272, .078, side * .166);
    gleam.material = splashMaterial;
    gleam.parent = caughtRoot;
    gleams.push(gleam);

    // Điểm sáng phụ dưới (Secondary mini sparkle)
    const gleam2 = MeshBuilder.CreateSphere(`caught-fish-eye-gleam2-${side}`, { diameter: .012, segments: 6 }, scene);
    gleam2.position.set(.268, .052, side * .162);
    gleam2.material = splashMaterial;
    gleam2.parent = caughtRoot;
    gleams2.push(gleam2);

    // Má hồng Chibi siêu đáng yêu
    const blush = MeshBuilder.CreateSphere(`caught-fish-blush-${side}`, { diameter: .045, segments: 8 }, scene);
    blush.position.set(.22, -.01, side * .148);
    blush.scaling.set(1.1, 0.6, 0.15);
    blush.material = blushMaterial;
    blush.parent = caughtRoot;
    blushes.push(blush);
  }

  // Miệng cười nhỏ xinh thân thiện (Cute Smiling Mouth)
  const mouthMat = new StandardMaterial('caught-fish-mouth-mat', scene);
  mouthMat.diffuseColor = Color3.FromHexString('#334155');
  const mouth = MeshBuilder.CreateTorus('caught-fish-mouth', { diameter: .045, thickness: .012, tessellation: 12 }, scene);
  mouth.rotation.x = Math.PI * 0.5;
  mouth.rotation.y = Math.PI * 0.5;
  mouth.position.set(.43, -.04, 0);
  mouth.scaling.set(0.6, 1.0, 1.0);
  mouth.material = mouthMat;
  mouth.parent = caughtRoot;

  // Vây lưng cá uốn cong (Dorsal Fin)
  const fin = MeshBuilder.CreateCylinder('caught-fish-fin', { height: .11, diameterTop: 0.02, diameterBottom: .16, tessellation: 4 }, scene);
  fin.position.y = .16;
  fin.scaling.z = .26;
  fin.material = caughtMaterial;
  fin.parent = caughtRoot;

  // Vây bụng dưới (Ventral Fin)
  const lowerFin = MeshBuilder.CreateCylinder('caught-fish-lower-fin', { height: .13, diameterTop: 0.02, diameterBottom: .17, tessellation: 4 }, scene);
  lowerFin.position.set(-.09, -.16, 0);
  lowerFin.rotation.z = Math.PI;
  lowerFin.scaling.z = .32;
  lowerFin.material = caughtMaterial;
  lowerFin.parent = caughtRoot;

  // Đầu mõm cá tròn trịa (Snout)
  const snout = MeshBuilder.CreateSphere('caught-fish-snout', { diameter: 1, segments: 10 }, scene);
  snout.position.x = .44;
  snout.scaling.set(.11, .075, .105);
  snout.material = caughtMaterial;
  snout.parent = caughtRoot;

  // Bụng cá sáng mịn êm đềm (Smooth Pastel Belly)
  const bellyMaterial = new StandardMaterial('caught-fish-belly-material', scene);
  bellyMaterial.diffuseColor = Color3.FromHexString('#fff1cf');
  bellyMaterial.emissiveColor = Color3.FromHexString('#fff1cf').scale(0.12);
  const belly = MeshBuilder.CreateSphere('caught-fish-belly', { diameter: 1, segments: 12 }, scene);
  belly.scaling.set(.37, .085, .15);
  belly.position.y = -.115;
  belly.material = bellyMaterial;
  belly.parent = caughtRoot;

  // Vây bơi hai bên hông (Pectoral Side Flippers)
  const sideFins = [];
  for (const side of [-1, 1]) {
    const sideFin = MeshBuilder.CreateSphere(`caught-fish-side-fin-${side}`, { diameter: 1, segments: 10 }, scene);
    sideFin.position.set(-.06, -.095, side * .17);
    sideFin.rotation.y = side * .35;
    sideFin.scaling.set(.18, .045, .11);
    sideFin.material = caughtMaterial;
    sideFin.parent = caughtRoot;
    sideFins.push(sideFin);
  }

  // Sọc thân cá (Body Stripes)
  const stripeMaterial = new StandardMaterial('caught-fish-stripe-material', scene);
  stripeMaterial.diffuseColor = Color3.FromHexString('#294f5a');
  const stripes = [];
  for (const x of [-.15, -.02, .11]) {
    const stripe = MeshBuilder.CreateTorus(`caught-fish-stripe-${x}`, { diameter: .42, thickness: .022, tessellation: 20 }, scene);
    stripe.position.x = x;
    stripe.rotation.y = Math.PI / 2;
    stripe.material = stripeMaterial;
    stripe.parent = caughtRoot;
    stripes.push(stripe);
  }

  // Râu cá trê uốn cong ngộ nghĩnh (Cute Curled Catfish Whiskers)
  const whiskerMaterial = new StandardMaterial('caught-fish-whisker-material', scene);
  whiskerMaterial.diffuseColor = Color3.FromHexString('#45616a');
  const whiskers = [];
  for (const side of [-1, 1]) {
    const whisker = MeshBuilder.CreateCylinder(`caught-fish-whisker-${side}`, { height: .26, diameter: .014, tessellation: 6 }, scene);
    whisker.position.set(.5, -.055, side * .095);
    whisker.rotation.x = side * .62;
    whisker.rotation.z = -.8;
    whisker.material = whiskerMaterial;
    whisker.parent = caughtRoot;
    whiskers.push(whisker);
  }

  // Đốm hoa văn lấp lánh (Sparkling Scale Spots)
  const spotMaterial = new StandardMaterial('caught-fish-spot-material', scene);
  spotMaterial.diffuseColor = Color3.FromHexString('#d6a344');
  spotMaterial.emissiveColor = Color3.FromHexString('#d6a344').scale(0.25);
  const spots = [];
  for (const side of [-1, 1]) for (const x of [-.23, -.02, .16]) {
    const spot = MeshBuilder.CreateSphere(`caught-fish-spot-${side}-${x}`, { diameter: 1, segments: 8 }, scene);
    spot.position.set(x, .07, side * .182);
    spot.scaling.set(.042, .034, .01);
    spot.material = spotMaterial;
    spot.parent = caughtRoot;
    spots.push(spot);
  }

  // =========================================================================
  // VƯƠNG MIỆN CÁ VUA HOÀNG GIA (PLAY TOGETHER CROWN FISH - NHƯ HÌNH MẪU)
  // Vương miện vàng 4 cánh nhọn đính ngọc quý rực rỡ trên đầu cá huyền thoại
  // =========================================================================
  const crownMat = new StandardMaterial('caught-fish-crown-mat', scene);
  crownMat.diffuseColor = Color3.FromHexString('#facc15');
  crownMat.emissiveColor = Color3.FromHexString('#f59e0b').scale(0.45);
  crownMat.specularColor = new Color3(0.9, 0.85, 0.4);
  crownMat.specularPower = 64;

  const crownGemMat = new StandardMaterial('caught-fish-crown-gem-mat', scene);
  crownGemMat.diffuseColor = Color3.FromHexString('#ef4444');
  crownGemMat.emissiveColor = Color3.FromHexString('#ef4444').scale(0.5);

  const crownRoot = new TransformNode('caught-fish-crown', scene);
  crownRoot.parent = caughtRoot;

  const crownBand = MeshBuilder.CreateTorus('caught-fish-crown-band', { diameter: .075, thickness: .014, tessellation: 16 }, scene);
  crownBand.rotation.x = Math.PI / 2;
  crownBand.material = crownMat;
  crownBand.parent = crownRoot;

  for (let cIdx = 0; cIdx < 4; cIdx++) {
    const cAng = (cIdx / 4) * Math.PI * 2;
    const cProng = MeshBuilder.CreateCylinder(`caught-fish-crown-prong-${cIdx}`, { height: .042, diameterTop: 0, diameterBottom: .022, tessellation: 4 }, scene);
    cProng.position.set(Math.cos(cAng) * .036, .026, Math.sin(cAng) * .036);
    cProng.material = crownMat;
    cProng.parent = crownRoot;

    const cGem = MeshBuilder.CreateSphere(`caught-fish-crown-gem-${cIdx}`, { diameter: .014, segments: 6 }, scene);
    cGem.position.set(Math.cos(cAng) * .036, .046, Math.sin(cAng) * .036);
    cGem.material = crownGemMat;
    cGem.parent = crownRoot;
  }
  crownRoot.setEnabled(false);

  caughtRoot.setEnabled(false);

  const linePoints = [new Vector3(), new Vector3(), new Vector3()];
  const line = MeshBuilder.CreateLines('local-fishing-line', { points: linePoints, updatable: true }, scene);
  line.color = Color3.FromHexString('#f8fafc');
  line.alpha = 0.86;
  line.setEnabled(false);

  const target = new Vector3();
  const baseTarget = new Vector3();
  let phase = 'idle';
  let fight = null;
  let displayedPull = 0;
  let elapsed = 0;
  let castDistance = 8;
  let animationId = 'basic_cast';
  let timeUntilBiteMs = null;
  let shadowSize = 'medium';
  let shadowShape='oval';
  const shadowDimensions=()=>{const size=FISH_SIZE_SCALE[shadowSize]||1;const shape=FISH_FORMS[shadowShape]||FISH_FORMS.oval;return {width:.18*size*shape[2]/.18,length:.52*size*shape[0]/.54,size};};
  const catchStart = new Vector3();
  let catchAttached = false;

  const animationDuration = (action, id = animationId) => {
    const animation = FISHING_CONFIG.animations[id] || FISHING_CONFIG.animations.basic_cast;
    const key = action === 'cast' ? 'castMs' : action === 'reel' ? 'reelMs' : 'catchMs';
    return (animation[key] || 900) / 1000;
  };

  const hide = () => {
    phase = 'idle';
    elapsed = 0;
    bobber.setEnabled(false);
    hideWaterEffects();
    line.setEnabled(false);
    human.clearFishingPose?.();
    caughtRoot.setEnabled(false);
    silhouette.setEnabled(false);
    shadowTail.setEnabled(false);
    splash.setEnabled(false);
    biteAlert.setEnabled(false);biteAlertDot.setEnabled(false);
    caughtRoot.parent=null;
    catchAttached=false;
  };

  const updateLine = () => {
    const hand = (human.fishingLineOrigin || human.toolGrip || human.rightArm).getAbsolutePosition();
    if(phase==='catch'){
      if(!catchAttached){
        const lift=Math.min(1,elapsed/animationDuration('catch'));
        const eased=1-(1-lift)**3;
        const cradle=(human.torsoNode || root).getAbsolutePosition().add(new Vector3(Math.sin(root.rotation.y)*.42,.43,Math.cos(root.rotation.y)*.42));
        Vector3.LerpToRef(catchStart,cradle,eased,caughtRoot.position);
        caughtRoot.position.y+=Math.sin(lift*Math.PI)*.48;
        caughtRoot.rotation.y=root.rotation.y;
        if(lift>=1){caughtRoot.parent=human.torsoNode || root;caughtRoot.position.set(0,.43,.42);caughtRoot.rotation.set(0,0,0);catchAttached=true;}
      }
      tail.rotation.y=Math.sin(elapsed*11)*.28;
      sideFins.forEach((sideFin, index)=>{
        sideFin.rotation.y=(index?1:-1)*(0.35+Math.sin(elapsed*9)*0.14);
      });
    }
    linePoints[0].copyFrom(hand);
    linePoints[1].set(
      (hand.x + bobber.position.x) * 0.5,
      Math.max(hand.y, bobber.position.y) + 0.22 + (phase==='reel'&&fight ? (1-(fight.tension||0)/100)*.45 : 0),
      (hand.z + bobber.position.z) * 0.5,
    );
    linePoints[2].copyFrom(bobber.position);
    MeshBuilder.CreateLines(null, { points: linePoints, instance: line });
  };

  const update = delta => {
    if (phase === 'idle') return;
    elapsed += delta;
    const hand = (human.fishingLineOrigin || human.toolGrip || human.rightArm).getAbsolutePosition();
    if (phase === 'cast') {
      const progress = Math.min(1, elapsed / animationDuration('cast'));
      Vector3.LerpToRef(hand, baseTarget, progress, bobber.position);
      bobber.position.y += Math.sin(progress*Math.PI)*1.2;
    } else {
      bobber.position.copyFrom(target);
      bobber.position.y += Math.sin(elapsed * (phase === 'bite' ? 16 : 3.4)) * (phase === 'bite' ? 0.075 : 0.025);
      if (phase === 'bite') bobber.position.x += Math.sin(elapsed * 20) * 0.045;
      if (phase === 'bite') { bobber.position.y -= .07; bobber.rotation.z=Math.sin(elapsed*18)*.32; }
      else bobber.rotation.z=Math.sin(elapsed*3.4)*.08;
      if (phase === 'reel') {
        const motion=fight?fishingFightState(fight,Date.now()+(fight.serverOffset||0)):null;
        if(fight)displayedPull+=(Math.min(.85,(fight.pull||0)/100*.85)-displayedPull)*(1-Math.exp(-delta*10));
        const progress=fight?displayedPull:Math.min(.75,elapsed/12);
        Vector3.LerpToRef(target,hand,progress,bobber.position);
        bobber.position.y=target.y+Math.sin(elapsed*12)*.035;
        if(motion){const lateral=(motion.phase==='rush'?.32:motion.phase==='warning'?.10:.035)*(1-motion.fatigue*.5);bobber.position.x+=Math.cos(root.rotation.y)*motion.direction*lateral*Math.sin(elapsed*8);bobber.position.z-=Math.sin(root.rotation.y)*motion.direction*lateral*Math.sin(elapsed*8);}
      }
    }
    if(phase==='waiting'||phase==='bite'){
      if(timeUntilBiteMs!==null)timeUntilBiteMs=Math.max(0,timeUntilBiteMs-delta*1000);
      const approach=phase==='bite'?1:timeUntilBiteMs===null?0:Math.max(0,Math.min(1,(3400-timeUntilBiteMs)/3000));
      const distance=2.1*(1-approach);
      const direction=root.rotation.y+.55;
      const dims=shadowDimensions(),shadowScale=dims.size;
      silhouette.scaling.set(dims.width,.016,dims.length);
      shadowTail.scaling.set(.16*shadowScale,.012,.13*shadowScale);
      silhouette.position.set(target.x+Math.sin(direction)*distance+Math.sin(elapsed*2)*.035,target.y-.035,target.z+Math.cos(direction)*distance+Math.cos(elapsed*2)*.04);
      silhouette.rotation.y=direction+Math.PI;
      shadowTail.position.set(silhouette.position.x+Math.sin(direction)*dims.length*.48,silhouette.position.y,silhouette.position.z+Math.cos(direction)*dims.length*.48);
      shadowTail.rotation.y=silhouette.rotation.y;
      silhouetteMaterial.alpha=phase==='bite'?.92:.76;
      silhouette.setEnabled(approach>0);
      shadowTail.setEnabled(approach>0);
      if(phase==='waiting'&&fishingNibbleState(timeUntilBiteMs))bobber.position.y-=.04+Math.abs(Math.sin(elapsed*20))*.025;
      if(phase==='bite'){
        splash.position.set(target.x,target.y+.1,target.z);
        splash.scaling.setAll(.8+Math.abs(Math.sin(elapsed*10))*.6);
        splash.setEnabled(true);
        const alertY=target.y+.7+Math.sin(elapsed*8)*.05;
        biteAlert.position.set(target.x+.45,alertY,target.z);
        biteAlertDot.position.set(target.x+.45,alertY-.23,target.z);
        biteAlert.setEnabled(true);biteAlertDot.setEnabled(true);
      }else{ splash.setEnabled(false);biteAlert.setEnabled(false);biteAlertDot.setEnabled(false); }
    }else if(phase==='reel'&&fight){const motion=fishingFightState(fight,Date.now()+(fight.serverOffset||0));const dims=shadowDimensions();silhouette.scaling.set(dims.width,.016,dims.length);silhouette.position.set(bobber.position.x,target.y-.035,bobber.position.z);silhouette.rotation.y=root.rotation.y+motion.direction*.6;silhouette.setEnabled(true);shadowTail.setEnabled(false);splash.position.set(bobber.position.x,target.y+.1,bobber.position.z);splash.scaling.setAll(.65+Math.abs(Math.sin(elapsed*12))*.5);splash.setEnabled(motion.phase==='rush'||motion.phase==='warning');biteAlert.setEnabled(false);biteAlertDot.setEnabled(false);
    }else{silhouette.setEnabled(false);shadowTail.setEnabled(false);splash.setEnabled(false);biteAlert.setEnabled(false);biteAlertDot.setEnabled(false);}
    updateWaterEffects(delta);
    updateLine();
  };

  return {
    update,
    isActive() { return phase !== 'idle'; },
    startCast(distance = 8, nextAnimationId = 'basic_cast', waterTarget = null, nextShadowSize = 'medium') {
      castDistance = Math.max(3, Number(distance) || 8);
      animationId = nextAnimationId || 'basic_cast';
      const position = root.getAbsolutePosition();
      const forward = new Vector3(Math.sin(root.rotation.y), 0, Math.cos(root.rotation.y));
      baseTarget.copyFrom(position).addInPlace(forward.scale(castDistance));
      baseTarget.y = position.y + 0.13;
      if(waterTarget && [waterTarget.x,waterTarget.z].every(Number.isFinite)) {
        baseTarget.set(waterTarget.x,waterTarget.y ?? .13,waterTarget.z);
        root.rotation.y=Math.atan2(baseTarget.x-position.x,baseTarget.z-position.z);
      }
      target.copyFrom(baseTarget);
      fight = null;displayedPull=0;landingTime=0;hideWaterEffects();bobber.rotation.set(0,0,0);
      phase = 'cast';
      elapsed = 0;
      timeUntilBiteMs = null;
      shadowSize = nextShadowSize;shadowShape='oval';
      caughtRoot.parent=null;
      bobber.position.copyFrom(position);
      bobber.position.y += 0.9;
      bobber.setEnabled(true);
      line.setEnabled(true);
      caughtRoot.setEnabled(false);
      human.playFishingAction?.('cast', () => {
        phase = 'waiting';
        landingTime=.85;
        elapsed = 0;
        human.setFishingPose?.(true);
      }, animationDuration('cast'));
    },
    setPhase(nextPhase, nextTimeUntilBiteMs = null, nextFight = null) {
      if (phase === 'idle') return;
      fight = nextFight;
      if(nextFight?.shadowShape)shadowShape=nextFight.shadowShape;
      if(nextFight?.shadowSize)shadowSize=nextFight.shadowSize;
      if(Number.isFinite(nextTimeUntilBiteMs))timeUntilBiteMs=Math.max(0,nextTimeUntilBiteMs);
      if (phase === 'cast') return;
      if(nextPhase==='reel' && phase!=='reel') human.playFishingAction?.('reel',()=>human.setFishingPose?.(true),animationDuration('reel'));
      if (nextPhase === 'waiting' || nextPhase === 'bite' || nextPhase === 'reel') phase = nextPhase;
    },
    playReel() {
      if (phase === 'idle') return;
      phase = 'reel';
      elapsed = 0;
      human.playFishingAction?.('reel', () => human.setFishingPose?.(true), animationDuration('reel'));
    },
    finishCatch(success = true, fish = null) {
      if (!success) { hide(); return; }
      phase = 'catch';
      elapsed = 0;
      catchAttached=false;
      caughtRoot.parent=null;
      catchStart.copyFrom(bobber.position);
      if(fish?.color) {
        const c = Color3.FromHexString(fish.color);
        caughtMaterial.diffuseColor = c;
        caughtMaterial.ambientColor = c.scale(0.42);
        caughtMaterial.emissiveColor = c.scale(0.18);
      }
      const form=fishForm(fish);
      const shape=FISH_FORMS[form]||FISH_FORMS.oval;
      rayDisc.setEnabled(form==='flat');body.setEnabled(form!=='flat');belly.setEnabled(form!=='flat');
      pufferSpikes.forEach(mesh=>mesh.setEnabled(form==='round'));
      tail.scaling.set(form==='eel'?.45:form==='flat'?.4:.19,form==='flat'?.025:form==='eel'?.06:.11,form==='flat'?.035:.07);
      tailLobes.forEach(mesh=>mesh.setEnabled(!['eel','flat','round'].includes(form)));
      fin.setEnabled(!['eel','flat','round'].includes(form));lowerFin.setEnabled(!['eel','flat'].includes(form));
      fin.scaling.y=form==='deep'?1.5:1;
      snout.scaling.set(form==='round'?.06:.11,form==='flat'?.04:.075,form==='flat'?.16:.105);

      body.scaling.set(...shape);
      belly.scaling.set(shape[0] * .82, shape[1] * .46, shape[2] * .85);
      belly.position.set(shape[0] * .02, -shape[1] * .52, 0);
      tail.position.x = -shape[0] * .59;
      tailLobes.forEach((lobe, index) => {
        lobe.position.x = -shape[0] * .72;
        lobe.position.y = (index ? 1 : -1) * shape[1] * .32;
      });
      fin.position.y = shape[1] * .76;
      lowerFin.position.y = -shape[1] * .76;
      snout.position.x = shape[0] * .45;

      mouth.position.set(shape[0] * .44, -shape[1] * .22, 0);

      eyes.forEach((eye, index) => {
        const side = index ? 1 : -1;
        const ex = shape[0] * .38;
        const ey = shape[1] * .25;
        const ez = side * shape[2] * .82;
        eye.position.set(ex + .004, ey, ez + side * .006);
        eyeScleras[index].position.set(ex, ey, ez);
        gleams[index].position.set(ex + .012, ey + .014, ez + side * .015);
        gleams2[index].position.set(ex + .008, ey - .012, ez + side * .012);
        blushes[index].position.set(shape[0] * .32, -shape[1] * .05, side * (shape[2] * .83 + .004));
      });

      sideFins.forEach((sideFin, index) => {
        sideFin.position.set(-shape[0] * .07, -shape[1] * .42, (index ? 1 : -1) * shape[2] * .84);
      });

      spots.forEach((spot, index) => {
        spot.position.z = (index < 3 ? -1 : 1) * (shape[2] + .004);
        spot.setEnabled(['carp', 'golden_carp', 'sea_snapper','koi','puffer'].includes(fish?.id));
      });
      for (const stripe of stripes) stripe.setEnabled(['perch', 'river_barb', 'sea_mackerel','tilapia','clownfish'].includes(fish?.id));
      for (const whisker of whiskers) whisker.setEnabled(form === 'catfish');

      // Vương miện hoàng gia Play Together cho cá Huyền thoại (Golden Crown)
      const isCrowned = fish?.rarity === 'legendary' || fish?.id === 'golden_carp';
      crownRoot.setEnabled(isCrowned);
      if (isCrowned) {
        crownRoot.position.set(shape[0] * .12, shape[1] * .88, 0);
        crownRoot.scaling.setAll(1.2);
      }

      stripeMaterial.diffuseColor = fish?.id === 'clownfish' ? Color3.White() : fish?.id === 'perch' ? Color3.FromHexString('#164e32') : Color3.FromHexString('#1e3a5f');
      spotMaterial.diffuseColor = fish?.id === 'koi' ? Color3.FromHexString('#ec6237') : fish?.id === 'sea_snapper' ? Color3.FromHexString('#fef08a') : Color3.FromHexString('#fde047');
      bellyMaterial.diffuseColor = fish?.id === 'golden_carp' ? Color3.FromHexString('#fef9c3') : fish?.id === 'sea_snapper' ? Color3.FromHexString('#ffe4e6') : Color3.FromHexString('#f1f5f9');
      caughtRoot.scaling.setAll(caughtFishScale(fish));
      caughtRoot.setEnabled(true);
      bobber.setEnabled(false);line.setEnabled(false);hideWaterEffects();splash.setEnabled(false);
      silhouette.setEnabled(false);
      biteAlert.setEnabled(false);biteAlertDot.setEnabled(false);
      human.playFishingAction?.('catch', () => human.setFishingCatchPose?.(), animationDuration('catch'));
    },
    clear: hide,
    dispose() {
      hide();
      bobberMaterial.dispose();
      bobber.dispose();floatWhite.dispose();
      ripples.forEach(mesh=>{mesh.material.dispose();mesh.dispose();});drops.forEach(mesh=>mesh.dispose());
      silhouette.dispose();silhouetteMaterial.dispose();
      shadowTail.dispose();splash.dispose();splashMaterial.dispose();biteAlert.dispose();biteAlertDot.dispose();alertMaterial.dispose();
      line.dispose();
      caughtRoot.dispose(false,true);
      caughtMaterial.dispose();eyeMaterial.dispose();eyeWhiteMat.dispose();blushMaterial.dispose();mouthMat.dispose();crownMat.dispose();crownGemMat.dispose();
      bellyMaterial.dispose();stripeMaterial.dispose();whiskerMaterial.dispose();spotMaterial.dispose();
    },
  };
}

export function createPlayer(scene, shadowGenerator, spawn = { x: 0, z: 18 }, controls = {}) {
  const root = new TransformNode('local-player', scene);
  root.position.set(spawn.x, 0, spawn.z);

  // High-quality Stylized Chibi Anime Character
  const human = buildHumanMesh(scene, 'local-player', {
    outfitId: controls.getOutfitId?.() || 'starter',
    outfitColor: controls.getOutfitColor?.() || '#f8fafc',
    customization: controls.getCustomization?.() || null,
    skinColor: controls.getCustomization?.()?.skinColor || '#e6b08f',
    hairColor: controls.getCustomization?.()?.hairColor || '#76503b',
    overallsColor: '#2563eb',
    bootsColor: '#f7f0e6',
    hasHat: false,
    ...avatarAppearance(controls.getOutfitId?.(), controls.getCustomization?.() || null),
    shadows: shadowGenerator,
  });
  human.root.parent = root;
  const fishingRig = createFishingRig(scene, root, human);

  // 3D Vehicle Rigs (Bike, Scooter, Tractor)
  const vehicleRigs = createVehicleRigs(scene, root, shadowGenerator);
  const initialVehicle = controls.getVehicle?.() || 'walk';
  vehicleRigs.setVehicle(initialVehicle);

  // Hero Night Light: Đèn chiếu sáng ấm áp CHỈ chiếu lên nhân vật vào ban đêm, không làm nhấp nháy công trình thế giới
  const heroNightLight = new PointLight('hero-night-light', new Vector3(0, 1.85, 0.45), scene);
  heroNightLight.diffuse = Color3.FromHexString('#fff3db'); // Vàng kem ấm áp
  heroNightLight.specular = Color3.FromHexString('#fef08a');
  heroNightLight.range = 2.4; // Thu hẹp bán kính chỉ bao quanh cơ thể nhân vật
  heroNightLight.intensity = 0;
  heroNightLight.parent = root;
  const updateHeroMeshes = () => {
    const meshes = human.root.getChildMeshes();
    if (meshes?.length) heroNightLight.includedOnlyMeshes = meshes;
  };
  updateHeroMeshes();

  const keys = new Set();
  const virtualInput = { x: 0, y: 0 };
  let sprinting = false;
  let jumpVelocity = 0;
  let jumpGroundY = root.position.y;
  let airborne = false;
  let autoTarget = null;
  let onArrive = null;
  let autoTargetStuckFrames = 0;
  let vehicleSpeed = 0;
  let pedalPhase = 0;
  const diagnostics = { input: false, collided: false, speed: 0, ridingBus: false };
  const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']);
  const isEditing = target => target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
  const isModal = target => target instanceof Element && Boolean(target.closest('[role="dialog"], [aria-modal="true"]'));
  const keyboardBlocked = () => isEditing(document.activeElement) || isModal(document.activeElement);
  const down = event => {
    if (isEditing(event.target) || isModal(event.target) || keyboardBlocked() || event.altKey || event.ctrlKey || event.metaKey) return;
    // Space on a HUD button belongs to that button, not the jump action.
    if (event.code === 'Space' && event.target instanceof Element && event.target.closest('button')) return;
    if (event.code === 'Space' && !event.repeat && !airborne && !fishingRig.isActive() && !controls.isRidingBus?.()) {
      airborne = true;
      jumpVelocity = 6.8;
      jumpGroundY = root.position.y;
      event.preventDefault();
      return;
    }
    if (movementKeys.has(event.code)) {
      keys.add(event.code);
      event.preventDefault();
    }
  };
  const up = event => keys.delete(event.code);
  const clearKeys = () => keys.clear();
  const onVisibilityChange = () => { if (document.hidden) clearKeys(); };
  window.addEventListener('keydown', down, true);
  window.addEventListener('keyup', up, true);
  window.addEventListener('blur', clearKeys);
  document.addEventListener('visibilitychange', onVisibilityChange);


  return {
    root,
    human,
    getDiagnostics() { return { ...diagnostics }; },
    getVehicleId() { return vehicleRigs.getVehicleId(); },
    update(delta) {
      const frameDelta = Math.min(Math.max(Number(delta) || 0, 0), 0.1);
      if (controls.isRidingBus?.()) {
        diagnostics.ridingBus = true;
        autoTarget = null;
        onArrive = null;
        airborne = false;
        // Open-Top Convertible Sightseeing Bus: Player stands tall on the observation deck!
        human.animate(frameDelta, false, 0);
        human.torsoNode.position.y = 0.60;
        human.leftLeg.rotation.set(0, 0, 0);
        human.rightLeg.rotation.set(0, 0, 0);
        // Stylized standing sightseeing pose: hands resting on/holding the front safety rail
        human.leftArm.rotation.set(-0.35, 0.10, -0.12);
        human.rightArm.rotation.set(-0.35, -0.10, 0.12);
        return;
      }
      if (fishingRig.isActive() || human.isFishingBusy?.()) {
        diagnostics.input = false;
        diagnostics.speed = 0;
        autoTarget = null;
        onArrive = null;
        human.animate(frameDelta, false, 0);
        fishingRig.update(frameDelta);
        return;
      }
      // HUD focus must pause gameplay keys without forgetting a physically held key.
      // Clearing on focusin used to discard W/A/S/D until the next keydown.
      const useKeyboard = !keyboardBlocked();
      const horizontal = (useKeyboard ? Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')) : 0) + virtualInput.x;
      const vertical = (useKeyboard ? Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown')) : 0) + virtualInput.y;
      const hasManualInput = horizontal !== 0 || vertical !== 0;
      diagnostics.input = hasManualInput;
      diagnostics.ridingBus = false;
      diagnostics.collided = false;
      diagnostics.speed = 0;
      let direction = Vector3.Zero();
      let isMoving = false;
      const baseSpeed = controls.getSpeed?.() || FARM_CONFIG.playerSpeed;
      const speed = baseSpeed * ((sprinting || keys.has('ShiftLeft') || keys.has('ShiftRight')) ? 1.35 : 1);

      if (hasManualInput) {
        const basis = controls.getCameraBasis?.();
        const forward = basis?.forward || new Vector3(0, 0, -1);
        const right = basis?.right || new Vector3(1, 0, 0);
        direction = forward.scale(vertical).add(right.scale(horizontal));
        autoTarget = null;
        onArrive = null;
        autoTargetStuckFrames = 0;
        isMoving = true;
      } else if (autoTarget) {
        direction.copyFrom(autoTarget).subtractInPlace(root.position);
        direction.y = 0;
        if (direction.length() <= 0.28) {
          const finalStep = controls.resolveMovement?.(
            root.position.x, root.position.z,
            autoTarget.x - root.position.x, autoTarget.z - root.position.z,
          ) || { x: autoTarget.x, z: autoTarget.z };
          const arrived = Math.hypot(finalStep.x - autoTarget.x, finalStep.z - autoTarget.z) < 0.06;
          root.position.x = finalStep.x;
          root.position.z = finalStep.z;
          autoTarget = null;
          const action = onArrive;
          onArrive = null;
          autoTargetStuckFrames = 0;
          if (arrived) action?.();
          human.animate(frameDelta, false, 0);
          return;
        }
        isMoving = true;
      }

      let actualSpeed = 0;
      let turn = 0;
      const vehicleProfile = VEHICLE_MOTION[vehicleRigs.getVehicleId()];
      vehicleSpeed = vehicleProfile ? approachVehicleSpeed(vehicleSpeed, isMoving ? speed : 0, frameDelta, vehicleProfile) : 0;
      if (isMoving && direction.lengthSquared() > 0.0001) {
        direction.normalize();
        const moveDist = (vehicleProfile ? vehicleSpeed : speed) * frameDelta;
        const dx = direction.x * moveDist;
        const dz = direction.z * moveDist;
        const prevX = root.position.x;
        const prevZ = root.position.z;

        if (controls.resolveMovement) {
          const resolved = controls.resolveMovement(prevX, prevZ, dx, dz);
          diagnostics.collided = Boolean(resolved.collided);
          root.position.x = resolved.x;
          root.position.z = resolved.z;

          if (autoTarget) {
            const movedDistSq = (resolved.x - prevX) ** 2 + (resolved.z - prevZ) ** 2;
            if (resolved.collided && movedDistSq < 0.0001) {
              autoTargetStuckFrames++;
              if (autoTargetStuckFrames > 30) {
                autoTarget = null;
                onArrive = null;
                autoTargetStuckFrames = 0;
                controls.onAutoMoveBlocked?.();
              }
            } else {
              autoTargetStuckFrames = 0;
            }
          }
        } else {
          root.position.x += dx;
          root.position.z += dz;
        }
        const moved = Math.hypot(root.position.x - prevX, root.position.z - prevZ);
        actualSpeed = frameDelta > 0 ? moved / frameDelta : 0;
        if (moved > 0.0001) {
          const desiredYaw = Math.atan2(direction.x, direction.z);
          const difference = Math.atan2(Math.sin(desiredYaw - root.rotation.y), Math.cos(desiredYaw - root.rotation.y));
          turn = difference;
          root.rotation.y += vehicleProfile ? difference * (1 - Math.exp(-18 * frameDelta)) : difference;
        }
        if (diagnostics.collided && moved < 0.0001) vehicleSpeed = 0;
      }
      const visiblyMoving = actualSpeed > 0.05;
      diagnostics.speed = actualSpeed;

      // Natural 3D terrain height adaptation (smoothly climb knolls without sinking)
      const targetGroundY = controls.getTerrainHeight ? controls.getTerrainHeight(root.position.x, root.position.z) : 0;

      if (airborne) {
        jumpVelocity -= 18 * frameDelta;
        root.position.y += jumpVelocity * frameDelta;
        if (root.position.y <= targetGroundY) {
          root.position.y = targetGroundY;
          jumpVelocity = 0;
          airborne = false;
          jumpGroundY = targetGroundY;
        }
      } else {
        const diff = targetGroundY - root.position.y;
        if (Math.abs(diff) > 0.001) {
          // Responsive 16x frame delta lerp for seamless, stable slope movement
          root.position.y += diff * Math.min(1.0, 16.0 * frameDelta);
        } else {
          root.position.y = targetGroundY;
        }
        jumpGroundY = root.position.y;
      }

      // If driving a vehicle, apply driving posture and rotate wheels
      if (vehicleRigs.hasVehicle()) {
        // Keep face/accessory animation alive while overriding riding joints.
        human.animate(frameDelta, false, 0);
        vehicleRigs.update(frameDelta, visiblyMoving, actualSpeed, turn);
        pedalPhase += actualSpeed * frameDelta * 2.4;
        applyVehiclePose(human, vehicleRigs.getVehicleId(), visiblyMoving, pedalPhase, vehicleRigs.getRiderOffset());
      } else {
        human.torsoNode.position.z = 0;
        human.root.rotation.z = 0;
        // Procedural walking / breathing animation
        human.animate(frameDelta, visiblyMoving, actualSpeed);
      }
      fishingRig.update(frameDelta);
    },
    moveTo(target, callback) {
      autoTarget = new Vector3(target.x, root.position.y, target.z);
      onArrive = callback || null;
    },
    stop() {
      autoTarget = null;
      onArrive = null;
    },
    setOutfit(idOrColor, color) {
      if (color) {
        human.setOutfit(idOrColor, color);
      } else if (typeof idOrColor === 'string' && idOrColor.startsWith('#')) {
        human.setOutfitColor(idOrColor);
      } else {
        human.setOutfit(idOrColor);
      }
    },
    applyCustomization(customization) {
      human.applyCustomization?.(customization);
    },
    setGender(gender) {
      human.setGender?.(gender);
    },
    setSkinTone(skinTone) {
      human.setSkinTone?.(skinTone);
    },
    setLOD(level) {
      human.setLOD?.(level);
    },
    setVehicle(vehicleId) {
      if (vehicleRigs.getVehicleId() === vehicleId) return;
      vehicleSpeed = 0;
      pedalPhase = 0;
      vehicleRigs.setVehicle(vehicleId);
    },
    setVirtualInput(x = 0, y = 0) {
      virtualInput.x = Math.max(-1, Math.min(1, Number(x) || 0));
      virtualInput.y = Math.max(-1, Math.min(1, Number(y) || 0));
    },
    setSprinting(active) {
      sprinting = Boolean(active);
    },
    jump() {
      if (airborne) return;
      jumpGroundY = root.position.y;
      jumpVelocity = 7.2;
      airborne = true;
    },
    setActiveTool(toolId) {
      human.setActiveTool(toolId);
    },
    startFishingCast(options = {}) {
      autoTarget = null;
      onArrive = null;
      fishingRig.startCast(options.distance || 8, options.animation || 'basic_cast', options.target, options.shadowSize);
    },
    setFishingPhase(phase, timeUntilBiteMs = null, fight = null) {
      fishingRig.setPhase(phase, timeUntilBiteMs, fight);
    },
    playFishingReel() {
      fishingRig.playReel();
    },
    finishFishingCatch(success = true, fish = null) {
      fishingRig.finishCatch(success, fish);
    },
    clearFishing() {
      fishingRig.clear();
    },
    playAction(actionType, onHit, onEnd) {
      autoTarget = null;
      human.playAction(actionType, onHit, onEnd);
    },
    lookAt(targetPos) {
      if (!targetPos) return;
      const angle = Math.atan2(targetPos.x - root.position.x, targetPos.z - root.position.z);
      root.rotation.y = angle;
    },
    isBusy() {
      return human.isPerformingAction();
    },
    setNightLighting(factor = 0) {
      if (!heroNightLight.includedOnlyMeshes?.length) {
        updateHeroMeshes();
      }
      // Khóa cứng: Chỉ phát sáng khi ĐÃ CÓ danh sách mesh giới hạn của nhân vật, tuyệt đối không rọi vào công trình/nhà ở
      if (heroNightLight.includedOnlyMeshes && heroNightLight.includedOnlyMeshes.length > 0) {
        const targetIntensity = Math.max(0, Math.min(1, Number(factor) || 0)) * 0.45;
        heroNightLight.intensity = targetIntensity;
      } else {
        heroNightLight.intensity = 0;
      }
    },
    dispose() {
      window.removeEventListener('keydown', down, true);
      window.removeEventListener('keyup', up, true);
      window.removeEventListener('blur', clearKeys);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      heroNightLight.dispose();
      fishingRig.dispose();
      vehicleRigs.dispose();
    },
  };
}
