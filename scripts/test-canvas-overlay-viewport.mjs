import assert from 'node:assert/strict';
import { canvasOverlayViewport } from '../src/game/player/canvasOverlayViewport.js';
const canvas={clientWidth:844,clientHeight:390,offsetLeft:0,offsetTop:0,
 getBoundingClientRect:()=>({left:0,top:0,width:390,height:844})};
assert.deepEqual(canvasOverlayViewport(canvas),{left:0,top:0,width:844,height:390},'portrait rotation must keep logical projection axes');
canvas.offsetLeft=12;canvas.offsetTop=8;
assert.deepEqual(canvasOverlayViewport(canvas),{left:12,top:8,width:844,height:390});
canvas.clientWidth=390;canvas.clientHeight=700;
assert.equal(canvasOverlayViewport(canvas).height,700,'keyboard and normal portrait use current layout size');
console.log('PASS: name/chat overlay projection stays in canvas-local axes after rotation and keyboard resizing');
