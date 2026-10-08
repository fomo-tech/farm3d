import { createRegionGate } from './createRegionGate.js';
import { VILLAGE_THEME_GROUPS } from '../worldDesignSystem.js';

export function createVillageGate(scene, position, villageName='Làng Hoa Mai', shadows=null, villageId=null, foliage=null) {
 let z=position.z;
 if(Math.abs(z-86)<6) z=93.5;
 else if(Math.abs(z+234)<6) z=-226.5;
 else if(Math.abs(z-406)<6) z=413.5;
 else if(Math.abs(position.x)<4 && z < -350) z=-386.5;
 const theme=VILLAGE_THEME_GROUPS[villageId] || VILLAGE_THEME_GROUPS[villageId?.replace(/-\d{3}$/,'')];
 return createRegionGate(scene,{name:`village-named-gate-${villageId||villageName}`,position:{...position,z},label:villageName,accent:theme?.accentColor||'#edaa57',halfSpan:6.4,shadows});
}
