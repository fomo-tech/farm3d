# Fashion boutique redesign QA

Implemented in the existing FashionBoutiqueModal used by the game. The isolated
fashion-preview.html page uses mock currency and ownership, never the online account.

- Cream / sky-blue / navy theme, amber checkout, green selection. Scoped CSS prevents
  the old pink rules from overriding the redesign.
- Full-body and face camera targets updated for the current avatar proportions.
- ResizeObserver handles container resizing; native DPR is capped at 2.
- One preview engine per mounted modal, no engine recreation on category changes.
- Real avatar/item thumbnails captured as 160×160 WebP, queued one task at a time
  and cached in memory across modal reopenings. All previews restore customization,
  camera target, radius, rotation and viewport after capture.
- Hair, clothing, shoes, gender, facial features and full sets use mesh thumbnails.

Browser checks on 2026-10-04:

- Seven hair thumbnails: all WebP, seven distinct images; largest approximately 2.6 KB.
- With 180 mock coins, the 260-coin hair selection is disabled and shows missing 80.
- Undo restores the equipped selection and disables checkout.
- Buying the 150-coin hair leaves 30 coins; reopening shows owned and equipped.
- Trying the free basic tank top enables the free equip action.
- Desktop two-column and narrow stacked layout inspected visually; narrow card
  clientWidth and scrollWidth match (no horizontal card overflow).
- Isolated preview measurement: maximum observed gap 17ms, initial long task 53ms.
  This is not a full-world online performance benchmark.
- npm run test:fashion passes; production build passes (existing large-chunk warnings).

The redesign uses the project's own models, not proprietary Play Together assets.
No claim of pixel-identical reproduction or complete elimination of full-world stalls.
