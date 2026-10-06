import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3, Matrix } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { createFaceTexture } from './createFaceTexture.js';
import { createLocomotionGait } from './LocomotionGait.js';
import {
  CHARACTER_ANIMATION_CONFIG,
  CHARACTER_LOD_CONFIG,
  CHARACTER_RENDER_CONFIG,
  normalizeCharacterAppearance,
  safeCharacterHex,
  getSkinTone,
} from '../../../shared/characterConfig.js';

const BODY_PROFILES = Object.freeze({
  female: { torsoX: 0.97, torsoY: 1.0, torsoZ: 0.98, head: 1.02, limb: 0.97, shoulder: 0.265, hip: 1.04 },
  male: { torsoX: 1.04, torsoY: 1.02, torsoZ: 1.02, head: 0.99, limb: 1.03, shoulder: 0.28, hip: 0.98 },
  neutral: { torsoX: 1.0, torsoY: 1.0, torsoZ: 1.0, head: 1.0, limb: 1.0, shoulder: 0.27, hip: 1.0 },
});

const HAIR_STYLE_ALIASES = Object.freeze({
  hair_ponytail: 'ponytail',
  hair_classic: 'classic',
  hair_anime_bangs: 'anime_bangs',
  hair_twintails: 'twintails',
  hair_chic_bob: 'bob',
  hair_wavy_curly: 'wavy',
  hair_slick_side: 'slick',
  hair_slick_back: 'slick',
  hair_wolf_cut: 'wavy',
  hair_beach_surfer: 'bob',
  hair_celestial_flow: 'celestial_flow',
});

const TOP_ALIASES = Object.freeze({
  top_tank_basic: 'tank',
  top_tee_white: 'starter',
  top_hoodie_cozy: 'hoodie_pastel',
  top_bomber_varsity: 'bomber',
  top_croptop_sport: 'croptop_summer',
  top_polo_preppy: 'polo',
  top_knit_sweater: 'knit',
  top_school_blazer: 'bomber',
  top_hawaii_shirt: 'starter',
  top_duck_hoodie: 'hoodie_pastel',
  top_angel_tunic: 'knit',
  top_suit_vest_luxury: 'vest',
  top_school_vest: 'vest',
  top_cat_ear_hoodie: 'hoodie_oversized',
  top_dino_hoodie: 'hoodie_oversized',
  top_pastel_cloud_hoodie: 'hoodie_oversized',
  top_sailor_uniform: 'sailor',
  top_cyber_jacket: 'techwear',
  top_royal_prince: 'prince',
  top_ballgown_corset: 'corset_ballgown',
  top_vampire_count: 'vampire',
  top_kimono_sakura: 'kimono',
  top_teddy_mascot: 'hoodie_oversized',
  // Áo Dài Việt Nam
  top_aodai_nu_sen: 'aodai_nu',
  top_aodai_nu_trang: 'aodai_nu',
  top_aodai_nam_gam: 'aodai_nam',
  top_aodai_nam_gold: 'aodai_nam',
  // Học Đường & K-Pop Streetwear
  top_kpop_streetwear: 'kpop_streetwear',
  top_kpop_harness_crop: 'kpop_streetwear',
  top_kpop_cardigan_school: 'vest',
  // Áo Vest & Blazers
  top_blazer_luxury: 'blazer_luxury',
  top_vest_tuxedo_white: 'blazer_luxury',
  top_vest_pinstripe: 'blazer_luxury',
});

const BOTTOM_ALIASES = Object.freeze({
  bot_denim_shorts: 'shorts_denim',
  bot_overalls_bib: 'overalls_blue',
  bot_tennis_skirt: 'skirt_pleated',
  bot_cargo_wide: 'cargo_pants',
  bot_jogger_sport: 'joggers_cozy',
  bot_school_uniform: 'skirt_pleated',
  bot_swim_trunks: 'shorts_denim',
  bot_duck_pants: 'overalls_blue',
  bot_angel_pants: 'cargo_pants',
  bot_suit_slacks: 'cargo_pants',
  bot_plaid_pleated_pink: 'skirt_pleated',
  bot_sailor_skirt: 'skirt_pleated',
  bot_tech_straps: 'cargo_pants',
  bot_ballgown_princess: 'ballgown_princess',
  bot_royal_prince_pants: 'cargo_pants',
  bot_gothic_lolita_skirt: 'ballgown_princess',
  bot_teddy_pants: 'cargo_pants',
  // Áo Dài Quần Lụa & K-Pop Cargo
  bot_aodai_pants_silk: 'aodai_silk',
  bot_aodai_pants_black: 'aodai_silk',
  bot_kpop_cargo_chains: 'cargo_pants',
});

const SHOE_ALIASES = Object.freeze({
  shoe_chunky_white: 'sneaker_chunky',
  shoe_running_neon: 'runner_neon',
  shoe_vintage_boots: 'boots_vintage',
  shoe_puffy_slides: 'slides',
  shoe_doll_flats: 'flats',
  shoe_school_loafers: 'flats',
  shoe_beach_sandals: 'slides',
  shoe_duck_feet: 'sneaker_chunky',
  shoe_celestial_heels: 'flats',
  shoe_oxford_wingtip: 'boots_vintage',
  shoe_dino_claws: 'sneaker_chunky',
  shoe_mary_jane: 'flats',
  shoe_roller_skates: 'runner_neon',
  shoe_glass_slippers: 'flats',
  shoe_royal_prince_boots: 'boots_vintage',
  shoe_geta_wood: 'slides',
});

const EAR_ALIASES = Object.freeze({
  human: 'human',
  cat_ears: 'cat',
  rabbit_ears: 'rabbit',
  bear_ears: 'bear',
  elf_ears: 'elf',
  shiba_ears: 'shiba',
  duck_beak: 'duck',
  halo_crown: 'halo',
  duck_floatie: 'duck_floatie',
  frog_backpack: 'frog_backpack',
  cat_headphones: 'cat_headphones',
  round_glasses: 'round_glasses',
  angel_wings: 'angel_wings',
  fox_tail: 'fox_tail',
  devil_horns: 'devil_horns',
  toast_mouth: 'toast_mouth',
  lollipop_sweet: 'lollipop_sweet',
  steampunk_goggles: 'steampunk_goggles',
  crown_royal: 'crown_royal',
  tiara_princess: 'crown_royal',
  aura_stars: 'aura_stars',
  cape_royal: 'cape_royal',
  cape_vampire: 'cape_royal',
  wings_faerie: 'wings_faerie',
  wings_bat: 'wings_bat',
  non_la_vietnam: 'non_la',
  khan_dong_truyenthong: 'khan_dong',
  kpop_beret: 'kpop_beret',
  kpop_idol_mic: 'kpop_mic',
});

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.14, specularPower = 48) {
  let m = scene.getMaterialByName(name);
  if (!m) {
    m = new StandardMaterial(name, scene);
    m.diffuseColor = Color3.FromHexString(safeCharacterHex(hex, '#f1f5f9'));
    m.ambientColor = m.diffuseColor.scale(0.24);
    m.specularColor = new Color3(specular, specular, specular);
    m.specularPower = specularPower;
    if (emissiveHex) {
      m.emissiveColor = Color3.FromHexString(safeCharacterHex(emissiveHex, '#0f172a'));
    } else {
      m.emissiveColor = Color3.Black();
    }
  }
  return m;
}

/** Original Bình Minh chibi avatar. Keep transform nodes stable for tools and animations. */
export function buildHumanMesh(scene, idPrefix, options = {}) {
  const appearance = normalizeCharacterAppearance({ ...options, ...(options.customization || {}) });
  const outfitId = options.outfitId || 'starter';
  const outfitColor = safeCharacterHex(options.outfitColor || '#f8fafc', '#f8fafc');
  const skinColor = safeCharacterHex(options.skinColor || appearance.skinColor, appearance.skinColor);
  const hairColor = safeCharacterHex(options.hairColor || '#76503b', '#76503b');
  const overallsColor = safeCharacterHex(options.overallsColor || options.pantsColor || '#2563eb', '#2563eb');
  const bootsColor = safeCharacterHex(options.bootsColor || '#f7f0e6', '#f7f0e6');
  const hasHat = Boolean(options.hasHat ?? false);
  const shadowGenerator = options.shadows || null;

  const materials = {
    skin: makeMat(scene, `${idPrefix}-pt-skin`, skinColor, null, 0.08, 32),
    hair: makeMat(scene, `${idPrefix}-pt-hair`, hairColor, null, 0.18, 48),
    hairGlint: makeMat(scene, `${idPrefix}-pt-hair-glint`, '#e2b18c', '#60402b', 0.45, 64),
    sproutGreen: makeMat(scene, `${idPrefix}-pt-sprout`, '#4ade80', '#22c55e', 0.25, 48),
    shirt: makeMat(scene, `${idPrefix}-pt-shirt`, outfitColor, null, 0.10, 32),
    shirtTrim: makeMat(scene, `${idPrefix}-pt-trim`, '#ffffff', null, 0.12, 32),
    topAccent: makeMat(scene, `${idPrefix}-pt-top-accent`, '#f97316', null, 0.14, 40),
    topDark: makeMat(scene, `${idPrefix}-pt-top-dark`, '#1e3a5f', null, 0.12, 36),
    knit: makeMat(scene, `${idPrefix}-pt-knit`, '#f59e0b', null, 0.10, 30),
    hoodieCords: makeMat(scene, `${idPrefix}-pt-cords`, '#f8fafc', null, 0.15, 32),
    overalls: makeMat(scene, `${idPrefix}-pt-overalls`, overallsColor, null, 0.08, 24),
    brass: makeMat(scene, `${idPrefix}-pt-brass`, '#f59e0b', '#b45309', 0.65, 96),
    sneakerBody: makeMat(scene, `${idPrefix}-pt-sneaker-body`, bootsColor, null, 0.2, 48),
    sneakerSole: makeMat(scene, `${idPrefix}-pt-sneaker-sole`, '#f1f5f9', null, 0.08, 24),
    sneakerAccent: makeMat(scene, `${idPrefix}-pt-sneaker-accent`, '#3b82f6', null, 0.25, 48),
    packCanvas: makeMat(scene, `${idPrefix}-pack-canvas`, '#e8ae6b', null, 0.08, 32),
    packFlap: makeMat(scene, `${idPrefix}-pack-flap`, '#b9794e', null, 0.08, 32),
    packStrap: makeMat(scene, `${idPrefix}-pack-strap`, '#8d6646', null, 0.06, 32),
    packLeaf: makeMat(scene, `${idPrefix}-pack-leaf`, '#55a66e', null, 0.08, 32),
    hatStraw: makeMat(scene, `${idPrefix}-pt-hat`, '#fde047', null, 0.08, 32),
    hatRibbon: makeMat(scene, `${idPrefix}-pt-ribbon`, '#ef4444', null, 0.18, 48),
    catEarInner: makeMat(scene, `${idPrefix}-pt-catear-in`, '#fda4af', null, 0.12, 32),
    catEarOuter: makeMat(scene, `${idPrefix}-pt-catear-out`, '#f8fafc', null, 0.18, 48),
    rabbitEarInner: makeMat(scene, `${idPrefix}-pt-rab-in`, '#fbcfe8', null, 0.12, 32),
    rabbitEarOuter: makeMat(scene, `${idPrefix}-pt-rab-out`, '#f8fafc', null, 0.18, 48),
    bearEarInner: makeMat(scene, `${idPrefix}-pt-bear-in`, '#fde68a', null, 0.12, 32),
    bearEarOuter: makeMat(scene, `${idPrefix}-pt-bear-out`, '#92400e', null, 0.18, 48),
    skirt: makeMat(scene, `${idPrefix}-pt-skirt`, '#f43f5e', null, 0.10, 32),
    bottomPocket: makeMat(scene, `${idPrefix}-pt-bottom-pocket`, '#334155', null, 0.08, 28),
    shoeBoot: makeMat(scene, `${idPrefix}-pt-shoe-boot`, '#78350f', null, 0.18, 42),
    shoeNeon: makeMat(scene, `${idPrefix}-pt-shoe-neon`, '#34d399', '#10b981', 0.24, 48),
    tieRed: makeMat(scene, `${idPrefix}-pt-tie-red`, '#ef4444', null, 0.2, 48),
    vestWhite: makeMat(scene, `${idPrefix}-pt-vest-white`, '#ffffff', null, 0.12, 32),
    vestNavy: makeMat(scene, `${idPrefix}-pt-vest-navy`, '#1e293b', null, 0.14, 40),
    cyberNeon: makeMat(scene, `${idPrefix}-pt-cyber-neon`, '#06b6d4', '#22d3ee', 0.45, 64),
    cyberDark: makeMat(scene, `${idPrefix}-pt-cyber-dark`, '#09090b', null, 0.15, 36),
    foxOrange: makeMat(scene, `${idPrefix}-pt-fox-orange`, '#ea580c', null, 0.12, 32),
    foxWhite: makeMat(scene, `${idPrefix}-pt-fox-white`, '#f8fafc', null, 0.10, 32),
    devilRed: makeMat(scene, `${idPrefix}-pt-devil-red`, '#dc2626', '#991b1b', 0.4, 64),
    toastCrust: makeMat(scene, `${idPrefix}-pt-toast-crust`, '#d97706', null, 0.08, 24),
    toastButter: makeMat(scene, `${idPrefix}-pt-toast-butter`, '#fde047', null, 0.3, 48),
    goggleLeather: makeMat(scene, `${idPrefix}-pt-goggle-leather`, '#5c2b16', null, 0.15, 36),
    goggleLens: makeMat(scene, `${idPrefix}-pt-goggle-lens`, '#06b6d4', '#0891b2', 0.6, 96),
    royalGold: makeMat(scene, `${idPrefix}-pt-royal-gold`, '#fbbf24', '#f59e0b', 0.65, 96),
    royalRed: makeMat(scene, `${idPrefix}-pt-royal-red`, '#991b1b', null, 0.15, 36),
    kimonoPink: makeMat(scene, `${idPrefix}-pt-kimono-pink`, '#f472b6', null, 0.12, 32),
    batWingDark: makeMat(scene, `${idPrefix}-pt-bat-dark`, '#3b0764', '#1e1b4b', 0.25, 48),
    fairyWingGlow: makeMat(scene, `${idPrefix}-pt-fairy-glow`, '#67e8f9', '#a5f3fc', 0.5, 64),
    aodaiSilk: makeMat(scene, `${idPrefix}-pt-aodai-silk`, '#f472b6', null, 0.28, 48),
    aodaiGoldTrim: makeMat(scene, `${idPrefix}-pt-aodai-gold`, '#fbbf24', '#f59e0b', 0.55, 64),
    aodaiPantsMat: makeMat(scene, `${idPrefix}-pt-aodai-pants`, '#fdfbf7', null, 0.18, 40),
    nonLaStraw: makeMat(scene, `${idPrefix}-pt-nonla-straw`, '#fef08a', null, 0.08, 24),
    nonLaRibbon: makeMat(scene, `${idPrefix}-pt-nonla-ribbon`, '#f472b6', null, 0.15, 32),
    khanDongNavy: makeMat(scene, `${idPrefix}-pt-khandong`, '#1e3a8a', null, 0.22, 48),
    kpopChainSilver: makeMat(scene, `${idPrefix}-pt-kpop-chain`, '#e2e8f0', '#94a3b8', 0.8, 128),
    kpopBeretMat: makeMat(scene, `${idPrefix}-pt-kpop-beret`, '#18181b', null, 0.12, 32),
    blazerLapel: makeMat(scene, `${idPrefix}-pt-blazer-lapel`, '#0f172a', null, 0.2, 48),
    leatherBrown: makeMat(scene, `${idPrefix}-pt-leather-brown`, '#5c2b16', null, 0.22, 40),
    silverMetal: makeMat(scene, `${idPrefix}-pt-silver-metal`, '#e2e8f0', '#94a3b8', 0.75, 120),
    laceWhite: makeMat(scene, `${idPrefix}-pt-lace-white`, '#ffffff', null, 0.15, 32),
    jadeGreen: makeMat(scene, `${idPrefix}-pt-jade-green`, '#10b981', '#059669', 0.5, 64),
    sockWhite: makeMat(scene, `${idPrefix}-pt-sock-white`, '#f8fafc', null, 0.10, 24),
  };
  // Soft, subtle subsurface scatter on skin; no radioactive glow on hair and shirt.
  materials.skin.ambientColor = materials.skin.diffuseColor.scale(CHARACTER_RENDER_CONFIG.material.skinAmbient);
  materials.skin.emissiveColor = materials.skin.diffuseColor.scale(CHARACTER_RENDER_CONFIG.material.skinEmissive);
  materials.hair.ambientColor = materials.hair.diffuseColor.scale(CHARACTER_RENDER_CONFIG.material.hairAmbient);
  materials.shirt.ambientColor = materials.shirt.diffuseColor.scale(CHARACTER_RENDER_CONFIG.material.clothingAmbient);
  materials.hair.emissiveColor = Color3.Black();
  materials.shirt.emissiveColor = Color3.Black();

  const root = new TransformNode(`${idPrefix}-pt-root`, scene);
  const proportions = CHARACTER_RENDER_CONFIG.proportions;
  const armJoints = [];
  const armSurfaces = [];
  const legJoints = [];
  const detailVisibility = new Map();
  const longSleeves = [];
  const shortSleeves = [];
  const shoulderSurfaces = [];
  const wristCuffs = [];
  let clothingScaled = false;
  let aodaiNamFrontFlapNode = null;
  let aodaiNamBackFlapNode = null;
  let aodaiNamPendantNode = null;
  let aodaiNuFrontFlapNode = null;
  let aodaiNuBackFlapNode = null;

  // ========================================================
  // 1. TORSO NODE (Thân giọt nước Chibi mũm mĩm & Áo Hoodie)
  // ========================================================
  const torsoNode = new TransformNode(`${idPrefix}-torso-node`, scene);
  torsoNode.position.y = 0.60;
  torsoNode.parent = root;

  // Tapered fabric torso, with a clean hem instead of a spherical belly.
  const shirtBody = MeshBuilder.CreateLathe(`${idPrefix}-shirt-body`, {
    shape: [
      new Vector3(0.235,-0.215,0), new Vector3(0.251,-0.205,0),
      new Vector3(0.261,-0.18,0), new Vector3(0.267,-0.12,0),
      new Vector3(0.263,-0.04,0), new Vector3(0.253,0.05,0),
      new Vector3(0.243,0.13,0), new Vector3(0.232,0.18,0),
      new Vector3(0.214,0.207,0), new Vector3(0.187,0.220,0),
      new Vector3(0.153,0.224,0),
    ],
    tessellation: 32, cap: 3,
  }, scene);
  shirtBody.position.y = 0.22;
  shirtBody.material = materials.shirt;
  shirtBody.parent = torsoNode;

  const teeHem = MeshBuilder.CreateTorus(`${idPrefix}-tee-hem`, {
    diameter: 0.54, thickness: 0.022, tessellation: 24,
  }, scene);
  teeHem.position.y = 0.01;
  teeHem.material = materials.shirt;
  teeHem.parent = torsoNode;

  // Bo gấu áo hoodie mềm mại
  const shirtHem = MeshBuilder.CreateTorus(`${idPrefix}-shirt-hem`, {
    diameter: 0.50,
    thickness: 0.045,
    tessellation: 18,
  }, scene);
  shirtHem.scaling.z = 0.86;
  shirtHem.position.y = 0.03;
  shirtHem.material = materials.shirtTrim;
  shirtHem.parent = torsoNode;

  // Mũ trùm đầu Hoodie vắt sau gáy (Back Hood Puff)
  const backHood = MeshBuilder.CreateSphere(`${idPrefix}-back-hood`, { diameter: 0.36, segments: 12 }, scene);
  backHood.scaling.set(1.2, 0.55, 0.75);
  backHood.position.set(0, 0.40, -0.22);
  backHood.material = materials.shirt;
  backHood.parent = torsoNode;

  // Cổ áo tròn Peter Pan phong cách Chibi đáng yêu
  const collar = MeshBuilder.CreateTorus(`${idPrefix}-collar`, {
    diameter: 0.26,
    thickness: 0.042,
    tessellation: 16,
  }, scene);
  collar.position.y = 0.44;
  collar.material = materials.shirtTrim;
  collar.parent = torsoNode;

  const hoodieDetails = [backHood, shirtHem];
  // Hoodie details are only visible with the farmer outfit.
  [-0.065, 0.065].forEach((dx, i) => {
    const cord = MeshBuilder.CreateCylinder(`${idPrefix}-cord-${i}`, {
      height: 0.16,
      diameter: 0.015,
      tessellation: 6,
    }, scene);
    cord.position.set(dx, 0.32, 0.23);
    cord.rotation.x = -0.15;
    cord.material = materials.hoodieCords;
    cord.parent = torsoNode;
    hoodieDetails.push(cord);

    const cordTip = MeshBuilder.CreateSphere(`${idPrefix}-cord-tip-${i}`, { diameter: 0.028, segments: 6 }, scene);
    cordTip.position.set(dx, 0.23, 0.245);
    cordTip.material = materials.shirtTrim;
    cordTip.parent = torsoNode;
    hoodieDetails.push(cordTip);
  });

  // Modular fashion silhouettes. Keep them as rounded primitives so a new
  // outfit can be swapped without loading another GLB or skeleton.
  const topVariants = {
    bomber: new TransformNode(`${idPrefix}-top-bomber`, scene),
    polo: new TransformNode(`${idPrefix}-top-polo`, scene),
    knit: new TransformNode(`${idPrefix}-top-knit`, scene),
    vest: new TransformNode(`${idPrefix}-top-vest`, scene),
    hoodie_oversized: new TransformNode(`${idPrefix}-top-hoodie-oversized`, scene),
    sailor: new TransformNode(`${idPrefix}-top-sailor`, scene),
    techwear: new TransformNode(`${idPrefix}-top-techwear`, scene),
    prince: new TransformNode(`${idPrefix}-top-prince`, scene),
    vampire: new TransformNode(`${idPrefix}-top-vampire`, scene),
    kimono: new TransformNode(`${idPrefix}-top-kimono`, scene),
    aodai_nu: new TransformNode(`${idPrefix}-top-aodai-nu`, scene),
    aodai_nam: new TransformNode(`${idPrefix}-top-aodai-nam`, scene),
    blazer_luxury: new TransformNode(`${idPrefix}-top-blazer-luxury`, scene),
    kpop_streetwear: new TransformNode(`${idPrefix}-top-kpop-streetwear`, scene),
    corset_ballgown: new TransformNode(`${idPrefix}-top-corset-ballgown`, scene),
  };
  Object.values(topVariants).forEach(node => {
    node.parent = torsoNode;
    node.setEnabled(false);
  });

  const bomberBody = shirtBody.clone(`${idPrefix}-bomber-body`);
  bomberBody.scaling.set(1.045, 1.015, 1.045);
  bomberBody.position.set(0, 0.22, 0.01);
  bomberBody.material = materials.topDark;
  bomberBody.parent = topVariants.bomber;
  const bomberHem = MeshBuilder.CreateTorus(`${idPrefix}-bomber-hem`, { diameter: 0.52, thickness: 0.035, tessellation: 18 }, scene);
  bomberHem.position.y = 0.03;
  bomberHem.material = materials.topAccent;
  bomberHem.parent = topVariants.bomber;
  const bomberCollar = MeshBuilder.CreateTorus(`${idPrefix}-bomber-collar`, { diameter: 0.28, thickness: 0.035, tessellation: 16 }, scene);
  bomberCollar.position.y = 0.43;
  bomberCollar.material = materials.topAccent;
  bomberCollar.parent = topVariants.bomber;
  [-0.13, 0.13].forEach((sx, index) => {
    const stripe = MeshBuilder.CreateBox(`${idPrefix}-bomber-stripe-${index}`, { width: 0.035, height: 0.32, depth: 0.028 }, scene);
    stripe.position.set(sx, 0.22, 0.24);
    stripe.material = materials.topAccent;
    stripe.parent = topVariants.bomber;
  });

  const bomberZip = MeshBuilder.CreateBox(`${idPrefix}-bomber-zip`, { width: 0.02, height: 0.38, depth: 0.025 }, scene);
  bomberZip.position.set(0, 0.22, 0.25);
  bomberZip.material = materials.silverMetal;
  bomberZip.parent = topVariants.bomber;

  const bomberBadge = MeshBuilder.CreateSphere(`${idPrefix}-bomber-badge`, { diameter: 0.07, segments: 8 }, scene);
  bomberBadge.scaling.set(1.1, 1.1, 0.25);
  bomberBadge.position.set(0.12, 0.31, 0.25);
  bomberBadge.material = materials.royalGold;
  bomberBadge.parent = topVariants.bomber;

  const poloCollar = MeshBuilder.CreateTorus(`${idPrefix}-polo-collar`, { diameter: 0.30, thickness: 0.042, tessellation: 16 }, scene);
  poloCollar.position.set(0, 0.43, 0.02);
  poloCollar.material = materials.shirtTrim;
  poloCollar.parent = topVariants.polo;

  const poloCrest = MeshBuilder.CreateSphere(`${idPrefix}-polo-crest`, { diameter: 0.055, segments: 8 }, scene);
  poloCrest.scaling.set(1.0, 1.0, 0.25);
  poloCrest.position.set(0.11, 0.31, 0.25);
  poloCrest.material = materials.royalGold;
  poloCrest.parent = topVariants.polo;

  [-0.04, 0.04].forEach((sx, index) => {
    const button = MeshBuilder.CreateCylinder(`${idPrefix}-polo-button-${index}`, { height: 0.018, diameter: 0.035, tessellation: 10 }, scene);
    button.rotation.x = Math.PI / 2;
    button.position.set(sx, 0.31 - index * 0.07, 0.275);
    button.material = materials.brass;
    button.parent = topVariants.polo;
  });

  const knitBody = shirtBody.clone(`${idPrefix}-knit-body`);
  knitBody.scaling.set(1.045, 1.015, 1.045);
  knitBody.position.set(0, 0.22, 0.01);
  knitBody.material = materials.knit;
  knitBody.parent = topVariants.knit;
  [0.09, 0.20, 0.31].forEach((y, index) => {
    const knitRib = MeshBuilder.CreateTorus(`${idPrefix}-knit-rib-${index}`, { diameter: 0.49, thickness: 0.012, tessellation: 18 }, scene);
    knitRib.position.set(0, y, 0.02);
    knitRib.scaling.z = 0.88;
    knitRib.material = materials.shirtTrim;
    knitRib.parent = topVariants.knit;
  });

  // 4. VEST QUÝ TỘC TUXEDO (Gile & Sơ Mi Trắng & Nơ Bướm Quý Phái)
  const vestBody = shirtBody.clone(`${idPrefix}-vest-body`);
  vestBody.scaling.set(1.045, 1.015, 1.045);
  vestBody.position.set(0, 0.22, 0.01);
  vestBody.material = materials.vestNavy;
  vestBody.parent = topVariants.vest;

  const vestShirtV = MeshBuilder.CreateBox(`${idPrefix}-vest-shirt-v`, { width: 0.18, height: 0.22, depth: 0.08 }, scene);
  vestShirtV.position.set(0, 0.35, 0.22);
  vestShirtV.material = materials.vestWhite;
  vestShirtV.parent = topVariants.vest;

  [-0.07, 0.07].forEach((cx, idx) => {
    const collarLapel = MeshBuilder.CreateBox(`${idPrefix}-vest-collar-${idx}`, { width: 0.06, height: 0.08, depth: 0.03 }, scene);
    collarLapel.rotation.z = idx === 0 ? 0.35 : -0.35;
    collarLapel.position.set(cx, 0.41, 0.25);
    collarLapel.material = materials.vestWhite;
    collarLapel.parent = topVariants.vest;
  });

  const bowCenter = MeshBuilder.CreateSphere(`${idPrefix}-bow-center`, { diameter: 0.05, segments: 8 }, scene);
  bowCenter.position.set(0, 0.40, 0.27);
  bowCenter.material = materials.tieRed;
  bowCenter.parent = topVariants.vest;
  [-0.05, 0.05].forEach((bx, idx) => {
    const bowWing = MeshBuilder.CreateSphere(`${idPrefix}-bow-wing-${idx}`, { diameter: 0.06, segments: 8 }, scene);
    bowWing.scaling.set(1.4, 0.7, 0.5);
    bowWing.rotation.z = idx === 0 ? 0.2 : -0.2;
    bowWing.position.set(bx, 0.40, 0.265);
    bowWing.material = materials.tieRed;
    bowWing.parent = topVariants.vest;
  });

  [0.28, 0.20, 0.12].forEach((by, idx) => {
    const vestBtn = MeshBuilder.CreateCylinder(`${idPrefix}-vest-btn-${idx}`, { height: 0.016, diameter: 0.034, tessellation: 10 }, scene);
    vestBtn.rotation.x = Math.PI / 2;
    vestBtn.position.set(0, by, 0.27);
    vestBtn.material = materials.brass;
    vestBtn.parent = topVariants.vest;
  });

  const pocketSquare = MeshBuilder.CreateBox(`${idPrefix}-pocket-square`, { width: 0.07, height: 0.035, depth: 0.02 }, scene);
  pocketSquare.rotation.z = 0.15;
  pocketSquare.position.set(0.12, 0.29, 0.25);
  pocketSquare.material = materials.vestWhite;
  pocketSquare.parent = topVariants.vest;

  // 5. HOODIE OVERSIZED SIÊU PHỒNG (Streetwear & Dino Form Rộng)
  const ovrHoodieBody = shirtBody.clone(`${idPrefix}-ovr-hoodie-body`);
  ovrHoodieBody.scaling.set(1.08, 1.03, 1.08);
  ovrHoodieBody.position.set(0, 0.22, 0.01);
  ovrHoodieBody.material = materials.shirt;
  ovrHoodieBody.parent = topVariants.hoodie_oversized;

  const ovrHoodieHem = MeshBuilder.CreateTorus(`${idPrefix}-ovr-hoodie-hem`, { diameter: 0.54, thickness: 0.05, tessellation: 20 }, scene);
  ovrHoodieHem.scaling.z = 0.88;
  ovrHoodieHem.position.y = 0.02;
  ovrHoodieHem.material = materials.shirtTrim;
  ovrHoodieHem.parent = topVariants.hoodie_oversized;

  const pouch = MeshBuilder.CreateBox(`${idPrefix}-ovr-pouch`, { width: 0.32, height: 0.17, depth: 0.08 }, scene);
  pouch.position.set(0, 0.13, 0.26);
  pouch.material = materials.shirt;
  pouch.parent = topVariants.hoodie_oversized;

  [-0.14, 0.14].forEach((px, idx) => {
    const pocketTrim = MeshBuilder.CreateBox(`${idPrefix}-pouch-trim-${idx}`, { width: 0.025, height: 0.14, depth: 0.085 }, scene);
    pocketTrim.rotation.z = idx === 0 ? -0.3 : 0.3;
    pocketTrim.position.set(px, 0.14, 0.265);
    pocketTrim.material = materials.shirtTrim;
    pocketTrim.parent = topVariants.hoodie_oversized;
  });

  const bigBackHood = MeshBuilder.CreateSphere(`${idPrefix}-big-back-hood`, { diameter: 0.44, segments: 14 }, scene);
  bigBackHood.scaling.set(1.28, 0.72, 0.90);
  bigBackHood.position.set(0, 0.42, -0.22);
  bigBackHood.material = materials.shirt;
  bigBackHood.parent = topVariants.hoodie_oversized;

  [-0.075, 0.075].forEach((dx, i) => {
    const cord = MeshBuilder.CreateCylinder(`${idPrefix}-ovr-cord-${i}`, { height: 0.22, diameter: 0.022, tessellation: 8 }, scene);
    cord.position.set(dx, 0.30, 0.25);
    cord.rotation.x = -0.15;
    cord.material = materials.hoodieCords;
    cord.parent = topVariants.hoodie_oversized;

    const tip = MeshBuilder.CreateCylinder(`${idPrefix}-ovr-cord-tip-${i}`, { height: 0.038, diameter: 0.028, tessellation: 8 }, scene);
    tip.position.set(dx, 0.18, 0.27);
    tip.material = materials.brass;
    tip.parent = topVariants.hoodie_oversized;
  });

  // Túi Kangaroo trước bụng hoodie form rộng Play Together (3D Pouch Pocket)
  const hoodiePouch = MeshBuilder.CreateBox(`${idPrefix}-ovr-pouch`, { width: 0.30, height: 0.16, depth: 0.045 }, scene);
  hoodiePouch.position.set(0, 0.11, 0.26);
  hoodiePouch.material = materials.shirt;
  hoodiePouch.parent = topVariants.hoodie_oversized;

  [-0.13, 0.13].forEach((px, pIdx) => {
    const slit = MeshBuilder.CreateBox(`${idPrefix}-ovr-slit-${pIdx}`, { width: 0.02, height: 0.12, depth: 0.048 }, scene);
    slit.rotation.z = pIdx === 0 ? 0.35 : -0.35;
    slit.position.set(px, 0.11, 0.265);
    slit.material = materials.shirtTrim;
    slit.parent = topVariants.hoodie_oversized;
  });

  // 6. ĐỒNG PHỤC NỮ SINH THỦY THỦ (Sailor Fuku Anime)
  const sailorBody = shirtBody.clone(`${idPrefix}-sailor-body`);
  sailorBody.scaling.set(1.03, 1.01, 1.03);
  sailorBody.position.set(0, 0.22, 0.01);
  sailorBody.material = materials.vestWhite;
  sailorBody.parent = topVariants.sailor;

  const sailorPanel = MeshBuilder.CreateBox(`${idPrefix}-sailor-panel`, { width: 0.17, height: 0.13, depth: 0.025 }, scene);
  sailorPanel.position.set(0, 0.34, 0.24);
  sailorPanel.material = materials.vestWhite;
  sailorPanel.parent = topVariants.sailor;

  const sailorFlap = MeshBuilder.CreateBox(`${idPrefix}-sailor-flap`, { width: 0.46, height: 0.025, depth: 0.26 }, scene);
  sailorFlap.position.set(0, 0.42, -0.12);
  sailorFlap.rotation.x = -0.20;
  sailorFlap.material = materials.topDark;
  sailorFlap.parent = topVariants.sailor;

  const flapStripe = MeshBuilder.CreateBox(`${idPrefix}-sailor-stripe`, { width: 0.44, height: 0.03, depth: 0.025 }, scene);
  flapStripe.position.set(0, 0.39, -0.24);
  flapStripe.rotation.x = -0.20;
  flapStripe.material = materials.shirtTrim;
  flapStripe.parent = topVariants.sailor;

  const flapStripe2 = MeshBuilder.CreateBox(`${idPrefix}-sailor-stripe-2`, { width: 0.39, height: 0.025, depth: 0.022 }, scene);
  flapStripe2.position.set(0, 0.41, -0.19);
  flapStripe2.rotation.x = -0.20;
  flapStripe2.material = materials.shirtTrim;
  flapStripe2.parent = topVariants.sailor;

  const sailorKnot = MeshBuilder.CreateSphere(`${idPrefix}-sailor-knot`, { diameter: 0.065, segments: 10 }, scene);
  sailorKnot.position.set(0, 0.36, 0.27);
  sailorKnot.material = materials.tieRed;
  sailorKnot.parent = topVariants.sailor;

  const anchorPin = MeshBuilder.CreateSphere(`${idPrefix}-sailor-anchor`, { diameter: 0.032, segments: 8 }, scene);
  anchorPin.position.set(0, 0.36, 0.30);
  anchorPin.material = materials.royalGold;
  anchorPin.parent = topVariants.sailor;

  [-0.06, 0.06].forEach((sx, idx) => {
    const tail = MeshBuilder.CreateBox(`${idPrefix}-sailor-tail-${idx}`, { width: 0.045, height: 0.16, depth: 0.02 }, scene);
    tail.rotation.z = idx === 0 ? 0.3 : -0.3;
    tail.position.set(sx, 0.28, 0.27);
    tail.material = materials.tieRed;
    tail.parent = topVariants.sailor;
  });

  // 7. TECHWEAR CYBERPUNK JACKET (Chiến Thuật Tương Lai)
  const techBody = shirtBody.clone(`${idPrefix}-tech-body`);
  techBody.scaling.set(1.05, 1.02, 1.05);
  techBody.position.set(0, 0.22, 0.01);
  techBody.material = materials.cyberDark;
  techBody.parent = topVariants.techwear;

  const techCollar = MeshBuilder.CreateCylinder(`${idPrefix}-tech-collar`, { height: 0.12, diameter: 0.32, tessellation: 18 }, scene);
  techCollar.position.set(0, 0.46, 0.02);
  techCollar.material = materials.cyberDark;
  techCollar.parent = topVariants.techwear;

  const zipper = MeshBuilder.CreateBox(`${idPrefix}-tech-zipper`, { width: 0.025, height: 0.40, depth: 0.03 }, scene);
  zipper.position.set(0, 0.22, 0.25);
  zipper.material = materials.cyberNeon;
  zipper.parent = topVariants.techwear;

  [-0.14, 0.14].forEach((tx, idx) => {
    const techStrap = MeshBuilder.CreateBox(`${idPrefix}-tech-strap-${idx}`, { width: 0.04, height: 0.30, depth: 0.03 }, scene);
    techStrap.position.set(tx, 0.24, 0.24);
    techStrap.material = materials.topDark;
    techStrap.parent = topVariants.techwear;

    const buckle = MeshBuilder.CreateBox(`${idPrefix}-tech-buckle-${idx}`, { width: 0.055, height: 0.035, depth: 0.04 }, scene);
    buckle.position.set(tx, 0.24, 0.26);
    buckle.material = materials.cyberNeon;
    buckle.parent = topVariants.techwear;
  });

  // 8. ÁO HOÀNG TỬ BẠCH MÃ (Royal Prince Military Tunic)
  const princeBody = shirtBody.clone(`${idPrefix}-prince-body`);
  princeBody.scaling.set(1.04, 1.015, 1.04);
  princeBody.position.set(0, 0.22, 0.01);
  princeBody.material = materials.vestWhite;
  princeBody.parent = topVariants.prince;

  const princeCollar = MeshBuilder.CreateCylinder(`${idPrefix}-prince-collar`, { height: 0.07, diameter: 0.28, tessellation: 16 }, scene);
  princeCollar.position.set(0, 0.44, 0.02);
  princeCollar.material = materials.royalGold;
  princeCollar.parent = topVariants.prince;

  // Dải ruy băng danh dự vắt chéo ngực (Honor Sash)
  const princeSash = MeshBuilder.CreateBox(`${idPrefix}-prince-sash`, { width: 0.06, height: 0.38, depth: 0.025 }, scene);
  princeSash.rotation.z = -0.65;
  princeSash.position.set(0, 0.22, 0.25);
  princeSash.material = materials.royalRed;
  princeSash.parent = topVariants.prince;

  // Cặp cầu vai hoàng gia vàng có tua rua (Golden Epaulettes)
  [-0.24, 0.24].forEach((ex, idx) => {
    const epaulette = MeshBuilder.CreateBox(`${idPrefix}-epaulette-${idx}`, { width: 0.12, height: 0.035, depth: 0.08 }, scene);
    epaulette.position.set(ex, 0.41, 0.02);
    epaulette.material = materials.royalGold;
    epaulette.parent = topVariants.prince;
  });

  const aiguillette = MeshBuilder.CreateTorus(`${idPrefix}-prince-aiguillette`, { diameter: 0.24, thickness: 0.022, tessellation: 18 }, scene);
  aiguillette.scaling.set(0.8, 1.3, 0.5);
  aiguillette.rotation.z = -0.4;
  aiguillette.position.set(0.14, 0.26, 0.24);
  aiguillette.material = materials.royalGold;
  aiguillette.parent = topVariants.prince;

  [0.34, 0.27, 0.20].forEach((fy, idx) => {
    const bar = MeshBuilder.CreateBox(`${idPrefix}-prince-bar-${idx}`, { width: 0.16, height: 0.018, depth: 0.022 }, scene);
    bar.position.set(0, fy, 0.26);
    bar.material = materials.royalGold;
    bar.parent = topVariants.prince;
  });

  // 9. ÁO BÁ TƯỚC MA CÀ RỒNG DRACULA (Gothic Vampire)
  const vampBody = shirtBody.clone(`${idPrefix}-vamp-body`);
  vampBody.scaling.set(1.045, 1.015, 1.045);
  vampBody.position.set(0, 0.22, 0.01);
  vampBody.material = materials.royalRed;
  vampBody.parent = topVariants.vampire;

  [-0.14, 0.14].forEach((vx, idx) => {
    const poppedCollar = MeshBuilder.CreateCylinder(`${idPrefix}-vamp-collar-${idx}`, { height: 0.20, diameterTop: 0.02, diameterBottom: 0.14, tessellation: 3 }, scene);
    poppedCollar.rotation.z = idx === 0 ? 0.45 : -0.45;
    poppedCollar.rotation.x = -0.3;
    poppedCollar.position.set(vx, 0.48, -0.06);
    poppedCollar.material = materials.topDark;
    poppedCollar.parent = topVariants.vampire;
  });

  // Jabot bèo nhún ren quý tộc Gothic
  [0.37, 0.32, 0.27].forEach((jy, idx) => {
    const jabotLayer = MeshBuilder.CreateSphere(`${idPrefix}-vamp-jabot-${idx}`, { diameter: 0.08 - idx * 0.015, segments: 8 }, scene);
    jabotLayer.scaling.set(1.4, 0.45, 0.5);
    jabotLayer.position.set(0, jy, 0.265);
    jabotLayer.material = materials.laceWhite;
    jabotLayer.parent = topVariants.vampire;
  });

  const batPendant = MeshBuilder.CreateSphere(`${idPrefix}-bat-pendant`, { diameter: 0.07, segments: 8 }, scene);
  batPendant.position.set(0, 0.33, 0.27);
  batPendant.material = materials.royalGold;
  batPendant.parent = topVariants.vampire;

  // 10. YUKATA LỄ HỘI HOA ANH ĐÀO (Sakura Kimono)
  const kimonoBody = shirtBody.clone(`${idPrefix}-kimono-body`);
  kimonoBody.scaling.set(1.05, 1.02, 1.05);
  kimonoBody.position.set(0, 0.22, 0.01);
  kimonoBody.material = materials.kimonoPink;
  kimonoBody.parent = topVariants.kimono;

  // Cổ trắng Haneri lót trong vạt chéo
  [-0.07, 0.07].forEach((hx, idx) => {
    const haneri = MeshBuilder.CreateBox(`${idPrefix}-kimono-haneri-${idx}`, { width: 0.035, height: 0.18, depth: 0.02 }, scene);
    haneri.rotation.z = idx === 0 ? -0.45 : 0.45;
    haneri.position.set(hx, 0.38, 0.25);
    haneri.material = materials.vestWhite;
    haneri.parent = topVariants.kimono;
  });

  // Đai lưng Obi vàng kim to bản
  const obiSash = MeshBuilder.CreateCylinder(`${idPrefix}-obi-sash`, { height: 0.12, diameter: 0.54, tessellation: 20 }, scene);
  obiSash.position.set(0, 0.10, 0.01);
  obiSash.material = materials.royalGold;
  obiSash.parent = topVariants.kimono;

  const obijimeCord = MeshBuilder.CreateTorus(`${idPrefix}-kimono-obijime`, { diameter: 0.54, thickness: 0.016, tessellation: 20 }, scene);
  obijimeCord.position.set(0, 0.10, 0.01);
  obijimeCord.material = materials.royalRed;
  obijimeCord.parent = topVariants.kimono;

  const jadeBead = MeshBuilder.CreateSphere(`${idPrefix}-kimono-jade`, { diameter: 0.05, segments: 8 }, scene);
  jadeBead.position.set(0, 0.10, 0.28);
  jadeBead.material = materials.jadeGreen;
  jadeBead.parent = topVariants.kimono;

  // Nơ bướm Obi lớn sau lưng
  const obiBow = MeshBuilder.CreateSphere(`${idPrefix}-obi-bow`, { diameter: 0.20, segments: 10 }, scene);
  obiBow.scaling.set(1.3, 0.7, 0.5);
  obiBow.position.set(0, 0.10, -0.26);
  obiBow.material = materials.royalRed;
  obiBow.parent = topVariants.kimono;

  // 11. ÁO DÀI VIỆT NAM NỮ HOA SEN (Vietnamese Traditional Ao Dai - Female Lotus Silk)
  const aodaiNuCollar = MeshBuilder.CreateCylinder(`${idPrefix}-aodai-nu-collar`, { height: 0.08, diameter: 0.285, tessellation: 24 }, scene);
  aodaiNuCollar.position.set(0, 0.44, 0.02);
  aodaiNuCollar.material = materials.shirt;
  aodaiNuCollar.parent = topVariants.aodai_nu;

  const aodaiNuCollarTrim = MeshBuilder.CreateTorus(`${idPrefix}-aodai-nu-collar-trim`, { diameter: 0.285, thickness: 0.018, tessellation: 24 }, scene);
  aodaiNuCollarTrim.position.set(0, 0.475, 0.02);
  aodaiNuCollarTrim.material = materials.aodaiGoldTrim;
  aodaiNuCollarTrim.parent = topVariants.aodai_nu;

  // Khuy ngọc cổ áo thanh lịch
  const aodaiNuCollarBrooch = MeshBuilder.CreateSphere(`${idPrefix}-aodai-nu-collar-brooch`, { diameter: 0.032, segments: 8 }, scene);
  aodaiNuCollarBrooch.position.set(0, 0.45, 0.165);
  aodaiNuCollarBrooch.material = materials.aodaiGoldTrim;
  aodaiNuCollarBrooch.parent = topVariants.aodai_nu;

  // Họa tiết hoa sen lụa hồng thêu ngực bên phải (Lotus Flower Chest Motif)
  const aodaiNuLotusBloom = MeshBuilder.CreateSphere(`${idPrefix}-aodai-nu-lotus-bloom`, { diameter: 0.075, segments: 8 }, scene);
  aodaiNuLotusBloom.scaling.set(1.1, 0.8, 0.4);
  aodaiNuLotusBloom.position.set(0.08, 0.30, 0.262);
  aodaiNuLotusBloom.material = materials.aodaiSilk;
  aodaiNuLotusBloom.parent = topVariants.aodai_nu;

  [-0.035, 0.035].forEach((lx, lIdx) => {
    const petal = MeshBuilder.CreateSphere(`${idPrefix}-aodai-nu-lotus-petal-${lIdx}`, { diameter: 0.045, segments: 6 }, scene);
    petal.scaling.set(0.9, 0.6, 0.35);
    petal.position.set(0.08 + lx, 0.30 - Math.abs(lx) * 0.2, 0.260);
    petal.rotation.z = lIdx === 0 ? 0.35 : -0.35;
    petal.material = materials.aodaiGoldTrim;
    petal.parent = topVariants.aodai_nu;
  });

  // Hàng khuy ngọc trai / hoa cài uốn lượn duyên dáng từ cổ xuống eo
  [
    [0.05, 0.41, 0.260],
    [0.08, 0.35, 0.265],
    [0.12, 0.28, 0.260],
    [0.15, 0.21, 0.245],
    [0.18, 0.14, 0.230],
  ].forEach(([px, py, pz], idx) => {
    const pearlBtn = MeshBuilder.CreateSphere(`${idPrefix}-aodai-pearl-${idx}`, { diameter: 0.032, segments: 8 }, scene);
    pearlBtn.position.set(px, py, pz);
    pearlBtn.material = materials.aodaiGoldTrim;
    pearlBtn.parent = topVariants.aodai_nu;
  });

  // Xẻ tà hông eo áo dài nữ viền chỉ vàng thướt tha
  [-0.205, 0.205].forEach((sx, idx) => {
    const slitTrim = MeshBuilder.CreateBox(`${idPrefix}-aodai-slit-trim-${idx}`, { width: 0.016, height: 0.24, depth: 0.035 }, scene);
    slitTrim.position.set(sx, 0.02, 0);
    slitTrim.material = materials.aodaiGoldTrim;
    slitTrim.parent = topVariants.aodai_nu;
  });

  // TÀ ÁO DÀI NỮ THƯỚT THA DÁNG CHỮ A (Female Flowing Flaps Node)
  aodaiNuFrontFlapNode = new TransformNode(`${idPrefix}-aodai-nu-front-flap-node`, scene);
  aodaiNuFrontFlapNode.position.set(0, -0.02, 0.185);
  aodaiNuFrontFlapNode.parent = topVariants.aodai_nu;

  const aodaiNuFrontUpper = MeshBuilder.CreateBox(`${idPrefix}-aodai-nu-front-upper`, { width: 0.38, height: 0.28, depth: 0.018 }, scene);
  aodaiNuFrontUpper.position.set(0, -0.13, 0);
  aodaiNuFrontUpper.rotation.x = -0.05;
  aodaiNuFrontUpper.material = materials.shirt;
  aodaiNuFrontUpper.parent = aodaiNuFrontFlapNode;

  const aodaiNuFrontLower = MeshBuilder.CreateBox(`${idPrefix}-aodai-nu-front-lower`, { width: 0.44, height: 0.28, depth: 0.018 }, scene);
  aodaiNuFrontLower.position.set(0, -0.37, 0.012);
  aodaiNuFrontLower.rotation.x = -0.02;
  aodaiNuFrontLower.material = materials.shirt;
  aodaiNuFrontLower.parent = aodaiNuFrontFlapNode;

  const aodaiNuFrontTrim = MeshBuilder.CreateBox(`${idPrefix}-aodai-nu-front-trim`, { width: 0.445, height: 0.026, depth: 0.026 }, scene);
  aodaiNuFrontTrim.position.set(0, -0.50, 0.015);
  aodaiNuFrontTrim.material = materials.aodaiGoldTrim;
  aodaiNuFrontTrim.parent = aodaiNuFrontFlapNode;

  // Họa tiết hoa sen thêu nổi chân tà áo dài nữ
  const aodaiNuHemLotus = MeshBuilder.CreateSphere(`${idPrefix}-aodai-nu-hem-lotus`, { diameter: 0.065, segments: 8 }, scene);
  aodaiNuHemLotus.scaling.set(1.2, 0.8, 0.4);
  aodaiNuHemLotus.position.set(0, -0.44, 0.02);
  aodaiNuHemLotus.material = materials.aodaiSilk;
  aodaiNuHemLotus.parent = aodaiNuFrontFlapNode;

  // Viền chỉ vàng hai mép tà trước
  [-0.20, 0.20].forEach((ex, eIdx) => {
    const edgeTrim = MeshBuilder.CreateBox(`${idPrefix}-aodai-nu-f-edge-${eIdx}`, { width: 0.015, height: 0.48, depth: 0.022 }, scene);
    edgeTrim.position.set(ex * 1.05, -0.26, 0.008);
    edgeTrim.material = materials.aodaiGoldTrim;
    edgeTrim.parent = aodaiNuFrontFlapNode;
  });

  // Tà sau áo dài nữ
  aodaiNuBackFlapNode = new TransformNode(`${idPrefix}-aodai-nu-back-flap-node`, scene);
  aodaiNuBackFlapNode.position.set(0, -0.02, -0.175);
  aodaiNuBackFlapNode.parent = topVariants.aodai_nu;

  const aodaiNuBackUpper = MeshBuilder.CreateBox(`${idPrefix}-aodai-nu-back-upper`, { width: 0.40, height: 0.28, depth: 0.018 }, scene);
  aodaiNuBackUpper.position.set(0, -0.13, 0);
  aodaiNuBackUpper.rotation.x = 0.05;
  aodaiNuBackUpper.material = materials.shirt;
  aodaiNuBackUpper.parent = aodaiNuBackFlapNode;

  const aodaiNuBackLower = MeshBuilder.CreateBox(`${idPrefix}-aodai-nu-back-lower`, { width: 0.46, height: 0.28, depth: 0.018 }, scene);
  aodaiNuBackLower.position.set(0, -0.37, -0.012);
  aodaiNuBackLower.rotation.x = 0.02;
  aodaiNuBackLower.material = materials.shirt;
  aodaiNuBackLower.parent = aodaiNuBackFlapNode;

  const aodaiNuBackTrim = MeshBuilder.CreateBox(`${idPrefix}-aodai-nu-back-trim`, { width: 0.465, height: 0.026, depth: 0.026 }, scene);
  aodaiNuBackTrim.position.set(0, -0.50, -0.015);
  aodaiNuBackTrim.material = materials.aodaiGoldTrim;
  aodaiNuBackTrim.parent = aodaiNuBackFlapNode;

  // 12. ÁO DÀI NAM HOÀNG TRIỀU GẤM RỒNG (Vietnamese Imperial Ao Dai - Male Royal Brocade)
  const aodaiNamCollar = MeshBuilder.CreateCylinder(`${idPrefix}-aodai-nam-collar`, { height: 0.085, diameter: 0.295, tessellation: 24 }, scene);
  aodaiNamCollar.position.set(0, 0.45, 0.02);
  aodaiNamCollar.material = materials.shirt;
  aodaiNamCollar.parent = topVariants.aodai_nam;

  const aodaiNamCollarTrim = MeshBuilder.CreateTorus(`${idPrefix}-aodai-nam-collar-trim`, { diameter: 0.295, thickness: 0.022, tessellation: 24 }, scene);
  aodaiNamCollarTrim.position.set(0, 0.49, 0.02);
  aodaiNamCollarTrim.material = materials.aodaiGoldTrim;
  aodaiNamCollarTrim.parent = topVariants.aodai_nam;

  // Khuy cài cổ áo hoàng gia nạm hồng ngọc
  const aodaiNamCollarBrooch = MeshBuilder.CreateSphere(`${idPrefix}-aodai-nam-collar-brooch`, { diameter: 0.038, segments: 8 }, scene);
  aodaiNamCollarBrooch.position.set(0, 0.46, 0.17);
  aodaiNamCollarBrooch.material = materials.royalGold;
  aodaiNamCollarBrooch.parent = topVariants.aodai_nam;

  const aodaiNamCollarRuby = MeshBuilder.CreateSphere(`${idPrefix}-aodai-nam-collar-ruby`, { diameter: 0.022, segments: 6 }, scene);
  aodaiNamCollarRuby.position.set(0, 0.46, 0.185);
  aodaiNamCollarRuby.material = materials.royalRed;
  aodaiNamCollarRuby.parent = topVariants.aodai_nam;

  // VẠT CHÉO NGŨ THÂN CÀI KHUY BƯỚM UỐN LƯỢN ÔM SÁT THÂN NGƯỜI
  [
    { w: 0.026, h: 0.12, d: 0.020, px: 0.05, py: 0.40, pz: 0.258, rz: -0.55 },
    { w: 0.026, h: 0.14, d: 0.020, px: 0.11, py: 0.31, pz: 0.262, rz: -0.50 },
    { w: 0.026, h: 0.14, d: 0.020, px: 0.17, py: 0.20, pz: 0.245, rz: -0.35 },
  ].forEach((cfg, sIdx) => {
    const placketSeg = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-placket-seg-${sIdx}`, { width: cfg.w, height: cfg.h, depth: cfg.d }, scene);
    placketSeg.position.set(cfg.px, cfg.py, cfg.pz);
    placketSeg.rotation.z = cfg.rz;
    placketSeg.material = materials.aodaiGoldTrim;
    placketSeg.parent = topVariants.aodai_nam;
  });

  // Hàng khuy bướm gấm mạ vàng hoàng gia (Imperial Butterfly Knot Frogs)
  [
    [0.04, 0.42, 0.262],
    [0.08, 0.35, 0.268],
    [0.13, 0.27, 0.262],
    [0.18, 0.18, 0.248],
  ].forEach(([bx, by, bz], idx) => {
    const goldKnot = MeshBuilder.CreateSphere(`${idPrefix}-aodai-nam-knot-${idx}`, { diameter: 0.038, segments: 8 }, scene);
    goldKnot.position.set(bx, by, bz);
    goldKnot.material = materials.royalGold;
    goldKnot.parent = topVariants.aodai_nam;

    const knotBar = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-knot-bar-${idx}`, { width: 0.055, height: 0.016, depth: 0.016 }, scene);
    knotBar.position.set(bx, by, bz - 0.004);
    knotBar.rotation.z = -0.45;
    knotBar.material = materials.aodaiGoldTrim;
    knotBar.parent = topVariants.aodai_nam;
  });

  // BỔ TỬ RỒNG MÂY HOÀNG TRIỀU THÊU NỔI TRƯỚC NGỰC ÁO (Imperial Dragon Medallion & Jade Emblem)
  const aodaiNamMedallionRing = MeshBuilder.CreateTorus(`${idPrefix}-aodai-nam-medallion-ring`, {
    diameter: 0.155,
    thickness: 0.018,
    tessellation: 24,
  }, scene);
  aodaiNamMedallionRing.position.set(0, 0.29, 0.268);
  aodaiNamMedallionRing.rotation.x = 0.08;
  aodaiNamMedallionRing.material = materials.aodaiGoldTrim;
  aodaiNamMedallionRing.parent = topVariants.aodai_nam;

  const aodaiNamMedallionDisk = MeshBuilder.CreateCylinder(`${idPrefix}-aodai-nam-medallion-disk`, {
    height: 0.016,
    diameter: 0.135,
    tessellation: 20,
  }, scene);
  aodaiNamMedallionDisk.position.set(0, 0.29, 0.266);
  aodaiNamMedallionDisk.rotation.x = Math.PI / 2 + 0.08;
  aodaiNamMedallionDisk.material = materials.royalGold;
  aodaiNamMedallionDisk.parent = topVariants.aodai_nam;

  const aodaiNamMedallionJade = MeshBuilder.CreateSphere(`${idPrefix}-aodai-nam-medallion-jade`, {
    diameter: 0.055,
    segments: 10,
  }, scene);
  aodaiNamMedallionJade.scaling.set(1.0, 1.0, 0.5);
  aodaiNamMedallionJade.position.set(0, 0.29, 0.280);
  aodaiNamMedallionJade.material = materials.jadeGreen;
  aodaiNamMedallionJade.parent = topVariants.aodai_nam;

  // ĐAI LƯNG GẤM HOÀNG GIA & KHÓA THẮT LƯNG NGỌC BÍCH (Imperial Waist Sash & Jade Plaque)
  const aodaiNamSash = MeshBuilder.CreateTorus(`${idPrefix}-aodai-nam-sash`, {
    diameter: 0.53,
    thickness: 0.042,
    tessellation: 24,
  }, scene);
  aodaiNamSash.position.set(0, 0.035, 0);
  aodaiNamSash.material = materials.aodaiGoldTrim;
  aodaiNamSash.parent = topVariants.aodai_nam;

  const aodaiNamSashInner = MeshBuilder.CreateTorus(`${idPrefix}-aodai-nam-sash-inner`, {
    diameter: 0.532,
    thickness: 0.018,
    tessellation: 24,
  }, scene);
  aodaiNamSashInner.position.set(0, 0.035, 0);
  aodaiNamSashInner.material = materials.khanDongNavy;
  aodaiNamSashInner.parent = topVariants.aodai_nam;

  const aodaiNamBuckleGold = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-buckle-gold`, {
    width: 0.11,
    height: 0.065,
    depth: 0.032,
  }, scene);
  aodaiNamBuckleGold.position.set(0, 0.035, 0.275);
  aodaiNamBuckleGold.material = materials.royalGold;
  aodaiNamBuckleGold.parent = topVariants.aodai_nam;

  const aodaiNamBuckleJade = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-buckle-jade`, {
    width: 0.075,
    height: 0.045,
    depth: 0.036,
  }, scene);
  aodaiNamBuckleJade.position.set(0, 0.035, 0.277);
  aodaiNamBuckleJade.material = materials.jadeGreen;
  aodaiNamBuckleJade.parent = topVariants.aodai_nam;

  // NGỌC BỘI HOÀNG GIA THẢ RỦ BÊN EO (Imperial Royal Jade Bi Pendant & Silk Tassel)
  aodaiNamPendantNode = new TransformNode(`${idPrefix}-aodai-nam-pendant-node`, scene);
  aodaiNamPendantNode.position.set(-0.17, 0.01, 0.20);
  aodaiNamPendantNode.parent = topVariants.aodai_nam;

  const aodaiPendantCord = MeshBuilder.CreateCylinder(`${idPrefix}-aodai-pendant-cord`, {
    height: 0.05,
    diameter: 0.014,
    tessellation: 6,
  }, scene);
  aodaiPendantCord.position.set(0, -0.01, 0);
  aodaiPendantCord.material = materials.aodaiGoldTrim;
  aodaiPendantCord.parent = aodaiNamPendantNode;

  const aodaiPendantJadeBi = MeshBuilder.CreateTorus(`${idPrefix}-aodai-pendant-jade-bi`, {
    diameter: 0.075,
    thickness: 0.022,
    tessellation: 18,
  }, scene);
  aodaiPendantJadeBi.position.set(0, -0.05, 0);
  aodaiPendantJadeBi.material = materials.jadeGreen;
  aodaiPendantJadeBi.parent = aodaiNamPendantNode;

  const aodaiPendantCap = MeshBuilder.CreateCylinder(`${idPrefix}-aodai-pendant-cap`, {
    height: 0.025,
    diameterTop: 0.018,
    diameterBottom: 0.035,
    tessellation: 10,
  }, scene);
  aodaiPendantCap.position.set(0, -0.09, 0);
  aodaiPendantCap.material = materials.royalGold;
  aodaiPendantCap.parent = aodaiNamPendantNode;

  const aodaiPendantTassel = MeshBuilder.CreateCylinder(`${idPrefix}-aodai-pendant-tassel`, {
    height: 0.09,
    diameterTop: 0.030,
    diameterBottom: 0.042,
    tessellation: 10,
  }, scene);
  aodaiPendantTassel.position.set(0, -0.14, 0);
  aodaiPendantTassel.material = materials.aodaiGoldTrim;
  aodaiPendantTassel.parent = aodaiNamPendantNode;

  // TÀ ÁO DÀI NAM HOÀNG TRIỀU THƯỚT THA DÁNG ĐỨNG CHỮ A (Male Flowing Flaps Node)
  aodaiNamFrontFlapNode = new TransformNode(`${idPrefix}-aodai-nam-front-flap-node`, scene);
  aodaiNamFrontFlapNode.position.set(0, -0.02, 0.19);
  aodaiNamFrontFlapNode.parent = topVariants.aodai_nam;

  const aodaiNamFrontUpper = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-front-upper`, {
    width: 0.42,
    height: 0.26,
    depth: 0.022,
  }, scene);
  aodaiNamFrontUpper.position.set(0, -0.12, 0);
  aodaiNamFrontUpper.rotation.x = -0.05;
  aodaiNamFrontUpper.material = materials.shirt;
  aodaiNamFrontUpper.parent = aodaiNamFrontFlapNode;

  const aodaiNamFrontLower = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-front-lower`, {
    width: 0.47,
    height: 0.26,
    depth: 0.022,
  }, scene);
  aodaiNamFrontLower.position.set(0, -0.35, 0.012);
  aodaiNamFrontLower.rotation.x = -0.02;
  aodaiNamFrontLower.material = materials.shirt;
  aodaiNamFrontLower.parent = aodaiNamFrontFlapNode;

  const aodaiNamFrontTrim = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-front-trim`, {
    width: 0.475,
    height: 0.028,
    depth: 0.028,
  }, scene);
  aodaiNamFrontTrim.position.set(0, -0.47, 0.016);
  aodaiNamFrontTrim.material = materials.aodaiGoldTrim;
  aodaiNamFrontTrim.parent = aodaiNamFrontFlapNode;

  // Dải hoa văn gấm hoàng triều thêu chỉ vàng chân vạt (Imperial Hem Wave Ribbon)
  const aodaiNamFrontBand = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-front-band`, {
    width: 0.465,
    height: 0.042,
    depth: 0.026,
  }, scene);
  aodaiNamFrontBand.position.set(0, -0.41, 0.015);
  aodaiNamFrontBand.material = materials.aodaiGoldTrim;
  aodaiNamFrontBand.parent = aodaiNamFrontFlapNode;

  [-0.14, 0, 0.14].forEach((rx, rIdx) => {
    const rosette = MeshBuilder.CreateSphere(`${idPrefix}-aodai-nam-rosette-${rIdx}`, {
      diameter: 0.032,
      segments: 6,
    }, scene);
    rosette.position.set(rx, -0.41, 0.030);
    rosette.material = materials.royalGold;
    rosette.parent = aodaiNamFrontFlapNode;
  });

  // Bổ tử thêu gấm hoàng triều ở trung tâm vạt trước (Imperial Medallion on Front Flap)
  const aodaiFlapMedallionRing = MeshBuilder.CreateTorus(`${idPrefix}-aodai-flap-medallion-ring`, {
    diameter: 0.13,
    thickness: 0.016,
    tessellation: 20,
  }, scene);
  aodaiFlapMedallionRing.rotation.x = Math.PI / 2;
  aodaiFlapMedallionRing.position.set(0, -0.25, 0.015);
  aodaiFlapMedallionRing.material = materials.aodaiGoldTrim;
  aodaiFlapMedallionRing.parent = aodaiNamFrontFlapNode;

  const aodaiFlapMedallionDisk = MeshBuilder.CreateCylinder(`${idPrefix}-aodai-flap-medallion-disk`, {
    height: 0.014,
    diameter: 0.11,
    tessellation: 16,
  }, scene);
  aodaiFlapMedallionDisk.rotation.x = Math.PI / 2;
  aodaiFlapMedallionDisk.position.set(0, -0.25, 0.015);
  aodaiFlapMedallionDisk.material = materials.royalGold;
  aodaiFlapMedallionDisk.parent = aodaiNamFrontFlapNode;

  const aodaiFlapMedallionJade = MeshBuilder.CreateSphere(`${idPrefix}-aodai-flap-medallion-jade`, {
    diameter: 0.040,
    segments: 8,
  }, scene);
  aodaiFlapMedallionJade.position.set(0, -0.25, 0.024);
  aodaiFlapMedallionJade.material = materials.jadeGreen;
  aodaiFlapMedallionJade.parent = aodaiNamFrontFlapNode;

  // Viền chỉ vàng hai mép tà trước và khuy thắt eo
  [-0.225, 0.225].forEach((ex, eIdx) => {
    const edgeTrim = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-f-edge-${eIdx}`, {
      width: 0.015,
      height: 0.47,
      depth: 0.026,
    }, scene);
    edgeTrim.position.set(ex * 1.04, -0.24, 0.008);
    edgeTrim.material = materials.aodaiGoldTrim;
    edgeTrim.parent = aodaiNamFrontFlapNode;

    const waistFrog = MeshBuilder.CreateSphere(`${idPrefix}-aodai-nam-waist-frog-${eIdx}`, {
      diameter: 0.035,
      segments: 6,
    }, scene);
    waistFrog.position.set(ex * 0.95, 0.01, 0.01);
    waistFrog.material = materials.royalGold;
    waistFrog.parent = aodaiNamFrontFlapNode;
  });

  // TÀ SAU ÁO DÀI NAM HOÀNG TRIỀU
  aodaiNamBackFlapNode = new TransformNode(`${idPrefix}-aodai-nam-back-flap-node`, scene);
  aodaiNamBackFlapNode.position.set(0, -0.02, -0.18);
  aodaiNamBackFlapNode.parent = topVariants.aodai_nam;

  const aodaiNamBackUpper = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-back-upper`, {
    width: 0.43,
    height: 0.26,
    depth: 0.022,
  }, scene);
  aodaiNamBackUpper.position.set(0, -0.12, 0);
  aodaiNamBackUpper.rotation.x = 0.05;
  aodaiNamBackUpper.material = materials.shirt;
  aodaiNamBackUpper.parent = aodaiNamBackFlapNode;

  const aodaiNamBackLower = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-back-lower`, {
    width: 0.48,
    height: 0.26,
    depth: 0.022,
  }, scene);
  aodaiNamBackLower.position.set(0, -0.35, -0.012);
  aodaiNamBackLower.rotation.x = 0.02;
  aodaiNamBackLower.material = materials.shirt;
  aodaiNamBackLower.parent = aodaiNamBackFlapNode;

  const aodaiNamBackTrim = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-back-trim`, {
    width: 0.485,
    height: 0.028,
    depth: 0.028,
  }, scene);
  aodaiNamBackTrim.position.set(0, -0.47, -0.016);
  aodaiNamBackTrim.material = materials.aodaiGoldTrim;
  aodaiNamBackTrim.parent = aodaiNamBackFlapNode;

  const aodaiNamBackBand = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-back-band`, {
    width: 0.475,
    height: 0.042,
    depth: 0.026,
  }, scene);
  aodaiNamBackBand.position.set(0, -0.41, -0.015);
  aodaiNamBackBand.material = materials.aodaiGoldTrim;
  aodaiNamBackBand.parent = aodaiNamBackFlapNode;

  [-0.235, 0.235].forEach((ex, eIdx) => {
    const edgeTrim = MeshBuilder.CreateBox(`${idPrefix}-aodai-nam-b-edge-${eIdx}`, {
      width: 0.015,
      height: 0.47,
      depth: 0.026,
    }, scene);
    edgeTrim.position.set(ex * 1.04, -0.24, -0.008);
    edgeTrim.material = materials.aodaiGoldTrim;
    edgeTrim.parent = aodaiNamBackFlapNode;
  });

  // 13. ÁO VEST BLAZER DOANH NHÂN SANG TRỌNG (Luxury Executive Blazer & Suit)
  const blazerBody = shirtBody.clone(`${idPrefix}-blazer-body`);
  blazerBody.scaling.set(1.05, 1.02, 1.05);
  blazerBody.position.set(0, 0.22, 0.01);
  blazerBody.material = materials.topDark;
  blazerBody.parent = topVariants.blazer_luxury;

  const blazerShirtV = MeshBuilder.CreateBox(`${idPrefix}-blazer-shirt-v`, { width: 0.16, height: 0.24, depth: 0.08 }, scene);
  blazerShirtV.position.set(0, 0.35, 0.22);
  blazerShirtV.material = materials.vestWhite;
  blazerShirtV.parent = topVariants.blazer_luxury;

  const blazerTie = MeshBuilder.CreateBox(`${idPrefix}-blazer-tie`, { width: 0.045, height: 0.24, depth: 0.025 }, scene);
  blazerTie.position.set(0, 0.27, 0.265);
  blazerTie.material = materials.tieRed;
  blazerTie.parent = topVariants.blazer_luxury;

  // Cặp ve áo vest sắc sảo gập ra hai bên
  [-0.09, 0.09].forEach((lx, idx) => {
    const lapel = MeshBuilder.CreateBox(`${idPrefix}-blazer-lapel-${idx}`, { width: 0.075, height: 0.24, depth: 0.035 }, scene);
    lapel.rotation.z = idx === 0 ? 0.32 : -0.32;
    lapel.position.set(lx, 0.32, 0.25);
    lapel.material = materials.blazerLapel;
    lapel.parent = topVariants.blazer_luxury;
  });

  const blazerPocketSquare = MeshBuilder.CreateBox(`${idPrefix}-blazer-pocket-square`, { width: 0.08, height: 0.035, depth: 0.02 }, scene);
  blazerPocketSquare.rotation.z = 0.12;
  blazerPocketSquare.position.set(0.13, 0.30, 0.255);
  blazerPocketSquare.material = materials.vestWhite;
  blazerPocketSquare.parent = topVariants.blazer_luxury;

  [[-0.05, 0.20], [0.05, 0.20], [-0.05, 0.11], [0.05, 0.11]].forEach(([bx, by], idx) => {
    const btn = MeshBuilder.CreateCylinder(`${idPrefix}-blazer-btn-${idx}`, { height: 0.016, diameter: 0.032, tessellation: 10 }, scene);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(bx, by, 0.265);
    btn.material = materials.brass;
    btn.parent = topVariants.blazer_luxury;
  });

  // Ghim cài ve áo hoàng kim quý tộc (Luxury Gold Lapel Pin)
  const blazerLapelPin = MeshBuilder.CreateSphere(`${idPrefix}-blazer-pin`, { diameter: 0.038, segments: 8 }, scene);
  blazerLapelPin.position.set(-0.11, 0.37, 0.27);
  blazerLapelPin.material = materials.royalGold;
  blazerLapelPin.parent = topVariants.blazer_luxury;

  // 14. ÁO THUN K-POP IDOL STREETWEAR (K-Pop Layering & Silver Chains)
  const kpopBody = shirtBody.clone(`${idPrefix}-kpop-body`);
  kpopBody.scaling.set(1.07, 1.025, 1.07);
  kpopBody.position.set(0, 0.22, 0.01);
  kpopBody.material = materials.cyberDark;
  kpopBody.parent = topVariants.kpop_streetwear;

  const kpopMockneck = MeshBuilder.CreateCylinder(`${idPrefix}-kpop-mockneck`, { height: 0.08, diameter: 0.28, tessellation: 18 }, scene);
  kpopMockneck.position.set(0, 0.44, 0.02);
  kpopMockneck.material = materials.vestWhite;
  kpopMockneck.parent = topVariants.kpop_streetwear;

  const kpopHarness = MeshBuilder.CreateBox(`${idPrefix}-kpop-harness`, { width: 0.045, height: 0.38, depth: 0.03 }, scene);
  kpopHarness.rotation.z = 0.58;
  kpopHarness.position.set(0, 0.23, 0.25);
  kpopHarness.material = materials.topDark;
  kpopHarness.parent = topVariants.kpop_streetwear;

  const kpopBuckle = MeshBuilder.CreateBox(`${idPrefix}-kpop-buckle`, { width: 0.06, height: 0.04, depth: 0.04 }, scene);
  kpopBuckle.position.set(0, 0.23, 0.27);
  kpopBuckle.material = materials.kpopChainSilver;
  kpopBuckle.parent = topVariants.kpop_streetwear;

  // Dây xích bạc K-Pop rủ vòng cung qua ngực
  [-0.14, -0.07, 0, 0.07, 0.14].forEach((cx, idx) => {
    const chainLink = MeshBuilder.CreateTorus(`${idPrefix}-kpop-chain-${idx}`, { diameter: 0.045, thickness: 0.014, tessellation: 12 }, scene);
    const cy = 0.25 - Math.abs(cx) * 0.4;
    chainLink.position.set(cx, cy, 0.27);
    chainLink.rotation.x = Math.PI / 2;
    chainLink.rotation.y = (idx % 2) * (Math.PI / 2);
    chainLink.material = materials.kpopChainSilver;
    chainLink.parent = topVariants.kpop_streetwear;
  });

  // 15. ÁO CORSET DẠ HỘI CÔNG CHÚA QUÝ PHÁI (Royal Princess Corset & Off-Shoulder Lace)
  const corsetBody = shirtBody.clone(`${idPrefix}-corset-body`);
  corsetBody.scaling.set(1.025, 0.96, 1.025);
  corsetBody.position.set(0, 0.20, 0.01);
  corsetBody.material = materials.skirt;
  corsetBody.parent = topVariants.corset_ballgown;

  // Viền bèo ren trắng cúp ngực tim đài các
  const sweetheartLace = MeshBuilder.CreateTorus(`${idPrefix}-sweetheart-lace`, { diameter: 0.32, thickness: 0.038, tessellation: 20 }, scene);
  sweetheartLace.scaling.set(1.1, 0.6, 1.0);
  sweetheartLace.rotation.x = -0.35;
  sweetheartLace.position.set(0, 0.39, 0.18);
  sweetheartLace.material = materials.laceWhite;
  sweetheartLace.parent = topVariants.corset_ballgown;

  // Ngọc cài hoàng gia trước ngực
  const corsetGem = MeshBuilder.CreateSphere(`${idPrefix}-corset-gem`, { diameter: 0.052, segments: 10 }, scene);
  corsetGem.position.set(0, 0.37, 0.255);
  corsetGem.material = materials.royalGold;
  corsetGem.parent = topVariants.corset_ballgown;

  // Đan dây ruy băng vàng kim corset trước bụng (Criss-Cross Boning)
  [0.28, 0.20, 0.12].forEach((by, bIdx) => {
    const lacing = MeshBuilder.CreateBox(`${idPrefix}-corset-lace-${bIdx}`, { width: 0.13 - bIdx * 0.02, height: 0.018, depth: 0.02 }, scene);
    lacing.position.set(0, by, 0.255);
    lacing.material = materials.royalGold;
    lacing.parent = topVariants.corset_ballgown;
  });

  // Bèo nhún vai bồng xòe công chúa hai bên (Off-Shoulder Frills)
  [-0.26, 0.26].forEach((fx, idx) => {
    const frill = MeshBuilder.CreateTorus(`${idPrefix}-shoulder-frill-${idx}`, { diameter: 0.17, thickness: 0.045, tessellation: 16 }, scene);
    frill.scaling.set(1.2, 0.7, 1.0);
    frill.position.set(fx, 0.38, 0.02);
    frill.material = materials.laceWhite;
    frill.parent = topVariants.corset_ballgown;
  });

  // Rounded overalls keep a clean silhouette from the gameplay camera.
  const dungareesBib = MeshBuilder.CreateSphere(`${idPrefix}-dungarees-bib`, { diameter: 0.54, segments: 16 }, scene);
  dungareesBib.scaling.set(1, 0.60, 0.89);
  dungareesBib.position.set(0, 0.08, 0.07);
  dungareesBib.material = materials.overalls;
  dungareesBib.parent = torsoNode;

  // Simple front pocket, deliberately larger than micro-details.
  const bibPocket = MeshBuilder.CreateBox(`${idPrefix}-bib-pocket`, {
    width: 0.18,
    height: 0.13,
    depth: 0.025,
  }, scene);
  bibPocket.position.set(0, 0.14, 0.31);
  bibPocket.material = materials.overalls;
  bibPocket.parent = torsoNode;

  // 2 Quai yếm có khuy đồng tròn mạ bóng
  const overallDetails = [dungareesBib, bibPocket];
  [-0.13, 0.13].forEach((sx, idx) => {
    const strap = MeshBuilder.CreateBox(`${idPrefix}-strap-${idx}`, {
      width: 0.05,
      height: 0.30,
      depth: 0.022,
    }, scene);
    strap.position.set(sx, 0.27, 0.27);
    strap.material = materials.overalls;
    strap.parent = torsoNode;
    overallDetails.push(strap);

    const button = MeshBuilder.CreateCylinder(`${idPrefix}-button-${idx}`, {
      height: 0.02,
      diameter: 0.042,
      tessellation: 10,
    }, scene);
    button.rotation.x = Math.PI / 2;
    button.position.set(sx, 0.23, 0.29);
    button.material = materials.brass;
    button.parent = torsoNode;
    overallDetails.push(button);

    // Cúc hông yếm quần
    const hipBtn = MeshBuilder.CreateCylinder(`${idPrefix}-hip-btn-${idx}`, { height: 0.016, diameter: 0.034, tessellation: 10 }, scene);
    hipBtn.rotation.z = Math.PI / 2;
    hipBtn.position.set(idx === 0 ? -0.27 : 0.27, 0.03, 0.05);
    hipBtn.material = materials.brass;
    hipBtn.parent = torsoNode;
    overallDetails.push(hipBtn);
  });

  [-0.07, 0.07].forEach((px, idx) => {
    const rivet = MeshBuilder.CreateCylinder(`${idPrefix}-bib-rivet-${idx}`, { height: 0.012, diameter: 0.022, tessellation: 8 }, scene);
    rivet.rotation.x = Math.PI / 2;
    rivet.position.set(px, 0.19, 0.325);
    rivet.material = materials.brass;
    rivet.parent = torsoNode;
    overallDetails.push(rivet);
  });

  // ========================================================
  // 2. TÚI HẠT GIỐNG BÌNH MINH - recognizable from the rear camera
  // ========================================================
  const backpackNode = new TransformNode(`${idPrefix}-backpack-node`, scene);
  backpackNode.position.set(0, 0.18, -0.26);
  backpackNode.parent = torsoNode;

  const packBody = MeshBuilder.CreateSphere(`${idPrefix}-seed-pack-body`, { diameter: 0.34, segments: 12 }, scene);
  packBody.scaling.set(1.05, 1.12, 0.72);
  packBody.material = materials.packCanvas;
  packBody.parent = backpackNode;

  const packFlap = MeshBuilder.CreateSphere(`${idPrefix}-seed-pack-flap`, { diameter: 0.31, segments: 10 }, scene);
  packFlap.scaling.set(1.05, 0.40, 0.72);
  packFlap.position.set(0, 0.12, -0.04);
  packFlap.material = materials.packFlap;
  packFlap.parent = backpackNode;

  [-0.12, 0.12].forEach((sx, i) => {
    const strap = MeshBuilder.CreateBox(`${idPrefix}-seed-pack-strap-${i}`, { width: 0.035, height: 0.32, depth: 0.025 }, scene);
    strap.position.set(sx, 0.06, 0.12);
    strap.material = materials.packStrap;
    strap.parent = backpackNode;
  });

  const seedBadge = MeshBuilder.CreateSphere(`${idPrefix}-seed-pack-badge`, { diameter: 0.12, segments: 10 }, scene);
  seedBadge.scaling.set(0.7, 1, 0.25);
  seedBadge.position.set(0, 0.01, -0.13);
  seedBadge.material = materials.packLeaf;
  seedBadge.parent = backpackNode;

  // CÁNH THIÊN THẦN THẦN THOẠI (ANGEL WINGS)
  const angelWingsNode = new TransformNode(`${idPrefix}-angel-wings-node`, scene);
  angelWingsNode.parent = torsoNode;
  angelWingsNode.position.set(0, 0.32, -0.16);
  angelWingsNode.setEnabled(false);
  const wingMat = makeMat(scene, `${idPrefix}-wing-mat`, '#ffffff', '#fef9c3', 0.2);
  [-0.14, 0.14].forEach((wx, idx) => {
    const wingWing = MeshBuilder.CreateSphere(`${idPrefix}-wing-${idx}`, { diameter: 0.44, segments: 10 }, scene);
    wingWing.scaling.set(idx === 0 ? -1.15 : 1.15, 0.48, 0.12);
    wingWing.rotation.z = idx === 0 ? -0.42 : 0.42;
    wingWing.rotation.y = idx === 0 ? -0.28 : 0.28;
    wingWing.position.set(wx * 2.0, 0.08, 0);
    wingWing.material = wingMat;
    wingWing.parent = angelWingsNode;
  });

  // PHAO BƠI VỊT VÀNG QUANH EO (DUCK FLOATIE - PLAY TOGETHER SIGNATURE)
  const duckFloatieNode = new TransformNode(`${idPrefix}-duck-floatie-node`, scene);
  duckFloatieNode.parent = torsoNode;
  duckFloatieNode.position.set(0, -0.01, 0);
  duckFloatieNode.setEnabled(false);

  const floatieTorus = MeshBuilder.CreateTorus(`${idPrefix}-floatie-torus`, {
    diameter: 0.76,
    thickness: 0.17,
    tessellation: 28,
  }, scene);
  const floatieMat = makeMat(scene, `${idPrefix}-floatie-mat`, '#facc15', '#fde047');
  floatieTorus.material = floatieMat;
  floatieTorus.parent = duckFloatieNode;

  const duckHeadFl = MeshBuilder.CreateSphere(`${idPrefix}-duck-head-fl`, { diameter: 0.22, segments: 12 }, scene);
  duckHeadFl.position.set(0, 0.16, 0.38);
  duckHeadFl.material = floatieMat;
  duckHeadFl.parent = duckFloatieNode;

  const duckBeakFl = MeshBuilder.CreateSphere(`${idPrefix}-duck-beak-fl`, { diameter: 0.13, segments: 10 }, scene);
  duckBeakFl.scaling.set(1.3, 0.45, 1.25);
  duckBeakFl.position.set(0, 0.13, 0.49);
  const beakFlMat = makeMat(scene, `${idPrefix}-beak-fl-mat`, '#f97316');
  duckBeakFl.material = beakFlMat;
  duckBeakFl.parent = duckFloatieNode;

  [-0.052, 0.052].forEach((ex, idx) => {
    const eye = MeshBuilder.CreateSphere(`${idPrefix}-duck-eye-fl-${idx}`, { diameter: 0.038, segments: 8 }, scene);
    eye.position.set(ex, 0.19, 0.45);
    const eyeMat = makeMat(scene, `${idPrefix}-duck-eye-mat`, '#0f172a');
    eye.material = eyeMat;
    eye.parent = duckFloatieNode;
  });

  // BALO ẾCH XANH MẮT LỒI (FROG BACKPACK)
  const frogBackpackNode = new TransformNode(`${idPrefix}-frog-backpack-node`, scene);
  frogBackpackNode.parent = torsoNode;
  frogBackpackNode.position.set(0, 0.22, -0.22);
  frogBackpackNode.setEnabled(false);

  const frogBody = MeshBuilder.CreateSphere(`${idPrefix}-frog-body`, { diameter: 0.38, segments: 14 }, scene);
  frogBody.scaling.set(1.05, 1.15, 0.85);
  const frogMat = makeMat(scene, `${idPrefix}-frog-mat`, '#4ade80', '#22c55e');
  frogBody.material = frogMat;
  frogBody.parent = frogBackpackNode;

  [-0.11, 0.11].forEach((fx, idx) => {
    const eyeSocket = MeshBuilder.CreateSphere(`${idPrefix}-frog-socket-${idx}`, { diameter: 0.13, segments: 10 }, scene);
    eyeSocket.position.set(fx, 0.20, 0.05);
    eyeSocket.material = frogMat;
    eyeSocket.parent = frogBackpackNode;

    const eyeWhite = MeshBuilder.CreateSphere(`${idPrefix}-frog-white-${idx}`, { diameter: 0.10, segments: 10 }, scene);
    eyeWhite.position.set(fx, 0.20, -0.02);
    const whiteMat = makeMat(scene, `${idPrefix}-frog-white-mat`, '#ffffff');
    eyeWhite.material = whiteMat;
    eyeWhite.parent = frogBackpackNode;

    const eyePupil = MeshBuilder.CreateSphere(`${idPrefix}-frog-pupil-${idx}`, { diameter: 0.045, segments: 8 }, scene);
    eyePupil.position.set(fx, 0.20, -0.06);
    const pupilMat = makeMat(scene, `${idPrefix}-frog-pupil-mat`, '#0f172a');
    eyePupil.material = pupilMat;
    eyePupil.parent = frogBackpackNode;
  });

  // ========================================================
  // 3. HEAD & CURVED FACE MESH (Ôm khít hộp sọ, 0% bay lơ lửng)
  // ========================================================
  const headNode = new TransformNode(`${idPrefix}-head-node`, scene);
  headNode.position.y = proportions.headAnchor;
  headNode.scaling.setAll(0.91);
  headNode.parent = torsoNode;

  // Khối đầu búp bê tròn bầu bĩnh má bánh bao
  const head = MeshBuilder.CreateSphere(`${idPrefix}-head`, {
    diameter: 0.96,
    segments: 24,
  }, scene);
  head.scaling.set(1.06, 0.94, 1.0);
  head.position.y = 0.39;
  head.material = materials.skin;
  head.parent = headNode;

  // KHUÔN MẶT 2D CANVAS PLAY TOGETHER CHUYÊN NGHIỆP
  const faceSystem = createFaceTexture(scene, idPrefix, {
    eyeColor: '#3b2b28',
    irisColor: '#785242',
    blushColor: '#ef9e94',
    smileColor: '#55302b',
  });

  const faceMat = new StandardMaterial(`${idPrefix}-face-mat`, scene);
  faceMat.diffuseColor = Color3.White();
  faceMat.emissiveColor = Color3.White();
  faceMat.emissiveTexture = faceSystem.texture;
  faceMat.diffuseTexture = faceSystem.texture;
  faceMat.useAlphaFromDiffuseTexture = true;
  faceMat.transparencyMode = 2;
  faceMat.specularColor = Color3.Black();
  faceMat.backFaceCulling = false;
  faceMat.disableLighting = true;
  faceMat.zOffset = -2;

  // MẶT NẠ CONG CURVED FACE MESH: Uốn cong theo mặt cầu hộp sọ
  const faceGround = MeshBuilder.CreateGround(`${idPrefix}-curved-face`, {
    width: 0.84,
    height: 0.68,
    subdivisionsX: 16,
    subdivisionsY: 16,
  }, scene);

  // Ground rotates -90 degrees: negative local height becomes the FRONT (+Z).
  // Match the scaled head ellipsoid so the face cannot float or hide behind it.
  const fPos = faceGround.getVerticesData('position');
  const faceRadiusX = 0.96 * 1.06 / 2;
  const faceRadiusY = 0.96 * 0.94 / 2;
  const faceRadiusZ = 0.96 / 2;
  for (let i = 0; i < fPos.length; i += 3) {
    const vx = fPos[i];
    const vy = fPos[i + 2];
    const radial = Math.max(0, 1 - (vx / faceRadiusX) ** 2 - (vy / faceRadiusY) ** 2);
    fPos[i + 1] = -(faceRadiusZ * Math.sqrt(radial) + 0.012);
  }
  faceGround.setVerticesData('position', fPos);
  faceGround.rotation.x = -Math.PI / 2;
  faceGround.position.set(0, 0.39, 0);
  faceGround.material = faceMat;
  faceGround.parent = headNode;

  // 2 Tai tròn xinh xắn hai bên đầu
  const humanEars = [];
  [-0.49, 0.49].forEach((tx, idx) => {
    const ear = MeshBuilder.CreateSphere(`${idPrefix}-ear-${idx}`, { diameter: 0.17, segments: 10 }, scene);
    ear.scaling.set(0.58, 0.9, 0.62);
    ear.position.set(tx, 0.36, 0.01);
    ear.material = materials.skin;
    ear.parent = headNode;
    humanEars.push(ear);
  });

  // ========================================================
  // 4. MÁI TÓC SCULPTED CHUNKY ANIME BANGS (Lọn tóc uốn vát nhọn)
  // ========================================================
  const hairRoot = new TransformNode(`${idPrefix}-hair-root`, scene);
  hairRoot.parent = headNode;

  // Khối tóc sau gáy & đỉnh đầu mượt mà
  const hairDome = MeshBuilder.CreateSphere(`${idPrefix}-hair-dome`, { diameter: 1.0, segments: 24 }, scene);
  hairDome.scaling.set(1.06, 1.0, 0.90);
  hairDome.position.set(0, 0.48, -0.07);
  hairDome.material = materials.hair;
  hairDome.parent = hairRoot;

  // A full sphere covered the forehead and read as a helmet. Pull the
  // lower front into the skull; keep the crown and rear volume intact.
  const scalpPositions = hairDome.getVerticesData('position');
  for (let i = 0; i < scalpPositions.length; i += 3) {
    const localY = scalpPositions[i + 1];
    const localZ = scalpPositions[i + 2];
    if (localY < 0.13 && localZ > 0) {
      const retreat = Math.min(1, (0.13 - localY) / 0.28);
      scalpPositions[i + 2] *= 1 - retreat * 0.85;
    }
  }
  hairDome.updateVerticesData('position', scalpPositions);
  const scalpNormals = [];
  VertexData.ComputeNormals(scalpPositions, hairDome.getIndices(), scalpNormals);
  hairDome.updateVerticesData('normal', scalpNormals);
  hairDome.refreshBoundingInfo();

  // VÒNG SÁNG ÓNG ÁNH THỜI TRANG ANIME PLAY TOGETHER (HAIR GLINT ANGEL RING)
  const hairGlintRing = MeshBuilder.CreateTorus(`${idPrefix}-hair-glint-ring`, {
    diameter: 0.94,
    thickness: 0.024,
    tessellation: 28,
  }, scene);
  hairGlintRing.scaling.set(1.06, 0.58, 0.92);
  hairGlintRing.rotation.x = -0.24;
  hairGlintRing.position.set(0, 0.62, -0.04);
  hairGlintRing.material = materials.hairGlint;
  hairGlintRing.parent = hairRoot;

  const hairGlintDashes = [];
  [-0.18, 0.18].forEach((gx, gIdx) => {
    const dash = MeshBuilder.CreateBox(`${idPrefix}-hair-glint-dash-${gIdx}`, {
      width: 0.14,
      height: 0.024,
      depth: 0.034,
    }, scene);
    dash.rotation.z = gIdx === 0 ? 0.22 : -0.22;
    dash.rotation.x = -0.32;
    dash.position.set(gx, 0.66, 0.32);
    dash.material = materials.hairGlint;
    dash.parent = hairRoot;
    hairGlintDashes.push(dash);
  });

  const quiffNode = new TransformNode(`${idPrefix}-quiff`, scene);
  quiffNode.parent = hairRoot;
  [-0.19, 0, 0.17].forEach((x, i) => {
    const tuft = MeshBuilder.CreateCylinder(`${idPrefix}-quiff-${i}`, {
      height: 0.22 + (i === 1 ? 0.08 : 0), diameterBottom: 0.38,
      diameterTop: 0.07, tessellation: 12,
    }, scene);
    tuft.parent = quiffNode;
    tuft.position.set(x, 0.84, 0.14);
    tuft.rotation.z = -0.45;
    tuft.rotation.x = 0.30;
    tuft.material = materials.hair;
  });

  // CỌNG MẦM CÂY KAIA ĐUNG ĐƯA (SPROUT AHOGE)
  const sproutNode = new TransformNode(`${idPrefix}-sprout-node`, scene);
  sproutNode.position.set(0, 0.82, 0.02);
  sproutNode.parent = hairRoot;

  const sproutStem = MeshBuilder.CreateCylinder(`${idPrefix}-sprout-stem`, {
    height: 0.15,
    diameterTop: 0.02,
    diameterBottom: 0.035,
    tessellation: 8,
  }, scene);
  sproutStem.position.y = 0.075;
  sproutStem.material = materials.sproutGreen;
  sproutStem.parent = sproutNode;

  // 2 Chiếc lá mầm xanh biếc xòe ra hai bên
  [-0.055, 0.055].forEach((lx, i) => {
    const leaf = MeshBuilder.CreateSphere(`${idPrefix}-sprout-leaf-${i}`, { diameter: 0.095, segments: 8 }, scene);
    leaf.scaling.set(1.25, 0.35, 0.65);
    leaf.rotation.z = i === 0 ? 0.55 : -0.55;
    leaf.position.set(lx, 0.15, 0);
    leaf.material = materials.sproutGreen;
    leaf.parent = sproutNode;
  });

  // Curved scalp-following fringe: no detached rounded bangs or visor silhouette.
  const fringePaths = [];
  for (let ix = 0; ix <= 14; ix++) {
    const t = ix / 14;
    const x = (t - 0.5) * 0.78;
    const edge = Math.abs(t - 0.5) * 2;
    const lower = 0.61 + 0.045 * Math.sin(Math.PI * t) + 0.018 * (t - 0.5);
    const upper = 0.79 - 0.15 * edge * edge;
    const path = [];
    for (let iy = 0; iy <= 4; iy++) {
      const y = lower + (upper - lower) * iy / 4;
      const radial = Math.max(0.012, 1 - (x / 0.509) ** 2 - ((y - 0.39) / 0.451) ** 2);
      path.push(new Vector3(x, y, 0.48 * Math.sqrt(radial) + 0.014));
    }
    fringePaths.push(path);
  }
  const fringe = MeshBuilder.CreateRibbon(`${idPrefix}-sculpted-fringe`, {
    pathArray: fringePaths, sideOrientation: 2,
  }, scene);
  // The fringe sits very close to the hair cap. A small depth bias prevents
  // the GPU from alternating which surface wins as the camera moves.
  const fringeMaterial = materials.hair.clone(`${idPrefix}-fringe-mat`);
  fringeMaterial.zOffset = -1;
  fringe.material = fringeMaterial;
  fringe.parent = hairRoot;

  // Short, subtle temples frame the face without hanging below the ears.
  [-0.43, 0.43].forEach((lx, idx) => {
    const lock = MeshBuilder.CreateSphere(`${idPrefix}-sidelock-${idx}`, { diameter: 0.24, segments: 12 }, scene);
    lock.scaling.set(0.48, 0.78, 0.55);
    lock.rotation.z = idx === 0 ? -0.1 : 0.1;
    lock.position.set(lx, 0.51, 0.06);
    lock.material = materials.hair;
    lock.parent = hairRoot;
  });

  // CÁC KIỂU TÓC THỜI TRANG ĐA DẠNG (MODULAR HAIRSTYLES)
  // 1. Tóc hai chùm nhí nhảnh bồng bềnh chuẩn Anime (Twintails with Ribbon Bows)
  const twintailsNode = new TransformNode(`${idPrefix}-twintails-node`, scene);
  twintailsNode.parent = hairRoot;
  twintailsNode.setEnabled(false);
  [-0.46, 0.46].forEach((tx, idx) => {
    // Dây nơ buộc tóc hai chùm đỏ xinh xắn
    const tie = MeshBuilder.CreateTorus(`${idPrefix}-hair-tie-${idx}`, { diameter: 0.12, thickness: 0.032, tessellation: 14 }, scene);
    tie.position.set(tx, 0.58, -0.05);
    tie.material = materials.tieRed;
    tie.parent = twintailsNode;

    const bowKnot = MeshBuilder.CreateSphere(`${idPrefix}-pigtail-bow-${idx}`, { diameter: 0.048, segments: 8 }, scene);
    bowKnot.position.set(tx * 1.08, 0.59, -0.01);
    bowKnot.material = materials.tieRed;
    bowKnot.parent = twintailsNode;

    [-0.035, 0.035].forEach((lx, lIdx) => {
      const bowLoop = MeshBuilder.CreateSphere(`${idPrefix}-pigtail-loop-${idx}-${lIdx}`, { diameter: 0.055, segments: 8 }, scene);
      bowLoop.scaling.set(1.4, 0.7, 0.4);
      bowLoop.rotation.z = lIdx === 0 ? 0.35 : -0.35;
      bowLoop.position.set(tx * 1.08 + lx, 0.60, 0.01);
      bowLoop.material = materials.tieRed;
      bowLoop.parent = twintailsNode;
    });

    const bowRibbonTail = MeshBuilder.CreateBox(`${idPrefix}-pigtail-tail-${idx}`, { width: 0.024, height: 0.14, depth: 0.012 }, scene);
    bowRibbonTail.rotation.z = idx === 0 ? 0.3 : -0.3;
    bowRibbonTail.position.set(tx * 1.08, 0.51, -0.01);
    bowRibbonTail.material = materials.tieRed;
    bowRibbonTail.parent = twintailsNode;

    // Chùm tóc trên bồng bềnh
    const upperPuff = MeshBuilder.CreateSphere(`${idPrefix}-pigtail-puff-${idx}`, { diameter: 0.34, segments: 14 }, scene);
    upperPuff.scaling.set(0.9, 1.25, 0.9);
    upperPuff.position.set(tx * 1.15, 0.46, -0.08);
    upperPuff.rotation.z = idx === 0 ? 0.28 : -0.28;
    upperPuff.material = materials.hair;
    upperPuff.parent = twintailsNode;

    // Lọn tóc giữa uốn lượn mềm mại
    const midLock = MeshBuilder.CreateSphere(`${idPrefix}-pigtail-mid-${idx}`, { diameter: 0.30, segments: 12 }, scene);
    midLock.scaling.set(0.8, 1.35, 0.85);
    midLock.position.set(tx * 1.25, 0.28, -0.09);
    midLock.rotation.z = idx === 0 ? 0.40 : -0.40;
    midLock.material = materials.hair;
    midLock.parent = twintailsNode;

    // Đuôi tóc vát nhọn vểnh nhẹ Anime
    const tipLock = MeshBuilder.CreateCylinder(`${idPrefix}-pigtail-tip-${idx}`, {
      height: 0.22,
      diameterTop: 0.24,
      diameterBottom: 0.04,
      tessellation: 12,
    }, scene);
    tipLock.position.set(tx * 1.32, 0.12, -0.07);
    tipLock.rotation.z = idx === 0 ? 0.48 : -0.48;
    tipLock.rotation.x = -0.15;
    tipLock.material = materials.hair;
    tipLock.parent = twintailsNode;
  });

  // 2. Tóc ngắn Bob uốn cụp má thời thượng (Cute Anime Bob)
  const bobNode = new TransformNode(`${idPrefix}-bob-node`, scene);
  bobNode.parent = hairRoot;
  bobNode.setEnabled(false);
  [-0.44, 0.44].forEach((bx, idx) => {
    const bobWing = MeshBuilder.CreateSphere(`${idPrefix}-bob-wing-${idx}`, { diameter: 0.38, segments: 14 }, scene);
    bobWing.scaling.set(0.72, 1.45, 0.90);
    bobWing.rotation.z = idx === 0 ? -0.18 : 0.18;
    bobWing.rotation.y = idx === 0 ? 0.25 : -0.25;
    bobWing.position.set(bx, 0.38, 0.06);
    bobWing.material = materials.hair;
    bobWing.parent = bobNode;

    const bobTip = MeshBuilder.CreateCylinder(`${idPrefix}-bob-tip-${idx}`, {
      height: 0.18,
      diameterTop: 0.26,
      diameterBottom: 0.06,
      tessellation: 12,
    }, scene);
    bobTip.position.set(bx * 0.92, 0.22, 0.08);
    bobTip.rotation.z = idx === 0 ? -0.32 : 0.32;
    bobTip.rotation.x = 0.20;
    bobTip.material = materials.hair;
    bobTip.parent = bobNode;
  });

  // Kẹp tăm ngọc trai cài tóc bên phải
  const pearlClip = MeshBuilder.CreateBox(`${idPrefix}-bob-clip`, { width: 0.08, height: 0.02, depth: 0.015 }, scene);
  pearlClip.position.set(0.40, 0.62, 0.24);
  pearlClip.rotation.z = -0.35;
  pearlClip.rotation.y = -0.45;
  pearlClip.material = materials.royalGold;
  pearlClip.parent = bobNode;

  // 3. Tóc xoăn sóng nước lãng mạn (Romantic Cascading Wavy Locks)
  const wavyNode = new TransformNode(`${idPrefix}-wavy-node`, scene);
  wavyNode.parent = hairRoot;
  wavyNode.setEnabled(false);
  [-0.42, 0.42].forEach((wx, idx) => {
    const w1 = MeshBuilder.CreateSphere(`${idPrefix}-wavy-1-${idx}`, { diameter: 0.34, segments: 12 }, scene);
    w1.scaling.set(0.75, 1.35, 0.75);
    w1.rotation.z = idx === 0 ? 0.15 : -0.15;
    w1.position.set(wx, 0.38, 0.02);
    w1.material = materials.hair;
    w1.parent = wavyNode;

    const w2 = MeshBuilder.CreateSphere(`${idPrefix}-wavy-2-${idx}`, { diameter: 0.30, segments: 12 }, scene);
    w2.scaling.set(0.70, 1.25, 0.70);
    w2.rotation.z = idx === 0 ? -0.18 : 0.18;
    w2.position.set(wx * 0.95, 0.22, 0.09);
    w2.material = materials.hair;
    w2.parent = wavyNode;

    const w3 = MeshBuilder.CreateSphere(`${idPrefix}-wavy-3-${idx}`, { diameter: 0.25, segments: 10 }, scene);
    w3.scaling.set(0.65, 1.15, 0.65);
    w3.position.set(wx * 0.90, 0.08, 0.12);
    w3.material = materials.hair;
    w3.parent = wavyNode;
  });

  // 4. Tóc vuốt ngược cá tính (Slick Back)
  const slickNode = new TransformNode(`${idPrefix}-slick-node`, scene);
  slickNode.parent = hairRoot;
  slickNode.setEnabled(false);
  const slickPuff = MeshBuilder.CreateSphere(`${idPrefix}-slick-puff`, { diameter: 0.52, segments: 12 }, scene);
  slickPuff.scaling.set(0.9, 0.55, 1.25);
  slickPuff.position.set(0, 0.86, 0.08);
  slickPuff.material = materials.hair;
  slickPuff.parent = slickNode;

  // 5. Đuôi ngựa cao năng động (Dynamic High Ponytail)
  const ponytailNode = new TransformNode(`${idPrefix}-ponytail`, scene);
  ponytailNode.parent = hairRoot;
  ponytailNode.position.set(0, 0.64, -0.38);
  ponytailNode.setEnabled(false);

  const scrunchie = MeshBuilder.CreateTorus(`${idPrefix}-ponytail-scrunchie`, { diameter: 0.16, thickness: 0.045, tessellation: 16 }, scene);
  scrunchie.rotation.x = Math.PI / 4;
  scrunchie.material = materials.tieRed;
  scrunchie.parent = ponytailNode;

  const ponyUpper = MeshBuilder.CreateSphere(`${idPrefix}-ponytail-upper`, { diameter: 0.38, segments: 14 }, scene);
  ponyUpper.scaling.set(0.85, 1.45, 0.85);
  ponyUpper.rotation.x = -0.55;
  ponyUpper.position.set(0, -0.05, -0.10);
  ponyUpper.material = materials.hair;
  ponyUpper.parent = ponytailNode;

  const ponyTailLock = MeshBuilder.CreateCylinder(`${idPrefix}-ponytail-tip`, {
    height: 0.35,
    diameterTop: 0.28,
    diameterBottom: 0.06,
    tessellation: 12,
  }, scene);
  ponyTailLock.position.set(0, -0.28, -0.22);
  ponyTailLock.rotation.x = -0.42;
  ponyTailLock.material = materials.hair;
  ponyTailLock.parent = ponytailNode;

  // 6. Tóc dài suôn mượt tiên tử Hime Cut (Ethereal Long Flowing Hair)
  const celestialNode = new TransformNode(`${idPrefix}-celestial-node`, scene);
  celestialNode.parent = hairRoot;
  celestialNode.setEnabled(false);

  const backFlow = MeshBuilder.CreateBox(`${idPrefix}-celestial-back`, { width: 0.62, height: 0.72, depth: 0.12 }, scene);
  backFlow.position.set(0, 0.14, -0.36);
  backFlow.rotation.x = -0.08;
  backFlow.material = materials.hair;
  backFlow.parent = celestialNode;

  [-0.42, 0.42].forEach((hx, idx) => {
    const himeStrand = MeshBuilder.CreateBox(`${idPrefix}-hime-strand-${idx}`, { width: 0.12, height: 0.52, depth: 0.08 }, scene);
    himeStrand.position.set(hx, 0.24, 0.08);
    himeStrand.rotation.z = idx === 0 ? 0.06 : -0.06;
    himeStrand.material = materials.hair;
    himeStrand.parent = celestialNode;
  });

  const celestialPin = MeshBuilder.CreateSphere(`${idPrefix}-celestial-pin`, { diameter: 0.07, segments: 10 }, scene);
  celestialPin.position.set(-0.38, 0.64, 0.18);
  celestialPin.material = materials.cyberNeon;
  celestialPin.parent = celestialNode;

  // BĂNG ĐÔ TAI MÈO THỜI TRANG (CAT EARS HEADBAND)
  const catEarsNode = new TransformNode(`${idPrefix}-cat-ears-node`, scene);
  catEarsNode.parent = headNode;
  catEarsNode.setEnabled(false);

  const headband = MeshBuilder.CreateTorus(`${idPrefix}-headband-mesh`, {
    diameter: 0.86,
    thickness: 0.026,
    tessellation: 18,
  }, scene);
  headband.scaling.set(1.0, 0.35, 0.85);
  headband.position.set(0, 0.72, -0.02);
  headband.material = materials.catEarOuter;
  headband.parent = catEarsNode;

  [-0.26, 0.26].forEach((ex, idx) => {
    const earOuter = MeshBuilder.CreateCylinder(`${idPrefix}-catear-out-${idx}`, {
      height: 0.18,
      diameterTop: 0.02,
      diameterBottom: 0.14,
      tessellation: 3,
    }, scene);
    earOuter.rotation.z = idx === 0 ? 0.35 : -0.35;
    earOuter.rotation.y = Math.PI / 2;
    earOuter.position.set(ex, 0.88, 0.02);
    earOuter.material = materials.catEarOuter;
    earOuter.parent = catEarsNode;

    const earInner = MeshBuilder.CreateCylinder(`${idPrefix}-catear-in-${idx}`, {
      height: 0.14,
      diameterTop: 0.015,
      diameterBottom: 0.09,
      tessellation: 3,
    }, scene);
    earInner.rotation.z = idx === 0 ? 0.35 : -0.35;
    earInner.rotation.y = Math.PI / 2;
    earInner.position.set(ex, 0.87, 0.04);
    earInner.material = materials.catEarInner;
    earInner.parent = catEarsNode;
  });

  // TAI THỎ ĐÁNG YÊU (RABBIT EARS)
  const rabbitEarsNode = new TransformNode(`${idPrefix}-rabbit-ears-node`, scene);
  rabbitEarsNode.parent = headNode;
  rabbitEarsNode.setEnabled(false);
  [-0.22, 0.22].forEach((rx, idx) => {
    const ear = MeshBuilder.CreateSphere(`${idPrefix}-rab-ear-${idx}`, { diameter: 0.26, segments: 12 }, scene);
    ear.scaling.set(0.55, 2.2, 0.4);
    ear.rotation.z = idx === 0 ? 0.18 : -0.18;
    ear.position.set(rx, 1.05, 0.02);
    ear.material = materials.rabbitEarOuter;
    ear.parent = rabbitEarsNode;

    const earIn = MeshBuilder.CreateSphere(`${idPrefix}-rab-in-${idx}`, { diameter: 0.18, segments: 10 }, scene);
    earIn.scaling.set(0.45, 1.8, 0.25);
    earIn.rotation.z = idx === 0 ? 0.18 : -0.18;
    earIn.position.set(rx, 1.03, 0.05);
    earIn.material = materials.rabbitEarInner;
    earIn.parent = rabbitEarsNode;
  });

  // TAI GẤU TRÒN XINH (BEAR EARS)
  const bearEarsNode = new TransformNode(`${idPrefix}-bear-ears-node`, scene);
  bearEarsNode.parent = headNode;
  bearEarsNode.setEnabled(false);
  [-0.38, 0.38].forEach((bx, idx) => {
    const bEar = MeshBuilder.CreateSphere(`${idPrefix}-bear-ear-${idx}`, { diameter: 0.28, segments: 12 }, scene);
    bEar.scaling.set(1.0, 0.9, 0.5);
    bEar.position.set(bx, 0.82, -0.04);
    bEar.material = materials.bearEarOuter;
    bEar.parent = bearEarsNode;

    const bIn = MeshBuilder.CreateSphere(`${idPrefix}-bear-in-${idx}`, { diameter: 0.18, segments: 10 }, scene);
    bIn.scaling.set(0.9, 0.8, 0.3);
    bIn.position.set(bx, 0.82, -0.02);
    bIn.material = materials.bearEarInner;
    bIn.parent = bearEarsNode;
  });

  // TAI YÊU TINH VỂNH (ELF EARS)
  const elfEarsNode = new TransformNode(`${idPrefix}-elf-ears-node`, scene);
  elfEarsNode.parent = headNode;
  elfEarsNode.setEnabled(false);
  [-0.52, 0.52].forEach((ex, idx) => {
    const elfEar = MeshBuilder.CreateCylinder(`${idPrefix}-elf-ear-${idx}`, { height: 0.28, diameterTop: 0.02, diameterBottom: 0.16, tessellation: 4 }, scene);
    elfEar.rotation.z = idx === 0 ? 1.15 : -1.15;
    elfEar.rotation.y = idx === 0 ? -0.3 : 0.3;
    elfEar.position.set(ex * 1.08, 0.42, -0.02);
    elfEar.material = materials.skin;
    elfEar.parent = elfEarsNode;
  });

  // TAI CÚN SHIBA NHÍ NHẢNH (SHIBA PUPPY EARS)
  const shibaEarsNode = new TransformNode(`${idPrefix}-shiba-ears-node`, scene);
  shibaEarsNode.parent = headNode;
  shibaEarsNode.setEnabled(false);
  const shibaMat = makeMat(scene, `${idPrefix}-shiba-mat`, '#d97706');
  const shibaInnerMat = makeMat(scene, `${idPrefix}-shiba-in-mat`, '#fffbeb');
  [-0.30, 0.30].forEach((sx, idx) => {
    const sEar = MeshBuilder.CreateCylinder(`${idPrefix}-shiba-ear-${idx}`, { height: 0.22, diameterTop: 0.03, diameterBottom: 0.16, tessellation: 4 }, scene);
    sEar.rotation.z = idx === 0 ? 0.38 : -0.38;
    sEar.rotation.y = Math.PI / 4;
    sEar.position.set(sx, 0.86, 0.02);
    sEar.material = shibaMat;
    sEar.parent = shibaEarsNode;

    const sIn = MeshBuilder.CreateCylinder(`${idPrefix}-shiba-in-${idx}`, { height: 0.16, diameterTop: 0.02, diameterBottom: 0.11, tessellation: 4 }, scene);
    sIn.rotation.z = idx === 0 ? 0.38 : -0.38;
    sIn.rotation.y = Math.PI / 4;
    sIn.position.set(sx, 0.86, 0.04);
    sIn.material = shibaInnerMat;
    sIn.parent = shibaEarsNode;
  });

  // MŨ MỎ VỊT VÀNG (DUCK BEAK)
  const duckBeakNode = new TransformNode(`${idPrefix}-duck-beak-node`, scene);
  duckBeakNode.parent = headNode;
  duckBeakNode.setEnabled(false);
  const duckBillMat = makeMat(scene, `${idPrefix}-duck-bill-mat`, '#f97316');
  const duckBill = MeshBuilder.CreateSphere(`${idPrefix}-duck-bill`, { diameter: 0.28, segments: 10 }, scene);
  duckBill.scaling.set(1.25, 0.42, 1.35);
  duckBill.position.set(0, 0.28, 0.44);
  duckBill.material = duckBillMat;
  duckBill.parent = duckBeakNode;

  // VÒNG HÀO QUANG THIÊN THẦN (HALO CROWN)
  const haloNode = new TransformNode(`${idPrefix}-halo-node`, scene);
  haloNode.parent = headNode;
  haloNode.position.set(0, 1.15, 0);
  haloNode.setEnabled(false);
  const haloRing = MeshBuilder.CreateTorus(`${idPrefix}-halo-ring`, { diameter: 0.58, thickness: 0.045, tessellation: 24 }, scene);
  haloRing.rotation.x = 0.18;
  const haloMat = makeMat(scene, `${idPrefix}-halo-mat`, '#facc15', '#fef08a');
  haloMat.disableLighting = true;
  haloRing.material = haloMat;
  haloRing.parent = haloNode;

  // TAI NGHE MÈO PHÁT SÁNG (CAT HEADPHONES RGB)
  const catHeadphonesNode = new TransformNode(`${idPrefix}-cat-headphones-node`, scene);
  catHeadphonesNode.parent = headNode;
  catHeadphonesNode.setEnabled(false);

  const hpBand = MeshBuilder.CreateTorus(`${idPrefix}-hp-band`, { diameter: 0.94, thickness: 0.045, tessellation: 24 }, scene);
  hpBand.scaling.set(1.0, 0.85, 0.35);
  hpBand.position.set(0, 0.44, 0);
  const hpMat = makeMat(scene, `${idPrefix}-hp-mat`, '#0f172a', '#1e293b');
  hpBand.material = hpMat;
  hpBand.parent = catHeadphonesNode;

  const rgbMat = makeMat(scene, `${idPrefix}-hp-rgb-mat`, '#ec4899', '#f472b6');
  [-0.49, 0.49].forEach((cx, idx) => {
    const cup = MeshBuilder.CreateCylinder(`${idPrefix}-hp-cup-${idx}`, { height: 0.12, diameter: 0.30, tessellation: 18 }, scene);
    cup.rotation.z = Math.PI / 2;
    cup.position.set(cx, 0.39, 0);
    cup.material = rgbMat;
    cup.parent = catHeadphonesNode;
  });

  [-0.26, 0.26].forEach((ex, idx) => {
    const hEar = MeshBuilder.CreateCylinder(`${idPrefix}-hp-ear-${idx}`, { height: 0.18, diameterTop: 0.02, diameterBottom: 0.14, tessellation: 3 }, scene);
    hEar.rotation.z = idx === 0 ? 0.35 : -0.35;
    hEar.rotation.y = Math.PI / 2;
    hEar.position.set(ex, 0.92, 0.01);
    hEar.material = rgbMat;
    hEar.parent = catHeadphonesNode;
  });

  // KÍNH CẬN TRÒN NOBITA (ROUND GLASSES)
  const roundGlassesNode = new TransformNode(`${idPrefix}-round-glasses-node`, scene);
  roundGlassesNode.parent = headNode;
  roundGlassesNode.setEnabled(false);
  const glassRimMat = makeMat(scene, `${idPrefix}-glasses-mat`, '#334155');
  [-0.18, 0.18].forEach((gx, idx) => {
    const rim = MeshBuilder.CreateTorus(`${idPrefix}-glasses-rim-${idx}`, { diameter: 0.26, thickness: 0.024, tessellation: 20 }, scene);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(gx, 0.44, 0.47);
    rim.material = glassRimMat;
    rim.parent = roundGlassesNode;
  });
  const glassBridge = MeshBuilder.CreateBox(`${idPrefix}-glasses-bridge`, { width: 0.11, height: 0.02, depth: 0.02 }, scene);
  glassBridge.position.set(0, 0.44, 0.47);
  glassBridge.material = glassRimMat;
  glassBridge.parent = roundGlassesNode;

  // ĐUÔI CÁO LÔNG XÙ LẮC LƯ (ANIMATED FOX TAIL)
  const foxTailNode = new TransformNode(`${idPrefix}-fox-tail-node`, scene);
  foxTailNode.parent = torsoNode;
  foxTailNode.position.set(0, -0.06, -0.22);
  foxTailNode.setEnabled(false);

  const tailRootSeg = MeshBuilder.CreateSphere(`${idPrefix}-fox-tail-0`, { diameter: 0.18, segments: 10 }, scene);
  tailRootSeg.scaling.set(0.9, 0.9, 1.2);
  tailRootSeg.position.set(0, 0.04, -0.10);
  tailRootSeg.material = materials.foxOrange;
  tailRootSeg.parent = foxTailNode;

  const tailMidSeg = MeshBuilder.CreateSphere(`${idPrefix}-fox-tail-1`, { diameter: 0.26, segments: 12 }, scene);
  tailMidSeg.scaling.set(1.0, 1.1, 1.5);
  tailMidSeg.position.set(0, 0.14, -0.24);
  tailMidSeg.rotation.x = -0.35;
  tailMidSeg.material = materials.foxOrange;
  tailMidSeg.parent = foxTailNode;

  const tailTipSeg = MeshBuilder.CreateSphere(`${idPrefix}-fox-tail-2`, { diameter: 0.20, segments: 10 }, scene);
  tailTipSeg.scaling.set(0.85, 0.95, 1.3);
  tailTipSeg.position.set(0, 0.28, -0.38);
  tailTipSeg.rotation.x = -0.65;
  tailTipSeg.material = materials.foxWhite;
  tailTipSeg.parent = foxTailNode;

  // CẶP SỪNG ÁC MA NEON (DEVIL HORNS)
  const devilHornsNode = new TransformNode(`${idPrefix}-devil-horns-node`, scene);
  devilHornsNode.parent = headNode;
  devilHornsNode.setEnabled(false);

  [-0.22, 0.22].forEach((hx, idx) => {
    const horn = MeshBuilder.CreateCylinder(`${idPrefix}-devil-horn-${idx}`, {
      height: 0.26,
      diameterTop: 0.02,
      diameterBottom: 0.12,
      tessellation: 12,
    }, scene);
    horn.rotation.z = idx === 0 ? -0.45 : 0.45;
    horn.rotation.x = 0.25;
    horn.position.set(hx, 0.88, 0.18);
    horn.material = materials.devilRed;
    horn.parent = devilHornsNode;
  });

  // BÁNH MÌ NƯỚNG NGẬM MIỆNG (TOAST IN MOUTH)
  const toastMouthNode = new TransformNode(`${idPrefix}-toast-mouth-node`, scene);
  toastMouthNode.parent = headNode;
  toastMouthNode.position.set(0, 0.32, 0.50);
  toastMouthNode.rotation.z = 0.12;
  toastMouthNode.rotation.x = 0.10;
  toastMouthNode.setEnabled(false);

  const toastSlice = MeshBuilder.CreateBox(`${idPrefix}-toast-slice`, { width: 0.16, height: 0.15, depth: 0.028 }, scene);
  toastSlice.material = materials.toastCrust;
  toastSlice.parent = toastMouthNode;

  const toastButter = MeshBuilder.CreateBox(`${idPrefix}-toast-butter`, { width: 0.065, height: 0.065, depth: 0.034 }, scene);
  toastButter.position.set(0.015, 0.02, 0.005);
  toastButter.material = materials.toastButter;
  toastButter.parent = toastMouthNode;

  // KẸO MÚT CẦU VỒNG (LOLLIPOP SWEET)
  const lollipopSweetNode = new TransformNode(`${idPrefix}-lollipop-node`, scene);
  lollipopSweetNode.parent = headNode;
  lollipopSweetNode.position.set(0.08, 0.31, 0.49);
  lollipopSweetNode.rotation.z = -0.45;
  lollipopSweetNode.rotation.x = 0.15;
  lollipopSweetNode.setEnabled(false);

  const stick = MeshBuilder.CreateCylinder(`${idPrefix}-lolli-stick`, { height: 0.20, diameter: 0.016, tessellation: 8 }, scene);
  stick.position.set(0, -0.05, 0);
  stick.material = materials.shirtTrim;
  stick.parent = lollipopSweetNode;

  const candy = MeshBuilder.CreateCylinder(`${idPrefix}-lolli-candy`, { height: 0.035, diameter: 0.15, tessellation: 18 }, scene);
  candy.rotation.x = Math.PI / 2;
  candy.position.set(0, 0.07, 0);
  candy.material = materials.skirt;
  candy.parent = lollipopSweetNode;

  const candyRing = MeshBuilder.CreateTorus(`${idPrefix}-lolli-ring`, { diameter: 0.10, thickness: 0.016, tessellation: 16 }, scene);
  candyRing.position.set(0, 0.07, 0);
  candyRing.material = materials.toastButter;
  candyRing.parent = lollipopSweetNode;

  // KÍNH PHI CÔNG GÁC TRÁN (STEAMPUNK GOGGLES)
  const steampunkGogglesNode = new TransformNode(`${idPrefix}-goggles-node`, scene);
  steampunkGogglesNode.parent = headNode;
  steampunkGogglesNode.position.set(0, 0.65, 0.32);
  steampunkGogglesNode.rotation.x = -0.22;
  steampunkGogglesNode.setEnabled(false);

  const goggleBand = MeshBuilder.CreateTorus(`${idPrefix}-goggle-band`, { diameter: 0.90, thickness: 0.035, tessellation: 20 }, scene);
  goggleBand.scaling.set(1.0, 0.3, 1.0);
  goggleBand.position.set(0, 0, -0.16);
  goggleBand.material = materials.goggleLeather;
  goggleBand.parent = steampunkGogglesNode;

  [-0.15, 0.15].forEach((gx, idx) => {
    const rim = MeshBuilder.CreateCylinder(`${idPrefix}-goggle-rim-${idx}`, { height: 0.06, diameter: 0.22, tessellation: 16 }, scene);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(gx, 0, 0.10);
    rim.material = materials.brass;
    rim.parent = steampunkGogglesNode;

    const lens = MeshBuilder.CreateCylinder(`${idPrefix}-goggle-lens-${idx}`, { height: 0.065, diameter: 0.17, tessellation: 14 }, scene);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(gx, 0, 0.10);
    lens.material = materials.goggleLens;
    lens.parent = steampunkGogglesNode;
  });

  // VƯƠNG MIỆN HOÀNG KIM RUBY (ROYAL CROWN)
  const royalCrownNode = new TransformNode(`${idPrefix}-royal-crown-node`, scene);
  royalCrownNode.parent = headNode;
  royalCrownNode.position.set(0, 0.85, 0);
  royalCrownNode.setEnabled(false);

  const crownBand = MeshBuilder.CreateCylinder(`${idPrefix}-crown-band`, { height: 0.08, diameter: 0.50, tessellation: 20 }, scene);
  crownBand.material = materials.royalGold;
  crownBand.parent = royalCrownNode;

  [-0.20, -0.10, 0, 0.10, 0.20].forEach((px, idx) => {
    const peak = MeshBuilder.CreateCylinder(`${idPrefix}-crown-peak-${idx}`, { height: idx === 2 ? 0.14 : 0.09, diameterTop: 0.01, diameterBottom: 0.06, tessellation: 4 }, scene);
    peak.position.set(px, idx === 2 ? 0.09 : 0.06, 0.23);
    peak.material = materials.royalGold;
    peak.parent = royalCrownNode;

    const gem = MeshBuilder.CreateSphere(`${idPrefix}-crown-gem-${idx}`, { diameter: 0.04, segments: 8 }, scene);
    gem.position.set(px, idx === 2 ? 0.14 : 0.10, 0.24);
    gem.material = materials.royalRed;
    gem.parent = royalCrownNode;
  });

  // HÀO QUANG 3 NGÔI SAO HOÀNG KIM XOAY VÒNG QUANH ĐẦU (ORBITING AURA STARS)
  const floatingStarsNode = new TransformNode(`${idPrefix}-floating-stars-node`, scene);
  floatingStarsNode.parent = headNode;
  floatingStarsNode.position.set(0, 0.88, 0);
  floatingStarsNode.setEnabled(false);

  [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].forEach((angle, idx) => {
    const star = MeshBuilder.CreateSphere(`${idPrefix}-aura-star-${idx}`, { diameter: 0.09, segments: 8 }, scene);
    star.scaling.set(1.2, 1.2, 0.4);
    star.position.set(Math.cos(angle) * 0.48, Math.sin(idx * 2) * 0.06, Math.sin(angle) * 0.48);
    star.material = materials.royalGold;
    star.parent = floatingStarsNode;
  });

  // ÁO CHOÀNG HOÀNG GIA NHUNG ĐỎ VIỀN LÔNG TRẮNG (ROYAL ERMINE CAPE)
  const royalCapeNode = new TransformNode(`${idPrefix}-royal-cape-node`, scene);
  royalCapeNode.parent = torsoNode;
  royalCapeNode.position.set(0, 0.36, -0.15);
  royalCapeNode.setEnabled(false);

  const capeCloth = MeshBuilder.CreateBox(`${idPrefix}-cape-cloth`, { width: 0.52, height: 0.72, depth: 0.025 }, scene);
  capeCloth.position.set(0, -0.30, -0.06);
  capeCloth.rotation.x = 0.12;
  capeCloth.material = materials.royalRed;
  capeCloth.parent = royalCapeNode;

  const capeFur = MeshBuilder.CreateTorus(`${idPrefix}-cape-fur`, { diameter: 0.40, thickness: 0.08, tessellation: 18 }, scene);
  capeFur.position.set(0, 0.02, 0.02);
  capeFur.material = materials.vestWhite;
  capeFur.parent = royalCapeNode;

  const capeBrooch = MeshBuilder.CreateSphere(`${idPrefix}-cape-brooch`, { diameter: 0.065, segments: 10 }, scene);
  capeBrooch.position.set(0, 0.04, 0.22);
  capeBrooch.material = materials.royalGold;
  capeBrooch.parent = royalCapeNode;

  // CÁNH TIÊN NỮ BƯỚM DẠ QUANG PHÁT SÁNG (FAERIE WINGS)
  const faerieWingsNode = new TransformNode(`${idPrefix}-faerie-wings-node`, scene);
  faerieWingsNode.parent = torsoNode;
  faerieWingsNode.position.set(0, 0.32, -0.16);
  faerieWingsNode.setEnabled(false);

  [-0.15, 0.15].forEach((wx, idx) => {
    const upWing = MeshBuilder.CreateSphere(`${idPrefix}-f-wing-up-${idx}`, { diameter: 0.48, segments: 10 }, scene);
    upWing.scaling.set(idx === 0 ? -1.3 : 1.3, 0.75, 0.08);
    upWing.rotation.z = idx === 0 ? -0.55 : 0.55;
    upWing.rotation.y = idx === 0 ? -0.35 : 0.35;
    upWing.position.set(wx * 2.2, 0.18, 0);
    upWing.material = materials.fairyWingGlow;
    upWing.parent = faerieWingsNode;

    const lowWing = MeshBuilder.CreateSphere(`${idPrefix}-f-wing-low-${idx}`, { diameter: 0.34, segments: 10 }, scene);
    lowWing.scaling.set(idx === 0 ? -1.1 : 1.1, 0.55, 0.08);
    lowWing.rotation.z = idx === 0 ? -0.2 : 0.2;
    lowWing.rotation.y = idx === 0 ? -0.2 : 0.2;
    lowWing.position.set(wx * 1.8, -0.08, 0);
    lowWing.material = materials.kimonoPink;
    lowWing.parent = faerieWingsNode;
  });

  // CÁNH DƠI QUỶ DRACULA GOTHIC (BAT WINGS)
  const batWingsNode = new TransformNode(`${idPrefix}-bat-wings-node`, scene);
  batWingsNode.parent = torsoNode;
  batWingsNode.position.set(0, 0.32, -0.16);
  batWingsNode.setEnabled(false);

  [-0.14, 0.14].forEach((bx, idx) => {
    const batWing = MeshBuilder.CreateSphere(`${idPrefix}-bat-w-${idx}`, { diameter: 0.46, segments: 10 }, scene);
    batWing.scaling.set(idx === 0 ? -1.25 : 1.25, 0.55, 0.08);
    batWing.rotation.z = idx === 0 ? -0.45 : 0.45;
    batWing.rotation.y = idx === 0 ? -0.30 : 0.30;
    batWing.position.set(bx * 2.1, 0.10, 0);
    batWing.material = materials.batWingDark;
    batWing.parent = batWingsNode;
  });

  // Mũ cói nông dân truyền thống
  const hatNode = new TransformNode(`${idPrefix}-hat-node`, scene);
  hatNode.parent = headNode;
  hatNode.setEnabled(hasHat);

  const hatBrim = MeshBuilder.CreateCylinder(`${idPrefix}-hat-brim`, { height: 0.04, diameter: 1.28, tessellation: 18 }, scene);
  hatBrim.position.set(0, 0.75, -0.05);
  hatBrim.rotation.x = -0.08;
  hatBrim.material = materials.hatStraw;
  hatBrim.parent = hatNode;

  const hatCrown = MeshBuilder.CreateSphere(`${idPrefix}-hat-crown`, { diameter: 0.88, segments: 20 }, scene);
  hatCrown.scaling.set(1, 0.50, 1);
  hatCrown.position.set(0, 0.81, -0.06);
  hatCrown.rotation.x = -0.08;
  hatCrown.material = materials.hatStraw;
  hatCrown.parent = hatNode;

  const ribbon = MeshBuilder.CreateTorus(`${idPrefix}-hat-ribbon`, { diameter: 0.88, thickness: 0.035, tessellation: 16 }, scene);
  ribbon.position.set(0, 0.77, -0.05);
  ribbon.rotation.x = -0.08;
  ribbon.material = materials.hatRibbon;
  ribbon.parent = hatNode;

  // NÓN LÁ VIỆT NAM TRUYỀN THỐNG (VIETNAMESE CONICAL HAT)
  const nonLaNode = new TransformNode(`${idPrefix}-non-la-node`, scene);
  nonLaNode.parent = headNode;
  nonLaNode.setEnabled(false);

  const nonLaCone = MeshBuilder.CreateCylinder(`${idPrefix}-non-la-cone`, {
    height: 0.36,
    diameterTop: 0.02,
    diameterBottom: 1.20,
    tessellation: 32,
  }, scene);
  nonLaCone.position.set(0, 0.88, -0.02);
  nonLaCone.rotation.x = -0.08;
  nonLaCone.material = materials.nonLaStraw;
  nonLaCone.parent = nonLaNode;

  const nonLaTip = MeshBuilder.CreateSphere(`${idPrefix}-non-la-tip`, { diameter: 0.05, segments: 8 }, scene);
  nonLaTip.position.set(0, 1.06, -0.035);
  nonLaTip.material = materials.brass;
  nonLaTip.parent = nonLaNode;

  [-0.24, 0.24].forEach((qx, idx) => {
    const quai = MeshBuilder.CreateBox(`${idPrefix}-non-la-quai-${idx}`, { width: 0.028, height: 0.44, depth: 0.012 }, scene);
    quai.position.set(qx, 0.54, 0.05);
    quai.rotation.z = idx === 0 ? -0.16 : 0.16;
    quai.material = materials.nonLaRibbon;
    quai.parent = nonLaNode;
  });

  // Vành nan tre khâu chỉ nổi nón lá truyền thống
  [0.68, 0.98].forEach((diam, rIdx) => {
    const ring = MeshBuilder.CreateTorus(`${idPrefix}-non-la-ring-${rIdx}`, {
      diameter: diam,
      thickness: 0.014,
      tessellation: 28,
    }, scene);
    ring.position.set(0, 0.77 + (1.20 - diam) * 0.26, -0.02);
    ring.rotation.x = -0.08;
    ring.material = materials.brass;
    ring.parent = nonLaNode;
  });

  // KHĂN ĐÓNG MẤN GẤM HOÀNG GIA (VIETNAMESE ROYAL TURBAN - NẾP GẤM 5 TẦNG)
  const khanDongNode = new TransformNode(`${idPrefix}-khan-dong-node`, scene);
  khanDongNode.parent = headNode;
  khanDongNode.setEnabled(false);

  // Khối mấn gấm ôm khít trán và hộp sọ
  const khanDongBase = MeshBuilder.CreateCylinder(`${idPrefix}-khan-dong-base`, {
    height: 0.16,
    diameterTop: 0.88,
    diameterBottom: 0.93,
    tessellation: 32,
  }, scene);
  khanDongBase.position.set(0, 0.77, 0.01);
  khanDongBase.rotation.x = -0.12;
  khanDongBase.material = materials.khanDongNavy;
  khanDongBase.parent = khanDongNode;

  // 5 Tầng nếp mấn gấm xếp lớp truyền thống (Iconic multi-tier wrapped silk)
  const khanDongTiers = [
    { diam: 0.925, y: 0.725, thick: 0.046 },
    { diam: 0.910, y: 0.755, thick: 0.043 },
    { diam: 0.895, y: 0.785, thick: 0.040 },
    { diam: 0.880, y: 0.815, thick: 0.038 },
    { diam: 0.865, y: 0.845, thick: 0.035 },
  ];
  khanDongTiers.forEach(({ diam, y, thick }, kIdx) => {
    const tier = MeshBuilder.CreateTorus(`${idPrefix}-khan-dong-tier-${kIdx}`, {
      diameter: diam,
      thickness: thick,
      tessellation: 28,
    }, scene);
    tier.position.set(0, y, 0.01);
    tier.rotation.x = -0.12;
    tier.material = materials.khanDongNavy;
    tier.parent = khanDongNode;

    // Viền chỉ vàng nổi bật giữa các nếp mấn hoàng gia
    if (kIdx < 4) {
      const goldPiping = MeshBuilder.CreateTorus(`${idPrefix}-khan-dong-piping-${kIdx}`, {
        diameter: diam + 0.005,
        thickness: 0.012,
        tessellation: 24,
      }, scene);
      goldPiping.position.set(0, y + 0.015, 0.01);
      goldPiping.rotation.x = -0.12;
      goldPiping.material = materials.aodaiGoldTrim;
      goldPiping.parent = khanDongNode;
    }
  });

  // KIM BÍNH HOÀNG GIA - NGỌC CÀI MẤN VƯƠNG GIẢ (Imperial Brooch & Ruby Jewel)
  const broochAnchor = new TransformNode(`${idPrefix}-khan-dong-brooch-anchor`, scene);
  broochAnchor.position.set(0, 0.765, 0.475);
  broochAnchor.rotation.x = -0.12;
  broochAnchor.parent = khanDongNode;

  // Đế hoa văn bát giác mạ vàng (8-pointed golden imperial star plate)
  const broochStar = MeshBuilder.CreateCylinder(`${idPrefix}-khan-dong-brooch-star`, {
    height: 0.018,
    diameter: 0.096,
    tessellation: 8,
  }, scene);
  broochStar.rotation.x = Math.PI / 2;
  broochStar.material = materials.royalGold;
  broochStar.parent = broochAnchor;

  // Vòng chuỗi hạt vàng bao quanh ngọc
  const broochRim = MeshBuilder.CreateTorus(`${idPrefix}-khan-dong-brooch-rim`, {
    diameter: 0.096,
    thickness: 0.016,
    tessellation: 18,
  }, scene);
  broochRim.material = materials.aodaiGoldTrim;
  broochRim.parent = broochAnchor;

  // Viên hồng ngọc hoàng gia Ruby lấp lánh ở tâm (Imperial Ruby cabochon)
  const broochRuby = MeshBuilder.CreateSphere(`${idPrefix}-khan-dong-brooch-ruby`, {
    diameter: 0.052,
    segments: 10,
  }, scene);
  broochRuby.scaling.set(1.0, 1.0, 0.6);
  broochRuby.position.set(0, 0, 0.015);
  broochRuby.material = materials.royalRed;
  broochRuby.parent = broochAnchor;

  // Giọt ngọc trai thả rủ quý phái
  const broochPearlDrop = MeshBuilder.CreateSphere(`${idPrefix}-khan-dong-pearl-drop`, {
    diameter: 0.030,
    segments: 8,
  }, scene);
  broochPearlDrop.position.set(0, -0.055, 0);
  broochPearlDrop.material = materials.vestWhite;
  broochPearlDrop.parent = broochAnchor;

  // MŨ NỒI BERET IDOL K-POP (K-POP BERET)
  const kpopBeretNode = new TransformNode(`${idPrefix}-kpop-beret-node`, scene);
  kpopBeretNode.parent = headNode;
  kpopBeretNode.setEnabled(false);

  const beretDisc = MeshBuilder.CreateSphere(`${idPrefix}-beret-disc`, { diameter: 0.88, segments: 16 }, scene);
  beretDisc.scaling.set(1.0, 0.28, 1.0);
  beretDisc.rotation.z = 0.28;
  beretDisc.rotation.x = -0.12;
  beretDisc.position.set(-0.06, 0.86, 0.02);
  beretDisc.material = materials.kpopBeretMat;
  beretDisc.parent = kpopBeretNode;

  const beretPin = MeshBuilder.CreateCylinder(`${idPrefix}-beret-pin`, { height: 0.015, diameter: 0.055, tessellation: 8 }, scene);
  beretPin.rotation.x = Math.PI / 2;
  beretPin.rotation.z = 0.28;
  beretPin.position.set(0.24, 0.82, 0.32);
  beretPin.material = materials.kpopChainSilver;
  beretPin.parent = kpopBeretNode;

  // MIC CÀI TAI THẦN TƯỢNG SÂN KHẤU (K-POP HEADSET MIC)
  const kpopMicNode = new TransformNode(`${idPrefix}-kpop-mic-node`, scene);
  kpopMicNode.parent = headNode;
  kpopMicNode.setEnabled(false);

  const micEarpiece = MeshBuilder.CreateSphere(`${idPrefix}-mic-earpiece`, { diameter: 0.08, segments: 8 }, scene);
  micEarpiece.position.set(0.44, 0.38, 0.02);
  micEarpiece.material = materials.kpopBeretMat;
  micEarpiece.parent = kpopMicNode;

  const micBoom = MeshBuilder.CreateCylinder(`${idPrefix}-mic-boom`, { height: 0.30, diameter: 0.012, tessellation: 6 }, scene);
  micBoom.position.set(0.32, 0.34, 0.22);
  micBoom.rotation.z = -0.75;
  micBoom.rotation.y = 0.65;
  micBoom.material = materials.kpopChainSilver;
  micBoom.parent = kpopMicNode;

  const micTip = MeshBuilder.CreateSphere(`${idPrefix}-mic-tip`, { diameter: 0.04, segments: 6 }, scene);
  micTip.position.set(0.18, 0.30, 0.38);
  micTip.material = materials.kpopBeretMat;
  micTip.parent = kpopMicNode;

  // ========================================================
  // 5. BÀN TAY BÁNH MOCHI & GIÀY SNEAKER CHUNKY ĐẾ BÁNH MÌ
  // ========================================================
  function createArm(isLeft) {
    const side = isLeft ? 1 : -1;
    let shoulderElbow = null;
    const armRoot = new TransformNode(`${idPrefix}-arm-root-${isLeft ? 'l' : 'r'}`, scene);
    armRoot.position.set(side * 0.31, proportions.shoulderHeight, 0);
    armRoot.parent = torsoNode;

    // Tay áo hoodie phồng to
    const sleeve = MeshBuilder.CreateCapsule(`${idPrefix}-sleeve-${isLeft ? 'l' : 'r'}`, {
      height: 0.29, radius: 0.115, tessellation: 16, subdivisions: 2,
    }, scene);
    sleeve.rotation.z = side * 0.16;
    sleeve.position.set(-side * 0.025, -0.065, 0);
    sleeve.material = materials.shirt;
    sleeve.parent = armRoot;
    sleeve.setEnabled(false);
    // The shoulder ball overlaps both torso and arm in every pose.
    const shoulder = MeshBuilder.CreateSphere(`${idPrefix}-shoulder-${side}`, { diameter: 0.175, segments: 20 }, scene);
    shoulder.parent = armRoot;
    shoulder.position.x = -side * 0.025;
    shoulder.material = materials.skin;
    shoulder.setEnabled(false);
    // Keep the inner armhole anchored inside the torso. The outer rings follow
    // the arm, so lifting it cannot pull the entire shoulder away from the shirt.
    const bridge = new Mesh(`${idPrefix}-shoulder-bridge-${side}`, scene);
    bridge.parent = torsoNode;
    bridge.material = materials.shirt;
    bridge.metadata = { articulatedSurface: true, sleeveLength: 0.24, radius: 0.098 };
    shoulderSurfaces.push(bridge);
    const bridgePositions = new Float32Array(17 * 21 * 3);
    const bridgeNormals = new Float32Array(bridgePositions.length);
    const bridgeIndices = [];
    for (let r = 0; r < 16; r++) for (let s = 0; s < 20; s++) {
      const a = r * 21 + s, b = a + 21;
      if (side > 0) bridgeIndices.push(a, b, a + 1, a + 1, b, b + 1);
      else bridgeIndices.push(a, a + 1, b, a + 1, b + 1, b);
    }
    const rotation = new Matrix();
    const outer = new Vector3(), transformed = new Vector3(), endpoint = new Vector3();
    const updateBridge = () => {
      Matrix.RotationYawPitchRollToRef(armRoot.rotation.y, armRoot.rotation.x, armRoot.rotation.z, rotation);
      outer.set(0, -0.14, 0);
      Vector3.TransformCoordinatesToRef(outer, rotation, endpoint);
      endpoint.addInPlace(armRoot.position);
      for (let r = 0; r < 17; r++) {
        const t = r / 8, u = 1 - t;
        const angle = t * Math.PI / 2;
        for (let s = 0; s <= 20; s++) {
          const theta = s / 20 * Math.PI * 2;
          const cosine = Math.cos(theta), sine = Math.sin(theta);
          if (r > 8) {
            const progress = (r - 8) / 8;
            const y = -0.14 - progress * (bridge.metadata.sleeveLength - 0.14);
            const radius = bridge.metadata.radius * (1 - progress * 0.22);
            const bend = Math.max(0, Math.min(1, (-y - 0.24) / 0.16));
            const a = (shoulderElbow?.rotation.x || 0) * bend * bend * (3 - 2 * bend);
            const dy = y + proportions.upperArmLength, z = sine * radius;
            outer.set(side * cosine * radius, dy * Math.cos(a) - z * Math.sin(a) - proportions.upperArmLength, dy * Math.sin(a) + z * Math.cos(a));
            Vector3.TransformCoordinatesToRef(outer, rotation, transformed);
            transformed.addInPlace(armRoot.position);
            const p = (r * 21 + s) * 3;
            bridgePositions[p] = transformed.x;
            bridgePositions[p + 1] = transformed.y;
            bridgePositions[p + 2] = transformed.z;
            continue;
          }
          outer.set(side * cosine * bridge.metadata.radius, -0.14, sine * bridge.metadata.radius);
          Vector3.TransformCoordinatesToRef(outer, rotation, transformed);
          transformed.addInPlace(armRoot.position);
          const p = (r * 21 + s) * 3;
          bridgePositions[p] = side * 0.17 * u * u + armRoot.position.x * 2 * u * t + endpoint.x * t * t
            + (transformed.x - endpoint.x) * Math.sin(angle);
          bridgePositions[p + 1] = proportions.shoulderHeight * u * u + armRoot.position.y * 2 * u * t + endpoint.y * t * t
            + cosine * 0.112 * Math.cos(angle) + (transformed.y - endpoint.y) * Math.sin(angle);
          bridgePositions[p + 2] = endpoint.z * t * t + sine * 0.112 * u + (transformed.z - endpoint.z) * t;
        }
      }
      VertexData.ComputeNormals(bridgePositions, bridgeIndices, bridgeNormals);
      if (bridge.getTotalVertices()) {
        bridge.updateVerticesData('position', bridgePositions, true);
        bridge.updateVerticesData('normal', bridgeNormals);
      } else {
        const data = new VertexData();
        data.positions = bridgePositions; data.normals = bridgeNormals; data.indices = bridgeIndices;
        data.applyToMesh(bridge, true);
      }
    };
    updateBridge();
    armSurfaces.push({mesh: bridge, update: updateBridge});
    const upperSleeve = MeshBuilder.CreateCapsule(`${idPrefix}-upper-sleeve-${side}`, {
      height: proportions.upperArmLength + 0.16, radius: 0.092, tessellation: 12,
    }, scene);
    upperSleeve.parent = armRoot;
    upperSleeve.position.y = -proportions.upperArmLength / 2;
    upperSleeve.material = materials.shirt;
    upperSleeve.setEnabled(false);
    longSleeves.push(upperSleeve);

    // Cánh tay Chibi ngắn mũm mĩm
    const arm = MeshBuilder.CreateCapsule(`${idPrefix}-arm-${isLeft ? 'l' : 'r'}`, {
      height: proportions.upperArmLength + 0.13,
      radius: 0.066,
      tessellation: 12,
    }, scene);
    arm.position.y = -proportions.upperArmLength / 2;
    arm.material = materials.skin;
    arm.parent = armRoot;

    const elbow = new TransformNode(`${idPrefix}-elbow-${isLeft ? 'l' : 'r'}`, scene);
    elbow.parent = armRoot;
    elbow.position.y = -proportions.upperArmLength;
    shoulderElbow = elbow;
    const elbowSurface = MeshBuilder.CreateSphere(`${idPrefix}-elbow-surface-${side}`, { diameter: 0.13, segments: 12 }, scene);
    elbowSurface.parent = elbow;
    elbowSurface.material = materials.skin;
    const forearm = MeshBuilder.CreateCapsule(`${idPrefix}-forearm-${isLeft ? 'l' : 'r'}`, {
      height: proportions.forearmLength + 0.12, radius: 0.064, tessellation: 12,
    }, scene);
    forearm.parent = elbow;
    forearm.position.y = -proportions.forearmLength / 2;
    forearm.material = materials.skin;
    const longSleeve = MeshBuilder.CreateCapsule(`${idPrefix}-long-sleeve-${side}`, { height: 0.43, radius: 0.089, tessellation: 12 }, scene);
    longSleeve.parent = elbow;
    longSleeve.position.y = -0.14;
    longSleeve.material = materials.shirt;
    longSleeve.setEnabled(false);
    longSleeves.push(longSleeve);
    armJoints.push(elbow);
    // One continuous surface, rather than separate capsules meeting at a seam.
    // Bend vertex rings around the elbow using the same articulated joint.
    const rings = [-0.14, -0.18, -0.22, -0.27, -0.32, -0.38, -0.48, -0.58, -0.63];
    const segments = 20;
    const indices = [];
    for (let r = 0; r < rings.length - 1; r++) for (let s = 0; s < segments; s++) {
      const a = r * (segments + 1) + s, b = a + segments + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const createSurface = (suffix, radius, material, short = false) => {
      const mesh = new Mesh(`${idPrefix}-${suffix}-${side}`, scene);
      mesh.parent = armRoot;
      mesh.material = material;
      const positions = new Float32Array(rings.length * (segments + 1) * 3);
      const normals = new Float32Array(positions.length);
      const update = () => {
        rings.forEach((y, r) => {
          if (short) y = -0.14 - r / (rings.length - 1) * 0.10;
          const bend = Math.max(0, Math.min(1, (-y - 0.24) / 0.16));
          const weight = bend * bend * (3 - 2 * bend);
          const angle = elbow.rotation.x * weight, c = Math.cos(angle), sn = Math.sin(angle);
          const lengthRatio = r / (rings.length - 1);
          const softRadius = radius * (1.06 - 0.27 * lengthRatio + 0.05 * Math.sin(lengthRatio * Math.PI));
          for (let s = 0; s <= segments; s++) {
            const theta = s / segments * Math.PI * 2;
            const localY = y + proportions.upperArmLength;
            const z = Math.sin(theta) * softRadius;
            const p = (r * (segments + 1) + s) * 3;
            positions[p] = Math.cos(theta) * softRadius;
            positions[p + 1] = localY * c - z * sn - proportions.upperArmLength;
            positions[p + 2] = localY * sn + z * c;
          }
        });
        VertexData.ComputeNormals(positions, indices, normals);
        if (mesh.getTotalVertices()) {
          mesh.updateVerticesData('position', positions, true);
          mesh.updateVerticesData('normal', normals);
        } else {
          const data = new VertexData();
          data.positions = positions; data.normals = normals; data.indices = indices;
          data.applyToMesh(mesh, true);
        }
      };
      update();
      armSurfaces.push({ mesh, update });
      return mesh;
    };
    createSurface('continuous-arm', 0.068, materials.skin);
    const shortFabric = createSurface('continuous-short-sleeve', 0.096, materials.shirt, true);
    shortFabric.setEnabled(false);
    shortSleeves.push(shortFabric);
    const fabric = createSurface('continuous-sleeve', 0.096, materials.shirt);
    fabric.setEnabled(false);
    longSleeves.push(fabric);
    arm.setEnabled(false);
    forearm.setEnabled(false);
    elbowSurface.setEnabled(false);
    // Existing rigid sections are superseded by the deforming fabric.
    longSleeves.splice(longSleeves.indexOf(upperSleeve), 1);
    longSleeves.splice(longSleeves.indexOf(longSleeve), 1);
    upperSleeve.setEnabled(false);
    longSleeve.setEnabled(false);

    // Bo cổ tay áo 3D có gân phong cách Play Together (Ribbed Wrist Cuffs)
    const wristCuff = MeshBuilder.CreateTorus(`${idPrefix}-wrist-cuff-${isLeft ? 'l' : 'r'}`, {
      diameter: 0.155,
      thickness: 0.034,
      tessellation: 18,
    }, scene);
    wristCuff.position.set(0, -proportions.forearmLength + 0.045, 0.01);
    wristCuff.material = materials.shirt;
    wristCuff.parent = elbow;
    wristCuff.setEnabled(false);
    longSleeves.push(wristCuff);
    wristCuffs.push(wristCuff);

    // Bàn tay bánh Mochi tròn nhẵn cực kỳ đáng yêu (Mitten Style)
    const hand = MeshBuilder.CreateSphere(`${idPrefix}-hand-${isLeft ? 'l' : 'r'}`, { diameter: 0.155, segments: 10 }, scene);
    hand.scaling.set(0.75, 1.0, 0.65);
    hand.position.set(0, -proportions.forearmLength - 0.005, 0.02);
    hand.material = materials.skin;
    hand.parent = elbow;

    const thumb = MeshBuilder.CreateSphere(`${idPrefix}-thumb-${isLeft ? 'l' : 'r'}`, { diameter: 0.065, segments: 8 }, scene);
    thumb.position.set(-side * 0.05, -proportions.forearmLength, 0.05);
    thumb.material = materials.skin;
    thumb.parent = elbow;

    return armRoot;
  }

  const leftArm = createArm(true);
  const rightArm = createArm(false);

  const shortsSeat = MeshBuilder.CreateSphere(`${idPrefix}-shorts-seat`, { diameter: 0.49, segments: 18 }, scene);
  shortsSeat.scaling.set(1, 0.39, 0.78);
  shortsSeat.position.y = -0.03;
  shortsSeat.material = materials.overalls;
  shortsSeat.parent = torsoNode;

  const shortsBelt = MeshBuilder.CreateTorus(`${idPrefix}-shorts-belt`, { diameter: 0.50, thickness: 0.026, tessellation: 20 }, scene);
  shortsBelt.position.y = 0.04;
  shortsBelt.material = materials.leatherBrown;
  shortsBelt.parent = shortsSeat;

  const shortsBuckle = MeshBuilder.CreateBox(`${idPrefix}-shorts-buckle`, { width: 0.05, height: 0.035, depth: 0.03 }, scene);
  shortsBuckle.position.set(0, 0.04, 0.245);
  shortsBuckle.material = materials.silverMetal;
  shortsBuckle.parent = shortsSeat;

  // Chân váy xòe Tennis phong cách Play Together (Pleated Tennis Skirt)
  const pleatedSkirt = MeshBuilder.CreateCylinder(`${idPrefix}-pleated-skirt`, {
    height: 0.22,
    diameterTop: 0.52,
    diameterBottom: 0.74,
    tessellation: 24,
  }, scene);
  pleatedSkirt.position.y = -0.06;
  pleatedSkirt.material = materials.skirt;
  pleatedSkirt.parent = torsoNode;
  pleatedSkirt.setEnabled(false);

  const skirtWaistband = MeshBuilder.CreateTorus(`${idPrefix}-skirt-waistband`, { diameter: 0.52, thickness: 0.032, tessellation: 24 }, scene);
  skirtWaistband.position.y = 0.04;
  skirtWaistband.material = materials.skirt;
  skirtWaistband.parent = pleatedSkirt;

  const skirtLace = MeshBuilder.CreateTorus(`${idPrefix}-skirt-lace`, { diameter: 0.74, thickness: 0.022, tessellation: 24 }, scene);
  skirtLace.position.y = -0.11;
  skirtLace.material = materials.laceWhite;
  skirtLace.parent = pleatedSkirt;

  // 16 Nếp xếp ly 3D sắc nét quanh chu vi chân váy
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const pleat = MeshBuilder.CreateBox(`${idPrefix}-skirt-pleat-${i}`, { width: 0.022, height: 0.22, depth: 0.014 }, scene);
    const r = 0.31;
    pleat.position.set(Math.cos(angle) * r, -0.01, Math.sin(angle) * r);
    pleat.rotation.y = -angle;
    pleat.material = materials.skirt;
    pleat.parent = pleatedSkirt;
  }

  // Váy dạ hội công chúa bồng bềnh hoàng gia (Royal Princess Ballgown Skirt - Elegant A-Line Flared Silhouette)
  const ballgownSkirt = MeshBuilder.CreateCylinder(`${idPrefix}-ballgown-skirt`, {
    height: 0.36,
    diameterTop: 0.49,
    diameterBottom: 0.88,
    tessellation: 32,
  }, scene);
  ballgownSkirt.position.set(0, -0.09, 0.01);
  ballgownSkirt.material = materials.skirt;
  ballgownSkirt.parent = torsoNode;
  ballgownSkirt.setEnabled(false);

  // Vành đai lưng váy đính vàng quý tộc
  const ballgownWaistband = MeshBuilder.CreateTorus(`${idPrefix}-ballgown-waistband`, {
    diameter: 0.50,
    thickness: 0.034,
    tessellation: 24,
  }, scene);
  ballgownWaistband.position.set(0, 0.17, 0);
  ballgownWaistband.material = materials.royalGold;
  ballgownWaistband.parent = ballgownSkirt;

  // Tầng peplum xòe lượn sóng phía trên (Tiered Peplum Overskirt)
  const ballgownPeplum = MeshBuilder.CreateCylinder(`${idPrefix}-ballgown-peplum`, {
    height: 0.16,
    diameterTop: 0.52,
    diameterBottom: 0.72,
    tessellation: 28,
  }, scene);
  ballgownPeplum.position.set(0, 0.06, 0);
  ballgownPeplum.material = materials.skirt;
  ballgownPeplum.parent = ballgownSkirt;

  // Viền vàng kim chân tầng peplum
  const peplumTrim = MeshBuilder.CreateTorus(`${idPrefix}-peplum-trim`, {
    diameter: 0.72,
    thickness: 0.022,
    tessellation: 24,
  }, scene);
  peplumTrim.position.set(0, -0.02, 0);
  peplumTrim.material = materials.royalGold;
  peplumTrim.parent = ballgownSkirt;

  // Nơ lụa công chúa trước eo (Princess Silk Bowknot)
  const ballgownBowCenter = MeshBuilder.CreateSphere(`${idPrefix}-ballgown-bow-knot`, { diameter: 0.055, segments: 10 }, scene);
  ballgownBowCenter.position.set(0, 0.17, 0.26);
  ballgownBowCenter.material = materials.royalGold;
  ballgownBowCenter.parent = ballgownSkirt;

  [-0.055, 0.055].forEach((bx, idx) => {
    const bowLoop = MeshBuilder.CreateSphere(`${idPrefix}-ballgown-bow-loop-${idx}`, { diameter: 0.075, segments: 10 }, scene);
    bowLoop.scaling.set(1.4, 0.75, 0.45);
    bowLoop.rotation.z = idx === 0 ? 0.25 : -0.25;
    bowLoop.position.set(bx, 0.17, 0.255);
    bowLoop.material = materials.royalGold;
    bowLoop.parent = ballgownSkirt;

    const bowRibbonTail = MeshBuilder.CreateBox(`${idPrefix}-ballgown-bow-tail-${idx}`, { width: 0.035, height: 0.15, depth: 0.015 }, scene);
    bowRibbonTail.rotation.z = idx === 0 ? 0.20 : -0.20;
    bowRibbonTail.rotation.x = -0.15;
    bowRibbonTail.position.set(bx * 0.9, 0.07, 0.27);
    bowRibbonTail.material = materials.royalGold;
    bowRibbonTail.parent = ballgownSkirt;
  });

  // Viền ren trắng tinh xảo chân váy (Scalloped White Lace Hem)
  const ballgownLace = MeshBuilder.CreateTorus(`${idPrefix}-ballgown-lace`, {
    diameter: 0.88,
    thickness: 0.036,
    tessellation: 32,
  }, scene);
  ballgownLace.position.set(0, -0.17, 0);
  ballgownLace.material = materials.laceWhite;
  ballgownLace.parent = ballgownSkirt;

  // Tầng ren lót bồng xòe bên trong nhô ra nhẹ (Petticoat Ruffle Hem)
  const petticoatRuffle = MeshBuilder.CreateTorus(`${idPrefix}-petticoat-ruffle`, {
    diameter: 0.91,
    thickness: 0.024,
    tessellation: 32,
  }, scene);
  petticoatRuffle.position.set(0, -0.19, 0);
  petticoatRuffle.material = materials.shirtTrim;
  petticoatRuffle.parent = ballgownSkirt;

  // 12 Nếp gân lụa thêu dọc thân váy lộng lẫy
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const rib = MeshBuilder.CreateBox(`${idPrefix}-ballgown-rib-${i}`, { width: 0.018, height: 0.32, depth: 0.015 }, scene);
    const r = 0.34;
    rib.position.set(Math.cos(angle) * r, -0.08, Math.sin(angle) * r);
    rib.rotation.y = -angle;
    rib.material = materials.skirt;
    rib.parent = ballgownSkirt;
  }

  const cargoDetailsNode = new TransformNode(`${idPrefix}-cargo-details`, scene);
  cargoDetailsNode.parent = torsoNode;
  cargoDetailsNode.setEnabled(false);
  [-0.22, 0.22].forEach((sx, index) => {
    const pocket = MeshBuilder.CreateBox(`${idPrefix}-cargo-pocket-${index}`, { width: 0.10, height: 0.11, depth: 0.018 }, scene);
    pocket.position.set(sx * 0.8, -0.10, 0.19);
    pocket.material = materials.bottomPocket;
    pocket.parent = cargoDetailsNode;

    const pocketFlap = MeshBuilder.CreateBox(`${idPrefix}-cargo-flap-${index}`, { width: 0.11, height: 0.035, depth: 0.025 }, scene);
    pocketFlap.position.set(sx * 0.8, -0.04, 0.20);
    pocketFlap.material = materials.bottomPocket;
    pocketFlap.parent = cargoDetailsNode;

    const rivet = MeshBuilder.CreateCylinder(`${idPrefix}-cargo-rivet-${index}`, { height: 0.012, diameter: 0.022, tessellation: 8 }, scene);
    rivet.rotation.x = Math.PI / 2;
    rivet.position.set(sx * 0.8, -0.04, 0.215);
    rivet.material = materials.silverMetal;
    rivet.parent = cargoDetailsNode;

    const strap = MeshBuilder.CreateBox(`${idPrefix}-cargo-strap-${index}`, { width: 0.024, height: 0.18, depth: 0.016 }, scene);
    strap.rotation.z = index === 0 ? 0.18 : -0.18;
    strap.position.set(sx * 0.95, -0.16, 0.18);
    strap.material = materials.cyberDark;
    strap.parent = cargoDetailsNode;

    const dRing = MeshBuilder.CreateTorus(`${idPrefix}-cargo-dring-${index}`, { diameter: 0.032, thickness: 0.008, tessellation: 10 }, scene);
    dRing.position.set(sx * 0.95, -0.24, 0.18);
    dRing.material = materials.silverMetal;
    dRing.parent = cargoDetailsNode;
  });

  const joggerDetailsNode = new TransformNode(`${idPrefix}-jogger-details`, scene);
  joggerDetailsNode.parent = torsoNode;
  joggerDetailsNode.setEnabled(false);
  [-0.15, 0.15].forEach((sx, index) => {
    const stripe = MeshBuilder.CreateBox(`${idPrefix}-jogger-stripe-${index}`, { width: 0.025, height: 0.38, depth: 0.025 }, scene);
    stripe.position.set(sx, -0.20, 0.16);
    stripe.material = materials.shoeNeon;
    stripe.parent = joggerDetailsNode;
  });

  const legOutfitParts = [];
  const shoeOutfitParts = [];
  function createLeg(isLeft) {
    const side = isLeft ? 1 : -1;
    const legRoot = new TransformNode(`${idPrefix}-leg-root-${isLeft ? 'l' : 'r'}`, scene);
    legRoot.position.set(side * 0.15, -0.02, 0);
    legRoot.parent = torsoNode;

    // Ống quần yếm ngắn mập có gấu xắn
    const pantLeg = MeshBuilder.CreateCylinder(`${idPrefix}-pant-leg-${isLeft ? 'l' : 'r'}`, {
      height: 0.22,
      diameterTop: 0.22,
      diameterBottom: 0.21,
      tessellation: 14,
    }, scene);
    pantLeg.position.y = -0.14;
    pantLeg.material = materials.overalls;
    pantLeg.parent = legRoot;

    const thigh = MeshBuilder.CreateCapsule(`${idPrefix}-thigh-${isLeft ? 'l' : 'r'}`, {
      height: proportions.thighLength + 0.06, radius: 0.072, tessellation: 12,
    }, scene);
    thigh.position.y = -proportions.thighLength / 2;
    thigh.parent = legRoot;
    thigh.material = materials.skin;
    const knee = new TransformNode(`${idPrefix}-knee-${isLeft ? 'l' : 'r'}`, scene);
    knee.position.y = -proportions.thighLength;
    knee.parent = legRoot;
    legJoints.push(knee);
    const kneeSurface = MeshBuilder.CreateSphere(`${idPrefix}-knee-surface-${side}`, { diameter: 0.143, segments: 12 }, scene);
    kneeSurface.parent = knee;
    kneeSurface.material = materials.skin;
    const calf = MeshBuilder.CreateCapsule(`${idPrefix}-calf-${isLeft ? 'l' : 'r'}`, {
      height: proportions.shinLength + 0.05, radius: 0.061, tessellation: 12,
    }, scene);
    calf.position.y = -proportions.shinLength / 2;
    calf.material = materials.skin;
    calf.parent = knee;

    // Tất đùi nữ sinh phong cách Play Together (School Knee Socks)
    const kneeSock = MeshBuilder.CreateCylinder(`${idPrefix}-knee-sock-${isLeft ? 'l' : 'r'}`, {
      height: 0.28,
      diameterTop: 0.165,
      diameterBottom: 0.152,
      tessellation: 16,
    }, scene);
    kneeSock.position.y = -0.16;
    kneeSock.material = materials.sockWhite;
    kneeSock.parent = knee;
    kneeSock.setEnabled(false);

    // Bo viền gập tất đùi mềm mại
    const sockCuff = MeshBuilder.CreateTorus(`${idPrefix}-sock-cuff-${isLeft ? 'l' : 'r'}`, {
      diameter: 0.165,
      thickness: 0.026,
      tessellation: 16,
    }, scene);
    sockCuff.position.y = -0.03;
    sockCuff.material = materials.sockWhite;
    sockCuff.parent = knee;
    sockCuff.setEnabled(false);

    // Bo vớ ngắn cổ chân khi mang giày thể thao (Ankle Sock Cuff)
    const ankleSockCuff = MeshBuilder.CreateTorus(`${idPrefix}-ankle-sock-${isLeft ? 'l' : 'r'}`, {
      diameter: 0.160,
      thickness: 0.028,
      tessellation: 16,
    }, scene);
    ankleSockCuff.position.y = -proportions.shinLength + 0.035;
    ankleSockCuff.material = materials.sockWhite;
    ankleSockCuff.parent = knee;
    ankleSockCuff.setEnabled(false);

    const shinPants = MeshBuilder.CreateCapsule(`${idPrefix}-shin-pants-${side}`, {height: proportions.shinLength + 0.09, radius: 0.095, tessellation: 12}, scene);
    shinPants.parent = knee;
    shinPants.position.y = -proportions.shinLength / 2;
    shinPants.material = materials.overalls;
    shinPants.setEnabled(false);
    const longPants = new Mesh(`${idPrefix}-continuous-pants-${side}`, scene);
    longPants.parent = legRoot;
    longPants.material = materials.overalls;
    const rings = [0.025, -0.10, -0.25, -0.34, -0.40, -0.46, -0.56, -0.66, -0.75];
    const positions = new Float32Array(rings.length * 13 * 3);
    const normals = new Float32Array(positions.length);
    const indices = [];
    for (let r = 0; r < rings.length - 1; r++) for (let s = 0; s < 12; s++) {
      const a = r * 13 + s, b = a + 13;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const skinLeg = new Mesh(`${idPrefix}-continuous-leg-${side}`, scene);
    skinLeg.parent = legRoot;
    skinLeg.material = materials.skin;
    const skinPositions = new Float32Array(positions.length);
    const skinNormals = new Float32Array(positions.length);
    const updatePants = () => {
      rings.forEach((y, r) => {
        const bend = Math.max(0, Math.min(1, (-y - 0.32) / 0.16));
        const weight = bend * bend * (3 - 2 * bend);
        const angle = knee.rotation.x * weight, c = Math.cos(angle), sn = Math.sin(angle);
        const radius = 0.109 - (r / (rings.length - 1)) * 0.016;
        for (let s = 0; s <= 12; s++) {
          const theta = s / 12 * Math.PI * 2, z = Math.sin(theta) * radius;
          const localY = y + proportions.thighLength, p = (r * 13 + s) * 3;
          positions[p] = Math.cos(theta) * radius;
          positions[p + 1] = localY * c - z * sn - proportions.thighLength;
          positions[p + 2] = localY * sn + z * c;
          const skinRadius = 0.076 - r / (rings.length - 1) * 0.018;
          const skinZ = Math.sin(theta) * skinRadius;
          skinPositions[p] = Math.cos(theta) * skinRadius;
          skinPositions[p + 1] = localY * c - skinZ * sn - proportions.thighLength;
          skinPositions[p + 2] = localY * sn + skinZ * c;
        }
      });
      VertexData.ComputeNormals(positions, indices, normals);
      VertexData.ComputeNormals(skinPositions, indices, skinNormals);
      if (skinLeg.getTotalVertices()) {
        skinLeg.updateVerticesData('position', skinPositions, true);
        skinLeg.updateVerticesData('normal', skinNormals);
      } else {
        const data = new VertexData();
        data.positions = skinPositions; data.normals = skinNormals; data.indices = indices;
        data.applyToMesh(skinLeg, true);
      }
      if (longPants.getTotalVertices()) {
        longPants.updateVerticesData('position', positions, true);
        longPants.updateVerticesData('normal', normals);
      } else {
        const data = new VertexData();
        data.positions = positions; data.normals = normals; data.indices = indices;
        data.applyToMesh(longPants, true);
      }
    };
    updatePants();
    longPants.setEnabled(false);
    armSurfaces.push({ mesh: skinLeg, update: updatePants });
    thigh.setEnabled(false);
    calf.setEnabled(false);
    kneeSurface.setEnabled(false);
    legOutfitParts.push({ pantLeg, calf, thigh, shinPants, kneeSurface, longPants, kneeSock, sockCuff, ankleSockCuff });

    // GIÀY SNEAKER CHUNKY ĐẾ BÁNH MÌ THỜI THƯỢNG (PLAY TOGETHER KICKS)
    const sneakerGroup = new TransformNode(`${idPrefix}-sneaker-${isLeft ? 'l' : 'r'}`, scene);
    sneakerGroup.position.set(0, -proportions.shinLength - 0.035, 0.04);
    sneakerGroup.scaling.setAll(proportions.shoeScale);
    sneakerGroup.parent = knee;

    // Thân giày bo tròn mập mạp
    const sneakerUpper = MeshBuilder.CreateSphere(`${idPrefix}-sneaker-up-${isLeft ? 'l' : 'r'}`, { diameter: 0.29, segments: 12 }, scene);
    sneakerUpper.scaling.set(0.80, 0.60, 1.12);
    sneakerUpper.position.y = -0.02;
    sneakerUpper.material = materials.sneakerBody;
    sneakerUpper.parent = sneakerGroup;

    // Mũi giày cao su tròn trắng
    const sneakerCap = MeshBuilder.CreateSphere(`${idPrefix}-sneaker-cap-${isLeft ? 'l' : 'r'}`, { diameter: 0.21, segments: 10 }, scene);
    sneakerCap.scaling.set(1.0, 0.8, 1.0);
    sneakerCap.position.set(0, -0.03, 0.10);
    sneakerCap.material = materials.sneakerSole;
    sneakerCap.parent = sneakerGroup;

    // Dải sọc thể thao trang trí hông giày
    const sneakerStripe = MeshBuilder.CreateBox(`${idPrefix}-sneaker-str-${isLeft ? 'l' : 'r'}`, {
      width: 0.22,
      height: 0.04,
      depth: 0.16,
    }, scene);
    sneakerStripe.position.set(0, -0.01, -0.02);
    sneakerStripe.material = materials.sneakerAccent;
    sneakerStripe.parent = sneakerGroup;

    // Đế cao su bánh mì kép dày dặn màu trắng sứ (Chunky Platform Sole)
    const sneakerPlatform = MeshBuilder.CreateSphere(`${idPrefix}-sneaker-sol-${isLeft ? 'l' : 'r'}`, { diameter: 0.30, segments: 12 }, scene);
    sneakerPlatform.scaling.set(0.85, 0.27, 1.1);
    sneakerPlatform.position.y = -0.12;
    sneakerPlatform.material = materials.sneakerSole;
    sneakerPlatform.parent = sneakerGroup;

    const sneakerLaces = [];
    [-0.03, 0.01, 0.05].forEach((lz, idx) => {
      const lace = MeshBuilder.CreateBox(`${idPrefix}-snk-lace-${isLeft ? 'l' : 'r'}-${idx}`, { width: 0.14, height: 0.018, depth: 0.024 }, scene);
      lace.position.set(0, 0.03 + idx * 0.015, 0.04 + lz);
      lace.rotation.x = -0.35;
      lace.material = materials.sneakerSole;
      lace.parent = sneakerGroup;
      sneakerLaces.push(lace);
    });
    const heelTab = MeshBuilder.CreateBox(`${idPrefix}-snk-tab-${isLeft ? 'l' : 'r'}`, { width: 0.032, height: 0.06, depth: 0.02 }, scene);
    heelTab.position.set(0, 0.05, -0.14);
    heelTab.material = materials.sneakerAccent;
    heelTab.parent = sneakerGroup;

    // Vành đệm mút cổ giày sneaker chunky Play Together (Padded Collar Rim)
    const sneakerAnkleRim = MeshBuilder.CreateTorus(`${idPrefix}-snk-rim-${isLeft ? 'l' : 'r'}`, {
      diameter: 0.17,
      thickness: 0.032,
      tessellation: 16,
    }, scene);
    sneakerAnkleRim.position.set(0, 0.045, -0.01);
    sneakerAnkleRim.material = materials.sneakerAccent;
    sneakerAnkleRim.parent = sneakerGroup;

    // Alternate silhouettes share the same ankle anchor and remain disabled
    // until selected by the fashion configuration.
    const bootCuff = MeshBuilder.CreateTorus(`${idPrefix}-boot-cuff-${isLeft ? 'l' : 'r'}`, { diameter: 0.19, thickness: 0.042, tessellation: 14 }, scene);
    bootCuff.position.y = 0.08;
    bootCuff.material = materials.shoeBoot;
    bootCuff.parent = sneakerGroup;
    const bootToe = MeshBuilder.CreateSphere(`${idPrefix}-boot-toe-${isLeft ? 'l' : 'r'}`, { diameter: 0.30, segments: 12 }, scene);
    bootToe.scaling.set(0.86, 0.78, 1.16);
    bootToe.position.set(0, -0.02, 0.02);
    bootToe.material = materials.shoeBoot;
    bootToe.parent = sneakerGroup;
    const bootTongue = MeshBuilder.CreateBox(`${idPrefix}-boot-tongue-${isLeft ? 'l' : 'r'}`, { width: 0.12, height: 0.14, depth: 0.04 }, scene);
    bootTongue.position.set(0, 0.04, 0.06);
    bootTongue.rotation.x = -0.25;
    bootTongue.material = materials.shoeBoot;
    bootTongue.parent = sneakerGroup;
    const bootSole = MeshBuilder.CreateSphere(`${idPrefix}-boot-sole-${isLeft ? 'l' : 'r'}`, { diameter: 0.32, segments: 10 }, scene);
    bootSole.scaling.set(0.88, 0.23, 1.12);
    bootSole.position.y = -0.13;
    bootSole.material = materials.sneakerSole;
    bootSole.parent = sneakerGroup;

    const runnerBand = MeshBuilder.CreateBox(`${idPrefix}-runner-band-${isLeft ? 'l' : 'r'}`, { width: 0.24, height: 0.045, depth: 0.18 }, scene);
    runnerBand.position.set(0, 0.04, 0.02);
    runnerBand.material = materials.shoeNeon;
    runnerBand.parent = sneakerGroup;
    const runnerHeel = MeshBuilder.CreateSphere(`${idPrefix}-runner-heel-${isLeft ? 'l' : 'r'}`, { diameter: 0.13, segments: 8 }, scene);
    runnerHeel.scaling.set(0.8, 0.9, 0.45);
    runnerHeel.position.set(0, -0.01, -0.13);
    runnerHeel.material = materials.shoeNeon;
    runnerHeel.parent = sneakerGroup;

    const slideSole = MeshBuilder.CreateSphere(`${idPrefix}-slide-sole-${isLeft ? 'l' : 'r'}`, { diameter: 0.30, segments: 10 }, scene);
    slideSole.scaling.set(0.90, 0.20, 1.12);
    slideSole.position.y = -0.11;
    slideSole.material = materials.sneakerSole;
    slideSole.parent = sneakerGroup;
    const slideStrap = MeshBuilder.CreateSphere(`${idPrefix}-slide-strap-${isLeft ? 'l' : 'r'}`, { diameter: 0.23, segments: 10 }, scene);
    slideStrap.scaling.set(0.88, 0.28, 0.40);
    slideStrap.position.set(0, -0.01, 0.02);
    slideStrap.material = materials.sneakerBody;
    slideStrap.parent = sneakerGroup;
    const slideFoot = MeshBuilder.CreateSphere(`${idPrefix}-slide-foot-${isLeft ? 'l' : 'r'}`, {diameter: 0.25, segments: 10}, scene);
    slideFoot.parent = sneakerGroup;
    slideFoot.scaling.set(0.77, 0.42, 1.03);
    slideFoot.position.set(0, -0.035, 0.02);
    slideFoot.material = materials.skin;

    const flatSole = MeshBuilder.CreateSphere(`${idPrefix}-flat-sole-${isLeft ? 'l' : 'r'}`, { diameter: 0.29, segments: 10 }, scene);
    flatSole.scaling.set(0.88, 0.18, 1.08);
    flatSole.position.y = -0.11;
    flatSole.material = materials.shoeBoot;
    flatSole.parent = sneakerGroup;
    const flatStrap = MeshBuilder.CreateBox(`${idPrefix}-flat-strap-${isLeft ? 'l' : 'r'}`, { width: 0.22, height: 0.045, depth: 0.035 }, scene);
    flatStrap.position.set(0, 0.02, 0.06);
    flatStrap.material = materials.sneakerAccent;
    flatStrap.parent = sneakerGroup;
    const flatUpper = MeshBuilder.CreateSphere(`${idPrefix}-flat-upper-${isLeft ? 'l' : 'r'}`, {diameter: 0.27, segments: 10}, scene);
    flatUpper.parent = sneakerGroup;
    flatUpper.scaling.set(0.82, 0.48, 1.08);
    flatUpper.position.set(0, -0.03, 0.015);
    flatUpper.material = materials.sneakerBody;
    const flatBow = MeshBuilder.CreateSphere(`${idPrefix}-flat-bow-${isLeft ? 'l' : 'r'}`, { diameter: 0.055, segments: 8 }, scene);
    flatBow.scaling.set(1.4, 0.6, 0.4);
    flatBow.position.set(0, 0.03, 0.11);
    flatBow.material = materials.tieRed;
    flatBow.parent = sneakerGroup;

    const variants = [bootCuff, bootToe, bootTongue, bootSole, runnerBand, runnerHeel, slideSole, slideStrap, slideFoot, flatSole, flatStrap, flatUpper, flatBow, ...sneakerLaces, heelTab, sneakerAnkleRim];
    variants.forEach(mesh => mesh.setEnabled(false));
    shoeOutfitParts.push({
      base: [sneakerUpper, sneakerCap, sneakerStripe, sneakerPlatform, ...sneakerLaces, heelTab, sneakerAnkleRim],
      boots: [bootCuff, bootToe, bootTongue, bootSole],
      runner: [runnerBand, runnerHeel],
      slides: [slideSole, slideStrap, slideFoot],
      flats: [flatSole, flatStrap, flatUpper, flatBow],
    });

    return legRoot;
  }

  const leftLeg = createLeg(true);
  const rightLeg = createLeg(false);
  const animatedJoints = [leftArm, rightArm, leftLeg, rightLeg, ...armJoints, ...legJoints];
  const previousRotations = animatedJoints.map(() => new Vector3());

  let activeBodyProfile = BODY_PROFILES[appearance.gender] || BODY_PROFILES.neutral;
  let activeSkinTone = appearance.skinTone;
  let activeLod = 0;
  let activeHairStyle = 'classic';
  let activeEarType = 'human';
  let activeTopStyle = 'starter';
  let activeBottomStyle = 'shorts_denim';
  let activeShoeStyle = 'sneaker_chunky';

  function setBodyProfile(gender = 'neutral') {
    activeBodyProfile = BODY_PROFILES[gender] || BODY_PROFILES.neutral;
    headNode.scaling.setAll(proportions.headScale * activeBodyProfile.head);
    torsoNode.scaling.set(activeBodyProfile.torsoX, activeBodyProfile.torsoY, activeBodyProfile.torsoZ);
    leftArm.scaling.setAll(activeBodyProfile.limb);
    rightArm.scaling.setAll(activeBodyProfile.limb);
    leftArm.position.x = activeBodyProfile.shoulder;
    rightArm.position.x = -activeBodyProfile.shoulder;
    leftLeg.scaling.setAll(activeBodyProfile.limb);
    rightLeg.scaling.setAll(activeBodyProfile.limb);
    shortsSeat.scaling.x = activeBodyProfile.hip;
    pleatedSkirt.scaling.x = activeBodyProfile.hip;
    root.metadata = { ...(root.metadata || {}), characterGender: gender };
  }

  function setMaterialColor(material, color, ambientScale = 0.24) {
    const safe = safeCharacterHex(color, '#f1f5f9');
    material.diffuseColor = Color3.FromHexString(safe);
    material.ambientColor = material.diffuseColor.scale(ambientScale);
    material.emissiveColor = Color3.Black();
  }

  function applyOutfit(id, color) {
    if (color) {
      setMaterialColor(materials.shirt, color);
    }
    const farmer = id === 'farmer';
    teeHem.setEnabled(false);
    const shortsColors = { starter: '#4778b6', farmer: '#2563eb', rose: '#ad6d8d', lake: '#395e98', royal: '#63528b' };
    setMaterialColor(materials.overalls, shortsColors[id] || shortsColors.starter);
    overallDetails.forEach(mesh => mesh.setEnabled(farmer));
    hoodieDetails.forEach(mesh => mesh.setEnabled(farmer));
    longSleeves.forEach(mesh => mesh.setEnabled(farmer));
    shoulderSurfaces.forEach(mesh => {
      mesh.metadata.sleeveLength = farmer ? 0.63 : 0.24;
      mesh.metadata.radius = 0.098;
      mesh.material = materials.shirt;
    });
    backpackNode.setEnabled(farmer);
    sproutNode.setEnabled(farmer);
    legOutfitParts.forEach(({ pantLeg, calf, shinPants, kneeSurface, longPants, kneeSock, sockCuff, ankleSockCuff }) => {
      shinPants.setEnabled(false);
      longPants.setEnabled(farmer);
      kneeSurface.setEnabled(false);
      pantLeg.setEnabled(!farmer);
      pantLeg.scaling.y = farmer ? 1 : 0.65;
      pantLeg.position.y = farmer ? -0.14 : -0.10;
      calf.setEnabled(false);
      kneeSock?.setEnabled(false);
      sockCuff?.setEnabled(false);
      ankleSockCuff?.setEnabled(!farmer);
    });
    hatNode.setEnabled(farmer);
    catEarsNode.setEnabled(id === 'cat' || id === 'party');
    activeTopStyle = farmer ? 'farmer' : 'starter';
    activeBottomStyle = farmer ? 'farmer' : 'shorts_denim';
    activeShoeStyle = 'sneaker_chunky';
    Object.values(topVariants).forEach(node => node.setEnabled(false));
    cargoDetailsNode.setEnabled(false);
    joggerDetailsNode.setEnabled(false);
    shoeOutfitParts.forEach(({ base, boots, runner, slides, flats }) => {
      base.forEach(mesh => mesh.setEnabled(true));
      [...boots, ...runner, ...slides, ...flats].forEach(mesh => mesh.setEnabled(false));
    });
  }

  function updateHairGlintColor(color) {
    const hairCol = Color3.FromHexString(safeCharacterHex(color || hairColor, '#76503b'));
    const glint = hairCol.scale(1.45).add(new Color3(0.24, 0.22, 0.20));
    materials.hairGlint.diffuseColor = glint;
    materials.hairGlint.ambientColor = glint.scale(0.35);
    materials.hairGlint.emissiveColor = glint.scale(0.25);
  }

  function setHair(style = 'classic', color = null) {
    const resolvedStyle = HAIR_STYLE_ALIASES[style] || style;
    activeHairStyle = resolvedStyle;
    if (color) {
      setMaterialColor(materials.hair, color);
      setMaterialColor(fringeMaterial, color);
      updateHairGlintColor(color);
    }
    const showHairDetails = activeLod < 2;
    hairGlintRing.setEnabled(false);
    hairGlintDashes.forEach(dash => dash.setEnabled(showHairDetails));
    quiffNode.setEnabled(showHairDetails && (resolvedStyle === 'classic' || resolvedStyle === 'anime_bangs'));
    fringe.setEnabled(activeLod < 1);
    twintailsNode.setEnabled(showHairDetails && resolvedStyle === 'twintails');
    bobNode.setEnabled(showHairDetails && resolvedStyle === 'bob');
    wavyNode.setEnabled(showHairDetails && resolvedStyle === 'wavy');
    slickNode.setEnabled(showHairDetails && resolvedStyle === 'slick');
    ponytailNode.setEnabled(resolvedStyle === 'ponytail');
    celestialNode.setEnabled(showHairDetails && resolvedStyle === 'celestial_flow');
    sproutNode.setEnabled(showHairDetails && (resolvedStyle === 'anime_bangs' || resolvedStyle === 'classic_sprout'));
    root.metadata = { ...(root.metadata || {}), hairStyle: style };
  }
  updateHairGlintColor(hairColor);

  function setEars(earType = 'human') {
    const resolvedType = EAR_ALIASES[earType] || earType;
    activeEarType = resolvedType;
    const showEarDetails = activeLod < 2;
    catEarsNode.setEnabled(showEarDetails && resolvedType === 'cat');
    rabbitEarsNode.setEnabled(showEarDetails && resolvedType === 'rabbit');
    bearEarsNode.setEnabled(showEarDetails && resolvedType === 'bear');
    elfEarsNode.setEnabled(showEarDetails && resolvedType === 'elf');
    shibaEarsNode.setEnabled(showEarDetails && resolvedType === 'shiba');
    duckBeakNode.setEnabled(showEarDetails && resolvedType === 'duck');
    haloNode.setEnabled(showEarDetails && (resolvedType === 'halo'));
    angelWingsNode.setEnabled(showEarDetails && (resolvedType === 'halo' || resolvedType === 'angel_wings'));
    duckFloatieNode.setEnabled(showEarDetails && resolvedType === 'duck_floatie');
    frogBackpackNode.setEnabled(showEarDetails && resolvedType === 'frog_backpack');
    catHeadphonesNode.setEnabled(showEarDetails && resolvedType === 'cat_headphones');
    roundGlassesNode.setEnabled(showEarDetails && resolvedType === 'round_glasses');
    foxTailNode.setEnabled(showEarDetails && resolvedType === 'fox_tail');
    devilHornsNode.setEnabled(showEarDetails && resolvedType === 'devil_horns');
    toastMouthNode.setEnabled(showEarDetails && resolvedType === 'toast_mouth');
    lollipopSweetNode.setEnabled(showEarDetails && resolvedType === 'lollipop_sweet');
    steampunkGogglesNode.setEnabled(showEarDetails && resolvedType === 'steampunk_goggles');
    royalCrownNode.setEnabled(showEarDetails && (resolvedType === 'crown_royal' || resolvedType === 'tiara_princess'));
    floatingStarsNode.setEnabled(showEarDetails && resolvedType === 'aura_stars');
    royalCapeNode.setEnabled(showEarDetails && (resolvedType === 'cape_royal' || resolvedType === 'cape_vampire'));
    faerieWingsNode.setEnabled(showEarDetails && resolvedType === 'wings_faerie');
    batWingsNode.setEnabled(showEarDetails && resolvedType === 'wings_bat');
    nonLaNode.setEnabled(showEarDetails && resolvedType === 'non_la');
    khanDongNode.setEnabled(showEarDetails && resolvedType === 'khan_dong');
    kpopBeretNode.setEnabled(showEarDetails && resolvedType === 'kpop_beret');
    kpopMicNode.setEnabled(showEarDetails && resolvedType === 'kpop_mic');
    const showHuman = resolvedType !== 'elf';
    humanEars.forEach(m => m.setEnabled(showHuman));
    root.metadata = { ...(root.metadata || {}), ears: earType };
  }

  function setTop(topId = 'starter', color = null) {
    const resolvedTop = TOP_ALIASES[topId] || topId;
    activeTopStyle = resolvedTop;
    if (color) {
      setMaterialColor(materials.shirt, color);
      setMaterialColor(materials.topDark, color);
      setMaterialColor(materials.knit, color);
      setMaterialColor(materials.vestNavy, color);
      setMaterialColor(materials.kimonoPink, color);
      setMaterialColor(materials.aodaiSilk, color);
      setMaterialColor(materials.blazerLapel, color);
    }
    const isHoodie = resolvedTop === 'hoodie_pastel' || resolvedTop === 'hoodie_oversized' || resolvedTop === 'farmer';
    hoodieDetails.forEach(m => m.setEnabled(isHoodie && resolvedTop !== 'hoodie_oversized'));
    const isLongSleeve = isHoodie || resolvedTop === 'bomber' || resolvedTop === 'knit' || resolvedTop === 'vest' || resolvedTop === 'techwear' || resolvedTop === 'prince' || resolvedTop === 'vampire' || resolvedTop === 'kimono' || resolvedTop === 'aodai_nu' || resolvedTop === 'aodai_nam' || resolvedTop === 'blazer_luxury' || resolvedTop === 'kpop_streetwear';
    const isAodai = resolvedTop === 'aodai_nam' || resolvedTop === 'aodai_nu';
    const sleeveMaterial = resolvedTop === 'bomber' ? materials.topDark : (resolvedTop === 'vest' || resolvedTop === 'blazer_luxury') ? materials.vestNavy : (resolvedTop === 'techwear' || resolvedTop === 'kpop_streetwear') ? materials.cyberDark : resolvedTop === 'prince' ? materials.vestWhite : isAodai ? materials.shirt : resolvedTop === 'vampire' ? materials.royalRed : (resolvedTop === 'kimono') ? materials.shirt : resolvedTop === 'knit' ? materials.knit : materials.shirt;
    const isBareShoulders = resolvedTop === 'tank' || resolvedTop === 'corset_ballgown';
    [...longSleeves, ...shortSleeves].forEach(mesh => { mesh.material = sleeveMaterial; });
    wristCuffs.forEach(mesh => { mesh.material = isAodai ? materials.aodaiGoldTrim : sleeveMaterial; });
    shoulderSurfaces.forEach(mesh => { mesh.material = isBareShoulders ? materials.skin : sleeveMaterial; });
    shoulderSurfaces.forEach(mesh => {
      mesh.metadata.sleeveLength = isLongSleeve || isBareShoulders ? 0.63 : 0.24;
      mesh.metadata.radius = isBareShoulders ? 0.070 : 0.098;
    });
    shortSleeves.forEach(mesh => mesh.setEnabled(!isBareShoulders && !isLongSleeve));
    Object.entries(topVariants).forEach(([variant, node]) => {
      node.setEnabled(activeLod < 2 && variant === resolvedTop);
    });
    teeHem.setEnabled(false);
    if (resolvedTop === 'corset_ballgown') {
      shirtBody.setEnabled(false);
      collar.setEnabled(false);
    } else {
      shirtBody.setEnabled(true);
      collar.setEnabled(resolvedTop !== 'tank' && !isAodai && resolvedTop !== 'blazer_luxury');
      if (resolvedTop === 'croptop_summer') {
        shirtBody.scaling.set(1.0, 0.72 * (clothingScaled ? proportions.torsoHeightScale : 1), 1.0);
        shirtBody.position.y = 0.28 * (clothingScaled ? proportions.torsoHeightScale : 1);
      } else if (resolvedTop === 'hoodie_oversized') {
        shirtBody.scaling.set(1.08, 1.03 * (clothingScaled ? proportions.torsoHeightScale : 1), 1.08);
        shirtBody.position.y = 0.22 * (clothingScaled ? proportions.torsoHeightScale : 1);
      } else {
        shirtBody.scaling.set(1.0, clothingScaled ? proportions.torsoHeightScale : 1, 1.0);
        shirtBody.position.y = 0.22 * (clothingScaled ? proportions.torsoHeightScale : 1);
      }
    }
    root.metadata = { ...(root.metadata || {}), topId };
  }

  function setBottom(bottomId = 'shorts_denim', color = null) {
    const resolvedBottom = BOTTOM_ALIASES[bottomId] || bottomId;
    activeBottomStyle = resolvedBottom;
    const isOveralls = resolvedBottom === 'overalls_blue' || resolvedBottom === 'farmer';
    const isBallgown = resolvedBottom === 'ballgown_princess';
    const isSkirt = resolvedBottom === 'skirt_pleated' || isBallgown;
    const isLongPants = resolvedBottom === 'cargo_pants' || resolvedBottom === 'joggers_cozy' || resolvedBottom === 'aodai_silk';
    if (color) {
      setMaterialColor(materials.overalls, color);
      setMaterialColor(materials.skirt, color);
      setMaterialColor(materials.bottomPocket, color);
      setMaterialColor(materials.aodaiPantsMat, color);
    }
    overallDetails.forEach(m => m.setEnabled(isOveralls));
    pleatedSkirt.setEnabled(isSkirt && !isBallgown);
    ballgownSkirt.setEnabled(isBallgown);
    cargoDetailsNode.setEnabled(activeLod < 2 && resolvedBottom === 'cargo_pants');
    joggerDetailsNode.setEnabled(activeLod < 2 && resolvedBottom === 'joggers_cozy');
    shortsSeat.setEnabled(!isSkirt && !isBallgown);
    legOutfitParts.forEach(({ pantLeg, calf, shinPants, kneeSurface, longPants, kneeSock, sockCuff, ankleSockCuff }) => {
      shinPants.setEnabled(false);
      longPants.setEnabled(!isBallgown && (isLongPants || isOveralls));
      longPants.material = (resolvedBottom === 'aodai_silk') ? materials.aodaiPantsMat : materials.overalls;
      kneeSurface.setEnabled(false);
      if (isBallgown) {
        pantLeg.setEnabled(false);
        calf.setEnabled(false);
        kneeSock?.setEnabled(false);
        sockCuff?.setEnabled(false);
        ankleSockCuff?.setEnabled(false);
      } else if (isSkirt) {
        pantLeg.setEnabled(false);
        calf.setEnabled(false);
        kneeSock?.setEnabled(true);
        sockCuff?.setEnabled(true);
        ankleSockCuff?.setEnabled(false);
      } else if (isLongPants || isOveralls) {
        pantLeg.setEnabled(false);
        pantLeg.scaling.y = 1.9;
        pantLeg.position.y = -0.20;
        calf.setEnabled(false);
        kneeSock?.setEnabled(false);
        sockCuff?.setEnabled(false);
        ankleSockCuff?.setEnabled(false);
      } else {
        pantLeg.setEnabled(true);
        pantLeg.scaling.y = 0.75;
        pantLeg.position.y = -0.10;
        calf.setEnabled(false);
        kneeSock?.setEnabled(false);
        sockCuff?.setEnabled(false);
        ankleSockCuff?.setEnabled(true);
      }
    });
    root.metadata = { ...(root.metadata || {}), bottomId };
  }

  function setShoes(shoeId = 'sneaker_chunky', color = null) {
    const resolvedShoe = SHOE_ALIASES[shoeId] || shoeId;
    activeShoeStyle = resolvedShoe;
    if (color) {
      setMaterialColor(materials.sneakerBody, color, 0.44);
      setMaterialColor(materials.shoeBoot, color);
    }
    if (resolvedShoe === 'runner_neon') {
      setMaterialColor(materials.sneakerAccent, '#22c55e', 0.3);
    } else if (resolvedShoe === 'boots_vintage') {
      setMaterialColor(materials.sneakerAccent, '#78350f', 0.3);
    } else {
      setMaterialColor(materials.sneakerAccent, '#3b82f6', 0.3);
    }
    const isBoot = resolvedShoe === 'boots_vintage';
    const isSlides = resolvedShoe === 'slides';
    const isFlats = resolvedShoe === 'flats';
    shoeOutfitParts.forEach(({ base, boots, runner, slides, flats }) => {
      base.forEach(mesh => mesh.setEnabled(activeLod === 2 || (!isBoot && !isSlides && !isFlats)));
      boots.forEach(mesh => mesh.setEnabled(activeLod < 2 && isBoot));
      runner.forEach(mesh => mesh.setEnabled(activeLod < 2 && resolvedShoe === 'runner_neon'));
      slides.forEach(mesh => mesh.setEnabled(activeLod < 2 && isSlides));
      flats.forEach(mesh => mesh.setEnabled(activeLod < 2 && isFlats));
    });
    root.metadata = { ...(root.metadata || {}), shoeId };
  }

  function setGender(gender = 'neutral') {
    setBodyProfile(gender);
  }

  function setSkinTone(value = 'peach') {
    const tone = getSkinTone(typeof value === 'string' ? value : value?.skinTone);
    const color = typeof value === 'object' ? value.skinColor || tone.hex : tone.hex;
    setMaterialColor(materials.skin, color, CHARACTER_RENDER_CONFIG.material.skinAmbient);
    materials.skin.emissiveColor = materials.skin.diffuseColor.scale(CHARACTER_RENDER_CONFIG.material.skinEmissive);
    activeSkinTone = tone.id;
    root.metadata = { ...(root.metadata || {}), skinTone: tone.id };
  }

  function setFaceFeatures(features) {
    faceSystem.updateFeatures(features);
  }

  function applyCustomization(custom) {
    if (!custom) return;
    if (Object.prototype.hasOwnProperty.call(custom, 'gender')) setGender(custom.gender);
    if (Object.prototype.hasOwnProperty.call(custom, 'skinTone') || Object.prototype.hasOwnProperty.call(custom, 'skinColor')) {
      setSkinTone(custom);
    }
    const hair = custom.hairStyle || custom.hair;
    if (hair || custom.hairColor) setHair(hair, custom.hairColor);
    const top = custom.topId || custom.topStyle || custom.top;
    if (top || custom.topColor) setTop(top, custom.topColor);
    const bottom = custom.bottomId || custom.bottomStyle || custom.bottom;
    if (bottom || custom.bottomColor) setBottom(bottom, custom.bottomColor);
    const shoe = custom.shoeId || custom.shoeStyle || custom.shoe || custom.shoes;
    if (shoe || custom.shoeColor) setShoes(shoe, custom.shoeColor);
    const ears = custom.ears || custom.earType;
    if (ears) setEars(ears);
    if (custom.eyeType || custom.eyeColor || custom.noseType || custom.mouthType || custom.blushType) {
      setFaceFeatures({
        eyeType: custom.eyeType,
        eyeColor: custom.eyeColor,
        noseType: custom.noseType,
        mouthType: custom.mouthType,
        blushType: custom.blushType,
      });
    }
  }

  setGender(appearance.gender);
  setSkinTone(appearance);
  if (options.customization) {
    applyCustomization(options.customization);
  } else {
    applyOutfit(outfitId, outfitColor);
  }
  root.metadata = {
    ...(root.metadata || {}),
    characterLod: activeLod,
    characterGender: appearance.gender,
    skinTone: activeSkinTone,
    characterVersion: CHARACTER_RENDER_CONFIG.version,
    renderStyle: CHARACTER_RENDER_CONFIG.style,
    geometryBudget: CHARACTER_RENDER_CONFIG.geometryBudget,
  };

  // Stretch clothing only: head and articulated limbs keep their own anchors.
  const bodyAnchors = new Set([headNode, leftArm, rightArm, leftLeg, rightLeg]);
  torsoNode.getChildren().forEach(node => {
    if (bodyAnchors.has(node) || node.metadata?.articulatedSurface) return;
    node.position.y *= proportions.torsoHeightScale;
    node.scaling.y *= proportions.torsoHeightScale;
  });
  clothingScaled = true;
  const neck = MeshBuilder.CreateCylinder(`${idPrefix}-neck`, { height: 0.09, diameter: 0.13, tessellation: 16 }, scene);
  neck.parent = torsoNode;
  neck.position.y = 0.51;
  neck.material = materials.skin;

  if (options.fixedAppearance) {
    // Decorative citizens never change outfits. Keeping the entire hidden
    // wardrobe for each one multiplies geometry and material memory on iOS.
    for (const mesh of root.getChildMeshes()) {
      if (!mesh.isEnabled()) mesh.dispose(false, false);
    }
    const usedMaterials = new Set(scene.meshes.map(mesh => mesh.material));
    for (const material of Object.values(materials)) {
      if (!usedMaterials.has(material)) material.dispose(false, false);
    }
    root.metadata.fixedAppearance = true;
  }

  // ========================================================
  // 6. CÔNG CỤ NÔNG TRẠI 3D (Handheld Tool Props)
  // ========================================================
  const toolMatWood = makeMat(scene, 'tool-mat-wood', '#78350f');
  const toolMatIron = makeMat(scene, 'tool-mat-iron', '#94a3b8');
  const toolMatCan = makeMat(scene, 'tool-mat-can', '#38bdf8', '#0284c7');
  const toolMatPouch = makeMat(scene, 'tool-mat-pouch', '#d97706');
  const toolMatBasket = makeMat(scene, 'tool-mat-basket', '#b45309');
  const toolMatRod = makeMat(scene, 'tool-mat-fishing-rod', '#8b5a2b');
  const toolMatRodTip = makeMat(scene, 'tool-mat-fishing-rod-tip', '#38bdf8', '#0284c7');

  const toolsNode = new TransformNode(`${idPrefix}-tools-root`, scene);
  toolsNode.parent = armJoints[1];
  toolsNode.position.set(0, -proportions.forearmLength - 0.03, 0.06);

  // Cuốc (Hoe)
  const hoeNode = new TransformNode(`${idPrefix}-tool-hoe`, scene);
  hoeNode.parent = toolsNode;
  const hoeHandle = MeshBuilder.CreateCylinder(`${idPrefix}-hoe-handle`, { height: 0.85, diameter: 0.045 }, scene);
  hoeHandle.position.set(0, -0.15, 0.15);
  hoeHandle.rotation.x = Math.PI / 4;
  hoeHandle.material = toolMatWood;
  hoeHandle.parent = hoeNode;

  const hoeBlade = MeshBuilder.CreateBox(`${idPrefix}-hoe-blade`, { width: 0.22, height: 0.04, depth: 0.18 }, scene);
  hoeBlade.position.set(0, 0.15, 0.45);
  hoeBlade.rotation.x = Math.PI / 2.5;
  hoeBlade.material = toolMatIron;
  hoeBlade.parent = hoeNode;
  hoeNode.setEnabled(false);

  // Bình tưới (Water Can)
  const waterCanNode = new TransformNode(`${idPrefix}-tool-watercan`, scene);
  waterCanNode.parent = toolsNode;
  const canBody = MeshBuilder.CreateCylinder(`${idPrefix}-can-body`, { height: 0.24, diameter: 0.22 }, scene);
  canBody.position.set(0, -0.05, 0.10);
  canBody.material = toolMatCan;
  canBody.parent = waterCanNode;

  const canSpout = MeshBuilder.CreateCylinder(`${idPrefix}-can-spout`, { height: 0.28, diameterTop: 0.04, diameterBottom: 0.07 }, scene);
  canSpout.position.set(0, 0.07, 0.22);
  canSpout.rotation.x = -Math.PI / 3.5;
  canSpout.material = toolMatCan;
  canSpout.parent = waterCanNode;
  waterCanNode.setEnabled(false);

  // Túi hạt giống (Seed Pouch)
  const seedBagNode = new TransformNode(`${idPrefix}-tool-seedbag`, scene);
  seedBagNode.parent = toolsNode;
  const seedPouch = MeshBuilder.CreateSphere(`${idPrefix}-pouch`, { diameterX: 0.22, diameterY: 0.26, diameterZ: 0.22, segments: 6 }, scene);
  seedPouch.position.set(0, -0.08, 0.06);
  seedPouch.material = toolMatPouch;
  seedPouch.parent = seedBagNode;
  seedBagNode.setEnabled(false);

  // Giỏ mây thu hoạch (Basket)
  const basketNode = new TransformNode(`${idPrefix}-tool-basket`, scene);
  basketNode.parent = toolsNode;
  const basket = MeshBuilder.CreateCylinder(`${idPrefix}-basket`, { height: 0.24, diameterTop: 0.34, diameterBottom: 0.22, tessellation: 8 }, scene);
  basket.position.set(0, -0.06, 0.10);
  basket.material = toolMatBasket;
  basket.parent = basketNode;
  basketNode.setEnabled(false);

  // Cần câu modular: giữ ở tay phải và tái sử dụng cho mọi loại cần config.
  const fishingRodNode = new TransformNode(`${idPrefix}-tool-fishing-rod`, scene);
  fishingRodNode.parent = toolsNode;
  fishingRodNode.position.set(0, -0.05, 0.05);
  fishingRodNode.rotation.x = 2.7;
  fishingRodNode.rotation.z = -0.08;
  const fishingRodGrip = MeshBuilder.CreateCylinder(`${idPrefix}-fishing-rod-grip`, {
    height: 0.28, diameterTop: 0.075, diameterBottom: 0.095, tessellation: 10,
  }, scene);
  fishingRodGrip.position.set(0, -0.20, 0.04);
  fishingRodGrip.material = toolMatRod;
  fishingRodGrip.parent = fishingRodNode;
  const fishingRodShaft = MeshBuilder.CreateCylinder(`${idPrefix}-fishing-rod-shaft`, {
    height: 1.45, diameterTop: 0.018, diameterBottom: 0.048, tessellation: 8,
  }, scene);
  fishingRodShaft.position.set(0, 0.58, 0.04);
  fishingRodShaft.rotation.z = -0.02;
  fishingRodShaft.material = toolMatRod;
  fishingRodShaft.parent = fishingRodNode;
  const fishingRodTip = MeshBuilder.CreateCylinder(`${idPrefix}-fishing-rod-tip`, {
    height: 0.16, diameterTop: 0.012, diameterBottom: 0.022, tessellation: 8,
  }, scene);
  fishingRodTip.position.set(0, 1.37, 0.04);
  fishingRodTip.material = toolMatRodTip;
  fishingRodTip.parent = fishingRodNode;
  const fishingLineOrigin = new TransformNode(`${idPrefix}-fishing-line-origin`, scene);
  fishingLineOrigin.parent = fishingRodNode;
  fishingLineOrigin.position.set(0, 1.45, 0.04);
  fishingRodNode.setEnabled(false);

  if (shadowGenerator) {
    [head, shirtBody, dungareesBib, packBody].forEach(m => shadowGenerator.addShadowCaster(m));
  }

  // Animation cycle & Action State Machine
  let animTimer = 0;
  const locomotionGait=createLocomotionGait();
  const previousTorsoRotation=new Vector3(),previousHeadRotation=new Vector3();
  let activeToolId = 'hand';
  let currentAction = null;
  let actionTime = 0;
  let actionDuration = 0.65;
  let onActionHit = null;
  let onActionEnd = null;
  let actionHitFired = false;
  let fishingAction = null;
  let fishingActionTime = 0;
  let fishingActionDuration = 0.9;
  let onFishingActionEnd = null;
  let fishingPose = false;
  let fishingCatchPose = false;

  function updateToolVisibility() {
    const effective = currentAction;
    hoeNode.setEnabled(effective === 'hoe' || effective === 'till');
    waterCanNode.setEnabled(effective === 'water');
    seedBagNode.setEnabled(effective === 'seed');
    basketNode.setEnabled(effective === 'harvest' || effective === 'celebrate');
    fishingRodNode.setEnabled(Boolean((fishingAction && fishingAction !== 'catch') || fishingPose));
  }

  function resetFishingPose() {
    rightArm.rotation.set(0, 0, 0);
    leftArm.rotation.set(0, 0, 0);
    torsoNode.rotation.set(0, 0, 0);
    torsoNode.position.y = 0.60;
    headNode.rotation.set(0, 0, 0);
  }

  function animateFishing(delta) {
    const elapsed = fishingAction ? fishingActionTime : animTimer;
    const progress = fishingAction ? Math.min(1, fishingActionTime / fishingActionDuration) : 1;
    const bob = Math.sin(elapsed * 2.6) * 0.025;
    torsoNode.position.y = 0.60 + bob;
    torsoNode.rotation.y = fishingPose ? -0.10 : 0;
    leftLeg.rotation.x *= 0.82;
    rightLeg.rotation.x *= 0.82;

    if (!fishingAction) {
      if (fishingCatchPose) {
        // Both palms converge below the fish in front of the chest.
        rightArm.rotation.x = -1.18;
        rightArm.rotation.y = 0.08;
        rightArm.rotation.z = 0.42;
        leftArm.rotation.x = -1.18;
        leftArm.rotation.y = -0.08;
        leftArm.rotation.z = -0.42;
        headNode.rotation.x = -0.12;
        return;
      }
      rightArm.rotation.x = -0.95;
      rightArm.rotation.y = 0.18;
      rightArm.rotation.z = -0.12;
      leftArm.rotation.x = -0.65;
      leftArm.rotation.y = -0.08;
      leftArm.rotation.z = 0.10;
      headNode.rotation.z = Math.sin(elapsed * 1.8) * 0.025;
      return;
    }

    if (fishingAction === 'cast') {
      if (progress < 0.38) {
        const wind = progress / 0.38;
        rightArm.rotation.x = -0.82 - wind * 1.0;
        rightArm.rotation.y = 0.18 + wind * 0.18;
        rightArm.rotation.z = -0.12 - wind * 0.12;
        leftArm.rotation.x = -0.55 - wind * 0.45;
        torsoNode.rotation.x = -wind * 0.08;
      } else {
        const release = (progress - 0.38) / 0.62;
        const ease = 1 - Math.pow(1 - release, 3);
        rightArm.rotation.x = -1.82 + ease * 1.25;
        rightArm.rotation.y = 0.36 - ease * 0.16;
        rightArm.rotation.z = -0.24 + ease * 0.14;
        leftArm.rotation.x = -1.0 + ease * 0.38;
        torsoNode.rotation.x = -0.08 + ease * 0.08;
      }
    } else if (fishingAction === 'reel') {
      const pump = Math.sin(progress * Math.PI * 3.2);
      rightArm.rotation.x = -1.12 - pump * 0.34;
      rightArm.rotation.y = 0.30 + pump * 0.08;
      rightArm.rotation.z = -0.20;
      leftArm.rotation.x = -0.92 - pump * 0.22;
      leftArm.rotation.y = -0.18;
      torsoNode.rotation.x = 0.05 + Math.abs(pump) * 0.05;
    } else if (fishingAction === 'catch') {
      const lift = 1 - Math.pow(1 - progress, 3);
      rightArm.rotation.x = -1.1 - lift * 0.08;
      rightArm.rotation.z = 0.2 + lift * 0.22;
      leftArm.rotation.x = -1.0 - lift * 0.18;
      leftArm.rotation.z = -0.2 - lift * 0.22;
      torsoNode.position.y = 0.60 + Math.sin(progress * Math.PI) * 0.08;
      headNode.rotation.x = -lift * 0.12;
    }
  }

  return {
    root,
    materials,
    torsoNode,
    headNode,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    hatNode,
    backpackNode,
    catEarsNode,
    sproutNode,
    faceSystem,
    joints: { elbows: armJoints, knees: legJoints },
    toolGrip: toolsNode,
    fishingLineOrigin,

    setOutfitColor(color) {
      setMaterialColor(materials.shirt, color);
    },
    setOutfit(id, color) {
      applyOutfit(id, color);
    },
    setHair,
    setEars,
    setTop,
    setBottom,
    setShoes,
    setGender,
    setSkinTone,
    setLOD(level = 0) {
      const nextLod = Math.max(0, Math.min(2, Math.round(Number(level) || 0)));
      if (activeLod === 2 && nextLod < 2) {
        detailVisibility.forEach((enabled, mesh) => mesh.setEnabled(enabled));
        detailVisibility.clear();
      }
      activeLod = nextLod;
      setHair(activeHairStyle);
      setEars(activeEarType);
      setTop(activeTopStyle);
      setBottom(activeBottomStyle);
      setShoes(activeShoeStyle);
      if (activeLod === 2) {
        root.getChildMeshes().forEach(mesh => {
          if (!/-(?:cord|button|polo-button|knit-rib|cuff|pant-cuff|tee-hem|thumb|sidelock|sneaker-str)/.test(mesh.name)) return;
          if (!detailVisibility.has(mesh)) detailVisibility.set(mesh, mesh.isEnabled(false));
          mesh.setEnabled(false);
        });
      }
      root.metadata = { ...(root.metadata || {}), characterLod: activeLod };
    },
    getAppearance() {
      return {
        gender: root.metadata?.characterGender || appearance.gender,
        skinTone: activeSkinTone,
        lod: activeLod,
        hairStyle: activeHairStyle,
        ears: activeEarType,
        topId: activeTopStyle,
        bottomId: activeBottomStyle,
        shoeId: activeShoeStyle,
        renderStyle: CHARACTER_RENDER_CONFIG.style,
      };
    },
    getRenderStats() {
      const meshes = root.getChildMeshes().filter(mesh => mesh.isEnabled());
      return { enabledMeshes: meshes.length, triangles: meshes.reduce((sum, mesh) => sum + mesh.getTotalIndices() / 3, 0), materials: new Set(meshes.map(mesh => mesh.material)).size, lod: activeLod };
    },
    setFaceFeatures,
    applyCustomization,
    setHatVisible(visible) {
      if (hatNode) hatNode.setEnabled(visible);
    },
    setCatEarsVisible(visible) {
      if (catEarsNode) catEarsNode.setEnabled(visible);
    },
    setExpression(expr) {
      faceSystem.setExpression(expr);
    },
    setActiveTool(toolId) {
      activeToolId = toolId;
      updateToolVisibility();
    },
    playAction(actionType, onHitCallback = null, onEndCallback = null) {
      fishingAction = null;
      fishingPose = false;
      currentAction = actionType;
      actionTime = 0;
      actionHitFired = false;
      onActionHit = onHitCallback;
      onActionEnd = onEndCallback;
      actionDuration = CHARACTER_ANIMATION_CONFIG.actionDurations[actionType]
        || CHARACTER_ANIMATION_CONFIG.actionDurations.default;

      if (actionType === 'harvest' || actionType === 'celebrate' || actionType === 'cheer') {
        faceSystem.setExpression('excited');
      } else if (actionType === 'wave' || actionType === 'fashion_pose') {
        faceSystem.setExpression('wink');
      } else if (actionType === 'heart_pose' || actionType === 'shy') {
        faceSystem.setExpression('shy');
      } else {
        faceSystem.setExpression('happy');
      }

      updateToolVisibility();
    },
    playFishingAction(actionType, onEndCallback = null, durationOverride = null) {
      currentAction = null;
      fishingCatchPose = false;
      fishingAction = actionType;
      fishingPose = false;
      fishingActionTime = 0;
      const fallbackDuration = actionType === 'cast' ? 0.95 : actionType === 'reel' ? 0.9 : 0.82;
      fishingActionDuration = Number.isFinite(durationOverride) && durationOverride > 0 ? durationOverride : fallbackDuration;
      onFishingActionEnd = onEndCallback;
      faceSystem.setExpression(actionType === 'catch' ? 'excited' : 'happy');
      updateToolVisibility();
    },
    setFishingPose(active = true) {
      currentAction = null;
      fishingAction = null;
      fishingPose = Boolean(active);
      fishingCatchPose = false;
      updateToolVisibility();
    },
    setFishingCatchPose() {
      currentAction = null;
      fishingAction = null;
      fishingPose = false;
      fishingCatchPose = true;
      updateToolVisibility();
    },
    clearFishingPose() {
      fishingAction = null;
      fishingPose = false;
      fishingCatchPose = false;
      onFishingActionEnd = null;
      resetFishingPose();
      updateToolVisibility();
    },
    isFishingBusy() {
      return Boolean(fishingAction || fishingPose);
    },
    isPerformingAction() {
      return Boolean(currentAction);
    },
    animate(delta, isMoving = false, speed = 1.0) {
      // Preserve existing action timing while lifting the hips for longer legs.
      delta = Math.min(0.1, Math.max(0, Number(delta) || 0));
      animatedJoints.forEach((joint, i) => previousRotations[i].copyFrom(joint.rotation));
      previousTorsoRotation.copyFrom(torsoNode.rotation);
      previousHeadRotation.copyFrom(headNode.rotation);
      const gait=locomotionGait.update(delta,isMoving&&!currentAction&&!fishingAction&&!fishingPose,speed);
      try {
      torsoNode.position.y = 0.60;
      torsoNode.position.x = 0;
      if (currentAction || fishingAction || fishingPose) {
        torsoNode.rotation.y = 0;
        headNode.rotation.y = 0;
      }
      animTimer += delta;
      ponytailNode.rotation.x = Math.sin(animTimer * (isMoving ? 8 : 2)) * (isMoving ? 0.12 : 0.025);
      armJoints.forEach((joint, i) => {
        joint.rotation.x = fishingAction || fishingPose ? -0.65 : currentAction ? -0.30 : gait.elbows[i];
      });
      legJoints.forEach((joint, i) => {
        joint.rotation.x = gait.knees[i];
      });

      // Cập nhật biểu cảm khuôn mặt
      faceSystem.update(delta);

      // Cọng mầm cây đung đưa trên đỉnh đầu
      sproutNode.rotation.z = Math.sin(animTimer * 4.5) * 0.18;

      // Hiệu ứng vòng hào quang thiên thần bay bổng & cánh vỗ & phao vịt lắc lư
      haloNode.position.y = 1.15 + Math.sin(animTimer * 3.5) * 0.035;
      angelWingsNode.rotation.y = Math.sin(animTimer * 5.0) * 0.14;
      duckFloatieNode.rotation.y = Math.sin(animTimer * 4.0) * 0.08;
      duckFloatieNode.rotation.z = Math.sin(animTimer * 2.5) * 0.04;

      if (fishingAction || fishingPose || fishingCatchPose) {
        if (fishingAction) fishingActionTime += delta;
        animateFishing(delta);
        if (fishingAction && fishingActionTime >= fishingActionDuration) {
          fishingAction = null;
          fishingPose = false;
          fishingRodNode.setEnabled(false);
          resetFishingPose();
          onFishingActionEnd?.();
          onFishingActionEnd = null;
          faceSystem.setExpression('happy');
          updateToolVisibility();
        }
        return;
      }

      // 1. Xử lý Action Animation chuyên biệt
      if (currentAction) {
        actionTime += delta;
        const p = Math.min(1.0, actionTime / actionDuration);

        if (currentAction === 'till' || currentAction === 'hoe') {
          if (p < 0.4) {
            const windUp = p / 0.4;
            rightArm.rotation.x = -0.5 - windUp * 1.6;
            rightArm.rotation.y = -0.2;
            leftArm.rotation.x = -0.3 - windUp * 1.3;
            torsoNode.position.y = 0.60 + windUp * 0.05;
            torsoNode.rotation.x = -windUp * 0.15;
          } else if (p < 0.7) {
            const strike = (p - 0.4) / 0.3;
            rightArm.rotation.x = -2.1 + strike * 3.1;
            leftArm.rotation.x = -1.6 + strike * 2.4;
            torsoNode.position.y = 0.65 - strike * 0.18;
            torsoNode.rotation.x = strike * 0.35;

            if (p >= 0.55 && !actionHitFired) {
              actionHitFired = true;
              onActionHit?.();
            }
          } else {
            const recover = (p - 0.7) / 0.3;
            rightArm.rotation.x = 1.0 - recover * 1.0;
            leftArm.rotation.x = 0.8 - recover * 0.8;
            torsoNode.position.y = 0.47 + recover * 0.13;
            torsoNode.rotation.x = 0.35 - recover * 0.35;
          }
        } else if (currentAction === 'water') {
          const tilt = Math.sin(p * Math.PI);
          rightArm.rotation.x = -0.85 * tilt;
          rightArm.rotation.z = -0.35 * tilt;
          rightArm.rotation.y = 0.25 * tilt;
          leftArm.rotation.x = -0.3 * tilt;
          torsoNode.rotation.x = 0.20 * tilt;

          if (p >= 0.3 && !actionHitFired) {
            actionHitFired = true;
            onActionHit?.();
          }
        } else if (currentAction === 'seed') {
          const sweep = Math.sin(p * Math.PI);
          rightArm.rotation.x = -0.6 * sweep;
          rightArm.rotation.y = -0.5 * sweep;
          rightArm.rotation.z = 0.4 * sweep;
          torsoNode.rotation.y = 0.2 * sweep;

          if (p >= 0.45 && !actionHitFired) {
            actionHitFired = true;
            onActionHit?.();
          }
        } else if (currentAction === 'harvest' || currentAction === 'celebrate') {
          if (p < 0.4) {
            const bend = p / 0.4;
            torsoNode.position.y = 0.60 - bend * 0.18;
            torsoNode.rotation.x = bend * 0.45;
            leftArm.rotation.x = bend * 0.7;
            rightArm.rotation.x = bend * 0.7;
            if (p >= 0.35 && !actionHitFired) {
              actionHitFired = true;
              onActionHit?.();
            }
          } else {
            const jump = (p - 0.4) / 0.6;
            torsoNode.position.y = 0.42 + Math.sin(jump * Math.PI) * 0.35;
            torsoNode.rotation.x = 0;
            leftArm.rotation.x = -2.5;
            leftArm.rotation.z = -0.35;
            rightArm.rotation.x = -2.5;
            rightArm.rotation.z = 0.35;
            headNode.rotation.x = -0.25;
          }
        } else if (currentAction === 'wave') {
          const wave = Math.sin(actionTime * 14);
          rightArm.rotation.x = -2.3;
          rightArm.rotation.z = -0.5 + wave * 0.4;
          headNode.rotation.z = wave * 0.08;
        } else if (currentAction === 'fashion_pose') {
          // Dáng người mẫu Idol Play Together: 1 tay chống hông, nghiêng đầu nhí nhảnh, nháy mắt
          const ease = Math.sin(p * Math.PI);
          rightArm.rotation.x = -0.35 * ease;
          rightArm.rotation.z = 0.85 * ease;
          rightArm.rotation.y = 0.5 * ease;
          leftArm.rotation.x = -0.35 * ease;
          leftArm.rotation.z = -0.5 * ease;
          torsoNode.rotation.y = 0.24 * ease;
          torsoNode.rotation.z = -0.09 * ease;
          headNode.rotation.z = 0.20 * ease;
          headNode.rotation.x = -0.08 * ease;
        } else if (currentAction === 'heart_pose') {
          // Bắn tim đôi tay chụm lại hình trái tim
          const ease = Math.sin(p * Math.PI);
          const bob = Math.sin(actionTime * 6) * 0.04 * ease;
          leftArm.rotation.x = -1.65 * ease;
          leftArm.rotation.z = 0.72 * ease;
          leftArm.rotation.y = -0.35 * ease;
          rightArm.rotation.x = -1.65 * ease;
          rightArm.rotation.z = -0.72 * ease;
          rightArm.rotation.y = 0.35 * ease;
          torsoNode.position.y = 0.60 + bob;
          headNode.rotation.x = 0.12 * ease;
          headNode.rotation.z = Math.sin(actionTime * 5) * 0.1 * ease;
        } else if (currentAction === 'cheer') {
          // Nhảy tưng bừng ăn mừng 2 tay giơ cao reo hò
          const hop = Math.max(0, Math.sin(actionTime * 9));
          torsoNode.position.y = 0.60 + hop * 0.30;
          leftArm.rotation.x = -2.6 + Math.sin(actionTime * 12) * 0.2;
          leftArm.rotation.z = -0.42;
          rightArm.rotation.x = -2.6 - Math.sin(actionTime * 12) * 0.2;
          rightArm.rotation.z = 0.42;
          headNode.rotation.x = -0.22;
          leftLeg.rotation.x = hop * -0.35;
          rightLeg.rotation.x = hop * 0.35;
        } else if (currentAction === 'shy') {
          // Dáng thẹn thùng giấu tay sau lưng, lắc lư e ấp
          const ease = Math.sin(p * Math.PI);
          const sway = Math.sin(actionTime * 6) * ease;
          leftArm.rotation.x = 0.45 * ease;
          leftArm.rotation.z = 0.32 * ease;
          rightArm.rotation.x = 0.45 * ease;
          rightArm.rotation.z = -0.32 * ease;
          torsoNode.rotation.y = sway * 0.16;
          torsoNode.rotation.z = sway * 0.06;
          headNode.rotation.x = 0.16 * ease;
          headNode.rotation.z = -sway * 0.14;
        } else if (currentAction === 'spin') {
          // Xoay 360 độ điệu nghệ trên sàn runway
          torsoNode.rotation.y = p * Math.PI * 2;
          leftArm.rotation.z = -0.65;
          rightArm.rotation.z = 0.65;
          leftArm.rotation.x = -0.25;
          rightArm.rotation.x = -0.25;
          torsoNode.position.y = 0.60 + Math.sin(p * Math.PI) * 0.14;
        }

        leftLeg.rotation.x *= 0.8;
        rightLeg.rotation.x *= 0.8;

        if (actionTime >= actionDuration) {
          currentAction = null;
          updateToolVisibility();
          faceSystem.setExpression('happy');
          rightArm.rotation.set(0, 0, 0);
          leftArm.rotation.set(0, 0, 0);
          torsoNode.position.y = 0.60;
          torsoNode.rotation.set(0, 0, 0);
          headNode.rotation.set(0, 0, 0);
          onActionEnd?.();
        }
        return;
      }

      // Grounded locomotion: opposing arms, swing-phase knees, restrained
      // weight transfer, and a distinct forward-leaning running pose.
      if (isMoving || gait.weight > .001) {
        const walkCycle = gait.phase;

        // Chân bước nhanh nhí nhảnh
        leftLeg.rotation.x = gait.hips[0];
        rightLeg.rotation.x = gait.hips[1];

        // Tay xòe nhẹ cân bằng nhí nhảnh kiểu Chibi Play Together
        leftArm.rotation.x = gait.arms[0];
        leftArm.rotation.z = -0.035 - gait.run*0.035;
        leftArm.rotation.y = 0;

        rightArm.rotation.x = gait.arms[1];
        rightArm.rotation.z = 0.035 + gait.run*0.035;
        rightArm.rotation.y = 0;

        // ĐẶC TRƯNG PLAY TOGETHER: BODY WADDLE ROLL (Lắc lư thân người sang 2 bên)
        torsoNode.rotation.z = gait.roll;
        torsoNode.rotation.y = gait.twist;
        headNode.rotation.z = -gait.roll*.65;
        headNode.rotation.y = -gait.twist*.6;

        // Hiệu ứng nhún đàn hồi Chibi (Squash & Stretch)
        torsoNode.position.y = 0.60 + gait.bob;
        torsoNode.position.x = gait.sway;
        torsoNode.scaling.set(activeBodyProfile.torsoX,activeBodyProfile.torsoY,activeBodyProfile.torsoZ);

        torsoNode.rotation.x = gait.lean;
        headNode.rotation.x = -gait.lean*.45;

        // Hair is rigidly attached to the head. Rotating the complete cap
        // independently made it intersect the scalp on every step.
        hairRoot.rotation.set(0, 0, 0);

        // Balo chú vịt vàng lắc lư vui vẻ theo nhịp chạy
        backpackNode.rotation.x = Math.sin(walkCycle * 2) * .055 * gait.weight;
        backpackNode.rotation.z = Math.sin(walkCycle) * .025 * gait.weight;

        // Đuôi cáo đung đưa sống động theo nhịp bước chân
        if (foxTailNode.isEnabled()) {
          foxTailNode.rotation.y = Math.sin(walkCycle * 1.6) * 0.38;
          foxTailNode.rotation.z = Math.cos(walkCycle * 1.6) * 0.18;
        }

        // Áo choàng hoàng gia phấp phới khi chạy
        if (royalCapeNode.isEnabled()) {
          royalCapeNode.rotation.x = 0.22 + Math.abs(Math.sin(walkCycle)) * 0.16;
          royalCapeNode.rotation.z = Math.sin(walkCycle) * 0.08;
        }

        // Tà áo dài hoàng triều thướt tha phấp phới tự nhiên khi di chuyển
        if (topVariants.aodai_nam?.isEnabled() && aodaiNamFrontFlapNode && aodaiNamBackFlapNode) {
          const flapFlutter = Math.sin(walkCycle) * 0.055;
          const runLift = (gait ? gait.run : 0) * 0.085;
          aodaiNamFrontFlapNode.rotation.x = -0.05 - runLift + flapFlutter;
          aodaiNamFrontFlapNode.rotation.z = Math.sin(walkCycle * 0.5) * 0.025;
          aodaiNamBackFlapNode.rotation.x = 0.05 + runLift - flapFlutter;
          aodaiNamBackFlapNode.rotation.z = -Math.sin(walkCycle * 0.5) * 0.025;
          if (aodaiNamPendantNode) {
            aodaiNamPendantNode.rotation.z = Math.sin(walkCycle * 1.5) * 0.16;
            aodaiNamPendantNode.rotation.x = Math.cos(walkCycle * 1.5) * 0.12;
          }
        }
        if (topVariants.aodai_nu?.isEnabled() && aodaiNuFrontFlapNode && aodaiNuBackFlapNode) {
          const flapFlutter = Math.sin(walkCycle) * 0.065;
          const runLift = (gait ? gait.run : 0) * 0.095;
          aodaiNuFrontFlapNode.rotation.x = -0.06 - runLift + flapFlutter;
          aodaiNuFrontFlapNode.rotation.z = Math.sin(walkCycle * 0.5) * 0.030;
          aodaiNuBackFlapNode.rotation.x = 0.06 + runLift - flapFlutter;
          aodaiNuBackFlapNode.rotation.z = -Math.sin(walkCycle * 0.5) * 0.030;
        }
        if (faerieWingsNode.isEnabled()) {
          faerieWingsNode.rotation.y = Math.sin(animTimer * 12) * 0.28;
        }
        if (batWingsNode.isEnabled()) {
          batWingsNode.rotation.y = Math.sin(animTimer * 8) * 0.22;
        }
        if (floatingStarsNode.isEnabled()) {
          floatingStarsNode.rotation.y += delta * 1.8;
          floatingStarsNode.position.y = 0.88 + Math.sin(animTimer * 2.5) * 0.04;
        }
      } else {
        // ĐỨNG THỞ IDLE DỊU DÀNG
        const idleCycle = animTimer * CHARACTER_ANIMATION_CONFIG.idleBreathSpeed;

        torsoNode.position.y = 0.60 + Math.sin(idleCycle) * 0.012;
        torsoNode.position.x = 0;
        torsoNode.scaling.set(activeBodyProfile.torsoX, activeBodyProfile.torsoY, activeBodyProfile.torsoZ);
        torsoNode.rotation.set(0, 0, 0);

        headNode.rotation.z = Math.sin(idleCycle * 0.5) * 0.035;
        headNode.rotation.x = 0;
        headNode.rotation.y = 0;
        hairRoot.rotation.set(0, 0, 0);
        backpackNode.rotation.set(0, 0, 0);

        if (foxTailNode.isEnabled()) {
          foxTailNode.rotation.y = Math.sin(idleCycle * 1.2) * 0.20;
          foxTailNode.rotation.z = Math.cos(idleCycle * 0.8) * 0.10;
        }
        if (royalCapeNode.isEnabled()) {
          royalCapeNode.rotation.x = 0.05 + Math.sin(idleCycle) * 0.03;
          royalCapeNode.rotation.z = 0;
        }

        // Tà áo dài và ngọc bội đung đưa êm dịu khi đứng thở
        if (topVariants.aodai_nam?.isEnabled() && aodaiNamFrontFlapNode && aodaiNamBackFlapNode) {
          const flapBreathe = Math.sin(idleCycle) * 0.018;
          aodaiNamFrontFlapNode.rotation.x = -0.05 + flapBreathe;
          aodaiNamFrontFlapNode.rotation.z = 0;
          aodaiNamBackFlapNode.rotation.x = 0.05 - flapBreathe;
          aodaiNamBackFlapNode.rotation.z = 0;
          if (aodaiNamPendantNode) {
            aodaiNamPendantNode.rotation.z = Math.sin(idleCycle * 0.8) * 0.04;
            aodaiNamPendantNode.rotation.x = 0;
          }
        }
        if (topVariants.aodai_nu?.isEnabled() && aodaiNuFrontFlapNode && aodaiNuBackFlapNode) {
          const flapBreathe = Math.sin(idleCycle) * 0.022;
          aodaiNuFrontFlapNode.rotation.x = -0.06 + flapBreathe;
          aodaiNuFrontFlapNode.rotation.z = 0;
          aodaiNuBackFlapNode.rotation.x = 0.06 - flapBreathe;
          aodaiNuBackFlapNode.rotation.z = 0;
        }
        if (faerieWingsNode.isEnabled()) {
          faerieWingsNode.rotation.y = Math.sin(animTimer * 6) * 0.18;
        }
        if (batWingsNode.isEnabled()) {
          batWingsNode.rotation.y = Math.sin(animTimer * 4) * 0.12;
        }
        if (floatingStarsNode.isEnabled()) {
          floatingStarsNode.rotation.y += delta * 1.8;
          floatingStarsNode.position.y = 0.88 + Math.sin(animTimer * 2.5) * 0.04;
        }

        leftLeg.rotation.x *= 0.85;
        rightLeg.rotation.x *= 0.85;

        leftArm.rotation.x *= 0.85;
        leftArm.rotation.z *= 0.85;
        leftArm.rotation.y = 0;

        rightArm.rotation.x *= 0.85;
        rightArm.rotation.z *= 0.85;
        rightArm.rotation.y = 0;
      }
      } finally {
        if (floatingStarsNode.isEnabled()) {
          floatingStarsNode.rotation.y += delta * 2.2;
        }
        torsoNode.position.y += proportions.hipHeight - 0.60;
        const blend = 1 - Math.exp(-delta / CHARACTER_ANIMATION_CONFIG.locomotionBlendSeconds);
        animatedJoints.forEach((joint, i) => Vector3.LerpToRef(previousRotations[i], joint.rotation, blend, joint.rotation));
        if (!currentAction && !fishingAction && !fishingPose && !fishingCatchPose) {
          Vector3.LerpToRef(previousTorsoRotation,torsoNode.rotation,blend,torsoNode.rotation);
          Vector3.LerpToRef(previousHeadRotation,headNode.rotation,blend,headNode.rotation);
          if (isMoving || gait.weight > .001) {
            // Use the actual blended angles, not the target gait: otherwise
            // slow joint blending leaves the character suspended above ground.
            const leftHip = leftLeg.rotation.x + torsoNode.rotation.x;
            const rightHip = rightLeg.rotation.x + torsoNode.rotation.x;
            const lowerLength = proportions.shinLength + .035;
            const leftReach = proportions.thighLength * Math.cos(leftHip)
              + lowerLength * Math.cos(leftHip + legJoints[0].rotation.x);
            const rightReach = proportions.thighLength * Math.cos(rightHip)
              + lowerLength * Math.cos(rightHip + legJoints[1].rotation.x);
            const standingReach = proportions.thighLength + lowerLength;
            torsoNode.position.y = proportions.hipHeight - Math.max(0, standingReach - Math.max(leftReach, rightReach));
          }
        }
        armSurfaces.forEach(surface => { if (surface.mesh.isEnabled()) surface.update(); });
      }
    },
  };
}
