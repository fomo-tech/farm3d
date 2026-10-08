# Mobile/PWA HUD and rendering

- Separate portrait and landscape HUD layouts with safe-area padding on controls.
- 44 px menu/action targets, compact quest and minimap, chat and context actions in separate zones.
- Standalone/fullscreen uses layout viewport dimensions; browser tabs retain visual viewport handling for browser toolbars. Chrome iOS containment applies only to browser tabs.
- Manifest supports both orientations and matches the blue launch background.
- Default unsaved graphics quality is Auto. Phone density caps: Auto 1.6, Balanced 1.35, Ultra 2, Eco 1; 1.8 million framebuffer pixel ceiling; adaptive Auto floor 1. HUD remains CSS/native resolution. Existing saved graphics preferences remain respected.

Validation: mobile viewport/PWA VM tests, graphics resolution tests, frame-safe resize tests, HUD runtime tests; browser HUD preview checked at 390×844, 844×390 and 320×568. Screenshots use the real HUD components with a lightweight preview background. Physical iOS PWA safe areas and GPU performance still require device verification.
