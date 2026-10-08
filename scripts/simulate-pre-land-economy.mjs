import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { CURRENT_POLICY, TRIAL_POLICY, PLAY_PROFILES, rewardCatalog, simulatePreLand, summarizeRuns } from './economy/preLandSimulation.js';
import { FISHING_CONFIG } from '../shared/fishingConfig.js';
import { ECONOMY_REWARD_CONFIG } from '../shared/economyRewardConfig.js';
import { LAND_CONFIG } from '../shared/landConfig.js';

const args=process.argv.slice(2);
function option(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const samples=Number(option('--seeds','32')),sessions=Number(option('--sessions','8'));
if(!Number.isSafeInteger(samples)||samples<1||samples>1000||!Number.isSafeInteger(sessions)||sessions<1||sessions>28)throw new Error('Use 1–1000 seeds and 1–28 sessions');
const out=resolve(option('--output','docs/economy-simulation'));
const profileFile=option('--profiles',null);
let measuredProfiles={};
if(profileFile){
 const loaded=JSON.parse(readFileSync(resolve(profileFile),'utf8'));
 if(!loaded.quality?.calibrationReady || !loaded.profiles || !Object.keys(loaded.profiles).length)throw new Error('Measured profile is not ready: collect enough complete sessions first');
 measuredProfiles=loaded.profiles;
 if(Object.keys(measuredProfiles).some(key=>!Object.hasOwn(PLAY_PROFILES,key)))throw new Error('Unknown measured profile');
 for(const profile of Object.values(measuredProfiles))if(Object.keys(profile).some(key=>!Object.hasOwn(PLAY_PROFILES.regular,key)))throw new Error('Unknown profile parameter');
}
const variants=[
  {policy:CURRENT_POLICY,useCodes:false,label:'current-no-codes'},
  {policy:CURRENT_POLICY,useCodes:true,label:'current-all-codes'},
  {policy:TRIAL_POLICY,useCodes:false,label:'trial-no-codes'},
  {policy:TRIAL_POLICY,useCodes:true,label:'trial-future-codes'},
];
const rows=[];
for(const variant of variants)for(const profile of Object.keys(PLAY_PROFILES))for(const sessionMinutes of [15,30,60])for(const baitId of [null,...Object.keys(FISHING_CONFIG.baits)]){
 const runs=Array.from({length:samples},(_,index)=>simulatePreLand({seed:index+1,sessions,profile,sessionMinutes,baitId,policy:variant.policy,useCodes:variant.useCodes,measuredProfiles}));
 rows.push({variant:variant.label,profile,sessionMinutes,baitId,...summarizeRuns(runs)});
}
// Existing issued codes are not reduced by a hypothetical future reward policy.
const legacyPolicy={...TRIAL_POLICY,id:'trial-existing-codes',codes:CURRENT_POLICY.codes};
for(const sessionMinutes of [15,30,60]){
 const runs=Array.from({length:samples},(_,index)=>simulatePreLand({seed:index+1,sessions,profile:'regular',sessionMinutes,policy:legacyPolicy,useCodes:true,measuredProfiles}));
 rows.push({variant:'trial-existing-codes',profile:'regular',sessionMinutes,baitId:null,...summarizeRuns(runs)});
}
const example=simulatePreLand({seed:1,sessions:4,measuredProfiles});
const catalog=rewardCatalog();
const result={version:1,date:'2026-10-06',samples,sessions,startAt:'2026-10-06T09:00:00+07:00',
  caveats:[
    'Thời gian và tỷ lệ thành công là giả định, chưa đo telemetry; các phân vị chỉ thể hiện biến động trong mô hình.',
    'Hai buổi mỗi ngày lúc 09:00/19:00 Việt Nam; điểm danh giữ giờ đổi ngày UTC như server hiện tại.',
    'Sau mốc đủ tiền mua đất, mô hình tiếp tục câu cá để so sánh dòng tiền; số dư những buổi sau không phải nông trại sau khi mua.',
    'Phiên câu chưa xong khi hết buổi mất mồi và không nhận cá; cá, mồi dư và tiến độ đi lại được giữ; không tạo thu nhập offline.',
    'Xu luôn nguyên; bán cả thùng dùng trọng lượng trung bình và cách làm tròn của server; cá chưa bán không được tính là xu mua đất.',
    'Mua cần trúc một lần, giữ thùng 10 con; chưa nâng cần/thùng. Không tính hao độ bền vì server chưa áp cơ chế này.',
    'Chỉ xét lô rẻ nhất. Chưa mô phỏng lô cao cấp, phí dịch chuyển nhanh, chiến lược đơn NPC, casino hoặc việc nhờ người chơi khác.',
    'Giá lô cao cấp và code đã phát hành cần chính sách chuyển tiếp riêng. Phương án thử chỉ chạy offline.',
  ],
  sources:{rewardsVersion:ECONOMY_REWARD_CONFIG.version,fishingVersion:FISHING_CONFIG.version,landConfig:LAND_CONFIG},
  profileSource:profileFile || 'assumed',profiles:Object.fromEntries(Object.entries(PLAY_PROFILES).map(([key,value])=>[key,{...value,...measuredProfiles[key]}])),policies:[CURRENT_POLICY,TRIAL_POLICY,legacyPolicy],rewardCatalog:catalog,rows,example};
mkdirSync(out,{recursive:true});
writeFileSync(join(out,'results.json'),JSON.stringify(result,null,2)+'\n');
const fields=['variant','profile','sessionMinutes','baitId','samples','reached','reachedFraction','p10','p50','p90','sessionAtPurchaseP50','walletAfterLandP50','reserveActiveMinutesP50','firstSessionNetP50','finalCoinsP50'];
const csv=[fields.join(','),...rows.map(r=>fields.map(key=>String((['p10','p50','p90'].includes(key)?r.activeMinutes[key]:r[key])??'')).join(','))].join('\n');
writeFileSync(join(out,'summary.csv'),csv+'\n');
const time=r=>r.activeMinutes.p50===null?'Chưa đạt':r.activeMinutes.p50.toFixed(1);
const basic=rows.filter(r=>r.baitId===null&&r.profile==='regular');
const lines=[
 '# Mô phỏng kinh tế trước mua đất — 06/10/2026','',
 `Chạy ${samples} seed cho mỗi kịch bản, ${sessions} buổi/seed, hai buổi mỗi ngày lúc 09:00 và 19:00 Việt Nam. Nguồn thông số: ${profileFile || 'giả định'}. Kết quả vẫn là mô hình, không phải phiên chơi thật.`,
 '', '## Luật và phạm vi', '',
 ...result.caveats.map(c=>`- ${c}`),
 '', '## Giả định thao tác', '',
 '| Kiểu chơi | Đi quầy → bờ lần đầu | Đi mỗi chiều khi bán | Thao tác cast | Nghỉ/thao tác giữa lượt | Hook thành công | Kéo cá hiếm thành công |',
 '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
 ...Object.entries(result.profiles).map(([id,p])=>`| ${id} | ${p.initialTravelMs/1000}s | ${p.returnTravelMs/1000}s | ${p.castOverheadMs/1000}s | ${p.betweenCastsMs/1000}s | ${Math.round(p.hookSuccess*100)}% | ${Math.round(p.rareFightSuccess*100)}% |`),
 '', 'Thời gian cắn câu lấy từ config; cá hiếm chạy chính luật tension/pull server với chiến lược thao tác giả định. Tỷ lệ kéo thành công là giả định chọn chiến lược tốt hoặc thao tác sai, không thay xác suất của server.',
 '', '## Mốc mua lô — chơi thông thường, không mồi', '',
 '| Phương án | Phút/buổi | P10/P50/P90 phút chơi tới đủ xu | Buổi mua P50 | Đạt trong mô phỏng | Vốn còn P50 |',
 '| --- | ---: | --- | ---: | ---: | ---: |',
 ...basic.map(r=>`| ${r.variant} | ${r.sessionMinutes} | ${r.activeMinutes.p10??'—'} / ${time(r)} / ${r.activeMinutes.p90??'—'} | ${r.sessionAtPurchaseP50??'—'} | ${r.reached}/${r.samples} | ${r.walletAfterLandP50??'—'} |`),
 '', 'P10/P50/P90 chỉ tính những lượt đã đạt; luôn xem cùng tỷ lệ đạt để tránh đọc sai kịch bản chưa đủ thời gian. Mốc 0 phút là mua bằng thưởng ban đầu, trước mua cần câu.',
 '', '## Độ nhạy tốc độ chơi — buổi 30 phút, không mồi', '',
 '| Phương án | Kiểu chơi | P50 phút tới đủ xu | P90 | Buổi mua P50 | Đạt |',
 '| --- | --- | ---: | ---: | ---: | ---: |',
 ...rows.filter(r=>r.baitId===null&&r.sessionMinutes===30).map(r=>`| ${r.variant} | ${r.profile} | ${time(r)} | ${r.activeMinutes.p90??'—'} | ${r.sessionAtPurchaseP50??'—'} | ${r.reached}/${r.samples} |`),
 '', '## Mồi — hiện tại, buổi 30 phút, không giftcode', '',
 '| Mồi | P50 phút tới đủ xu | Xu ròng buổi đầu P50 | Cá bắt TB toàn kỳ | Cá thoát TB |',
 '| --- | ---: | ---: | ---: | ---: |',
 ...rows.filter(r=>r.variant==='current-no-codes'&&r.profile==='regular'&&r.sessionMinutes===30).map(r=>`| ${r.baitId??'Không mồi'} | ${time(r)} | ${r.firstSessionNetP50} | ${r.caughtMean} | ${r.escapedMean} |`),
 '', 'Mua mồi theo gói nguyên, trừ tiền cả lần cá thoát; khi thiếu vốn thì câu không mồi cho tới đủ tiền bổ sung. So sánh này giữ thùng 10 và cần trúc. Kịch bản mồi có thêm đi lại mua mồi khi hết.',
 '', '## Ngân sách thưởng hiện hành', '',
 '| Nguồn | Xu | Có thể dùng trước mua đất |', '| --- | ---: | --- |',
 `| Ban đầu | ${catalog.totals.initial} | Có |`,
 `| Toàn bộ code đang bật | ${catalog.totals.activeCodes} | Có, một lần |`,
 `| Điểm danh đủ 7 ngày | ${catalog.totals.attendanceWeek} | Có, theo ngày |`,
 `| Nhiệm vụ câu cá | ${catalog.totals.fishingOneTime} | Có, khi đủ điều kiện |`,
 `| Hướng dẫn nông trại | ${catalog.totals.onboardingOneTime} | Sau mua/hoàn thành hướng dẫn |`,
 `| Quest cũ | ${catalog.totals.legacyOneTime} | Cần hành động nông trại |`,
 `| Chính tuyến | ${catalog.totals.mainOneTime} | Cần hoàn thành hướng dẫn |`,
 `| Daily nông trại mỗi ngày | ${catalog.totals.dailyFarm} | Cần hoàn thành hướng dẫn |`,
 '', 'Đơn hàng nằm trong catalog nhưng cần tiêu nông sản nên không cộng như thưởng miễn phí. Trước mua đất, daily tưới cây vẫn bị điều kiện hoàn thành hướng dẫn chặn dù có thể giúp tưới vườn người khác.',
 '', '## Ví dụ dòng tiền từng buổi — seed 1, hiện tại, 30 phút, không code', '',
 '| Buổi | Xu đầu | Bán cá | Điểm danh | Mission cá | Chi cần/mồi | Xu cuối | Cá chưa bán |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
 ...example.sessionsDetail.map(s=>`| ${s.session} | ${s.startingCoins} | ${s.cashflow['fish-sale']||0} | ${s.cashflow.attendance||0} | ${s.cashflow['fishing-mission']||0} | ${(s.cashflow.rod||0)+(s.cashflow.bait||0)} | ${s.endingCoins} | ${s.unsoldFish} |`),
 '', '## Phương án thử và điều kiện áp dụng', '',
 `Phương án offline: lô rẻ nhất ${TRIAL_POLICY.landPrice.toLocaleString('vi-VN')} xu; ngân sách code phát hành mới tổng 300 xu; điểm danh [${TRIAL_POLICY.attendance.join(', ')}] (1.220 xu/7 ngày). Giữ giá cá và chu kỳ câu để đo tác động độc lập. Đây là một phương án thử, chưa thay config game.`,
 '', 'Không giảm giá trị code đã phát hành hoặc thu hồi xu đã nhận. Hàng trial-existing-codes mô phỏng giữ nguyên tổng code cũ khi áp giá lô thử, để thấy ảnh hưởng chuyển tiếp. Không coi việc đổi giá lô riêng là cân xong: nghề trước mua, nội dung buổi đầu, giá khai hoang và recipe vẫn cần tiếp tục.',
 '', 'Mục tiêu kiểm tra chính: regular, buổi 30 phút, không mồi đạt P50 trong 60–120 phút và khoảng buổi 2–4; người dùng code tương lai không mua ngay. Fast/relaxed là độ nhạy, không ép mọi người cùng thời gian.',
 '', 'Mốc an toàn cộng 20 xu vốn (4 hạt cà rốt) được báo riêng trong JSON/CSV. Hướng dẫn cấp 50 xu + 3 hạt chỉ được dự báo sau mua, không cộng vào ví trước mua. Thời gian nhận hướng dẫn và vụ đầu chưa mô phỏng ở bước này.',
 '', '## Bước tiếp', '',
 '1. Đo thời gian di chuyển tới quầy/bờ, số giây giữa cast, hook thành công và thời gian bán ở phiên chơi thật.',
 '2. Thay các giả định profile bằng số đo rồi chạy lại cùng seed; thử độ nhạy quanh giá lô và ngân sách thưởng.',
 '3. Xây nhiệm vụ trước mua đất để người chơi không chỉ lặp câu cá 60–120 phút.',
 '4. Sau khi đường mua lô ổn định, mở rộng simulator sang sản xuất 4 ô và tiến trình khai hoang.',
 '', 'Lệnh chạy: `npm run simulate:economy -- --seeds 32 --sessions 8`. Có thể tăng seed tới 1.000; `--output` chọn thư mục kết quả. Không kết nối MongoDB hoặc sửa ví/config cân bằng của game.',
];
writeFileSync(join(out,'report.md'),lines.join('\n')+'\n');
console.log(JSON.stringify({output:out,scenarios:rows.length,samples,sessions,baseline:basic.map(r=>({variant:r.variant,minutes:r.sessionMinutes,p50:r.activeMinutes.p50,p90:r.activeMinutes.p90,session:r.sessionAtPurchaseP50,reached:r.reached}))},null,2));
