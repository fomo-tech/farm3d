import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { MongoClient } from 'mongodb';
import { buildFishingTelemetryReport } from './economy/fishingTelemetryReport.js';

const args=process.argv.slice(2);
const option=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const input=option('--input',null),out=resolve(option('--output','docs/fishing-measurements'));
const since=new Date(option('--since',new Date(Date.now()-7*86400000).toISOString()));
if(!Number.isFinite(since.getTime()))throw new Error('Invalid --since date');
const minimumSamples=Number(option('--minimum-samples','20'));
if(!Number.isSafeInteger(minimumSamples)||minimumSamples<1)throw new Error('Invalid sample threshold');
let events,quality={droppedEvents:0,pendingEvents:0};
if(input) {
  const loaded=JSON.parse(readFileSync(resolve(input),'utf8'));
  events=Array.isArray(loaded)?loaded:loaded.events;
  quality={...quality,...loaded.quality};
} else {
  const mongo=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017',{serverSelectionTimeoutMS:5000});
  try {
    await mongo.connect();const db=mongo.db(option('--database',process.env.MONGODB_DB||'farm_online_3d'));
    events=await db.collection('fishing_telemetry').find({at:{$gte:since.getTime()}}).sort({at:1}).limit(300001).toArray();
    if(events.length>300000)throw new Error('More than 300000 events; narrow --since to avoid a truncated report');
    const pending=await db.collection('players').aggregate([{$group:{_id:null,total:{$sum:{$size:{$ifNull:['$fishingTelemetryOutbox',[]]}}}}}]).toArray();
    const loss=await db.collection('players').aggregate([{$match:{fishingTelemetryLossAt:{$gte:since.getTime()}}},{$group:{_id:null,total:{$sum:'$fishingTelemetryDropped'}}}]).toArray();
    quality={droppedEvents:loss[0]?.total||0,pendingEvents:pending[0]?.total||0};
  } finally {await mongo.close();}
}
if(!Array.isArray(events))throw new Error('Input must contain an events array');
const report=buildFishingTelemetryReport(events,{minimumSamples,...quality});
mkdirSync(out,{recursive:true});
writeFileSync(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
const fields=['sessionId','startAt','closed','connectedMinutes','activeEstimateMinutes','durationBucket','casts','caught','escaped','cancelled','unobserved','sold','salesCoins','rodCost','baitCost','toolCost','missionCoins','netFishingCoins','baitUsed'];
writeFileSync(join(out,'sessions.csv'),[fields.join(','),...report.sessions.map(s=>fields.map(f=>s[f]??'').join(','))].join('\n')+'\n');
const profilePath=join(out,'measured-profile.json');
// Never silently apply default guesses as measured parameters.
writeFileSync(profilePath,JSON.stringify({version:1,generatedAt:report.generatedAt,quality:report.quality,profiles:report.measuredProfile?{regular:report.measuredProfile}:{}},null,2)+'\n');
const rows=report.sessions.map(s=>`| ${s.startAt} | ${s.connectedMinutes} / ${s.activeEstimateMinutes} | ${s.casts} | ${s.caught} / ${s.escaped} / ${s.unobserved} | ${s.salesCoins} | ${s.rodCost+s.baitCost+s.toolCost} | ${s.missionCoins} | ${s.netFishingCoins} |`);
writeFileSync(join(out,'report.md'),[
 '# Số đo câu cá trước mua đất','',`Thời điểm xuất: ${report.generatedAt}. ${report.uniqueEvents} bản ghi duy nhất, ${report.sessions.length} phiên kết nối.`,
 '', 'Thời gian hoạt động là ước tính từ input hợp lệ + 60 giây, không phải thời gian focus trình duyệt. Phiên reconnect tách riêng; cá bắt thuộc phiên thả câu, tiền bán thuộc phiên thanh toán.',
 '', '| Phiên bắt đầu | Phút kết nối / hoạt động ước tính | Lượt câu | Bắt / thoát / chưa rõ | Bán cá | Chi cần/mồi/dụng cụ | Mission | Xu ròng câu cá |',
 '| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: |',...rows,
 '', 'Xu ròng chỉ gồm câu cá và nhiệm vụ câu cá. Giftcode, điểm danh và nguồn khác không được suy ra từ số dư tài khoản.',
 '', '## Thông số đo được','',
 '| Thông số | Số mẫu | Giá trị |','| --- | ---: | ---: |',
 ...Object.entries(report.metrics).map(([key,m])=>`| ${key} | ${m.samples} | ${m.p50??m.value??'Chưa có'} |`),
 '', 'Các thông số thời gian dùng millisecond; tỷ lệ dùng khoảng 0–1. Độ trễ cast trước khi server nhận không đo riêng được; profile xuất đặt castOverheadMs = 0 và gộp thao tác giữa hai lượt vào betweenCastsMs.',
 '', '## Chất lượng dữ liệu','',
 `- Profile sẵn sàng: ${report.quality.calibrationReady?'Có':'Chưa; không dùng profile rỗng để mô phỏng.'}`,
 `- Số mẫu tối thiểu mỗi thông số: ${minimumSamples}.`,
 `- Phiên thiếu đầu/cuối: ${report.quality.incompleteSessions}; lượt chưa rõ kết quả: ${report.quality.unobservedCasts}; kết quả thiếu bản ghi thả câu: ${report.quality.orphanOutcomes}.`,
 `- Sự kiện bỏ do hàng đợi đầy: ${report.quality.droppedEvents}; sự kiện còn chờ lưu: ${report.quality.pendingEvents}; phiên chồng nhau: ${report.quality.overlappingSessions}.`,
 '', 'Chưa rõ kết quả được giữ riêng, không tự tính là bắt được hoặc thoát. Báo cáo rỗng có nghĩa chưa thu thập dữ liệu; không tạo số liệu mẫu để thay thế.',
 '', 'Nếu đủ mẫu: `npm run simulate:economy -- --profiles docs/fishing-measurements/measured-profile.json --output docs/economy-measured-simulation`. Chỉ profile regular được thay bằng số đo; fast/relaxed vẫn là giả định.',
].join('\n')+'\n');
console.log(JSON.stringify({output:out,events:report.uniqueEvents,sessions:report.sessions.length,quality:report.quality},null,2));
