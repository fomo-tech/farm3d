# Image-generated HUD icons

Generated with the built-in image_gen tool as individual transparent images, then converted with cwebp to 256×256 WebP at quality 90. Subject specifications and shared art direction are in `prompts.json`. The original generated alpha is preserved; no scripted repainting or background removal is performed.

Runtime assets: `public/assets/hud/imagegen-v1/`. `HudIcon.jsx` loads this set for the existing HUD controls. Browser inspection page: `/hud-webp-preview.html`, showing each icon on pale and dark backgrounds and at 40px.

The previous rendered PNG sets remain available for comparison. HUD handlers, currency values, quest state and navigation behavior are unchanged.
