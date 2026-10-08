# Raised river and lake banks

The waterfront now builds 17 earth slopes around five lakes and both sides of six river channels. Each slope rises approximately 0.5–0.7 m, transitions from damp earth to turf, and fades into the meadow. Grass blades share one merged mesh. The existing water colors are preserved.

TerrainHeightSystem samples the same accepted triangles as the rendered bank, using a cached spatial grid. Bridges, beach transitions, the Crystal Lake pier, roads, farm lots and water confluences are excluded from bank triangles.

Verification: test-shore-terrain, test-waterfront-scenery, test-water-shore-movement, test-lake-travel and test-lake-statics passed. Production build passed. Browser preview checked at low angles for the river and Lotus Lake; screenshots are in shore-terrain/. This does not replace a mobile frame-rate measurement.

Outstanding existing check: test-lake-layout reports 124 meshes against its budget of fewer than 90. That test constructs createRomanticLake and createLakeDistrict without the new waterfront banks; its resource-budget failure is separate from this implementation and was not hidden by raising the limit.
