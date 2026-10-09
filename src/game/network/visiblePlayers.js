// Keep network presence complete while bounding expensive 3D avatar work.
export function selectVisiblePlayers(players, position, existing = new Map(), limit = 32) {
  const x = position?.x || 0, z = position?.z || 0;
  const score = player => Math.hypot(player.x - x, player.z - z) - (existing.has(player.playerId) ? 4 : 0);
  return players.filter(p => Number.isFinite(p.x) && Number.isFinite(p.z))
    .map(player => ({ player, score: score(player) }))
    .sort((a, b) => a.score - b.score || a.player.playerId.localeCompare(b.player.playerId))
    .slice(0, limit).map(item => item.player);
}
