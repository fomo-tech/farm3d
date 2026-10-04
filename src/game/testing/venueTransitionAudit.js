import { FarmWorld } from '../world/FarmWorld.js';
import { VENUE_LAYOUT } from '../../../shared/venueLayout.js';
const status = document.querySelector('#status'), report = document.querySelector('#report');
const enter = document.querySelector('#enter'), exit = document.querySelector('#exit');
let measuring = false, lastFrame = 0, result = null;
new PerformanceObserver(list => {
  if (measuring) result.longTasks.push(...list.getEntries().map(entry => Math.round(entry.duration)));
}).observe({type:'longtask', buffered:false});
const frame = time => {
  if (measuring && lastFrame) result.maxFrameGapMs = Math.max(result.maxFrameGapMs, Math.round(time - lastFrame));
  lastFrame = time;
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);
const world = new FarmWorld(document.querySelector('#game'), text => { status.textContent = text; }, {
  initialLocation:{x:0,z:18,y:0}, graphicsQuality:'ultra', getPlayerName:()=>'Venue audit',
  onReady:() => { enter.disabled=false; status.textContent='World ready · isolated test, no account writes'; },
  onFatalError:text => { status.textContent=text; },
});
const measure = async (label, operation) => {
  enter.disabled=exit.disabled=true;
  result={label,maxFrameGapMs:0,longTasks:[],sceneMeshes:world.scene.meshes.length};
  lastFrame=0; measuring=true;
  const start=performance.now();
  await operation();
  result.operationMs=Math.round(performance.now()-start);
  setTimeout(() => {
    measuring=false;
    report.textContent=JSON.stringify(result,null,2);
    enter.disabled=!!world.currentVenue; exit.disabled=!world.currentVenue;
  },2500);
};
enter.onclick=() => measure('shop entry',async () => {
  await world.ensureVenueBuilt('supplies');
  const entrance=VENUE_LAYOUT.supplies.entrance;
  world.player.root.position.set(entrance.x,0,entrance.z);
  world.completeVenueEntry('supplies');
});
exit.onclick=() => measure('shop exit',() => world.exitVenue());
window.addEventListener('pagehide',() => world.dispose());
