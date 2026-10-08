import {Icon3dRedApple} from './icons3d/Inventory3DIcons.jsx';
import { FISHING_CONFIG } from '../../shared/fishingConfig.js';
import { fishForm } from '../../shared/fishAppearance.js';
import React from 'react';
import { getFashionItem, EYES_OPTIONS, EYE_COLORS, NOSE_OPTIONS, MOUTH_OPTIONS, BLUSH_OPTIONS } from '../../shared/fashionConfig.js';
import { Icon3dTabEars, Icon3dTabFace } from './icons3d/Fashion3DIcons.jsx';
import {
  Icon3dCarrot, Icon3dEgg, Icon3dMilk, Icon3dFlourBowl, Icon3dCheese, Icon3dJamJar,
  Icon3dTomato, Icon3dStrawberry, Icon3dFishingRodBamboo, Icon3dFishingRodPro,
  Icon3dBaitWorm, Icon3dBaitLure, Icon3dFishChum, Icon3dCoolerBox,
} from './icons3d/GameIcons3D.jsx';

const EXISTING = {
  apple: Icon3dRedApple,
  carrot: Icon3dCarrot, tomato: Icon3dTomato, strawberry: Icon3dStrawberry,
  egg: Icon3dEgg, milk: Icon3dMilk, flour: Icon3dFlourBowl,
  cheese: Icon3dCheese, jam: Icon3dJamJar, rod_bamboo: Icon3dFishingRodBamboo,
  rod_carbon: Icon3dFishingRodPro, bait_worm: Icon3dBaitWorm,
  bait_lure: Icon3dBaitLure, fish_chum: Icon3dFishChum, cooler_box: Icon3dCoolerBox,
};

const CROP_COLORS = {
  wheat: '#d7ab38', pumpkin: '#ec852b', melon: '#46a95f', turnip: '#d9b2d8',
  wool: '#f3eee2', maturePig: '#dc9b91', duckEgg: '#d9e7dd',
};

function CropArt({ id, size }) {
  const color = CROP_COLORS[id];
  return <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label={spec?.name||id}>
    {id === 'wheat' ? <g fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
      <path d="M39 68V13M27 67 51 30"/><path d="M39 22q-12-10-10-15 11 0 10 15Zm1 8q12-12 13-19-13 1-13 19Zm-1 10q-13-10-14-18 12 2 14 18Zm1 9q12-10 13-18-13 2-13 18Z" fill={color}/>
    </g> : id === 'pumpkin' ? <g><ellipse cx="40" cy="47" rx="29" ry="22" fill={color}/><ellipse cx="40" cy="47" rx="13" ry="22" fill="#f5a83c"/><path d="M40 27q-1-11 9-14" fill="none" stroke="#39874d" strokeWidth="6" strokeLinecap="round"/><path d="M38 29q-10-8-18-4" fill="none" stroke="#39874d" strokeWidth="4"/></g>
    : id === 'melon' ? <g><circle cx="40" cy="43" r="28" fill={color}/><path d="M15 43q25-14 50 0M25 20q15 23 0 46M55 20Q40 43 55 66" fill="none" stroke="#257b43" strokeWidth="5"/><path d="M39 15q-3-9 7-10" fill="none" stroke="#35784b" strokeWidth="5"/></g>
    : id === 'turnip' ? <g><path d="M19 31q21-14 42 0 1 20-21 35Q18 50 19 31Z" fill="#eee1ed" stroke="#b88fb7" strokeWidth="2"/><path d="M39 25Q20 17 23 8q14-2 16 17Zm3 0Q44 7 59 9q1 11-17 16Z" fill="#58a669"/></g>
    : id === 'wool' ? <g><path d="M20 52q-14-9-2-20-4-13 12-15 10-12 20-3 16-2 16 14 10 10 0 21-2 14-20 12H32q-12 4-12-9Z" fill={color} stroke="#b8aca6" strokeWidth="2"/><path d="M29 57v8m22-7v8" stroke="#9c8c81" strokeWidth="5" strokeLinecap="round"/></g>
    : id === 'duckEgg' ? <g><path d="M40 11C23 11 17 37 20 50c3 13 11 20 20 20s17-7 20-20C63 37 57 11 40 11Z" fill={color} stroke="#7fae9e" strokeWidth="2"/><path d="M27 38q1-17 12-20" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></g>
    : <g><ellipse cx="40" cy="43" rx="28" ry="19" fill={color}/><circle cx="25" cy="34" r="8" fill={color}/><path d="m17 30 1-10 9 5m19 17h4" fill="none" stroke="#b77970" strokeWidth="3" strokeLinecap="round"/><circle cx="21" cy="32" r="2" fill="#3c2c2c"/></g>}
  </svg>;
}

const FISH_SHAPES = {
  carp: { color: '#d99635', belly: '#f4c77c', body: 'M17 42Q35 20 62 40Q39 61 17 42Z', tail: 'M18 42 5 30v25Z' },
  perch: { color: '#64a24b', belly: '#b9cd84', body: 'M17 43Q34 23 62 40Q42 59 17 43Z', tail: 'M18 43 5 32v23Z' },
  golden_carp: { color: '#f2bb2a', belly: '#ffe59a', body: 'M17 42Q37 19 63 40Q38 63 17 42Z', tail: 'M18 42 4 27v30Z' },
  river_catfish: { color: '#687b80', belly: '#b6c0b7', body: 'M17 43Q43 25 67 42Q40 57 17 43Z', tail: 'M18 43 5 36v14Z' },
  river_barb: { color: '#80b8c2', belly: '#d0dfe0', body: 'M17 43Q38 23 63 42Q39 58 17 43Z', tail: 'M18 43 5 30v26Z' },
  sea_mackerel: { color: '#3989b1', belly: '#b9d4dc', body: 'M14 41Q38 30 66 41Q40 53 14 41Z', tail: 'M15 41 3 31v21Z' },
  sea_snapper: { color: '#df7180', belly: '#f5b2aa', body: 'M16 43Q36 20 64 41Q41 62 16 43Z', tail: 'M17 43 4 29v27Z' },
};

function FishArt({ id, size }) {
  const spec=FISHING_CONFIG.fish[id],form=fishForm(spec);
  const bodies={oval:'M17 42Q35 20 62 40Q39 61 17 42Z',deep:'M20 42Q34 8 60 40Q39 73 20 42Z',long:'M7 42Q35 25 70 40Q39 58 7 42Z',slender:'M10 42Q38 31 67 40Q39 52 10 42Z',catfish:'M9 42Q34 23 68 40Q39 59 9 42Z',eel:'M4 44Q30 31 70 38Q39 45 4 48Z',round:'M24 42A19 19 0 1 0 62 42A19 19 0 1 0 24 42Z',flat:'M14 42 38 18 66 42 38 62Z'};
  const fish = FISH_SHAPES[id] || (spec?{color:spec.color,belly:'#eef2db',body:bodies[form],tail:form==='flat'?'M15 42 2 43 15 45Z':form==='eel'?'M10 43 1 46 10 47Z':'M18 42 4 30v25Z'}:null);
  if (!fish) return null;
  return <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label={id}>
    <defs><linearGradient id={`fish-${id}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffffff" stopOpacity=".55"/><stop offset=".35" stopColor={fish.color}/><stop offset="1" stopColor={fish.belly}/></linearGradient></defs>
    <ellipse cx="40" cy="66" rx="27" ry="3" fill="#12394d" opacity=".14"/>
    <path d={fish.tail} fill={fish.color} stroke="#294d5a" strokeWidth="1.5"/>
    <path d={fish.body} fill={`url(#fish-${id})`} stroke="#294d5a" strokeWidth="1.5"/>
    <path d="M24 47Q42 57 58 44Q41 49 24 47Z" fill={fish.belly}/>
    <path d="M32 33 44 24 49 35" fill={fish.color} stroke="#294d5a" strokeWidth="1.5"/>
    {id === 'perch' && <path d="m36 33-4 18m11-18-3 19m10-17-2 15" stroke="#376647" strokeWidth="3"/>}
    {id === 'sea_mackerel' && <path d="m31 35 4 5m3-6 4 6m3-6 4 6m3-5 4 5" stroke="#174e70" strokeWidth="2"/>}
    {id === 'river_catfish' && <path d="M58 42q12-11 16-7m-16 8q10 10 16 9" fill="none" stroke="#53656a" strokeWidth="1.5"/>}
    <circle cx="55" cy="39" r="3.5" fill="#fff"/><circle cx="56" cy="39" r="2.3" fill="#1c3038"/><circle cx="57" cy="38" r=".8" fill="#fff"/>
    {id === 'golden_carp' && <path d="m34 26 4-7 4 7 4-6 4 8" fill="#ffe989" stroke="#ba7b17" strokeWidth="1.5"/>}
    {id === 'sea_snapper' && <path d="M37 32q3 5 0 9m9-8q3 5 0 9" fill="none" stroke="#b6485f" strokeWidth="2"/>}
  </svg>;
}

function FashionArt({ item, size }) {
  const id = item.itemId || item.id || '';
  const spec = getFashionItem(id);
  const color = spec?.color || item.color || '#7196ae';
  const isSet = (item.id && (item.id.startsWith('fashion:') || item.id.startsWith('set_'))) || id.startsWith('set_');

  let type = null;
  if (isSet) type = 'set';
  else if (id.startsWith('gender_') || item.field === 'gender') type = 'gender';
  else if (id.startsWith('top_')) type = 'top';
  else if (id.startsWith('bot_')) type = 'bottom';
  else if (id.startsWith('shoe_')) type = 'shoe';
  else if (id.startsWith('hair_') || id.startsWith('dye_')) type = 'hair';
  else if (id === 'human') type = 'human';
  else if (id === 'duck_beak') type = 'duck_beak';
  else if (id.includes('lollipop') || id.includes('keo')) type = 'lollipop';
  else if (id === 'aura_stars') type = 'aura_stars';
  else if (id.includes('non_la')) type = 'non_la';
  else if (id.includes('beret')) type = 'beret';
  else if (id.includes('glasses') || id.includes('goggles')) type = 'glasses';
  else if (id.includes('ears')) type = 'ears';
  else if (id.includes('crown') || id.includes('halo') || id.includes('quang')) type = 'crown';
  else if (id.includes('wings') || id.includes('canh')) type = 'wings';
  else if (/hat|khan_dong|mu_/.test(id)) type = 'hat';
  else if (id.includes('backpack') || id.includes('balo')) type = 'backpack';
  else if (id.includes('headphones') || id.includes('tai_nghe') || id.includes('mic')) type = 'headphones';
  else if (id.includes('floatie') || id.includes('phao')) type = 'floatie';
  else if (id.includes('toast') || id.includes('banh_mi')) type = 'toast';
  else if (id.includes('horn') || id.includes('sung')) type = 'horns';
  else if (id.includes('tail') || id.includes('duoi')) type = 'tail';
  else if (id.includes('cape') || id.includes('choang')) type = 'cape';
  else if (['classic', 'sparkle', 'smile_arc', 'cat_eyes', 'surprised'].includes(id) || item.field === 'eyeType') type = 'eyes';
  else if (['smile', 'beaming', 'cat_mouth', 'surprised_o', 'tongue'].includes(id) || item.field === 'mouthType') type = 'mouth';
  else if (['peach', 'heart', 'drunk'].includes(id) || item.field === 'blushType') type = 'blush';
  else if (['dot', 'cat_nose'].includes(id) || item.field === 'noseType') type = 'nose';

  if (!type) {
    const faceItem = [EYES_OPTIONS, EYE_COLORS, NOSE_OPTIONS, MOUTH_OPTIONS, BLUSH_OPTIONS].some(group => group.some(entry => entry.id === id));
    const CategoryIcon = faceItem ? Icon3dTabFace : Icon3dTabEars;
    return <CategoryIcon size={size} />;
  }

  const outline = '#1e293b';
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label={item.name || id}>
      <defs>
        <radialGradient id="art_gold" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="90%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#713f12" />
        </radialGradient>
        <radialGradient id="art_duck" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="45%" stopColor="#facc15" />
          <stop offset="90%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </radialGradient>
        <radialGradient id="art_frog" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="40%" stopColor="#4ade80" />
          <stop offset="85%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </radialGradient>
        <radialGradient id="art_pink" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fdf2f8" />
          <stop offset="40%" stopColor="#f472b6" />
          <stop offset="85%" stopColor="#db2777" />
          <stop offset="100%" stopColor="#831843" />
        </radialGradient>
        <linearGradient id="art_item_grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="25%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Bóng đổ tròn mềm dưới chân món đồ */}
      <ellipse cx="40" cy="71" rx="26" ry="4" fill="#0f172a" opacity="0.16" />

      {type === 'top' && (
        <g>
          {/* Tay áo trái & phải 3D */}
          <path d="M 26 20 L 12 33 C 10 38 15 41 19 38 L 26 30 Z" fill="url(#art_item_grad)" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 54 20 L 68 33 C 70 38 65 41 61 38 L 54 30 Z" fill="url(#art_item_grad)" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />

          {/* Thân áo phồng */}
          <path
            d="M 24 18 L 56 18 L 58 55 C 58 59 22 59 22 55 Z"
            fill="url(#art_item_grad)"
            stroke={outline}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Vệt sáng bóng trên ngực áo */}
          <ellipse cx="38" cy="27" rx="14" ry="4" fill="#ffffff" opacity="0.45" />

          {/* Bo gấu áo và cổ áo tròn */}
          <path d="M 32 18 Q 40 26 48 18" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
          {id.includes('hoodie') && (
            <>
              <path d="M 30 42 L 50 42 L 48 52 L 32 52 Z" fill="#ffffff" fillOpacity="0.25" stroke={outline} strokeWidth="1.8" />
              <line x1="36" y1="23" x2="36" y2="34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="44" y1="23" x2="44" y2="31" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="36" cy="34" r="2" fill="#facc15" />
              <circle cx="44" cy="31" r="2" fill="#facc15" />
            </>
          )}
          {id.includes('aodai') && (
            <path d="M 34 55 L 28 69 M 46 55 L 52 69" stroke={color} strokeWidth="5" strokeLinecap="round" />
          )}
        </g>
      )}

      {type === 'set' && (
        <g>
          <path d="M 24 16 L 56 16 L 58 40 L 22 40 Z" fill={color || '#ec4899'} stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 22 40 L 58 40 L 64 64 L 16 64 Z" fill="#38bdf8" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="40" cy="24" rx="12" ry="3" fill="#ffffff" opacity="0.5" />
          <circle cx="62" cy="20" r="7" fill="#facc15" stroke="#854d0e" strokeWidth="1.8" />
          <polygon points="62,15 64,19 68,20 64,21 62,25 60,21 56,20 60,19" fill="#ffffff" />
        </g>
      )}

      {type === 'gender' && (
        <g>
          <ellipse cx="40" cy="65" rx="18" ry="4" fill="#cbd5e1" />
          <path d="M 28 62 C 26 44 54 44 52 62 Z" fill={id === 'boy' ? '#38bdf8' : id === 'girl' ? '#f472b6' : '#a78bfa'} stroke={outline} strokeWidth="2.5" />
          <circle cx="40" cy="30" r="14" fill="#fed7aa" stroke={outline} strokeWidth="2.5" />
          <ellipse cx="36" cy="25" rx="5" ry="2.5" fill="#ffffff" opacity="0.6" />
        </g>
      )}

      {type === 'bottom' && (
        <g>
          {/skirt|gown/.test(id) ? (
            <>
              <path d="M 26 18 L 54 18 L 65 62 L 15 62 Z" fill="url(#art_item_grad)" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
              <line x1="33" y1="25" x2="30" y2="61" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="47" y1="25" x2="50" y2="61" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M 22 18 L 58 18 L 55 64 L 43 64 L 40 40 L 37 64 L 25 64 Z" fill="url(#art_item_grad)" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
              <rect x="22" y="17" width="36" height="8" rx="3" fill="#ffffff" fillOpacity="0.25" stroke={outline} strokeWidth="2" />
              <circle cx="40" cy="21" r="2" fill="#facc15" stroke="#854d0e" strokeWidth="1" />
            </>
          )}
          <ellipse cx="40" cy="21" rx="14" ry="2" fill="#ffffff" opacity="0.6" />
        </g>
      )}

      {type === 'shoe' && (
        <g>
          {/* Sneaker 3D thời trang bồng bềnh */}
          <path
            d="M 16 38 C 18 25 32 25 38 32 L 60 32 C 66 32 70 38 68 48 L 12 48 C 12 42 14 38 16 38 Z"
            fill="url(#art_item_grad)"
            stroke={outline}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <ellipse cx="42" cy="35" rx="12" ry="2.5" fill="#ffffff" opacity="0.6" />
          <path d="M 54 33 C 60 33 67 37 67 48 L 50 48 Z" fill="#ffffff" stroke={outline} strokeWidth="2" />
          <line x1="34" y1="34" x2="44" y2="34" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          <line x1="36" y1="40" x2="46" y2="40" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          {/* Đế bánh mì Marshmallow siêu dày */}
          <rect x="9" y="48" width="62" height="15" rx="7.5" fill="#ffffff" stroke={outline} strokeWidth="2.5" />
          <ellipse cx="40" cy="59" rx="26" ry="2" fill="#cbd5e1" opacity="0.6" />
          <line x1="22" y1="55" x2="28" y2="55" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="55" x2="42" y2="55" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="55" x2="56" y2="55" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {type === 'hair' && (
        <g>
          {/* Mái tóc bồng bềnh 3D */}
          <circle cx="18" cy="40" r="10" fill={color} stroke={outline} strokeWidth="2.5" />
          <circle cx="62" cy="40" r="10" fill={color} stroke={outline} strokeWidth="2.5" />
          <path
            d="M 18 36 C 14 14 66 14 62 36 C 62 48 56 52 50 42 C 46 34 34 34 30 42 C 24 52 18 48 18 36 Z"
            fill={color}
            stroke={outline}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Vòng sáng tóc Anime Play Together */}
          <path d="M 26 22 Q 40 14 54 22" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.75" />
          <polygon points="54,26 56.5,31 62,31.5 58,35 59,40 54,37 49,40 50,35 46,31.5 51.5,31" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
        </g>
      )}

      {type === 'human' && (
        <g>
          <circle cx="40" cy="38" r="24" fill="#fed7aa" stroke={outline} strokeWidth="2.5" />
          <ellipse cx="34" cy="28" rx="8" ry="4" fill="#ffffff" opacity="0.6" />
          <circle cx="16" cy="38" r="6" fill="#fcd34d" stroke={outline} strokeWidth="2" />
          <circle cx="64" cy="38" r="6" fill="#fcd34d" stroke={outline} strokeWidth="2" />
          <ellipse cx="32" cy="38" rx="3.5" ry="4.5" fill="#1e293b" />
          <circle cx="31" cy="36" r="1.5" fill="#ffffff" />
          <ellipse cx="48" cy="38" rx="3.5" ry="4.5" fill="#1e293b" />
          <circle cx="47" cy="36" r="1.5" fill="#ffffff" />
          <path d="M 36 46 Q 40 51 44 46" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <ellipse cx="28" cy="44" rx="4" ry="2" fill="#fb7185" opacity="0.7" />
          <ellipse cx="52" cy="44" rx="4" ry="2" fill="#fb7185" opacity="0.7" />
        </g>
      )}

      {type === 'floatie' && (
        <g>
          {/* Phao vịt vàng 3D */}
          <ellipse cx="40" cy="46" rx="28" ry="17" fill="url(#art_duck)" stroke={outline} strokeWidth="2.5" />
          <ellipse cx="40" cy="46" rx="14" ry="8" fill="#7dd3fc" stroke={outline} strokeWidth="2" />
          <ellipse cx="36" cy="38" rx="14" ry="3.5" fill="#ffffff" opacity="0.6" />
          {/* Đầu vịt vàng đáng yêu */}
          <circle cx="21" cy="31" r="12" fill="url(#art_duck)" stroke={outline} strokeWidth="2.2" />
          <ellipse cx="18" cy="26" rx="4" ry="2" fill="#ffffff" opacity="0.6" />
          <circle cx="17" cy="28" r="2.5" fill="#1e293b" />
          <circle cx="16" cy="27" r="1" fill="#ffffff" />
          {/* Mỏ vịt cam phồng */}
          <ellipse cx="11" cy="34" rx="7" ry="4" fill="#f97316" stroke={outline} strokeWidth="1.8" />
        </g>
      )}

      {type === 'backpack' && (
        <g>
          {/* Balo ếch xanh mắt lồi 3D */}
          <rect x="18" y="24" width="44" height="42" rx="16" fill="url(#art_frog)" stroke={outline} strokeWidth="2.5" />
          <ellipse cx="40" cy="30" rx="14" ry="3" fill="#ffffff" opacity="0.5" />
          {/* 2 Mắt ếch to tròn trên đỉnh */}
          <circle cx="28" cy="18" r="9" fill="url(#art_frog)" stroke={outline} strokeWidth="2.2" />
          <circle cx="28" cy="18" r="5.5" fill="#ffffff" />
          <circle cx="28" cy="18" r="3" fill="#1e293b" />
          <circle cx="27" cy="17" r="1.2" fill="#ffffff" />

          <circle cx="52" cy="18" r="9" fill="url(#art_frog)" stroke={outline} strokeWidth="2.2" />
          <circle cx="52" cy="18" r="5.5" fill="#ffffff" />
          <circle cx="52" cy="18" r="3" fill="#1e293b" />
          <circle cx="51" cy="17" r="1.2" fill="#ffffff" />

          {/* Túi trước bụng & má hồng */}
          <rect x="25" y="44" width="30" height="16" rx="7" fill="#ffffff" fillOpacity="0.25" stroke={outline} strokeWidth="2" />
          <ellipse cx="26" cy="36" rx="3" ry="1.5" fill="#fb7185" />
          <ellipse cx="54" cy="36" rx="3" ry="1.5" fill="#fb7185" />
        </g>
      )}

      {type === 'headphones' && (
        <g>
          {/* Tai nghe mèo RGB 3D */}
          <path d="M 18 42 C 18 20 62 20 62 42" stroke="#334155" strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* 2 Tai mèo RGB phát sáng trên gọng */}
          <polygon points="20,24 26,10 35,20" fill="url(#art_pink)" stroke={outline} strokeWidth="2" strokeLinejoin="round" />
          <polygon points="24,21 27,14 32,19" fill="#fecdd3" />
          <polygon points="60,24 54,10 45,20" fill="url(#art_pink)" stroke={outline} strokeWidth="2" strokeLinejoin="round" />
          <polygon points="56,21 53,14 48,19" fill="#fecdd3" />
          {/* 2 Ốp tai phồng êm ái */}
          <rect x="11" y="36" width="14" height="26" rx="7" fill="url(#art_pink)" stroke={outline} strokeWidth="2.2" />
          <rect x="55" y="36" width="14" height="26" rx="7" fill="url(#art_pink)" stroke={outline} strokeWidth="2.2" />
          <circle cx="18" cy="49" r="3" fill="#38bdf8" />
          <circle cx="62" cy="49" r="3" fill="#38bdf8" />
        </g>
      )}

      {type === 'ears' && (
        <g>
          {/* Cặp tai mèo búp bê 3D */}
          <path d="M 12 48 C 12 28 68 28 68 48" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 14 42 C 12 18 18 10 30 24 C 31 34 22 42 14 42 Z" fill={color || '#fb923c'} stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 17 38 C 16 23 20 17 26 26 C 27 32 21 38 17 38 Z" fill="#fda4af" />
          <path d="M 66 42 C 68 18 62 10 50 24 C 49 34 58 42 66 42 Z" fill={color || '#fb923c'} stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 63 38 C 64 23 60 17 54 26 C 53 32 59 38 63 38 Z" fill="#fda4af" />
        </g>
      )}

      {type === 'crown' && (
        <g>
          {/* Vương miện hoàng gia 3D Ruby */}
          <path d="M 14 36 L 22 56 L 58 56 L 66 36 L 52 44 L 40 24 L 28 44 Z" fill="url(#art_gold)" stroke="#713f12" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="20" y="54" width="40" height="9" rx="3" fill="url(#art_gold)" stroke="#713f12" strokeWidth="2" />
          <circle cx="40" cy="46" r="6" fill="#f43f5e" stroke="#9f1239" strokeWidth="1.5" />
          <polygon points="40,43 42,45 44,46 42,47 40,49 38,47 36,46 38,45" fill="#ffffff" />
          <circle cx="24" cy="58" r="2.5" fill="#38bdf8" />
          <circle cx="56" cy="58" r="2.5" fill="#38bdf8" />
          <polygon points="40,16 42,20 45,21 42,22 40,25 38,22 35,21 38,20" fill="#facc15" />
        </g>
      )}

      {type === 'wings' && (
        <g>
          {/* Đôi cánh thiên thần lông vũ 3D */}
          <path
            d="M 39 44 C 18 12 5 22 7 36 C 8 52 38 58 39 44 Z"
            fill={id.includes('bat') ? '#3b0764' : id.includes('faerie') ? '#a855f7' : '#ffffff'}
            stroke={outline}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M 41 44 C 62 12 75 22 73 36 C 72 52 42 58 41 44 Z"
            fill={id.includes('bat') ? '#3b0764' : id.includes('faerie') ? '#a855f7' : '#ffffff'}
            stroke={outline}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <ellipse cx="23" cy="30" rx="9" ry="3" transform="rotate(-25 23 30)" fill="#ffffff" opacity="0.6" />
          <ellipse cx="57" cy="30" rx="9" ry="3" transform="rotate(25 57 30)" fill="#ffffff" opacity="0.6" />
          <polygon points="40,24 41.5,28 45,28.5 42,31 43,35 40,32.5 37,35 38,31 35,28.5 38.5,28" fill="#facc15" />
        </g>
      )}

      {type === 'glasses' && (
        <g stroke={outline} strokeWidth="4.5" fill="none">
          <circle cx="26" cy="40" r="14" fill="#ffffff" fillOpacity="0.2" />
          <circle cx="54" cy="40" r="14" fill="#ffffff" fillOpacity="0.2" />
          <path d="M 40 37 Q 40 35 40 37" />
          <line x1="12" y1="36" x2="4" y2="33" />
          <line x1="68" y1="36" x2="76" y2="33" />
          <ellipse cx="23" cy="34" rx="4" ry="2" fill="#ffffff" stroke="none" opacity="0.7" />
          <ellipse cx="51" cy="34" rx="4" ry="2" fill="#ffffff" stroke="none" opacity="0.7" />
        </g>
      )}

      {type === 'horns' && (
        <g>
          {/* Cặp sừng ác ma đỏ bóng 3D */}
          <path d="M 22 56 C 10 32 26 14 30 16 C 30 36 34 50 22 56 Z" fill="#ef4444" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="25" cy="28" rx="2.5" ry="6" transform="rotate(-15 25 28)" fill="#ffffff" opacity="0.6" />
          <path d="M 58 56 C 70 32 54 14 50 16 C 50 36 46 50 58 56 Z" fill="#ef4444" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="55" cy="28" rx="2.5" ry="6" transform="rotate(15 55 28)" fill="#ffffff" opacity="0.6" />
        </g>
      )}

      {type === 'tail' && (
        <g>
          {/* Đuôi cáo cam lông xù lắc lư 3D */}
          <path d="M 24 64 C 54 58 68 34 54 18 C 42 16 38 32 24 64 Z" fill="#ea580c" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 54 18 C 50 28 42 28 48 36 C 56 32 58 24 54 18 Z" fill="#ffffff" stroke={outline} strokeWidth="1.5" />
          <ellipse cx="44" cy="36" rx="6" ry="12" transform="rotate(-30 44 36)" fill="#ffffff" opacity="0.35" />
        </g>
      )}

      {type === 'lollipop' && (
        <g>
          <line x1="40" y1="46" x2="40" y2="72" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
          <line x1="40" y1="46" x2="40" y2="72" stroke={outline} strokeWidth="2" strokeLinecap="round" />
          <circle cx="40" cy="32" r="20" fill="url(#art_pink)" stroke={outline} strokeWidth="2.5" />
          <ellipse cx="34" cy="24" rx="8" ry="3.5" fill="#ffffff" opacity="0.6" />
          <path d="M 40 32 A 12 12 0 1 0 52 44" fill="none" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" />
          <circle cx="40" cy="32" r="4.5" fill="#38bdf8" />
        </g>
      )}

      {type === 'non_la' && (
        <g>
          <polygon points="40,16 10,58 70,58" fill="#fef08a" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="40" cy="58" rx="30" ry="7" fill="#fde047" stroke={outline} strokeWidth="2.5" />
          <line x1="40" y1="16" x2="40" y2="58" stroke="#ca8a04" strokeWidth="1.8" strokeDasharray="3 3" />
          <path d="M 24 58 Q 20 72 38 72 Q 56 72 54 58" fill="none" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}

      {type === 'hat' && (
        <g>
          <path d="M 18 46 C 18 18 62 18 62 46 Z" fill={color || '#3b82f6'} stroke={outline} strokeWidth="2.5" />
          <ellipse cx="40" cy="49" rx="32" ry="8" fill={color || '#3b82f6'} stroke={outline} strokeWidth="2.5" />
          <ellipse cx="38" cy="32" rx="14" ry="4" fill="#ffffff" opacity="0.5" />
        </g>
      )}

      {type === 'cape' && (
        <g>
          <path d="M 28 20 L 14 66 L 66 66 L 52 20 Z" fill="#b91c1c" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="22" y="18" width="36" height="8" rx="4" fill="#ffffff" stroke={outline} strokeWidth="2" />
          <circle cx="40" cy="22" r="4.5" fill="#facc15" stroke="#854d0e" strokeWidth="1.5" />
          <line x1="32" y1="26" x2="24" y2="65" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="3" />
          <line x1="48" y1="26" x2="56" y2="65" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="3" />
        </g>
      )}

      {type === 'toast' && (
        <g>
          <path d="M 20 28 C 30 18 50 18 60 28 C 64 54 58 64 54 64 L 26 64 C 22 64 16 54 20 28 Z" fill="#d97706" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 23 30 C 31 22 49 22 57 30 C 60 52 55 60 52 60 L 28 60 C 25 60 20 52 23 30 Z" fill="#fef3c7" />
          <rect x="33" y="38" width="14" height="14" rx="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
        </g>
      )}

      {type === 'aura_stars' && (
        <g>
          <polygon points="40,12 43,22 53,24 45,31 47,41 40,35 33,41 35,31 27,24 37,22" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
          <polygon points="18,36 20,42 26,43 21,47 23,53 18,50 13,53 15,47 10,43 16,42" fill="#fbbf24" stroke="#ca8a04" strokeWidth="1.5" />
          <polygon points="62,36 64,42 70,43 65,47 67,53 62,50 57,53 59,47 54,43 60,42" fill="#fbbf24" stroke="#ca8a04" strokeWidth="1.5" />
        </g>
      )}

      {type === 'beret' && (
        <g>
          <ellipse cx="40" cy="42" rx="28" ry="16" fill="#18181b" stroke={outline} strokeWidth="2.5" />
          <ellipse cx="38" cy="35" rx="22" ry="11" fill="#27272a" />
          <ellipse cx="34" cy="32" rx="10" ry="3" fill="#ffffff" opacity="0.3" />
          <circle cx="26" cy="38" r="4.5" fill="#facc15" stroke="#854d0e" strokeWidth="1.5" />
        </g>
      )}

      {type === 'eyes' && (
        <g>
          {id === 'sparkle' ? (
            <g fill="#1e1b4b">
              <ellipse cx="28" cy="40" rx="9" ry="13" />
              <ellipse cx="52" cy="40" rx="9" ry="13" />
              <polygon points="28,34 30,38 34,40 30,42 28,46 26,42 22,40 26,38" fill="#fff" />
              <polygon points="52,34 54,38 58,40 54,42 52,46 50,42 46,40 50,38" fill="#fff" />
              <circle cx="31" cy="44" r="1.8" fill="#fff" />
              <circle cx="55" cy="44" r="1.8" fill="#fff" />
            </g>
          ) : id === 'smile_arc' ? (
            <g fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round">
              <path d="M 18 42 Q 28 30 38 42" />
              <path d="M 42 42 Q 52 30 62 42" />
            </g>
          ) : id === 'cat_eyes' ? (
            <g fill="#1e1b4b">
              <path d="M 18 45 Q 32 30 38 42 Q 30 50 18 45 Z" stroke={outline} strokeWidth="2" />
              <circle cx="28" cy="40" r="3" fill="#fff" />
              <path d="M 62 45 Q 48 30 42 42 Q 50 50 62 45 Z" stroke={outline} strokeWidth="2" />
              <circle cx="52" cy="40" r="3" fill="#fff" />
            </g>
          ) : (
            <g fill="#1e1b4b">
              <circle cx="28" cy="40" r="11" stroke={outline} strokeWidth="2" />
              <circle cx="52" cy="40" r="11" stroke={outline} strokeWidth="2" />
              <circle cx="26" cy="37" r="4" fill="#fff" />
              <circle cx="50" cy="37" r="4" fill="#fff" />
              <circle cx="31" cy="43" r="1.8" fill="#fff" />
              <circle cx="55" cy="43" r="1.8" fill="#fff" />
            </g>
          )}
        </g>
      )}

      {type === 'mouth' && (
        <g fill="none" stroke="#e11d48" strokeWidth="3.5" strokeLinecap="round">
          {id === 'cat_mouth' ? (
            <path d="M 26 42 Q 33 49 40 42 Q 47 49 54 42" />
          ) : id === 'beaming' ? (
            <g>
              <path d="M 26 38 Q 40 58 54 38 Z" fill="#e11d48" />
              <path d="M 30 40 H 50" stroke="#fff" strokeWidth="3.5" />
            </g>
          ) : id === 'surprised_o' ? (
            <ellipse cx="40" cy="44" rx="8" ry="11" fill="#e11d48" />
          ) : id === 'tongue' ? (
            <g>
              <path d="M 26 40 Q 40 52 54 40" />
              <path d="M 35 44 V 52 Q 40 56 45 52 V 44" fill="#f472b6" strokeWidth="2" />
            </g>
          ) : (
            <path d="M 26 42 Q 40 54 54 42" />
          )}
        </g>
      )}

      {type === 'blush' && (
        <g>
          {id === 'heart' ? (
            <g fill="#fb7185">
              <path d="M 24 43 A 5 5 0 0 0 16 48 C 16 53 24 57 24 57 S 32 53 32 48 A 5 5 0 0 0 24 43 Z" />
              <path d="M 56 43 A 5 5 0 0 0 48 48 C 48 53 56 57 56 57 S 64 53 64 48 A 5 5 0 0 0 56 43 Z" />
            </g>
          ) : (
            <g fill="#fda4af">
              <ellipse cx="22" cy="44" rx="12" ry="7" />
              <ellipse cx="58" cy="44" rx="12" ry="7" />
            </g>
          )}
        </g>
      )}

      {type === 'nose' && (
        <g>
          {id === 'cat_nose' ? (
            <polygon points="40,47 34,41 46,41" fill="#f43f5e" />
          ) : (
            <circle cx="40" cy="42" r="3" fill="#b45309" />
          )}
        </g>
      )}
    </svg>
  );
}

export function InventoryItemArt({ item, size = 48 }) {
  const ExactIcon = EXISTING[item.itemId];
  if (ExactIcon) return <ExactIcon size={size}/>;
  if (FISHING_CONFIG.fish[item.itemId] && item.kind === 'fish') return <FishArt id={item.itemId} size={size}/>;
  if (CROP_COLORS[item.itemId]) return <CropArt id={item.itemId} size={size}/>;
  if (item.category === 'fashion') return <FashionArt item={item} size={size}/>;
  return <span className="pt-inv-name-art" style={{ '--art-size': `${size}px` }} aria-label={item.name}>{item.name}</span>;
}
