import { createHash } from 'node:crypto';
const hash=value=>createHash('sha256').update(value).digest('hex');

/** Coins, escrow and journal outbox commit in ONE MongoDB player document.
 * Revision also guards the existing farm purchases. The append-only ledger is
 * an idempotent outbox projection, not a second source of financial truth.
 * This works on standalone MongoDB without pretending multi-doc transactions.
 */
export class CasinoWalletService {
  constructor(db) { this.players=db.collection('players');this.ledger=db.collection('casino_ledger'); }
  async init() { await this.ledger.createIndex({playerId:1,at:-1});await this.flushAll(); }
  async receipt(player,requestId,fingerprint) {
    const id=hash(`${player.playerId}\0${requestId}`);
    const receipt=(player.casinoOutbox||[]).find(r=>r._id===id)||await this.ledger.findOne({_id:id});
    if(receipt&&receipt.fingerprint!==fingerprint) throw new Error('Mã yêu cầu đã được dùng với nội dung khác.');
    return receipt;
  }
  async transact(playerId,roundId,requestId,mode,amount,bets={}) {
    if(!Number.isSafeInteger(amount)||amount<0||amount>1_000_000) throw new Error('Số xu không hợp lệ.');
    if(typeof requestId!=='string'||!requestId.length||requestId.length>180) throw new Error('Thiếu mã yêu cầu.');
    const key=hash(roundId),fingerprint=hash(JSON.stringify({roundId,mode,amount,bets}));
    for(let attempt=0;attempt<32;attempt++) {
      // Read player BEFORE the ledger: archive writes ledger before removing
      // the outbox and incrementing revision, so a receipt cannot disappear.
      const player=await this.players.findOne({playerId});
      if(!player) throw new Error('Không tìm thấy người chơi.');
      const existing=await this.receipt(player,requestId,fingerprint);
      if(existing) return existing;
      if((player.casinoOutbox||[]).length>=128) {await this.flush(playerId);continue;}
      const escrow=player.casinoEscrows?.[key];
      if(mode==='settle'&&!escrow) return null;
      const delta=mode==='settle'?amount:(escrow?.amount||0)-amount;
      if(!Number.isSafeInteger(player.progress?.coins)||player.progress.coins+delta<0) throw new Error('Không đủ xu nông trại.');
      const receipt={_id:hash(`${playerId}\0${requestId}`),playerId,roundId,requestId,fingerprint,
        mode,delta,stake:mode==='settle'?escrow.amount:amount,reward:mode==='settle'?amount:null,
        balance:player.progress.coins+delta,bets,at:Date.now()};
      const update={$inc:{'progress.coins':delta,revision:1},$push:{casinoOutbox:receipt},$set:{updatedAt:Date.now()}};
      if(mode==='settle') update.$unset={[`casinoEscrows.${key}`]:''};
      else update.$set[`casinoEscrows.${key}`]={roundId,amount,bets,at:Date.now()};
      const result=await this.players.updateOne({playerId,revision:player.revision||0},update);
      if(!result.modifiedCount) continue;
      // Failure to project cannot lose money: journal stays in the atomic outbox.
      await this.flush(playerId).catch(error=>console.error('[Casino ledger outbox]',error.message));
      return receipt;
    }
    throw new Error('Số dư đang bận. Vui lòng thử lại.');
  }
  hold(playerId,roundId,amount,bets,requestId) {return this.transact(playerId,roundId,requestId,'hold',amount,bets);}
  settle(playerId,roundId,reward) {return this.transact(playerId,roundId,`settle:${roundId}`,'settle',reward);}
  async flush(playerId) {
    const player=await this.players.findOne({playerId},{projection:{casinoOutbox:1}});
    for(const event of player?.casinoOutbox||[]) {
      await this.ledger.updateOne({_id:event._id},{$setOnInsert:event},{upsert:true});
      await this.players.updateOne({playerId,'casinoOutbox._id':event._id},{$pull:{casinoOutbox:{_id:event._id}},$inc:{revision:1}});
    }
  }
  async flushAll() {
    for await(const player of this.players.find({'casinoOutbox.0':{$exists:true}},{projection:{playerId:1}})) await this.flush(player.playerId);
  }
  async escrows() {
    const holds=[];
    for await(const player of this.players.find({casinoEscrows:{$exists:true}},{projection:{playerId:1,casinoEscrows:1}})) {
      for(const escrow of Object.values(player.casinoEscrows||{})) holds.push({playerId:player.playerId,...escrow});
    }
    return holds;
  }
}
import { CasinoActionError as Error } from './CasinoActionError.js';
