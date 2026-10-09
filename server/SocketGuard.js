// Limits are checked before parsing or starting database work.
export class SocketGuard {
  constructor({clock=Date.now,maxPerIp=32,maxTotal=1500}={}){this.clock=clock;this.maxPerIp=maxPerIp;this.maxTotal=maxTotal;this.addresses=new Map();this.total=0;}
  admit(ip){const now=this.clock();let entry=this.addresses.get(ip);if(!entry){if(this.addresses.size>=10000)return false;entry={active:0,start:now,attempts:0};this.addresses.set(ip,entry);}if(now-entry.start>=60000){entry.start=now;entry.attempts=0;}entry.attempts++;return this.total<this.maxTotal&&entry.active<this.maxPerIp&&entry.attempts<=Math.max(60,this.maxPerIp*2);}
  connected(ip){this.addresses.get(ip).active++;this.total++;}
  disconnected(ip){const e=this.addresses.get(ip);if(e){e.active=Math.max(0,e.active-1);this.total=Math.max(0,this.total-1);}}
  prune(){const now=this.clock();for(const [ip,e] of this.addresses)if(!e.active&&now-e.start>=60000)this.addresses.delete(ip);}
}
export function allowSocketOperation(client,type,now=Date.now()){
  const policies={chat:[4,5000],get_social_state:[2,10000],social_action:[6,10000],get_profile:[8,10000],land_market:[2,10000],resync:[2,10000],travel:[3,10000],google_login:[2,60000],google_link:[2,60000]};
  const [limit,windowMs]=policies[type]||[20,1000];
  client.operationWindows||=new Map();const key=Object.hasOwn(policies,type)?type:'other';
  let bucket=client.operationWindows.get(key);if(!bucket||now-bucket.start>=windowMs){bucket={start:now,count:0};client.operationWindows.set(key,bucket);}
  return ++bucket.count<=limit;
}
