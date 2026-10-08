// Explicit gameplay semantics take precedence over translated labels.
export function contextHudIcon(action) {
  const explicit = action.iconAsset;
  if (explicit) return { asset: explicit === 'ticket' ? 'coin' : explicit === 'fishing' ? 'fishing' : explicit, mobileAsset: explicit };
  const label = action.label || '';
  if (/Câu cá/.test(label)) return { asset:'fishing', mobileAsset:'fishing' };
  if (/Mua vé|Thần Tài/.test(label)) return { asset:'coin', mobileAsset:'ticket' };
  if (/lô đất|đất nông trại/i.test(label)) return { asset:'land', mobileAsset:'land' };
  if (/cổng/.test(label)) return { asset:'gate', mobileAsset:'gate' };
  if (/Trò chuyện|Nói chuyện/.test(label)) return { asset:'chat', mobileAsset:'chat' };
  if (/Thu hoạch/.test(label)) return { asset:'basket', mobileAsset:'basket' };
  if (/Gieo hạt/.test(label)) return { asset:'seeds', mobileAsset:'seeds' };
  if (/xe/.test(label)) return { asset:'bike', mobileAsset:'bike' };
  return { asset:'hand', mobileAsset:'hand' };
}
