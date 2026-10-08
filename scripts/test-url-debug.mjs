import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../public/mobile-debug.js',import.meta.url),'utf8');
for(const [search,enabled] of [['',false],['?debug',true],['?debug=1',true],['?debug=true',true],['?debug=0',false],['?debug=false',false],['?debug=off',false],['?mobileDebug=1',true],['?hair=x&debug',true]]){
 const logs=[];
 const context={URLSearchParams,Date,performance:{now:()=>1},location:{search,hostname:'localhost'},console:{info:(...args)=>logs.push(args),debug:()=>{}},document:{body:null,documentElement:{dataset:{}},addEventListener(){}},window:{addEventListener(){}},setTimeout(){},setInterval(){},localStorage:{setItem(){}}};
 vm.runInNewContext(source,context);
 assert.equal(context.window.__farmDebug.enabled,enabled,search);
 assert.equal(context.document.documentElement.dataset.debug,String(enabled));
 context.window.__farmDebug.mark('Preparing world');
 context.window.__farmDebug.log('Avatar loaded');
 context.console.debug('Render check');
 assert.equal(logs.length,enabled?3:0,`${search}: debug output is opt-in`);
 if(enabled)assert.ok(logs.some(args=>args[1]==='Avatar loaded'));
}
console.log('PASS URL debug flags, boot logs, application logs and console.debug are opt-in');
