import { createHash,randomBytes,randomUUID,scrypt,timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { CASINO_CONFIG as CONFIG,CASINO_GAMES,QUICK_CHAT } from '../../shared/casino/casinoConfig.js';
import { sortCards } from '../../shared/casino/cards.js';
import { validateTienLenPlay } from '../../shared/casino/tienLenRules.js';
import { baiCaoPayout } from '../../shared/casino/baiCaoRules.js';
import { drawDice,shuffledDeck,settlementPlan } from './CasinoRoundService.js';
import { CasinoWalletService } from './CasinoWalletService.js';
import { CasinoActionError as Error } from './CasinoActionError.js';
const active=round=>round&&!['waiting','result','aborted'].includes(round.phase);
const hash=s=>createHash('sha256').update(s).digest('hex');
const copy=value=>structuredClone(value);
const derivePassword=promisify(scrypt);

export class CasinoRoomManager {
  constructor(db,{clock=()=>Date.now(),onWallet=()=>{},config={}}={}) {
    this.db=db;this.collection=db.collection('casino_rooms');this.wallet=new CasinoWalletService(db);
    this.clock=clock;this.onWallet=onWallet;this.config={...CONFIG,...config};this.rooms=new Map();this.locks=new Map();this.members=new Map();
  }
  async init() {
    await this.wallet.init();
    for await(const room of this.collection.find({})) {
      delete room._id;
      this.rooms.set(room.id,room);
      room.seats.forEach(seat=>{if(seat){seat.offlineAt=this.clock();if(!seat.left)this.members.set(seat.playerId,room.id);}});
      if(room.round?.plan) await this.finishSettlement(room);
      else if(active(room.round)) {
        room.round.phase='aborted';room.round.abortReason='Server khởi động lại: hoàn lại toàn bộ cược chưa quyết toán.';
        room.history=[{id:room.round.id,phase:'aborted',at:this.clock(),reason:room.round.abortReason},...(room.history||[])].slice(0,20);
      }
      room.round=null;this.releaseDepartedSeats(room);room.seats.forEach(seat=>{if(seat)seat.ready=false;});await this.save(room);
    }
    // Also covers debit committed before the room snapshot was written.
    for(const escrow of await this.wallet.escrows()) {
      const receipt=await this.wallet.settle(escrow.playerId,escrow.roundId,escrow.amount);
      if(receipt) await this.onWallet(escrow.playerId,receipt);
    }
    for(const game of Object.keys(CASINO_GAMES)) if(![...this.rooms.values()].some(r=>r.system&&r.game===game)) {
      await this.create({playerId:'system',name:'Hội quán'}, {game,name:CASINO_GAMES[game].name,system:true,stake:10},`system:${game}`);
    }
  }
  async save(room) {
    const doc = copy(room);
    delete doc._id;
    await this.collection.replaceOne({id: room.id}, doc, {upsert: true});
  }
  async locked(id,work) {
    const previous=this.locks.get(id)||Promise.resolve();
    const next=previous.catch(()=>{}).then(work);this.locks.set(id,next);
    try{return await next;}finally{if(this.locks.get(id)===next)this.locks.delete(id);}
  }
  async create(player,payload,requestId) {
    return this.locked('create',async()=>{
      if(!CASINO_GAMES[payload.game]) throw new Error('Trò chơi không hợp lệ.');
      const id=hash(`${player.playerId}:${requestId}`).slice(0,24);
      if(this.rooms.has(id)) return this.rooms.get(id);
      if(!payload.system&&[...this.rooms.values()].filter(r=>r.owner===player.playerId).length>=3) throw new Error('Mỗi người chơi tối đa 3 bàn.');
      if(this.rooms.size>=this.config.maxRooms) throw new Error('Đã đủ số bàn chơi.');
      const stake=Number(payload.stake||10);
      if(!CONFIG.chips.includes(stake)) throw new Error('Mức cược bàn không hợp lệ.');
      const password=String(payload.password||'');
      if(password.length>64) throw new Error('Mật khẩu tối đa 64 ký tự.');
      const salt=password?randomBytes(16).toString('hex'):null;
      const room={id,game:payload.game,name:String(payload.name||CASINO_GAMES[payload.game].name).trim().slice(0,36),owner:player.playerId,
        system:!!payload.system,private:!!password,password:password?(await derivePassword(password,salt,32)).toString('hex'):null,salt,
        stake,seats:Array(CASINO_GAMES[payload.game].seats).fill(null),round:null,history:[],chat:[],scores:{},lastWinner:null,createdAt:this.clock()};
      await this.save(room);this.rooms.set(id,room);return room;
    });
  }
  async action(player,payload,requestId) {
    if(!requestId) throw new Error('Thiếu mã yêu cầu.');
    if(payload.kind==='create') {
      const room=await this.create(player,{...payload,system:false},requestId);
      return this.action(player,{kind:'join',roomId:room.id,password:payload.password},`${requestId}:join`);
    }
    const room=this.rooms.get(String(payload.roomId||this.members.get(player.playerId)||''));
    if(!room) throw new Error('Không tìm thấy bàn chơi.');
    return this.locked(room.id,async()=>{
      const index=room.seats.findIndex(s=>s?.playerId===player.playerId),seat=room.seats[index];
      if(payload.kind==='join') {
        const current=this.members.get(player.playerId);
        if([...this.rooms.values()].some(r=>r.id!==room.id&&r.seats.some(s=>s?.playerId===player.playerId)))throw new Error('Ghế tại bàn trước vẫn được giữ đến khi ván kết thúc.');
        if(current&&current!==room.id) throw new Error('Hãy rời bàn hiện tại trước.');
        if(room.private&&index<0&&this.members.get(player.playerId)!==room.id) {
          const digest=await derivePassword(String(payload.password||'').slice(0,64),room.salt,32);
          if(!timingSafeEqual(digest,Buffer.from(room.password,'hex'))) throw new Error('Sai mật khẩu bàn.');
        }
        const spectators=[...this.members].filter(([id,r])=>r===room.id&&!room.seats.some(s=>s?.playerId===id)).length;
        if(!current&&spectators>=this.config.maxSpectators) throw new Error('Bàn đã đủ người xem.');
        // Assign the first available place under the room lock; users never pick seats.
        if(index<0&&!active(room.round)&&room.round?.phase!=='result') {
          const target=room.seats.findIndex(value=>!value);
          if(target>=0)room.seats[target]={playerId:player.playerId,name:player.name,ready:false,offlineAt:null};
        }
        this.members.set(player.playerId,room.id);if(seat){seat.offlineAt=null;seat.left=false;}
      } else {
        if(this.members.get(player.playerId)!==room.id) throw new Error('Bạn chưa vào bàn này.');
        if(payload.kind==='seat') {
          if(active(room.round)) throw new Error('Đợi ván kết thúc để chọn ghế.');
          const target=Number(payload.seat);
          if(!Number.isInteger(target)||target<0||target>=room.seats.length) throw new Error('Ghế không hợp lệ.');
          if(room.seats[target]&&room.seats[target].playerId!==player.playerId) throw new Error('Ghế đã có người.');
          if(index>=0)room.seats[index]=null;
          room.seats[target]={playerId:player.playerId,name:player.name,ready:false,offlineAt:null};
        } else if(payload.kind==='leave') {
          if(active(room.round)&&seat) {seat.offlineAt=this.clock();seat.ready=false;seat.left=true;}
          else if(index>=0)room.seats[index]=null;
          this.members.delete(player.playerId);
        } else if(payload.kind==='chat'||payload.kind==='emote') {
          const text=payload.kind==='chat'?QUICK_CHAT[Number(payload.message)]:['Vẫy tay','Vui vẻ','Chúc mừng'][Number(payload.message)];
          if(!text)throw new Error('Tin nhắn không hợp lệ.');
          const recent=room.chat.filter(m=>m.playerId===player.playerId&&this.clock()-m.at<2000);
          if(recent.length>=2)throw new Error('Gửi tin nhắn chậm lại nhé.');
          room.chat=[...room.chat,{playerId:player.playerId,name:player.name,text,at:this.clock()}].slice(-30);
        } else {
          if(!seat||seat.offlineAt) throw new Error('Chỉ người đang ngồi bàn được chơi.');
          if(payload.kind==='ready') {
            if(active(room.round)||room.round?.phase==='result')throw new Error('Đợi ván mới để sẵn sàng.');
            seat.ready=!!payload.ready;
          } else if(['bet','cancel','repeat'].includes(payload.kind)) await this.bet(room,player,payload,requestId);
          else if(payload.kind==='reveal') {
            if(room.game!=='bai-cao'||room.round?.phase!=='playing'||!room.round.hands[player.playerId])throw new Error('Chưa thể lật bài.');
            room.round.revealed[player.playerId]=true;
          } else if(payload.kind==='play'||payload.kind==='pass') this.play(room,player.playerId,payload);
          else throw new Error('Thao tác bàn chơi không hợp lệ.');
        }
      }
      await this.save(room);return this.view(player.playerId);
    });
  }
  async bet(room,player,payload,requestId) {
    const round=room.round;
    if(room.game==='tien-len'||!round||round.phase!=='open'||this.clock()>=round.deadline||payload.roundId!==round.id||!round.players.includes(player.playerId))throw new Error('Ván đã chốt hoặc bạn chỉ đang xem.');
    const commandKey=`${player.playerId}:${requestId}`;
    if(round.commands[commandKey]) {
      if(round.intents[commandKey]?.fingerprint!==hash(JSON.stringify(payload))) throw new Error('Yêu cầu trùng khác nội dung.');
      return;
    }
    const old=round.bets[player.playerId]||{},bets={...old};
    if(payload.kind==='cancel')for(const key of Object.keys(bets))delete bets[key];
    else if(payload.kind==='repeat') {
      if(Object.values(old).some(Boolean))throw new Error('Hủy cược hiện tại trước khi đặt lại.');
      Object.assign(bets,room.previousBets?.[player.playerId]||{});
      if(!Object.keys(bets).length)throw new Error('Chưa có mức cược ván trước.');
    } else {
      if(!CASINO_GAMES[room.game].choices.includes(payload.choice)||!CONFIG.chips.includes(payload.amount))throw new Error('Cửa hoặc chip không hợp lệ.');
      if(room.game==='bai-cao')throw new Error('Bộ Ba Kỳ Diệu dùng mức cược cố định khi sẵn sàng.');
      bets[payload.choice]=(bets[payload.choice]||0)+payload.amount;
    }
    const amount=Object.values(bets).reduce((a,b)=>a+b,0);
    if(amount>this.config.maxBet)throw new Error(`Tối đa ${this.config.maxBet} xu/ván.`);
    const key=`${player.playerId}:${requestId}`;
    if(round.commands[key])return;
    if(Object.keys(round.commands).filter(k=>k.startsWith(`${player.playerId}:`)).length>=this.config.maxRequestsPerRound)throw new Error('Đã đủ thao tác trong ván.');
    // Persist command intent before touching coins. A retry uses EXACTLY the
    // same target total even if other bets have since been added.
    round.intents||={};
    const fingerprint=hash(JSON.stringify(payload));
    if(round.intents[key]&&round.intents[key].fingerprint!==fingerprint)throw new Error('Yêu cầu trùng khác nội dung.');
    round.intents[key]||={fingerprint,bets,amount};await this.save(room);
    const intent=round.intents[key];
    if(intent.failed)throw new Error('Yêu cầu trước thất bại. Hãy thao tác lại.');
    // A failed older intent must not replace later successful bets.
    if(Object.keys(round.intents).some(k=>k.startsWith(`${player.playerId}:`)&&k!==key&&!round.commands[k]&&!round.intents[k].failed))throw new Error('Cược trước đang chờ xử lý.');
    let receipt;
    try { receipt=await this.wallet.hold(player.playerId,round.id,intent.amount,intent.bets,`bet:${requestId}`); }
    catch(error) { if(error instanceof Error) {intent.failed=true;await this.save(room);} throw error; }
    round.bets[player.playerId]=intent.bets;round.commands[key]=true;
    await this.onWallet(player.playerId,receipt);
  }
  async start(room) {
    const seats=room.seats.filter(s=>s?.ready&&!s.offlineAt);
    if(seats.length<CASINO_GAMES[room.game].minPlayers)return false;
    const now=this.clock(),id=randomUUID();
    room.round={id,ruleVersion:this.config.version,rules:copy(CASINO_GAMES[room.game]),config:copy(this.config),phase:room.game==='bai-cao'?'funding':room.game==='tien-len'?'dealing':'open',
      deadline:now+(room.game==='tien-len'?this.config.dealMs:this.config.openMs),players:seats.map(s=>s.playerId),names:Object.fromEntries(seats.map(s=>[s.playerId,s.name])),bets:{},commands:{},revealed:{}};
    await this.save(room);
    if(room.game==='bai-cao') {
      try {
        for(const seat of seats) {
          const receipt=await this.wallet.hold(seat.playerId,id,room.stake,{hand:room.stake},`cao:${id}:${seat.playerId}`);
          room.round.bets[seat.playerId]={hand:room.stake};await this.onWallet(seat.playerId,receipt);
        }
      } catch(error) {
        for(const escrow of (await this.wallet.escrows()).filter(e=>e.roundId===id)) { const receipt=await this.wallet.settle(escrow.playerId,id,escrow.amount); if(receipt)await this.onWallet(escrow.playerId,receipt); }
        room.chat.push({name:'Nhà cái',text:error instanceof Error?`Không mở ván: ${error.message}`:'Không mở ván: đang gặp lỗi xử lý. Cược đã hoàn lại.',at:now});
        room.seats.forEach(s=>{if(s)s.ready=false;});room.round=null;await this.save(room);return true;
      }
      room.round.phase='dealing';room.round.deadline=now+this.config.dealMs;
    }
    if(['bai-cao','tien-len'].includes(room.game)) {
      const deck=shuffledDeck(),size=room.game==='bai-cao'?3:13;
      room.round.hands=Object.fromEntries(seats.map(s=>[s.playerId,sortCards(deck.splice(0,size))]));
      if(room.game==='bai-cao')room.round.banker=deck.splice(0,3);
      else {
        const smallest=Math.min(...Object.values(room.round.hands).flat());
        room.round.turn=room.lastWinner&&room.round.players.includes(room.lastWinner)?room.lastWinner:room.round.players.find(p=>room.round.hands[p].includes(smallest));
        room.round.requiredFirst=room.lastWinner?null:smallest;room.round.table=null;room.round.passed=[];room.round.ranking=[];room.round.lastPlayed=null;
      }
    }
    room.seats.forEach(s=>{if(s)s.ready=false;});await this.save(room);return true;
  }
  play(room,playerId,payload,{automatic=false}={}) {
    const round=room.round;
    if(room.game!=='tien-len'||round?.phase!=='playing'||round.turn!==playerId)throw new Error('Chưa đến lượt bạn.');
    if(!automatic&&this.clock()>=round.deadline)throw new Error('Đã hết thời gian lượt.');
    const hand=round.hands[playerId];
    if(payload.kind==='pass') {
      if(!round.table)throw new Error('Người mở vòng không thể bỏ lượt.');
      round.passed.push(playerId);
    } else {
      const checked=validateTienLenPlay(hand,payload.cards,round.table,round.requiredFirst);
      if(checked.error)throw new Error(checked.error);
      round.hands[playerId]=hand.filter(card=>!payload.cards.includes(card));round.table=checked.play;
      round.lastPlayed=playerId;round.requiredFirst=null;
      if(!round.hands[playerId].length)round.ranking.push(playerId);
    }
    const remaining=round.players.filter(p=>round.hands[p].length);
    if(remaining.length<=1) {
      round.ranking.push(...remaining);room.lastWinner=round.ranking[0];
      round.result={ranking:round.ranking.map((id,i)=>({playerId:id,name:round.names[id],score:i===0?(round.players.length-1)*10:-10}))};
      for(const rank of round.result.ranking)room.scores[rank.playerId]=(room.scores[rank.playerId]||0)+rank.score;
      round.phase='result';round.deadline=this.clock()+round.config.resultMs;this.addHistory(room);return;
    }
    const canRespond=remaining.filter(p=>p!==round.lastPlayed&&!round.passed.includes(p));
    if(round.table&&!canRespond.length) {
      const oldLast=round.lastPlayed;round.table=null;round.passed=[];
      round.turn=remaining.includes(oldLast)?oldLast:this.nextPlayer(round,oldLast,remaining);
    } else round.turn=this.nextPlayer(round,playerId,canRespond.length?canRespond:remaining);
    round.deadline=this.clock()+round.config.turnMs;
  }
  nextPlayer(round,from,candidates) {
    const start=round.players.indexOf(from);
    for(let i=1;i<=round.players.length;i++){const id=round.players[(start+i)%round.players.length];if(candidates.includes(id))return id;}
    return candidates[0];
  }
  addHistory(room) {
    if(room.history.some(h=>h.id===room.round.id))return;
    room.history=[{id:room.round.id,ruleVersion:room.round.ruleVersion,at:this.clock(),result:copy(room.round.result),settlements:copy(room.round.plan||[])},...room.history].slice(0,20);
  }
  releaseDepartedSeats(room) {
    if(active(room.round))return false;
    let changed=false;
    for(let i=0;i<room.seats.length;i++) {
      const seat=room.seats[i];
      // A deliberate departure has no reconnect grace. Also recover seats left
      // by older servers that removed membership without recording departure.
      if(seat&&(seat.left||!this.members.has(seat.playerId))){room.seats[i]=null;changed=true;}
    }
    return changed;
  }
  async finishSettlement(room) {
    for(const payment of room.round.plan) {
      const receipt=await this.wallet.settle(payment.playerId,payment.roundId,payment.reward);
      if(receipt)await this.onWallet(payment.playerId,receipt);
    }
    room.previousBets=copy(room.round.bets);room.round.phase='result';room.round.deadline=this.clock()+room.round.config.resultMs;
    this.addHistory(room);this.releaseDepartedSeats(room);await this.save(room);
  }
  async tick() {
    let changed=false;
    for(const room of this.rooms.values())await this.locked(room.id,async()=>{
      const now=this.clock(),round=room.round;
      if(!active(round)&&this.releaseDepartedSeats(room)){await this.save(room);changed=true;}
      if(!active(round)) for(let i=0;i<room.seats.length;i++) {
        const seat=room.seats[i];
        if(seat?.offlineAt&&now-seat.offlineAt>=this.config.reconnectMs) {room.seats[i]=null;this.members.delete(seat.playerId);await this.save(room);changed=true;}
      }
      if(!round) {if(await this.start(room))changed=true;return;}
      if(round.phase==='result'&&now>=round.deadline) {room.round=null;await this.save(room);changed=true;return;}
      if(round.phase==='playing'&&room.game==='tien-len'&&now>=round.deadline) {
        this.play(room,round.turn,round.table?{kind:'pass'}:{kind:'play',cards:[round.hands[round.turn][0]]},{automatic:true});await this.save(room);changed=true;return;
      }
      if(round.phase==='playing'&&room.game==='bai-cao'&&(now>=round.deadline||round.players.every(p=>round.revealed[p]))) {
        round.result={banker:round.banker,players:round.players.map(p=>({playerId:p,name:round.names[p],cards:round.hands[p],...baiCaoPayout(round.hands[p],round.banker,room.stake)}))};
        round.plan=settlementPlan(room);round.phase='settling';await this.save(room);await this.finishSettlement(room);changed=true;return;
      }
      if(now<round.deadline)return;
      if(round.phase==='open') {round.phase='closed';round.deadline=now+round.config.closedMs;round.result=drawDice(room.game);}
      else if(round.phase==='closed') {round.phase='shaking';round.deadline=now+round.config.shakeMs;}
      else if(round.phase==='shaking') {round.phase='reveal';round.deadline=now+round.config.revealMs;}
      else if(round.phase==='reveal') {round.plan=settlementPlan(room);round.phase='settling';await this.save(room);await this.finishSettlement(room);changed=true;return;}
      else if(round.phase==='dealing') {round.phase='playing';round.deadline=now+(room.game==='bai-cao'?round.config.caoMs:round.config.turnMs);}
      else if(round.phase==='settling') {await this.finishSettlement(room);changed=true;return;}
      else return;
      await this.save(room);changed=true;
    });
    return changed;
  }
  async disconnect(playerId) {
    const room=this.rooms.get(this.members.get(playerId));if(!room)return;
    await this.locked(room.id,async()=>{const seat=room.seats.find(s=>s?.playerId===playerId);if(seat){seat.offlineAt=this.clock();await this.save(room);}else this.members.delete(playerId);});
  }
  async reconnect(playerId) {
    const room=this.rooms.get(this.members.get(playerId));if(!room)return;
    await this.locked(room.id,async()=>{const seat=room.seats.find(s=>s?.playerId===playerId);if(seat){seat.offlineAt=null;await this.save(room);}});
  }
  view(playerId) {
    const summaries=[...this.rooms.values()].map(room=>({id:room.id,game:room.game,name:room.system?CASINO_GAMES[room.game].name:room.name,private:room.private,stake:room.stake,seats:room.seats.length,
      occupied:room.seats.filter(Boolean).length,phase:room.round?.phase||'waiting'}));
    const room=this.rooms.get(this.members.get(playerId));
    let mine=null;
    if(room) {
      const round=room.round,publicResult=round&&['reveal','settling','result'].includes(round.phase);
      mine={...summaries.find(r=>r.id===room.id),seatList:copy(room.seats),rules:copy(round?.rules||CASINO_GAMES[room.game]),
        ruleVersion:round?.ruleVersion||this.config.version,history:copy(room.history),chat:copy(room.chat.slice(-12)),scores:copy(room.scores),
        round:round?{id:round.id,participating:round.players.includes(playerId),phase:round.phase,deadline:round.deadline,turn:round.turn,table:copy(round.table||null),requiredFirst:round.turn===playerId?round.requiredFirst:null,
          hand:copy(round.hands?.[playerId]||[]),counts:Object.fromEntries(Object.entries(round.hands||{}).map(([id,hand])=>[id,hand.length])),
          bets:copy(round.bets[playerId]||{}),totals:Object.fromEntries(CASINO_GAMES[room.game].choices.map(choice=>[choice,Object.values(round.bets).reduce((n,b)=>n+(b[choice]||0),0)])),
          result:publicResult?copy(round.result):null,revealed:copy(round.revealed),ranking:copy(round.ranking||[])}:null};
    }
    const pendingRoom=!mine?summaries.find(summary=>{const pending=this.rooms.get(summary.id);return active(pending.round)&&pending.seats.some(seat=>seat?.playerId===playerId);})||null:null;
    return {type:'casino_state',viewerId:playerId,rooms:summaries,mine,pendingRoom,serverTime:this.clock(),ruleVersion:this.config.version};
  }
}
