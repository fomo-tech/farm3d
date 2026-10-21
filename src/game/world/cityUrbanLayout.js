export const CITY_LANDMARK_BUILDINGS = [
    // North business skyline
    { id: 'finance-tower-a', x: -103, z: -91, width: 25, depth: 24, height: 32, palette: 'navy', sign: 'cyan', roofAccent: 'cyan', action: 'finance', district: 'business', sideWindows: true },
    { id: 'finance-tower-b', x: -32, z: -92, width: 22, depth: 24, height: 25, palette: 'blue', sign: 'gold', roofAccent: 'gold', action: 'finance', district: 'business', sideWindows: true },
    { id: 'finance-tower-c', x: 40, z: -91, width: 26, depth: 24, height: 38, palette: 'navy', sign: 'cyan', roofAccent: 'cyan', action: 'finance', district: 'business', sideWindows: true },
    { id: 'finance-tower-d', x: 108, z: -91, width: 24, depth: 24, height: 29, palette: 'blue', sign: 'gold', roofAccent: 'gold', action: 'finance', district: 'business', sideWindows: true },
    // Shopping and entertainment streets
    { id: 'shopping-a', x: -103, z: -24, width: 26, depth: 22, height: 10, palette: 'pink', sign: 'pink', action: 'shopping', district: 'shopping' },
    { id: 'shopping-b', x: -65, z: -24, width: 24, depth: 22, height: 14, palette: 'gold', sign: 'pink', action: 'shopping', district: 'shopping' },
    { id: 'shopping-c', x: -102, z: 24, width: 26, depth: 20, height: 12, palette: 'red', sign: 'gold', action: 'shopping', district: 'shopping' },
    { id: 'entertainment-a', x: 67, z: -24, width: 27, depth: 22, height: 13, palette: 'pink', sign: 'cyan', action: 'entertainment', district: 'entertainment' },
    { id: 'entertainment-b', x: 106, z: -24, width: 25, depth: 22, height: 17, palette: 'blue', sign: 'pink', action: 'entertainment', district: 'entertainment' },
    { id: 'entertainment-c', x: 104, z: 24, width: 28, depth: 20, height: 11, palette: 'pink', sign: 'cyan', action: 'entertainment', district: 'entertainment' },
    { id: 'city-museum', x: -28, z: -24, width: 20, depth: 18, height: 12, palette: 'gold', sign: 'cyan', roofAccent: 'cyan', action: 'entertainment', district: 'civic' },
    { id: 'city-metro-station', x: 30, z: -24, width: 20, depth: 18, height: 8, palette: 'silver', sign: 'cyan', action: 'transport', district: 'services' },
    { id: 'city-media-tower', x: 151, z: -91, width: 20, depth: 24, height: 34, palette: 'blue', sign: 'pink', roofAccent: 'pink', action: 'entertainment', district: 'business', sideWindows: true },
    { id: 'city-nightclub', x: -167, z: -25, width: 24, depth: 20, height: 15, palette: 'navy', sign: 'pink', roofAccent: 'pink', action: 'entertainment', district: 'old-town' },
    { id: 'city-pawnshop', x: -65, z: 24, width: 22, depth: 20, height: 9, palette: 'gold', sign: 'cyan', action: 'shopping', district: 'shopping' },
    // Residential east/south neighborhoods
    { id: 'residential-a', x: -103, z: 77, width: 28, depth: 25, height: 16, palette: 'green', sign: 'green', action: 'community', district: 'residential' },
    { id: 'residential-b', x: -62, z: 77, width: 25, depth: 25, height: 12, palette: 'gold', sign: 'green', action: 'community', district: 'residential' },
    { id: 'residential-c', x: 67, z: 77, width: 27, depth: 25, height: 18, palette: 'blue', sign: 'green', action: 'community', district: 'residential' },
    { id: 'residential-d', x: 106, z: 77, width: 24, depth: 25, height: 13, palette: 'green', sign: 'gold', action: 'community', district: 'residential' },
    { id: 'residential-west-block', x: -150, z: 77, width: 20, depth: 25, height: 14, palette: 'green', sign: 'gold', action: 'community', district: 'residential' },
    { id: 'city-hospital', x: -14, z: 78, width: 25, depth: 24, height: 17, palette: 'white', sign: 'red', roofAccent: 'red', action: 'services', district: 'services' },
    { id: 'city-apartments-south', x: 18, z: 108, width: 25, depth: 22, height: 19, palette: 'blue', sign: 'green', action: 'community', district: 'residential' },
    { id: 'city-apartments-east', x: 106, z: 108, width: 24, depth: 22, height: 16, palette: 'green', sign: 'cyan', action: 'community', district: 'residential' },
    // Civic services and port warehouses
    { id: 'civic-hall', x: -32, z: 27, width: 23, depth: 18, height: 15, palette: 'blue', sign: 'gold', roofAccent: 'gold', action: 'services', district: 'services' },
    { id: 'civic-services', x: 32, z: 27, width: 22, depth: 18, height: 11, palette: 'green', sign: 'cyan', action: 'services', district: 'services' },
    { id: 'city-police', x: -78, z: 27, width: 20, depth: 18, height: 10, palette: 'navy', sign: 'blue', action: 'services', district: 'services' },
    { id: 'city-fire-station', x: 78, z: 27, width: 20, depth: 18, height: 9, palette: 'red', sign: 'gold', action: 'services', district: 'services' },
    { id: 'port-warehouse-a', x: -103, z: 141, width: 29, depth: 22, height: 9, palette: 'red', sign: 'gold', action: 'port', district: 'waterfront' },
    { id: 'port-warehouse-b', x: -60, z: 141, width: 27, depth: 22, height: 12, palette: 'gold', sign: 'cyan', action: 'port', district: 'waterfront' },
    { id: 'port-terminal', x: 42, z: 141, width: 30, depth: 22, height: 15, palette: 'blue', sign: 'cyan', action: 'port', district: 'waterfront' },
    { id: 'port-office', x: 94, z: 141, width: 24, depth: 20, height: 13, palette: 'navy', sign: 'cyan', roofAccent: 'cyan', action: 'port', district: 'waterfront' },
    { id: 'port-warehouse-c', x: -148, z: 141, width: 20, depth: 20, height: 8, palette: 'silver', sign: 'gold', action: 'port', district: 'waterfront' },
    // Outer city regions: each has a distinct skyline and a dedicated route
    // back to the civic core instead of feeling like an empty extension.
    { id: 'old-town-a', x: -205, z: -86, width: 22, depth: 24, height: 9, palette: 'gold', sign: 'red', action: 'community', district: 'old-town' },
    { id: 'old-town-b', x: -167, z: -86, width: 22, depth: 24, height: 12, palette: 'red', sign: 'gold', action: 'shopping', district: 'old-town' },
    { id: 'old-town-c', x: -205, z: -25, width: 20, depth: 20, height: 10, palette: 'green', sign: 'cyan', action: 'community', district: 'old-town' },
    { id: 'university-library', x: 78, z: -176, width: 30, depth: 28, height: 18, palette: 'blue', sign: 'gold', roofAccent: 'gold', action: 'community', district: 'university' },
    { id: 'university-hall', x: 119, z: -176, width: 27, depth: 28, height: 13, palette: 'silver', sign: 'cyan', action: 'services', district: 'university' },
    { id: 'university-dorm', x: 166, z: -176, width: 25, depth: 28, height: 16, palette: 'green', sign: 'blue', action: 'community', district: 'university' },
    { id: 'industrial-warehouse-a', x: -202, z: 178, width: 34, depth: 28, height: 11, palette: 'red', sign: 'gold', action: 'port', district: 'industrial' },
    { id: 'industrial-warehouse-b', x: -158, z: 178, width: 28, depth: 28, height: 14, palette: 'silver', sign: 'cyan', action: 'port', district: 'industrial' },
    { id: 'industrial-depot', x: -190, z: 224, width: 26, depth: 16, height: 8, palette: 'gold', sign: 'red', action: 'port', district: 'industrial' },
    { id: 'industrial-garage', x: -148, z: 224, width: 26, depth: 16, height: 10, palette: 'navy', sign: 'pink', action: 'vehicles', district: 'industrial' },
    { id: 'airport-terminal', x: 102, z: 178, width: 34, depth: 22, height: 11, palette: 'blue', sign: 'cyan', roofAccent: 'cyan', action: 'transport', district: 'airport' },
    { id: 'airport-hangar', x: 162, z: 178, width: 30, depth: 22, height: 9, palette: 'silver', sign: 'gold', action: 'transport', district: 'airport' },
    { id: 'airport-control-tower', x: 204, z: 176, width: 12, depth: 12, height: 25, palette: 'navy', sign: 'cyan', roofAccent: 'cyan', action: 'transport', district: 'airport', sideWindows: true },
  ];

const connectors = [
 [[-210,-190],[-183,-174],[-151,-157],[-111,-170],[-74,-189],[-45,-176]],
 [[-210,108],[-190,87],[-183,53],[-190,20]],
 [[130,-142],[155,-128],[182,-120],[210,-104]],
];
export const CITY_CONNECTOR_ROADS = connectors.flatMap((points,route)=>points.slice(1).map(([x2,z2],i)=>{
 const [x1,z1]=points[i];
 return {id:`city-connector-${route}-${i}`,x:(x1+x2)/2,z:(z1+z2)/2,x1,z1,x2,z2,length:Math.hypot(x2-x1,z2-z1),width:7,northSouth:false,diagonal:true};
}));

// Keep authored landmarks inside their blocks, with clearance from carriageways.
const landmarkCorrections={
 'finance-tower-c':{x:22,width:20},
 'city-nightclub':{x:-185,width:24},
 'city-apartments-east':{z:115,depth:12},
 'port-warehouse-a':{z:148,depth:12},
 'port-warehouse-b':{z:148,depth:12},
 'port-terminal':{x:24,z:148,width:22,depth:12},
 'old-town-a':{x:-188,width:24},
 'old-town-b':{x:-148,width:20},
 'old-town-c':{x:-188,width:24},
 'university-hall':{x:113,width:18},
 'industrial-warehouse-a':{x:-188,z:188,width:24,depth:26},
 'industrial-warehouse-b':{x:-148,z:188,width:20,depth:26},
 'airport-control-tower':{x:198,width:10},
};
for(const b of CITY_LANDMARK_BUILDINGS)Object.assign(b,landmarkCorrections[b.id]);

export function createCityInfill(roads) {
 const reserved = [
  {minX:-42,maxX:42,minZ:-42,maxZ:42},
  {minX:-128,maxX:-96,minZ:60,maxZ:92},
  {minX:28,maxX:60,minZ:62,maxZ:94},
  {minX:-206,maxX:-174,minZ:4,maxZ:36},
  {minX:140,maxX:192,minZ:-20,maxZ:116},
  {minX:76,maxX:224,minZ:205,maxZ:231},
  ...CITY_LANDMARK_BUILDINGS.map(b=>({minX:b.x-b.width/2-1,maxX:b.x+b.width/2+1,minZ:b.z-b.depth/2-1,maxZ:b.z+b.depth/2+1})),
  ...roads.map(r=>r.diagonal?{minX:Math.min(r.x1,r.x2)-6,maxX:Math.max(r.x1,r.x2)+6,minZ:Math.min(r.z1,r.z2)-6,maxZ:Math.max(r.z1,r.z2)+6}:{minX:r.x-(r.northSouth?r.width/2+3:r.length/2+3),maxX:r.x+(r.northSouth?r.width/2+3:r.length/2+3),minZ:r.z-(r.northSouth?r.length/2+3:r.width/2+3),maxZ:r.z+(r.northSouth?r.length/2+3:r.width/2+3)}),
 ];
 const buildings=[],palettes=['navy','blue','silver','gold','green'];
 for(let x=-228;x<=228;x+=19)for(let z=-228;z<=228;z+=19){
  const seed=Math.abs(Math.round(x*17+z*31)),width=11+seed%3,depth=11+seed%4;
  const a=x-width/2-1,b=x+width/2+1,c=z-depth/2-1,d=z+depth/2+1;
  if(reserved.some(r=>a<r.maxX&&b>r.minX&&c<r.maxZ&&d>r.minZ))continue;
  buildings.push({id:'city-infill-'+buildings.length,x,z,width,depth,height:z<-45&&Math.abs(x)<130?20+seed%23:z>130?6+seed%7:9+seed%15,palette:palettes[seed%palettes.length]});
 }
 return buildings;
}

