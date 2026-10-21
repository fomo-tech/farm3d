import {NETWORK_WATER_SHAPES,NETWORK_BRIDGES} from '../../shared/waterNetwork.js';
import React, {memo,useId} from 'react';
import {MINIMAP_RIVER_POLYGON,MINIMAP_BRIDGES,MINIMAP_ROADS,MINIMAP_PARCELS,MINIMAP_LAKE_POLYGON,MINIMAP_WATER_POLYGON,MINIMAP_SAND_POLYGON,LAKE_CONFIG,CITY_BLOCK_SURFACES,CITY_BUILDING_FOOTPRINTS} from '../game/world/minimapLayout.js';
import {IS_CITY_MODE} from '../game/world/gameMode.js';
import {CITY_COAST,CITY_LAKE_OUTLINE,CITY_REGION_MOUNTAINS,CITY_BIOMES,CITY_WORLD_SCALE,CITY_AIRPORT_RUNWAY} from '../game/world/cityRegionLayout.js';
export const FarmMapTerrain=memo(function MapTerrain(){const waterId='map-water-'+useId().replace(/:/g,'');if(IS_CITY_MODE)return <>
 <polygon points={CITY_COAST.map(p=>p.join(',')).join(' ')} fill="#40483e" stroke="#a69d80" strokeWidth="10" strokeLinejoin="round"/>
 {CITY_BIOMES.map(b=><polygon key={b.id} points={b.points.map(p=>p.join(',')).join(' ')} fill={b.color} fillOpacity=".6"/>)}
 <g fill="none" stroke="#8a9180" strokeOpacity=".4" strokeWidth="2">{CITY_REGION_MOUNTAINS.map((m,i)=><g key={i}>{[1,.74,.48].map(s=><ellipse key={s} cx={m.x} cy={m.z} rx={m.radius*s} ry={m.radius*s*.8}/>)}</g>)}</g>
 <polygon points={CITY_LAKE_OUTLINE.map(p=>p.join(',')).join(' ')} fill="#244f60" stroke="#8b9b8d" strokeWidth="3"/>
 <rect x={CITY_AIRPORT_RUNWAY.x-CITY_AIRPORT_RUNWAY.width/2} y={CITY_AIRPORT_RUNWAY.z-CITY_AIRPORT_RUNWAY.depth/2} width={CITY_AIRPORT_RUNWAY.width} height={CITY_AIRPORT_RUNWAY.depth} fill="#181d21" stroke="#969fa5" strokeWidth="1"/>
 <path d={`M${CITY_AIRPORT_RUNWAY.x-CITY_AIRPORT_RUNWAY.width/2+12} ${CITY_AIRPORT_RUNWAY.z}H${CITY_AIRPORT_RUNWAY.x+CITY_AIRPORT_RUNWAY.width/2-12}`} stroke="#e0e4e5" strokeWidth="1.5" strokeDasharray="10 10"/>
 <rect x="-240" y="-240" width="480" height="480" fill="#252b2d"/>
 <g data-map-terrain="city-blocks">{CITY_BLOCK_SURFACES.map(block=><rect key={block.id} x={block.x-block.width/2} y={block.z-block.depth/2} width={block.width} height={block.depth} rx="2" fill="#35404b" stroke="#66727d" strokeOpacity=".65" strokeWidth="2"/>)}</g>
 <polygon points={MINIMAP_WATER_POLYGON} fill="#2e8da4"/>
 <g data-map-terrain="city-buildings">{CITY_BUILDING_FOOTPRINTS.map(building=><rect key={building.id} transform={building.rotation?`rotate(${-building.rotation*180/Math.PI} ${building.x} ${building.z})`:undefined} x={building.x-building.width/2} y={building.z-building.depth/2} width={building.width} height={building.depth} rx=".5" fill={building.fill} stroke="#a9b4bd" strokeOpacity=".45" strokeWidth=".7"/> )}</g>
 <g stroke="#303944" strokeLinecap="round">{MINIMAP_ROADS.map(r=><line key={r.id} x1={r.x1??r.x-(r.northSouth?0:r.length/2)} y1={r.z1??r.z-(r.northSouth?r.length/2:0)} x2={r.x2??r.x+(r.northSouth?0:r.length/2)} y2={r.z2??r.z+(r.northSouth?r.length/2:0)} strokeWidth={r.width+3}/>)}</g>
 <g stroke="#b8bec0" strokeLinecap="round">{MINIMAP_ROADS.map(r=><line key={`${r.id}-lane`} x1={r.x1??r.x-(r.northSouth?0:r.length/2)} y1={r.z1??r.z-(r.northSouth?r.length/2:0)} x2={r.x2??r.x+(r.northSouth?0:r.length/2)} y2={r.z2??r.z+(r.northSouth?r.length/2:0)} strokeWidth={r.width*.52}/>)}</g>
 <rect x="-23" y="-23" width="46" height="46" rx="5" fill="#c5cbd1" stroke="#f5f6f7" strokeWidth="2"/>
 <rect x="-126" y="62" width="28" height="28" rx="4" fill="#5d8766" stroke="#9cc99a" strokeWidth="1.5"/>
 <rect x="30" y="64" width="28" height="28" rx="4" fill="#5d8766" stroke="#9cc99a" strokeWidth="1.5"/>
 <rect x="80" y="209" width="140" height="18" fill="#181d21" stroke="#969fa5" strokeWidth=".7"/>
 <path d="M85 218H215" stroke="#e0e4e5" strokeWidth="1" strokeDasharray="7 5"/>
 <g fill="#a9b0b2" fontSize="5" fontFamily="sans-serif" letterSpacing="1" textAnchor="middle" pointerEvents="none"><text x="-74" y="-150">DOWNTOWN</text><text x="116" y="-198">UNIVERSITY</text><text x="-183" y="111">OLD TOWN</text><text x="-172" y="200">INDUSTRIAL</text><text x="113" y="199">AIRPORT</text><text x="173" y="124">PORT</text></g>
 <g transform={`scale(${CITY_WORLD_SCALE})`} fill="#c7cbbf" fontSize="13" fontFamily="sans-serif" letterSpacing="3" textAnchor="middle" pointerEvents="none"><text x="-190" y="-450">VINEWOOD HILLS</text><text x="80" y="-653">INLAND LAKE</text><text x="285" y="-455">SANDY COUNTY</text><text x="-70" y="-1030">NORTH BAY</text><text x="-290" y="-850">NORTH RANGE</text><text x="-510" y="-300" transform="rotate(-78 -510 -300)">PACIFIC COAST</text><text x="-350" y="277">INTERNATIONAL AIRPORT</text></g>
 </>;return <>
 <defs><radialGradient id={waterId}><stop offset="0" stopColor="#4fa4b9"/><stop offset=".7" stopColor="#6bbdca"/><stop offset="1" stopColor="#a2dcd0"/></radialGradient></defs>
 {MINIMAP_PARCELS.map(p=><rect key={p.id} x={p.x-p.width/2} y={p.z-p.depth/2} width={p.width} height={p.depth} rx="2" fill="#a2ca8d" stroke="#cee3b5" strokeWidth="1.5"/>)}
 <polygon points={MINIMAP_SAND_POLYGON} fill="#f7e3b9"/>
 <polygon points={MINIMAP_WATER_POLYGON} fill="#66c2d2"/>
 <polygon data-map-terrain="river" points={MINIMAP_RIVER_POLYGON} fill="#66c2d2" strokeLinejoin="round"/>
 {NETWORK_WATER_SHAPES.map(shape=><polygon key={shape.id} data-map-terrain={shape.kind} points={shape.outline.map(p=>`${p.x},${p.z}`).join(' ')} fill={shape.kind==='lake'?`url(#${waterId})`:'#66c2d2'} strokeLinejoin="round"/>)}
 <polygon points={MINIMAP_LAKE_POLYGON} fill={`url(#${waterId})`}/>
 <g stroke="#8eaf8150" strokeLinecap="round">{MINIMAP_ROADS.map(r=><line key={r.id} x1={r.x-(r.northSouth?0:r.length/2)} y1={r.z-(r.northSouth?r.length/2:0)} x2={r.x+(r.northSouth?0:r.length/2)} y2={r.z+(r.northSouth?r.length/2:0)} strokeWidth={r.width+5}/>)}</g>
 <g stroke="#fff5db" strokeLinecap="round">{MINIMAP_ROADS.map(r=><line key={r.id} x1={r.x-(r.northSouth?0:r.length/2)} y1={r.z-(r.northSouth?r.length/2:0)} x2={r.x+(r.northSouth?0:r.length/2)} y2={r.z+(r.northSouth?r.length/2:0)} strokeWidth={r.width+2}/>)}</g>
 <g data-map-terrain="bridges">{NETWORK_BRIDGES.map(b=><rect key={b.id} x={b.cx-(b.axis==='x'?b.span:b.width)/2} y={b.cz-(b.axis==='x'?b.width:b.span)/2} width={b.axis==='x'?b.span:b.width} height={b.axis==='x'?b.width:b.span} fill="#e8bb87" stroke="#fff4d9" strokeWidth="1.5"/>)}{MINIMAP_BRIDGES.map(b=><rect key={b.id} x={b.cx-b.spanX/2} y={b.cz-b.widthZ/2} width={b.spanX} height={b.widthZ} fill="#e8bb87" stroke="#fff4d9" strokeWidth="1.5"/>)}</g>
 <circle cx="0" cy="0" r="48" fill="#f5e3bb" stroke="#fff5de" strokeWidth="4"/>
 <circle cx="0" cy="0" r="10" fill="#66c2d2" stroke="#fff5de" strokeWidth="3"/>
 <rect x={LAKE_CONFIG.approach.x-LAKE_CONFIG.approach.width/2} y={LAKE_CONFIG.approach.z-2.4} width={LAKE_CONFIG.approach.width} height="4.8" fill="#faf0d6"/>
 <rect x={LAKE_CONFIG.pier.x-LAKE_CONFIG.pier.length/2} y={LAKE_CONFIG.pier.z-LAKE_CONFIG.pier.width/2} width={LAKE_CONFIG.pier.length} height={LAKE_CONFIG.pier.width} fill="#e8bb87"/>
 </>});
