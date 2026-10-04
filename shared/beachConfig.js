const freeze = value => { for (const item of Object.values(value)) if (item && typeof item === 'object') freeze(item); return Object.freeze(value); };
export function validateBeachConfig(config) {
  for (const [key,value] of Object.entries(config.colors)) if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`Beach color: ${key}`);
  if (!(config.streaming.keepDistance > config.streaming.detailDistance && config.streaming.detailDistance > 0)) throw new Error('Beach streaming hysteresis');
  for (const zone of config.zones) if (!Number.isFinite(zone.x) || !Number.isFinite(zone.z) || !['entrance','promenade','resort','fishing','lookout'].includes(zone.kind)) throw new Error('Beach zone');
  if (!(config.coast.halfWidth > 0 && config.coast.landZ < config.coast.shoreZ)) throw new Error('Beach coast');
  return config;
}
export const BEACH_CONFIG = freeze(validateBeachConfig({
  coast: { halfWidth: 118, landZ: 318, shoreZ: 361, amplitude: 2.5, secondaryAmplitude: 1.2 },
  road: { z:310, width:6, shoulder:1.2, detourX:240, inlandStart:278 },
  oceanBands: [[361,118],[474,176],[650,176],[970,550]],
  sideBeach: { endZ:650, sandWidth:24, pathOffset:28, pathWidth:5 },
  colors: { sand:'#ead6b2', wetSand:'#cfbb9b', shallow:'#61bfca', middle:'#438eae', horizon:'#5799b1', foam:'#e5f3ed',
    wood:'#b79170', darkWood:'#806752', cream:'#f2e9d7', coral:'#d88a79', blue:'#83baca', palm:'#579970', trunk:'#a08465', stone:'#c3beb0', skin:'#d7b99d', ink:'#403e39' },
  streaming: { detailDistance: 165, keepDistance: 225 },
  waves: { count:3, speed:.19, travel:1.5, spacing:3.6, width:.5 },
  fishingPier: { x:-63, z:365, width:4, length:24, landStart:341, deckY:.22 },
  vendor: { x:-70, z:343, interactionDistance:3.5 },
  zones: [
    { id:'entrance',kind:'entrance',x:0,z:323 },
    { id:'promenade-west',kind:'promenade',x:-74,z:331 },
    { id:'promenade-east',kind:'promenade',x:65,z:331 },
    { id:'resort',kind:'resort',x:24,z:348 },
    { id:'fishing',kind:'fishing',x:-63,z:353 },
    { id:'lookout',kind:'lookout',x:91,z:350 },
  ],
  palms: [[-104,334],[-97,339],[-90,333],[-85,346],[-78,334],[-50,334],[-42,338],[-28,336],[-12,334],
    [12,334],[49,334],[54,339],[61,333],[86,334],[94,339],[104,334],[108,347]],
  loungers: [[13,348],[23,346],[34,349],[46,346]],
  colliders: [ {id:'beach-coconut-counter',minX:-25,maxX:-19,minZ:330,maxZ:332},
    {id:'beach-fishing-counter',minX:-72,maxX:-68,minZ:342,maxZ:344} ],
}));
export function beachShoreZ(x) {
  const c=BEACH_CONFIG.coast;
  return c.shoreZ + c.amplitude*Math.sin(x*.035) + c.secondaryAmplitude*Math.sin(x*.083);
}
// Matches the ocean ribbons, including their widening offshore footprint.
export function beachOceanHalfWidth(z) {
  const bands=BEACH_CONFIG.oceanBands;
  for(let i=1;i<bands.length;i++) if(z<=bands[i][0]) {
    const [a,wa]=bands[i-1], [b,wb]=bands[i];
    return wa+(wb-wa)*Math.max(0,(z-a)/(b-a));
  }
  return bands[bands.length-1][1];
}
export function beachWaterAt(x,z,radius=0) {
  if(z+radius<beachShoreZ(x)-.2 || z-radius>970) return false;
  const width=Math.max(beachOceanHalfWidth(z-radius),beachOceanHalfWidth(z+radius));
  return Math.abs(x)-radius<=width;
}
// Reserve the downstream river too: foliage must not migrate from sea to river.
export function beachResourceWaterAt(x,z,radius=0) {
  if(beachWaterAt(x,z,radius)) return true;
  if(z+radius<318 || z-radius>650) return false;
  const center=218+2*Math.max(0,Math.min(1,(z-330)/76));
  return Math.abs(x-center)<=14+radius;
}
const coastalRoadSegments=(()=>{
  const r=BEACH_CONFIG.road;
  return freeze([
    {id:'coast-west',x:-(620+r.detourX)/2,z:406,length:620-r.detourX,isNorthSouth:false},
    {id:'coast-west-turn',x:-r.detourX,z:358,length:96,isNorthSouth:true},
    {id:'coast-landward',x:0,z:r.z,length:2*r.detourX,isNorthSouth:false},
    {id:'coast-east-turn',x:r.detourX,z:358,length:96,isNorthSouth:true},
    {id:'coast-east',x:(620+r.detourX)/2,z:406,length:620-r.detourX,isNorthSouth:false},
    {id:'coast-city-link',x:0,z:294,length:32,isNorthSouth:true},
  ]);
})();
export function beachRoadSegments() { return coastalRoadSegments; }
export const COASTAL_BUS_CONFIG=freeze({
  waypoints: [[0,54],[0,50],[0,86],[0,BEACH_CONFIG.road.z],
    [-BEACH_CONFIG.road.detourX,BEACH_CONFIG.road.z],[-BEACH_CONFIG.road.detourX,406],[-300,406],[-315,406],
    [-BEACH_CONFIG.road.detourX,406],[-BEACH_CONFIG.road.detourX,BEACH_CONFIG.road.z],[0,BEACH_CONFIG.road.z],
    [BEACH_CONFIG.road.detourX,BEACH_CONFIG.road.z],[BEACH_CONFIG.road.detourX,406],[300,406],[315,406],
    [BEACH_CONFIG.road.detourX,406],[BEACH_CONFIG.road.detourX,BEACH_CONFIG.road.z],[0,BEACH_CONFIG.road.z],[0,86]],
  stops: {beach:3,thuPhong:6,huongDuong:13},
  shelter: {x:5.2,z:BEACH_CONFIG.road.z-5.2},
});
export function beachRoadAt(x,z,clearance=0) {
  return beachRoadSegments().some(s=>s.isNorthSouth
    ? Math.abs(x-s.x)<=BEACH_CONFIG.road.width/2+BEACH_CONFIG.road.shoulder+clearance && Math.abs(z-s.z)<=s.length/2+clearance
    : Math.abs(z-s.z)<=BEACH_CONFIG.road.width/2+BEACH_CONFIG.road.shoulder+clearance && Math.abs(x-s.x)<=s.length/2+clearance);
}
export function beachPromenadeAt(x,z,clearance=0) {
  const c=BEACH_CONFIG.coast,s=BEACH_CONFIG.sideBeach;
  if(Math.abs(z-328)<=2.5+clearance && Math.abs(x)<=c.halfWidth+s.pathOffset+clearance) return true;
  return z>=c.landZ-clearance && z<=s.endZ+clearance
    && Math.abs(Math.abs(x)-beachOceanHalfWidth(z)-s.pathOffset)<=s.pathWidth/2+clearance;
}
export function beachFishingAt(x,z) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  const c=BEACH_CONFIG.coast, p=BEACH_CONFIG.fishingPier;
  return (Math.abs(x)<=c.halfWidth && z>=beachShoreZ(x)-9 && z<=beachShoreZ(x)+5)
    || (Math.abs(x-p.x)<=p.width/2 && z>=p.z-4 && z<=p.z);
}
export function beachGroundHeight(x,z) {
  const p=BEACH_CONFIG.fishingPier, c=BEACH_CONFIG.coast;
  if(Math.abs(x-p.x)<=p.width/2 && z>=p.landStart && z<=p.z) return p.deckY;
  if(Math.abs(x)<=c.halfWidth+BEACH_CONFIG.sideBeach.pathOffset && z>=325.5 && z<=330.5) return .21;
  if(Math.abs(x)<=4 && z>=310 && z<=326) return .22;
  if(beachRoadAt(x,z)) return .08;
  if(z>=BEACH_CONFIG.coast.landZ && z<=BEACH_CONFIG.sideBeach.endZ) {
    const side=BEACH_CONFIG.sideBeach, edge=Math.abs(x)-beachOceanHalfWidth(z);
    if(Math.abs(edge-side.pathOffset)<=side.pathWidth/2) return .21;
    if(edge>=0 && edge<=side.sandWidth) return edge<=3.8 ? .15 : .145;
  }
  if(Math.abs(x)<=c.halfWidth && z>=c.landZ && z<=beachShoreZ(x)) return z>=beachShoreZ(x)-3.8 ? .15 : .145;
  return null;
}
export function beachDeepWaterAt(x,z) {
  if(!beachWaterAt(x,z) || z<=beachShoreZ(x)+.5) return false;
  const p=BEACH_CONFIG.fishingPier;
  return !(Math.abs(x-p.x)<=p.width/2-.45 && z>=p.landStart && z<=p.z-.45);
}
