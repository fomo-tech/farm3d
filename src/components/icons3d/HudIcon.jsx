const MOBILE_ASSETS = new Set(['backpack','wardrobe','camera','phone','quest','coin','gem','chat','bike','sprint','jump','land','fishing','gate','ticket','hand']);
export function HudIcon({ asset, size = 32, className = '', alt = '', mobile = false, mobileAsset = asset }) {
  const icon = <img className={`hud-object-icon ${className}`} src={`/assets/hud/farm-v2/${asset}.webp`} width={size} height={size} alt={alt} draggable="false" decoding="async" />;
  if (!mobile || !MOBILE_ASSETS.has(mobileAsset)) return icon;
  return <picture className="hud-responsive-icon" style={{display:'contents'}}><source media="(max-width:700px), (max-width:1100px) and (max-height:600px)" srcSet={`/assets/hud/mobile-v1/${mobileAsset}.webp`} type="image/webp" />{icon}</picture>;
}
