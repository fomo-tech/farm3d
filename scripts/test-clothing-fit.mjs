import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { buildHumanMesh } from '../src/game/player/buildHumanMesh.js';
import { getDefaultCustomization, TOPS, BOTTOMS, SHOES } from '../shared/fashionConfig.js';
import { CHARACTER_RENDER_CONFIG, safeCharacterHex } from '../shared/characterConfig.js';
globalThis.OffscreenCanvas ||= class {
  constructor(width,height){this.width=width;this.height=height;}
  getContext(){return new Proxy({}, {get:(_,key)=>key==='measureText'?()=>({width:100}):key==='createRadialGradient'||key==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});}
};
const engine=new NullEngine();
const p=CHARACTER_RENDER_CONFIG.proportions;
for(const gender of ['male','female','neutral']){
 const scene=new Scene(engine);
 const avatar=buildHumanMesh(scene,`fit-${gender}`,{customization:{...getDefaultCustomization(),gender}});
 const find=suffix=>avatar.root.getChildMeshes().find(mesh=>mesh.name.endsWith(suffix));
 for(const top of TOPS){
  avatar.applyCustomization({...getDefaultCustomization(),gender,topId:top.id,topColor:top.color});
  avatar.animate(1/60,false,0);
  for(const side of [1,-1]){
   const sleeve=find(`shoulder-bridge-${side}`);
   assert.ok(sleeve.metadata.sleeveLength<=p.upperArmLength+p.forearmLength+1e-6,`${top.id}: sleeves stop at wrist`);
   assert.ok(sleeve.metadata.sleeveLength>0.14,`${top.id}: valid sleeve surface`);
   const vertices=sleeve.getVerticesData('position');
   assert.ok(vertices.every(Number.isFinite),`${top.id}: finite sleeve geometry`);
   // The armhole's upper rim must sit below the neckline rather than rising into the head.
   assert.ok(vertices[1]<=p.shoulderHeight+0.01,`${top.id}: inner shoulder fits neckline`);
  }
  const before=find('shirt-body').position.y;
  avatar.setTop(top.id,top.color);
  assert.equal(find('shirt-body').position.y,before,`${top.id}: switching never compounds torso scaling`);
 }
 for(const bottom of BOTTOMS){
  avatar.setBottom(bottom.id,bottom.color);
  avatar.animate(1/60,true,4);
  const pants=find('continuous-pants-1');
  assert.ok(pants.getVerticesData('position').every(Number.isFinite),`${bottom.id}: pants bend with legs`);
 }
 for(const id of ['top_tee_white','top_hoodie_cozy','top_tank_basic','top_bomber_varsity']){
  avatar.setTop(id);
  const cuff=find('wrist-cuff-l');
  assert.equal(cuff.isEnabled(),['top_hoodie_cozy','top_bomber_varsity'].includes(id),`${id}: cuff visibility follows sleeve length`);
 }
 avatar.setTop('top_bomber_varsity');
 assert.equal(find('shirt-body').isEnabled(),false,'bomber has one fabric body');
 avatar.setLOD(2);
 assert.equal(find('shirt-body').isEnabled(),true,'distant bomber keeps a body silhouette');
 avatar.setLOD(0);
 avatar.setBottom('bot_cargo_wide');
 const cargo=find('cargo-pocket-1');
 assert.ok(cargo.parent.name.endsWith('leg-root-l'),'cargo pocket follows the moving thigh');
 assert.equal(cargo.isEnabled(),true);
 avatar.setBottom('bot_tennis_skirt');
 assert.equal(cargo.isEnabled(),false,'cargo details disappear with a skirt');
 assert.ok(find('pleated-skirt').getVerticesData('position').every(Number.isFinite),'pleats have valid continuous geometry');
 avatar.setShoes('shoe_doll_flats');
 assert.equal(find('flat-upper-l').material,find('flat-strap-l').material,'flat upper and strap share the selected shoe color');
 for(const topId of ['top_croptop_sport','top_tank_basic','top_ballgown_corset','top_hoodie_cozy']){
  avatar.setTop(topId);
  assert.equal(find('skin-torso').isEnabled(),true,`${topId}: body remains beneath clothing`);
  assert.equal(find('skin-torso').material,find('continuous-arm-1').material,`${topId}: exposed body shares skin tone`);
  const tank=topId==='top_tank_basic';
  assert.equal(find('tank-body').isEnabled(),tank,'tank silhouette only appears for sleeveless tops');
  assert.equal(find('tank-strap-1').isEnabled(),tank,'tank straps switch with garment');
  if(tank){
   assert.equal(find('shirt-body').isEnabled(),false,'tank removes the closed shirt shell');
   assert.equal(find('shoulder-bridge-1').material,find('skin-torso').material,'bare shoulders have skin material');
  }
 }
 avatar.setTop('top_tank_basic');
 avatar.setOutfit('starter');
 assert.equal(find('tank-body').isEnabled(),false,'legacy outfit clears tank geometry');
 assert.equal(find('shirt-body').isEnabled(),true,'legacy outfit restores a complete shirt');
 for(const id of ['top_school_blazer','top_blazer_luxury','top_vest_tuxedo_white','top_vest_pinstripe']){
  avatar.setTop(id);
  assert.equal(find('shirt-body').isEnabled(),false,`${id}: no overlapping shirt body`);
  assert.equal(find('blazer-body').isEnabled(),true,`${id}: selects blazer silhouette`);
  assert.equal(find('shoulder-bridge-1').material,find('blazer-body').material,`${id}: jacket and sleeves match`);
  for(const suffix of ['blazer-shirt-v','blazer-lapel-0','blazer-lapel-1','blazer-tie']){
   const panel=find(suffix);
   assert.ok(panel.getVerticesData('position').every(Number.isFinite),`${id}: finite front panel`);
   const normals=panel.getVerticesData('normal');
   for(let i=2;i<normals.length;i+=3)assert.ok(normals[i]>0,`${id}: front panel faces outward`);
  }
 }
 avatar.setBottom('bot_ballgown_princess');
 const gown=find('ballgown-skirt');
 const longScale=gown.scaling.y;
 avatar.setBottom('bot_gothic_lolita_skirt');
 assert.ok(gown.scaling.y<longScale,'gothic skirt has a shorter silhouette than evening gown');
 assert.equal(find('pleated-skirt').isEnabled(),false,'gothic skirt has one fabric silhouette');
 const shortScale=gown.scaling.y;
 avatar.setBottom('bot_gothic_lolita_skirt');
 assert.equal(gown.scaling.y,shortScale,'repeated skirt selection never compounds length');
 avatar.setBottom('bot_tennis_skirt');
 assert.equal(gown.isEnabled(),false,'evening silhouette disappears when switching skirts');
 avatar.setTop('top_ballgown_corset');
 const corsetColor=find('corset-body').material.diffuseColor.toHexString();
 avatar.setBottom('bot_school_uniform');
 assert.equal(find('corset-body').material.diffuseColor.toHexString(),corsetColor,'skirt color does not overwrite corset');
 for(const id of ['bot_suit_slacks','bot_angel_pants','bot_royal_prince_pants']){
  avatar.setBottom(id);
  assert.equal(find('cargo-pocket-1').isEnabled(),false,`${id}: formal pants have no cargo pockets`);
 }
 for(const shoe of SHOES){
  avatar.setShoes(shoe.id);
  assert.equal(find('flat-sole-l').material.diffuseColor.toHexString(),safeCharacterHex(shoe.soleColor).toUpperCase(),`${shoe.id}: catalog sole color`);
  avatar.setLOD(2);avatar.setLOD(0);
  assert.equal(find('flat-sole-l').material.diffuseColor.toHexString(),safeCharacterHex(shoe.soleColor).toUpperCase(),`${shoe.id}: sole survives LOD switch`);
  assert.equal(find('skate-wheel-1-0-0').isEnabled(),shoe.id==='shoe_roller_skates','only patin has wheels');
  assert.equal(find('geta-block-1-0').isEnabled(),shoe.id==='shoe_geta_wood','only geta has wooden supports');
 }
 scene.dispose();
}
engine.dispose();
console.log('PASS: all catalog tops/bottoms fit male, female and neutral joints; wrist limits, neckline overlap, switching and cuff visibility.');
