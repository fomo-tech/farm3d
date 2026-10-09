// Ordered WebSocket transport: each connection starts with an empty baseline.
export function applyWorldDelta(state, message) {
  for (const id of message.removed || []) state.delete(id);
  for (const player of message.players || []) state.set(player.playerId, player);
  for (const [id, x, y, z, rotation] of message.moves || []) {
    const player = state.get(id);
    if (player) state.set(id, { ...player, x, y, z, rotation });
  }
  return [...state.values()];
}
