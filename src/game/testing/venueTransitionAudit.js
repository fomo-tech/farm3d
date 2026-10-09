import { FarmWorld } from '../world/FarmWorld.js';
import { VENUE_LAYOUT } from '../../../shared/venueLayout.js';
const status = document.querySelector('#status'), report = document.querySelector('#report');
const enter = document.querySelector('#enter'), exit = document.querySelector('#exit');
const testVenue = new URLSearchParams(location.search).get('venue') === 'casino' ? 'casino' : 'supplies';
let measuring = false, lastFrame = 0, result = null;
let openedTable = null;
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
  onCasinoTable: game => { openedTable = game; status.textContent = `Mở bàn: ${game}`; },
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
  if (new URLSearchParams(location.search).has('interleaved')) {
    await Promise.all([world.ensureVenueBuilt(testVenue),world.ensureVenueBuilt('supplies')]);
  } else await world.ensureVenueBuilt(testVenue);
  const entrance=VENUE_LAYOUT[testVenue].entrance;
  world.player.root.position.set(entrance.x,0,entrance.z);
  world.completeVenueEntry(testVenue);
  result.position = world.getPlayerState();
  result.foreignInteriorVisible = world.scene.meshes.filter(mesh=>mesh.metadata?.interiorVenue&&mesh.metadata.interiorVenue!==testVenue&&mesh.isEnabled()&&mesh.isVisible).length;
  result.sharedInteriorMeshes = world.venueMeshesMap.get(testVenue)?.filter(mesh=>testVenue!=='supplies'&&world.venueMeshesMap.get('supplies')?.includes(mesh)).length;
  result.venueMeshes = world.venueMeshesMap.get(testVenue)?.length;
  result.visibleVenueMeshes = world.venueMeshesMap.get(testVenue)?.filter(mesh => mesh.isEnabled() && mesh.isVisible).length;
});
exit.onclick=() => measure('shop exit',() => world.exitVenue());
if (testVenue === 'casino') {
  const testTables = document.createElement('button');
  testTables.textContent = 'Kiểm tra tương tác 3 bàn';
  report.before(testTables);
  testTables.onclick = () => {
    if (world.currentVenue !== 'casino') { status.textContent = 'Vào Hội quán trước'; return; }
    const { x, y, z } = VENUE_LAYOUT.casino.interior;
    const checks = [];
    for (const [game, dx, dz] of [['tai-xiu', -6.5, -3.5], ['bau-cua', 6.5, -3.5], ['bai-cao', -6.5, 4.5]]) {
      world.player.stop();
      world.player.root.position.set(x + dx, y, z + dz - 3.2);
      world.lastVenueTransition = 0;
      world.updateVenueProximity();
      openedTable = null;
      world.interactContext();
      checks.push({ game, opened: openedTable, pass: openedTable === game });
    }
    report.textContent = JSON.stringify(checks, null, 2);
    status.textContent = checks.every(check => check.pass) ? 'PASS: cả 3 bàn nhận tương tác mở trò chơi' : 'FAIL: có bàn không mở được';
  };
}
window.addEventListener('pagehide',() => world.dispose());
