# Game-wide upgrade audit — 2026-10-12

## Implemented
- Shared cream, mint, yellow and coral treatment for HUD, phone, inventory, fashion, map, shops, missions, profile, guide and settings.
- Shared phone app component in production and preview; raster icons and bounded mobile/landscape layout.
- Compact seed catalogue, fishing catalogue, market offers and vehicle dealer; buying actions stay visible at small sizes.
- Settings separates gameplay options from account options.
- Fishing shop gear portraits render real object meshes into cached bitmap thumbnails; character hairstyles use mesh portraits too.
- Plaza architecture uses warmer, brighter shared materials. Rendering enables FXAA when MSAA is unavailable.

## Verification
- Production build, asset validation, farm layout and road connectivity passed.
- Rendering, landscape, app bindings, fashion and fishing configuration checks passed.
- Mission unit and isolated server tests passed.
- Real FarmWorld preview completed eight walking segments, returning from all four directions. Boot playable: 3190ms; scenery complete: 4891ms on this machine, not a general performance guarantee.
- Supplies layout measured at 390×844, 844×390 and 1280×800. Page height equals viewport; purchase action inside dialog (landscape bottom 304px, dialog bottom 374px).
- UI screenshots are component previews; world facade screenshot uses the actual world builder. No user character was submitted during testing.

## Remaining issues
- New-player journey simulation still fails expected land expansion milestones after correcting product-capacity counting. Economy progression requires separate investigation; all tests are not passing.
- Existing fallback character art and some legacy interface icons still use SVG. World models and the complete asset library have not been replaced.
- This is a broad interface/rendering upgrade, not a complete rebuild of every game system or an exact reproduction of Play Together.
