# Root-cause fix: near foliage GPU matrices overwritten between chunks

Confirmed in Babylon source: thinInstanceSetBuffer('matrix') creates world0–3
vertex attributes via Mesh.setVerticesBuffer on the mesh Geometry. Mesh.clone
shares Geometry by default. Detailed foliage clones consequently shared writable
world-matrix GPU attributes: constructing a different chunk replaced the first
chunk's rendered placements, while CPU thinInstanceCount/bounds still looked valid.
Separate LOD meshes were unaffected. Counting enabled meshes could not catch this.

Fix: mesh.makeGeometryUnique() immediately after cloning each detailed prototype,
BEFORE setting thin-instance buffers. Material sharing and chunk cache remain.
No original game assets were removed.

Regression test test-foliage-buffer-isolation.mjs failed before the change.
It now verifies geometry isolation, unchanged first-chunk world attributes after
building another chunk, unchanged buffers after evicting that chunk, and an
unmodified source prototype. Added to npm run test:scenery-streaming.
Existing streaming suites and real-geometry camera test pass. Build passes.

Browser: fixed build FarmWorld-0996194c.js, preview port 4180, Ultra1280x720,
72-second route starting -69,122 with continuous camera orbit; 13 transitions
and return to the same chunk. Completed, no fatal failures, no gaps >1000ms.
Largest frame gap 84ms; largest long CPU task 85ms. Final FPS22, not a 60FPS claim.
Final foliage: 4245 placements, 383 enabled detailed meshes, 541 visible LOD
batches, missingRepresentations0, pending0.
Development attempt reloaded during testing and is NOT counted as acceptance.
This verifies the specific GPU-buffer corruption and bounded route, not full
15-minute or multiplayer performance acceptance.

Screenshot: foliage-gpu-isolation-2026-10-04.png.
