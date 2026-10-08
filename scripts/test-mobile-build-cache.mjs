import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {mobileBuildPlugin} from './mobileBuildPlugin.mjs';
const root=mkdtempSync(join(tmpdir(),'mobile-cache-'));
try {
 mkdirSync(join(root,'dist/assets'),{recursive:true});
 writeFileSync(join(root,'dist/index.html'),'test');
 writeFileSync(join(root,'dist/assets/game-abcdefgh.js'),'test');
 const plugin=mobileBuildPlugin();plugin.configResolved({root,build:{outDir:'dist'}});
 let middleware;plugin.configureServer({middlewares:{use(fn){middleware=fn;}}});
 const request=url=>{const headers={};middleware({method:'HEAD',url,headers:{'user-agent':'iPhone'}},{setHeader(k,v){headers[k]=v;},end(){}},()=>assert.fail('fixture must resolve'));return headers;};
 assert.match(request('/assets/game-abcdefgh.js')['Cache-Control'],/immutable/,'hashed bundles must survive relaunch');
 assert.equal(request('/')['Cache-Control'],'no-cache','HTML must revalidate to discover new builds');
 console.log('PASS: mobile hashed bundles cached, HTML revalidated');
}finally{rmSync(root,{recursive:true,force:true});}
