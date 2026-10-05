// Only advance after an authoritative server snapshot; never auto-place bets.
export function nextQuickPlayAction(room, viewerId) {
  if (!room) return null;
  const ownSeat = room.seatList?.find(seat => seat?.playerId === viewerId);
  if (ownSeat?.ready || room.round?.participating) return { kind: 'complete' };
  if (room.round && room.round.phase !== 'waiting') return null;
  if (ownSeat) return ownSeat.ready ? { kind: 'complete' } : { kind: 'ready', ready: true, roomId: room.id };
  const seat = room.seatList?.findIndex(value => !value);
  return seat >= 0 ? { kind: 'seat', seat, roomId: room.id } : { kind: 'full' };
}
