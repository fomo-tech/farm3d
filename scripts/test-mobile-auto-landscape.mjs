import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../public/orientation.js', import.meta.url), 'utf8');
const flush = async () => { for (let i=0;i<12;i++) await Promise.resolve(); };
function setup({ mobile=true, supported=true, installed=false, fullscreenRejected=false } = {}) {
  const classes = new Set(), events = new Map();
  const classList = {add:(...names)=>names.forEach(n=>classes.add(n)),remove:(...names)=>names.forEach(n=>classes.delete(n)),toggle:(name,on)=>on?classes.add(name):classes.delete(name)};
  let fullscreenCalls=0, lockCalls=0;
  const root={classList,style:{setProperty(){}},requestFullscreen:async()=>{
    fullscreenCalls++;
    if(fullscreenRejected)throw Error('Fullscreen denied');
    document.fullscreenElement=root;
  }};
  const document={documentElement:root,getElementById:()=>null,querySelector:()=>null,addEventListener:(name,fn)=>events.set(name,fn),hidden:false};
  const context={navigator:{userAgent:mobile?'Android Chrome':'Desktop Chrome',maxTouchPoints:mobile?5:0},document,
    screen:{width:390,height:844},matchMedia:query=>({matches:(mobile&&query==='(pointer: coarse)')||(installed&&query==='(display-mode: standalone)')}),
    addEventListener(){},requestAnimationFrame:()=>1,setTimeout:()=>1,clearTimeout(){},sessionStorage:{getItem:()=>null}};
  context.window={screen:context.screen,innerWidth:mobile?390:1440,innerHeight:mobile?844:900};
  if(supported)context.screen.orientation={lock:async mode=>{
    lockCalls++; assert.equal(mode,'landscape');
    if(!installed&&!document.fullscreenElement)throw Error('Fullscreen required');
    context.window.innerWidth=844;context.window.innerHeight=390;
  }};
  vm.runInNewContext(source,context);
  return {classes,events,calls:()=>({fullscreenCalls,lockCalls})};
}
const android=setup();await flush();
assert.deepEqual(android.calls(),{fullscreenCalls:0,lockCalls:1},'attempt native lock at startup without an invalid fullscreen call');
android.events.get('pointerdown')({target:{closest:()=>false}});await flush();
assert.deepEqual(android.calls(),{fullscreenCalls:1,lockCalls:2},'first touch enters fullscreen then locks landscape');
assert.ok(android.classes.has('mobile-landscape'));
const installed=setup({installed:true});await flush();
assert.ok(installed.classes.has('mobile-landscape'),'installed app locks without interaction');
assert.equal(installed.calls().fullscreenCalls,0);
const unsupported=setup({supported:false,fullscreenRejected:true});await flush();
unsupported.events.get('pointerdown')({target:{closest:()=>false}});await flush();
assert.ok(unsupported.classes.has('mobile-rotated'),'unsupported browser renders logical landscape without native lock');
const desktop=setup({mobile:false});await flush();
assert.deepEqual(desktop.calls(),{fullscreenCalls:0,lockCalls:0},'desktop never changes screen mode');
assert.ok(desktop.classes.has('is-desktop-device'));
const manifest=JSON.parse(readFileSync(new URL('../public/manifest.webmanifest',import.meta.url),'utf8'));
assert.equal(manifest.orientation,'landscape');
console.log('PASS: mobile auto landscape, first-touch fullscreen retry, installed app, unsupported browser fallback, desktop isolation');
