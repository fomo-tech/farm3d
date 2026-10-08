# Oversized river birds

The visible giant black wings came from `river-stork-*` and `vensong-stork-*`, confirmed by ray picking the running game's upper-right sky at player position (47.6, 24.4). They were not the separate procedural seagulls at the beach.

`public/models/animals/stork.glb` has a 196.8-unit wingspan and no node scale. Placements used 1.2–1.25 directly. `modelUnitScale` in AssetRegistry converts this particular centimetre-authored model to metres before ModelAssetManager instantiates/freezes transforms. Final wingspans are 2.36–2.46 metres; all other model scales are unchanged.

Regression tests inspect the real source GLB, morph target extremes, ID/path parity and production instancing with source dimensions. Browser verification uses the original account/location and low camera angles. Temporary ray-picking instrumentation was removed after diagnosis.
