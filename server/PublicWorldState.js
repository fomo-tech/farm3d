// Public wire schema: additions to internal client state must never be broadcast
// automatically. Nested objects follow the same rule as the top-level player.
const PLAYER_FIELDS = Object.freeze([
  'playerId', 'name', 'channelId', 'farmId', 'villageId', 'roomId',
  'x', 'y', 'z', 'rotation', 'venue', 'vehicle', 'outfit', 'homeTier',
]);
const CUSTOMIZATION_FIELDS = Object.freeze([
  'gender', 'skinTone', 'skinColor', 'hairStyle', 'hairColor',
  'topId', 'topStyle', 'topColor', 'bottomId', 'bottomStyle', 'bottomColor',
  'shoeId', 'shoeStyle', 'shoeColor', 'ears', 'earType', 'eyeType',
  'eyeColor', 'noseType', 'mouthType', 'blushType',
]);
const FISHING_FIELDS = Object.freeze([
  'id', 'phase', 'castDistance', 'biteAt', 'expiresAt', 'hookedAt',
  'pull', 'tension', 'shadowSize', 'shadowShape',
]);
const FIGHT_FIELDS = Object.freeze([
  'pullRate', 'rushRate', 'restMs', 'rushMs', 'slackGraceMs',
  'warningMs', 'cruiseMs', 'direction',
]);

function publicScalars(source, fields) {
  const result = {};
  for (const field of fields) {
    if (!Object.hasOwn(source || {}, field)) continue;
    const value = source[field];
    if (value === null || typeof value === 'string' || typeof value === 'boolean' ||
      (typeof value === 'number' && Number.isFinite(value))) result[field] = value;
  }
  return result;
}

export function publicWorldPlayer(client, now = Date.now()) {
  const player = publicScalars(client, PLAYER_FIELDS);
  player.customization = client.customization
    ? publicScalars(client.customization, CUSTOMIZATION_FIELDS) : null;
  const fishing = client.fishing;
  player.fishing = fishing?.expiresAt > now ? {
    ...publicScalars(fishing, FISHING_FIELDS),
    target: fishing.target ? publicScalars(fishing.target, ['x', 'y', 'z']) : null,
    fightProfile: fishing.fightProfile ? publicScalars(fishing.fightProfile, FIGHT_FIELDS) : null,
  } : null;
  return player;
}
