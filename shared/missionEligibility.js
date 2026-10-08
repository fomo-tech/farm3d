// Shared presentation rules. The server supplies ownership from its database.
export function missionAvailability(mission, progress = {}, context = {}) {
  const requirements = mission.requirements || [];
  for (const requirement of requirements) {
    if (requirement === 'land' && !(context.hasLand ?? (progress.unlockedPlots > 0 || progress.unlockedTileKeys?.length > 0))) return 'Bạn cần sở hữu đất trước.';
    if (requirement === 'onboarding' && !progress.onboarding?.completed) return 'Hãy hoàn thành hướng dẫn tân thủ trước.';
    if (requirement === 'fishingIntro' && !(progress.fishing?.stats?.totalSold > 0 || progress.fishing?.lastSale?.count > 0)) return 'Hãy câu và bán cá đầu tiên trước.';
    if (requirement === 'rod' && !progress.fishing?.ownedRods?.length) return 'Bạn cần có cần câu trước.';
    if (requirement === 'livestock' && !(context.hasLivestock ?? Object.values(progress.animalPens || {}).some(Boolean))) return 'Bạn cần có vật nuôi trước.';
    if (!['land', 'onboarding', 'rod', 'livestock', 'fishingIntro'].includes(requirement)) return 'Điều kiện nhiệm vụ không hợp lệ.';
  }
  return null;
}
