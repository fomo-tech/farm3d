import {NETWORK_WATER_SHAPES,NETWORK_BRIDGES} from '../../shared/waterNetwork.js';
import React, {memo,useId} from 'react';
import {MINIMAP_RIVER_POLYGON,MINIMAP_BRIDGES,MINIMAP_ROADS,MINIMAP_PARCELS,MINIMAP_LAKE_POLYGON,MINIMAP_WATER_POLYGON,MINIMAP_SAND_POLYGON,LAKE_CONFIG} from '../game/world/minimapLayout.js';
export const FarmMapTerrain=memo(function MapTerrain(){const waterId='map-water-'+useId().replace(/:/g,'');return <>
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
