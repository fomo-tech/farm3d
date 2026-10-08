import { createHash, randomUUID } from 'node:crypto';
import { FISHING_CONFIG, fishingInventoryCount } from '../shared/fishingConfig.js';
import { fishingWaterAt } from '../shared/fishing.js';
import { BEACH_CONFIG } from '../shared/beachConfig.js';

export const TELEMETRY_VERSION = 1;
export const TELEMETRY_OUTBOX_LIMIT = 256;
const PRESENCE_MS = 15000;
const ACTIVITY_GRACE_MS = 60000;
const key = value => createHash('sha256').update(value).digest('hex');
export function fishingArea(context = {}) {
  if (context.venue === 'fishing' || (!context.venue && Number.isFinite(context.x) && Number.isFinite(context.z)
    && Math.hypot(context.x-BEACH_CONFIG.vendor.x,context.z-BEACH_CONFIG.vendor.z)<=BEACH_CONFIG.vendor.interactionDistance)) return 'shop';
  if (context.venue) return 'other';
  const zone = fishingWaterAt(context.x,context.z);
  return zone ? `bank:${zone}` : 'other';
}

export class FishingTelemetry {
  constructor(database, {enabled=process.env.FISHING_TELEMETRY_ENABLED!=='0',retentionDays=30,now=Date.now} = {}) {
    this.enabled=enabled;this.now=now;this.retentionMs=retentionDays*86400000;
    this.events=database.collection('fishing_telemetry');this.players=database.collection('players');
    this.sessions=new Map();this.buffer=[];this.flushing=false;this.droppedPresence=0;this.healthId=`health-${randomUUID()}`;this.healthFlushed=0;
  }
  async init() {
    if(!this.enabled)return;
    await this.events.createIndex({expiresAt:1},{expireAfterSeconds:0});
    await this.events.createIndex({sessionId:1,at:1});
    await this.events.createIndex({at:1,type:1});
  }
  event(sessionId,type,data={},eventId=randomUUID(),at=this.now(),session=this.sessions.get(sessionId)) {
    if(!this.enabled||!session)return null;
    return {_id:eventId,version:TELEMETRY_VERSION,sessionId,playerKey:session.playerKey,type,at,
      hasLand:Boolean(session.hasLand),area:session.area,data,expiresAt:new Date(at+this.retentionMs)};
  }
  enqueue(event) {
    if(!event)return;
    if(this.buffer.length>=2000){this.droppedPresence++;this.lastPresenceLossAt=this.now();return;}
    this.buffer.push(event);
  }
  startSession(playerId,context,now=this.now()) {
    if(!this.enabled)return null;
    const id=randomUUID();
    this.sessions.set(id,{playerKey:key(playerId),hasLand:Boolean(context.farmId),area:fishingArea(context),lastMeaningfulAt:now,lastRecordedAt:now});
    this.enqueue(this.event(id,'session_start',{activeUntil:now+ACTIVITY_GRACE_MS},undefined,now));
    return id;
  }
  observe(id,context,{meaningful=false,now=this.now()}={}) {
    const session=this.sessions.get(id);if(!session)return;
    const area=fishingArea(context),changed=area!==session.area;
    if(meaningful)session.lastMeaningfulAt=now;
    session.hasLand=Boolean(context.farmId);session.area=area;
    if(!changed&&now-session.lastRecordedAt<PRESENCE_MS)return;
    session.lastRecordedAt=now;
    this.enqueue(this.event(id,'presence',{activeUntil:session.lastMeaningfulAt+ACTIVITY_GRACE_MS},undefined,now));
  }
  endSession(id,context,now=this.now()) {
    if(!this.sessions.has(id))return;
    this.observe(id,context,{now});
    const session=this.sessions.get(id);
    this.enqueue(this.event(id,'session_end',{activeUntil:session.lastMeaningfulAt+ACTIVITY_GRACE_MS},undefined,now));
    this.sessions.delete(id);
  }
  committedEvents(player,before,action,payload,result,context,now=this.now()) {
    const id=context.telemetrySessionId;
    const session=context.telemetrySession || this.sessions.get(id);
    if(!session||!action.startsWith('fishing_'))return [];
    this.observe(id,context,{meaningful:true,now});
    const previous=before.pending, next=player.progress.fishing.pending, data=[];
    const castKey=cast=>key(cast.id);
    const base=cast=>({castKey:castKey(cast),zone:cast.zone,rodId:cast.rodId,baitId:cast.baitId||null,castAt:cast.castAt,
      biteAt:cast.biteAt,expiresAt:cast.expiresAt,rarity:FISHING_CONFIG.fish[cast.fishId]?.rarity,phase:cast.phase});
    if(action==='fishing_buy')data.push(['gear_purchase',{gearId:payload.id,kind:FISHING_CONFIG.rods[payload.id]?'rod':FISHING_CONFIG.baits[payload.id]?'bait':'tool',quantity:FISHING_CONFIG.baits[payload.id]?.quantity || 1}]);
    if(action==='fishing_cast') {
      if(previous&&previous.id!==next?.id)data.push(['escape',{...base(previous),reason:'timeout',durationMs:Math.max(0,previous.expiresAt-previous.castAt)}]);
      if(next)data.push(['cast',{...base(next),inventoryCount:fishingInventoryCount(player.progress.fishing),capacity:player.progress.fishing.coolerCapacity}]);
    }
    if(previous&&['fishing_reel','fishing_pull','fishing_cancel'].includes(action)) {
      if(action==='fishing_reel'&&(result?.fishCaught||next?.phase==='fighting'))data.push(['hook',{...base(previous),reactionMs:now-previous.biteAt}]);
      if(result?.fishCaught)data.push(['catch',{...base(previous),fishId:result.fishCaught,weight:result.weight,
        durationMs:Math.max(0,now-previous.castAt),fightMs:previous.hookedAt?Math.max(0,now-previous.hookedAt):0,inventoryCount:fishingInventoryCount(player.progress.fishing)}]);
      if(result?.fishEscaped) {
        const reason=action==='fishing_cancel'?'cancelled':now>previous.expiresAt?'timeout':
          result.fishEscaped.includes('Dây căng')?'snap':result.fishEscaped.includes('Dây chùng')?'slack':
          result.fishEscaped.includes('rời vị trí')?'moved':'escaped';
        data.push(['escape',{...base(previous),reason,durationMs:Math.max(0,now-previous.castAt),fightMs:previous.hookedAt?Math.max(0,now-previous.hookedAt):0}]);
      }
    }
    if(result?.fishSold)data.push(['sale',{...result.fishSold,inventoryCount:fishingInventoryCount(player.progress.fishing)}]);
    if(result?.fishingMission)data.push(['mission',{missionId:result.fishingMission}]);
    return data.map(([type,details],index)=>this.event(id,type,{...details,coinsBefore:before.coins,coinsAfter:player.progress.coins,
      coinDelta:player.progress.coins-before.coins,activeUntil:now+ACTIVITY_GRACE_MS,fishingVersion:FISHING_CONFIG.version},key(`${player.playerId}:${player.revision+1}:${index}`),now,session));
  }
  async write(events) {
    if(!events.length)return;
    // Idempotent upsert also recovers a projection interrupted after a partial batch.
    await this.events.bulkWrite(events.map(event=>({updateOne:{filter:{_id:event._id},update:{$setOnInsert:event},upsert:true}})),{ordered:false});
  }
  async flushOutboxes() {
    for await(const player of this.players.find({'fishingTelemetryOutbox.0':{$exists:true}}, {projection:{playerId:1,fishingTelemetryOutbox:1}}).limit(50)) {
      const pending=player.fishingTelemetryOutbox.filter(e=>e.expiresAt>new Date(this.now()));
      await this.write(pending);
      await this.players.updateOne({_id:player._id},{$pull:{fishingTelemetryOutbox:{_id:{$in:player.fishingTelemetryOutbox.map(e=>e._id)}}}});
    }
  }
  async flush() {
    if(!this.enabled||this.flushing)return;
    this.flushing=true;
    const batch=this.buffer.slice(0,200);
    try {
      await this.write(batch);this.buffer.splice(0,batch.length);
      if(this.droppedPresence!==this.healthFlushed){
        await this.events.updateOne({_id:this.healthId},{$set:{version:TELEMETRY_VERSION,type:'health',at:this.lastPresenceLossAt,
          data:{droppedPresence:this.droppedPresence},expiresAt:new Date(this.lastPresenceLossAt+this.retentionMs)}},{upsert:true});
        this.healthFlushed=this.droppedPresence;
      }
      await this.flushOutboxes();
    } finally {this.flushing=false;}
  }
}
