// Land development tuning. Imported by server, HUD and world geometry.
function freeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') freeze(child);
  return Object.freeze(value);
}

export function validateLandExpansionConfig(config) {
  const integer = (n, min = 1) => Number.isSafeInteger(n) && n >= min;
  if (!integer(config.version) || !integer(config.columns) || !integer(config.rows)) throw new Error('Land expansion: invalid grid');
  if (!config.initialTiles?.length || new Set(config.initialTiles).size !== config.initialTiles.length || config.initialTiles.some(key => !isFarmTileKey(key, config))) throw new Error('Land expansion: invalid initial tiles');
  if (typeof config.requireAdjacent !== 'boolean' || !integer(config.reserveCoins, 0)) throw new Error('Land expansion: invalid policy');
  let previous = config.initialTiles.length;
  for (const tier of config.tiers) {
    if (!integer(tier.through) || tier.through <= previous || !integer(tier.cost) || !integer(tier.level)) throw new Error('Land expansion: invalid tier');
    previous = tier.through;
  }
  if (previous !== config.columns * config.rows) throw new Error('Land expansion: tiers must cover grid');
  if (!integer(config.legacy.columns) || !integer(config.legacy.rows) || config.legacy.columns > config.columns || config.legacy.rows > config.rows) throw new Error('Land expansion: invalid legacy grid');
  if (!integer(config.visuals.spacingX / .1) || !Number.isFinite(config.visuals.spacingZ) || config.visuals.spacingZ <= 0 || !Number.isFinite(config.visuals.centerZ) || !/^#[\da-f]{6}$/i.test(config.visuals.lockedColor)) throw new Error('Land expansion: invalid visuals');
  return config;
}

export const LAND_EXPANSION_CONFIG = freeze(validateLandExpansionConfig({
  version: 3,
  columns: 6,
  rows: 4,
  initialTiles: ['0:0', '1:0', '2:0', '3:0'],
  requireAdjacent: true, // Orthogonal neighbours, not diagonals.
  reserveCoins: 0, // Optional minimum wallet balance after clearing a tile.
  tiers: [
    { through: 5, cost: 2500, level: 1 },
    { through: 6, cost: 6500, level: 1 },
    { through: 7, cost: 7000, level: 1 },
    { through: 8, cost: 8000, level: 1 },
    { through: 12, cost: 20000, level: 2 },
    { through: 18, cost: 60000, level: 4 },
    { through: 24, cost: 120000, level: 6 },
  ],
  // Do not edit after release: old saves used a row-major 4 x 3 grid.
  legacy: { columns: 4, rows: 3 },
  visuals: { spacingX: 2.1, spacingZ: 1.5, centerZ: -2.8, lockedColor: '#76bd37' },
}));

export function isFarmTileKey(key, config = LAND_EXPANSION_CONFIG) {
  if (typeof key !== 'string' || !/^\d+:\d+$/.test(key)) return false;
  const [column, row] = key.split(':').map(Number);
  return key === `${column}:${row}` && column < config.columns && row < config.rows;
}

export function farmTileKeys(config = LAND_EXPANSION_CONFIG) {
  return Array.from({ length: config.rows }, (_, row) => Array.from({ length: config.columns }, (_, column) => `${column}:${row}`)).flat();
}

export function unlockedFarmTiles(progress = {}, config = LAND_EXPANSION_CONFIG) {
  if (Array.isArray(progress.unlockedTileKeys)) return [...new Set(progress.unlockedTileKeys.filter(key => isFarmTileKey(key, config)))];
  const count = Math.max(0, Math.floor(Number(progress.unlockedPlots) || 0));
  const legacyTotal = config.legacy.columns * config.legacy.rows;
  // Preserve purchased expansion entitlements; old geometry only rendered 12.
  if (count > legacyTotal) return farmTileKeys(config);
  return Array.from({ length: Math.min(count, legacyTotal) }, (_, index) => `${index % config.legacy.columns}:${Math.floor(index / config.legacy.columns)}`);
}

export function normalizeLandProgress(progress, config = LAND_EXPANSION_CONFIG) {
  progress.unlockedTileKeys = unlockedFarmTiles(progress, config);
  progress.unlockedPlots = progress.unlockedTileKeys.length;
  progress.landExpansionVersion = config.version;
  return progress;
}

export function landUnlockQuote(progress, tileKey, config = LAND_EXPANSION_CONFIG) {
  const unlocked = unlockedFarmTiles(progress, config);
  const tier = config.tiers.find(t => unlocked.length < t.through);
  const cost = tier?.cost || 0;
  const level = tier?.level || 1;
  let error = null;
  if (!isFarmTileKey(tileKey, config)) error = 'Ô đất không hợp lệ.';
  else if (unlocked.includes(tileKey)) error = 'Ô đất đã được khai hoang.';
  else if (!unlocked.length) error = 'Bạn cần sở hữu lô đất trước.';
  else if (!tier) error = 'Lô đất đã được khai hoang toàn bộ.';
  else if (config.requireAdjacent && !unlocked.some(key => {
    const [x, y] = key.split(':').map(Number);
    const [column, row] = tileKey.split(':').map(Number);
    return Math.abs(x - column) + Math.abs(y - row) === 1;
  })) error = 'Hãy mở ô liền kề với đất đã khai hoang.';
  else if ((progress.level || 1) < level) error = `Cần cấp ${level} để khai hoang ô này.`;
  else if (!Number.isSafeInteger(progress.coins) || progress.coins < cost + config.reserveCoins) error = `Cần ${cost} xu${config.reserveCoins ? ` và giữ lại ${config.reserveCoins} xu vốn` : ''}.`;
  return { tileKey, cost, level, error, unlocked: unlocked.includes(tileKey) };
}

export function unlockFarmTile(progress, tileKey, config = LAND_EXPANSION_CONFIG) {
  const quote = landUnlockQuote(progress, tileKey, config);
  if (quote.error) throw new Error(quote.error);
  normalizeLandProgress(progress, config);
  progress.coins -= quote.cost;
  progress.unlockedTileKeys.push(tileKey);
  progress.unlockedPlots = progress.unlockedTileKeys.length;
  return { tileKey, cost: quote.cost, unlockedPlots: progress.unlockedPlots };
}
