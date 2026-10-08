import {stealLivestock,recoverLivestockClaim} from './LivestockTheft.js';
import { unlockedFarmTiles } from '../shared/landExpansionConfig.js';
import { randomUUID } from 'node:crypto';
import { FARM_CONFIG, farmBarnCapacity } from '../shared/farmConfig.js';
import { farmGatePosition, insideFarm, theftPolicy, farmBoundaryBlocked, farmGateOpen, cropYield } from '../shared/farmSecurity.js';
import { WORLD_VILLAGES, worldFarmId } from '../shared/villageLayout.js';

// A per-farm queue serializes gate changes, watering, harvesting and stealing.
// Durable crop claims + player receipts recover the two-document transfer on
// standalone MongoDB as well as replica sets; no in-memory-only rewards.
const queues = new Map();
export async function withFarmLock(id, task) {
  const previous = queues.get(id) || Promise.resolve();
  let release;
  const next = new Promise(resolve => { release = resolve; });
  queues.set(id, next);
  await previous;
  try { return await task(); } finally { release(); if (queues.get(id) === next) queues.delete(id); }
}
export class FarmSecurity {
  constructor({ assignments, crops, players, now = Date.now }) {
    Object.assign(this, { assignments, crops, players, now });
    this.gates = new Map();
    this.pending = new Map();
  }
  async init() {
    for (const farm of await this.assignments.find({ status: { $ne: 'pending' } }).toArray()) this.gates.set(`${farm.villageId}:${farm.lot}`, farmGateOpen(farm));
    for (const owner of await this.players.find({livestockTheftClaim:{$exists:true}}).toArray()) await this.recoverLivestock(owner);
    for (const row of await this.crops.find({ theftClaim: { $exists: true } }).toArray()) await this.recover(row);
  }
  async stealLivestock(args) {return withFarmLock(args.farmId,()=>stealLivestock(this,args));}
  async recoverLivestock(owner) {return recoverLivestockClaim(this,owner);}
  gateOpen(assignment) { return Boolean(assignment) && farmGateOpen(assignment); }
  blocksMovement(from, to) {
    for (const [key, open] of this.gates) {
      const colon = key.lastIndexOf(':'), village = WORLD_VILLAGES.find(v => v.id === key.slice(0, colon));
      if (village && farmBoundaryBlocked(worldFarmId(village.order, Number(key.slice(colon + 1))), open, from, to)) return true;
    }
    return false;
  }
  async recover(row) {
    const claim = row.theftClaim;
    const paid = await this.players.findOne({ playerId: claim.playerId, farmTheftReceipts: claim.id });
    if (paid) {
      await this.assignments.updateOne({ villageId: row.villageId, lot: Number(row.farmId.slice(-6)), theftReceipts: { $ne: claim.id } }, {
        $set: { theftDay: claim.day }, $inc: { [claim.counterPath]: 1 }, $addToSet: { theftReceipts: claim.id },
        $push: { theftLog: { $each: [{ id: claim.id, playerId: claim.playerId, crop: claim.crop, amount: claim.amount, at: claim.at }], $slice: -50 } },
      });
      await this.crops.updateOne({ _id: row._id, 'theftClaim.id': claim.id }, { $set: { state: 'tilled', yield: 0, stolenAmount: claim.amount, stolenBy: claim.playerId }, $unset: { theftClaim: '' } });
    } else await this.crops.updateOne({ _id: row._id, 'theftClaim.id': claim.id }, { $unset: { theftClaim: '' } });
  }
  async toggle(assignment, farmId, playerId, open, position, occupants = []) {
    return withFarmLock(farmId, async () => {
      if (assignment.playerId !== playerId || typeof open !== 'boolean') return { error: 'Chỉ chủ đất được đóng/mở cổng.' };
      const gate = farmGatePosition(farmId);
      if (position.venue || Math.hypot(position.x - gate.x, position.z - gate.z) > FARM_CONFIG.security.gate.interactionDistance) return { error: 'Hãy đứng gần cổng.' };
      if (!open && occupants.some(p => !p.venue && Math.abs(p.x - gate.x) < 3.2 && Math.abs(p.z - gate.z) < 1)) return { error: 'Có người đứng trong vùng cổng. Hãy tránh ra trước khi đóng.' };
      const updated = await this.assignments.updateOne({ _id: assignment._id, playerId }, { $set: { gateOpen: open, gateUpdatedAt: this.now() } });
      if (!updated.matchedCount) return { error: 'Quyền sở hữu đã thay đổi.' };
      this.gates.set(`${assignment.villageId}:${assignment.lot}`, open);
      for (const [id, pending] of this.pending) if (pending.farmId === farmId) this.pending.delete(id);
      return { farmId, open, updatedAt: this.now() };
    });
  }
  async steal({ assignment, farmId, storageFarmId, tileKey, playerId, position, tilePosition, phase, token }) {
    return withFarmLock(farmId, async () => {
      const now = this.now(), day = new Date(now).toISOString().slice(0, 10);
      const farm = await this.assignments.findOne({ _id: assignment._id });
      const player = await this.players.findOne({ playerId });
      if (!farm) return { error: 'Nông trại không tồn tại.' };
      const owner = await this.players.findOne({ playerId: farm.playerId });
      if (!unlockedFarmTiles(owner?.progress).includes(tileKey)) return { error: 'Ô đất chưa được khai hoang.' };
      const row = await this.crops.findOne({ villageId: farm.villageId, farmId: storageFarmId, tileKey });
      if (!player || !row || position.venue || !insideFarm(farmId, position) || Math.hypot(position.x - tilePosition.x, position.z - tilePosition.z) > FARM_CONFIG.security.theft.interactionDistance) return { error: 'Hãy đứng trong vườn, sát cây chín.' };
      if (row.theftClaim) { await this.recover(row); return { error: 'Cây đang được chăm sóc. Hãy thử lại sau nhé.' }; }
      const policy = theftPolicy({ owner: farm.playerId === playerId, gateOpen: this.gateOpen(farm), row, now,
        claimedAt: farm.claimedAt || 0, playerCount: player.farmTheftCounts?.[day] || 0, farmCount: farm.theftCounts?.[day] || 0 });
      if (policy.error) return policy;
      if (phase === 'start') {
        const pending = { token: randomUUID(), farmId, tileKey, x: position.x, z: position.z, plantedAt: row.plantedAt, readyAt: now + FARM_CONFIG.security.theft.interactionMs, expiresAt: now + FARM_CONFIG.security.theft.interactionMs + 5000 };
        this.pending.set(playerId, pending);
        return { pending };
      }
      const pending = this.pending.get(playerId);
      this.pending.delete(playerId);
      if (phase !== 'finish' || !pending || token !== pending.token || pending.farmId !== farmId || pending.tileKey !== tileKey || pending.plantedAt !== row.plantedAt || Math.hypot(position.x - pending.x, position.z - pending.z) > .2 || now < pending.readyAt || now > pending.expiresAt) return { error: 'Lượt lấy đã hủy hoặc chưa đủ thời gian.' };
      const total = Object.values(player.progress.inventory).reduce((sum, n) => sum + Number(n || 0), 0);
      if (total + policy.amount > farmBarnCapacity(player.progress.barnLevel)) return { error: 'Kho đã đầy.' };
      const claim = { id: randomUUID(), playerId, day, amount: policy.amount, crop: policy.crop, at: now, counterPath: `theftCounts.${day}` };
      const normalizedYield = cropYield(row);
      const reserved = await this.crops.updateOne({ _id: row._id, plantedAt: row.plantedAt, state: 'watered', theftClaim: { $exists: false }, stolenAmount: { $in: [null, 0] } }, { $set: { theftClaim: claim, yield: normalizedYield } });
      if (!reserved.modifiedCount) return { error: 'Cây vừa được người khác lấy.' };
      row.theftClaim = claim;
      row.yield = normalizedYield;
      const paid = await this.players.updateOne({ playerId, revision: player.revision || 0,
        ...(FARM_CONFIG.security.theft.dailyLimitsEnabled ? { [`farmTheftCounts.${day}`]: { $not: { $gte: FARM_CONFIG.security.theft.dailyPlayerLimit } } } : {}) }, {
        $inc: { [`progress.inventory.${policy.crop}`]: policy.amount, [`farmTheftCounts.${day}`]: 1, revision: 1 },
        $addToSet: { farmTheftReceipts: claim.id }, $set: { updatedAt: now },
      });
      await this.recover(row);
      if (!paid.modifiedCount) return { error: 'Dữ liệu vừa thay đổi, lượt lấy chưa được tính.' };
      return { tileData: { ...row, state: 'tilled', yield: 0, theftClaim: undefined, stolenAmount: policy.amount, stolenBy: playerId }, amount: policy.amount };
    });
  }
  observeMovement(playerId, position, getTilePosition) {
    const pending = this.pending.get(playerId);
    if (!pending) return;
    const tile = pending.kind==='livestock' ? pending.targetPosition : getTilePosition(pending.farmId, pending.tileKey);
    if (this.now() > pending.expiresAt || position.venue || !tile || Math.hypot(position.x - pending.x, position.z - pending.z) > .2 || Math.hypot(position.x - tile.x, position.z - tile.z) > FARM_CONFIG.security.theft.interactionDistance) this.pending.delete(playerId);
  }
}
