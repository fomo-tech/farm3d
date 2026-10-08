// Grid search uses the same collision rules as movement, including closed gates.
export function findWalkingPath(start, target, blocked, {step=1, margin=32, maxNodes=50000}={}) {
  const clear=(a,b)=>{
    const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.35));
    for(let i=1;i<=n;i++)if(blocked(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n))return false;
    return true;
  };
  if(blocked(target.x,target.z))return null;
  if(clear(start,target))return [target];
  const minX=Math.min(start.x,target.x)-margin,maxX=Math.max(start.x,target.x)+margin;
  const minZ=Math.min(start.z,target.z)-margin,maxZ=Math.max(start.z,target.z)+margin;
  const key=(x,z)=>`${x}:${z}`;
  const first={x:Math.round(start.x/step),z:Math.round(start.z/step),g:0,parent:null};
  const point=n=>({x:n.x*step,z:n.z*step});
  const score=n=>n.g+Math.hypot(n.x*step-target.x,n.z*step-target.z);
  const open=[],best=new Map([[key(first.x,first.z),0]]);
  const push=node=>{node.score=score(node);open.push(node);let i=open.length-1;while(i>0){const parent=(i-1)>>1;if(open[parent].score<=node.score)break;open[i]=open[parent];i=parent;}open[i]=node;};
  const pop=()=>{const result=open[0],last=open.pop();if(open.length){let i=0;while(i*2+1<open.length){let child=i*2+1;if(child+1<open.length&&open[child+1].score<open[child].score)child++;if(last.score<=open[child].score)break;open[i]=open[child];i=child;}open[i]=last;}return result;};
  push(first);
  let visited=0;
  while(open.length&&visited++<maxNodes){
    const node=pop(),p=point(node);
    if(node.g!==best.get(key(node.x,node.z)))continue;
    if(Math.hypot(p.x-target.x,p.z-target.z)<=step*1.5&&clear(p,target)){
      const path=[target];for(let n=node;n.parent;n=n.parent)path.unshift(point(n));
      const result=[];let from=start,index=0;
      while(index<path.length){let last=index;while(last+1<path.length&&clear(from,path[last+1]))last++;result.push(path[last]);from=path[last];index=last+1;}
      return result;
    }
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const next={x:node.x+dx,z:node.z+dz,g:node.g+Math.hypot(dx,dz)*step,parent:node},q=point(next),id=key(next.x,next.z);
      if(q.x<minX||q.x>maxX||q.z<minZ||q.z>maxZ||next.g>=(best.get(id)??Infinity)||!clear(node.parent?p:start,q))continue;
      best.set(id,next.g);push(next);
    }
  }
  return null;
}
