// One palette for Crystal Lake, the regional lakes, and every river channel.
export const WATER_PALETTE=Object.freeze({deep:'#3e8eae',body:'#499fb5',mid:'#63b6c3',shallow:'#499fb5',edge:'#499fb5'});
export function seaWaterColor(x,z){
 const stops=[[360,WATER_PALETTE.edge],[474,WATER_PALETTE.mid],[650,WATER_PALETTE.body],[970,WATER_PALETTE.deep]];
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
 for(let i=1;i<stops.length;i++)if(z<=stops[i][0]){const [a,ca]=stops[i-1],[b,cb]=stops[i],t=Math.max(0,Math.min(1,(z-a)/(b-a))),p=rgb(ca),q=rgb(cb);return p.map((v,j)=>v+(q[j]-v)*t);}
 return rgb(WATER_PALETTE.deep);
}
