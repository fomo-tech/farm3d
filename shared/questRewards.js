import {ECONOMY_REWARD_CONFIG} from './economyRewardConfig.js';
export function claimLegacyQuest(progress,id) {
 const quest=Object.hasOwn(ECONOMY_REWARD_CONFIG.quests,id)?ECONOMY_REWARD_CONFIG.quests[id]:null;
 const stat=quest?progress.stats?.[quest.stat]:null;
 if(!quest||progress.claimedQuests?.includes(id)||!Number.isSafeInteger(stat)||stat<quest.goal)return 'Nhiệm vụ chưa hoàn thành.';
 progress.coins+=quest.coins;progress.xp+=quest.xp;progress.claimedQuests=[...(progress.claimedQuests||[]),id];return null;
}
