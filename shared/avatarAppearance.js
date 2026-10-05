export const OUTFIT_COLORS = Object.freeze({ starter: '#f8fafc', farmer: '#f1b445', rose: '#e87994', lake: '#5f91c8', royal: '#8a72b8' });

// Identical construction defaults on local and remote clients.
export function avatarAppearance(outfit = 'starter', customization = null) {
  const outfitId = Object.hasOwn(OUTFIT_COLORS, outfit) ? outfit : 'starter';
  return {
    outfitId, outfitColor: OUTFIT_COLORS[outfitId], customization,
    skinColor: customization?.skinColor || '#e6b08f',
    hairColor: customization?.hairColor || '#76503b',
    overallsColor: '#2563eb', bootsColor: '#f7f0e6', hasHat: false,
  };
}
