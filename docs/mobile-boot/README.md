# Mobile boot optimization

Covered loading frames allow 12ms for construction instead of 3ms on mobile. The budget falls to 3ms for the requested first frame and 1ms after mobile gameplay starts. Desktop gameplay remains at 2.5ms.

On mobile, waterfront decoration is scheduled after onReady; water surfaces, bridges and water collision remain prerequisites. Bank strips and stone courses yield between batches rather than building all shoreline geometry in one step. Shore texture/material disposal is registered before the first yield so closing the world during construction releases resources.

The local mobile-bundled middleware caches content-hashed files immutably while revalidating HTML. This affects local bundled serving; production cache/compression headers are controlled by the VPS web server.

Verification: test-boot-construction, test-shore-terrain, test-waterfront-scenery, test-water-landscape (including deferred scenery and usable collisions), test-water-shore-movement and test-mobile-build-cache passed. Production build succeeded.

Browser comparison: isolated performance.html, desktop Chrome using mobile viewport/profile and warm local assets. Former 3ms construction budget: 19,437ms; new 12ms budget: 3,239ms. Both runs used the new deferred scenery path, so this comparison isolates budget behavior, not all changes. The sample is not a physical-phone or cold-network measurement. It excludes downloading/parsing initial JS. Exact counters are in budget-comparison.json; screenshot is optimized.png. Temporary viewport override was reset.

The isolated performance page accepts bootBudget=3 to reproduce the budget comparison without writing player accounts. Normal gameplay does not read this parameter.
