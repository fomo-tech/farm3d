# Clothing mesh revision

Revised clothing geometry in buildHumanMesh, rather than changing the wardrobe interface.

- Continuous pleated skirt fabric replaces detached rectangular pleats; slimmer matching hem.
- Flats have a slim light sole, matching curved strap and bow attached to the upper.
- Smaller sneaker cap and platform; hoodie pocket and hood proportions reduced.
- Bomber uses contrasting light sleeves, white front accents, and a single body surface.
- Cargo, jogger and silk pants use distinct taper profiles; cargo details follow the thigh.
- Catalog colors are applied when equipping by ID without an explicit color.
- Distant clothing retains a torso silhouette.

Verified front and side views with male/female idle and running previews.
Tests: test-clothing-fit, test-fashion-boutique, test-inventory-fashion-mesh.
Screenshots: female-front.png, male-front.png, female-running.png, male-running.png.

This revises shared garment shapes. Catalog variants that share an alias still share a silhouette; it is not a unique handcrafted model for every item.

## Exposed skin repair

Added an independent skin torso beneath clothing. Croptops now reveal the waist instead of an empty gap. Sleeveless tops use a lower fabric body and separate straps with skin shoulders. Lowered the corset neckline and moved its lace/gem onto the fabric edge. Skin shares the same material and skin-tone updates as the limbs. Switching to legacy outfit presets clears tank pieces and restores the full shirt.

Visual checks: croptop-skin.png, tank-skin.png, corset-skin-running.png. Regression checks cover exposed body, shared skin material, sleeveless visibility and outfit switching for male/female/neutral avatars.

## Blazer repair

School blazer now selects the blazer silhouette instead of bomber. Removed the duplicate underlying shirt shell and matched sleeve fabric to jacket material. Shirt inset, tie, lapels and pocket square use subdivided surfaces fitted to the lathed jacket profile; outward normals keep the shirt bright. Two small front buttons replace the oversized double row. Checked male executive and female school blazer, including side running view. Regression tests cover all four catalog blazer aliases, body overlap, sleeve materials and panel normals.

## Female outfit and thumbnail repair

Fitting-room thumbnails now save and restore each mesh's local enabled state, including children of hidden wardrobe nodes. Previously, thumbnail isolation permanently disabled bodies of inactive garments; selecting an oversized hoodie later could show only sleeves. Regression tests reproduce repeated captures and confirm all four hoodie torsos survive.

Sailor collar uses fitted navy/white surfaces and a rounded red bow. Gothic skirt has a shorter independent silhouette with light trims; evening gown is longer, with un-stretched bow/waist details and no detached vertical box ribs.

## Catalog audit: 33 tops, 20 bottoms, 16 shoes

Review page: /female-fashion-review.html with group=tops, bottoms, or shoes. Screenshots: catalog-tops.png, catalog-bottoms.png, catalog-shoes.png.

Changes: independent corset color, shirt sleeves under gile, crop silhouette for K-Pop crop, removal of generic torso shells under all variants that supply their own body, and retained corset body at distant LOD. Formal/silk pants no longer carry cargo pockets. Shoes now respect catalog sole/accent colors through LOD switches. Roller skates have a chassis and four wheels per foot, geta have wooden supports, celestial sandals have narrow straps, loafers/Oxford have no doll bow, Oxford has a low silhouette, duck shoes have a broad flattened foot, and Dino slippers have three claws. Legacy outfit changes also hide previous skirts and specialized shoe parts.

Expanded capture regression to every fashion catalog item, followed by all 33 tops at all three LODs. Fit checks include every shoe color through LOD switching and the corset/skirt material isolation.

Some catalog variants still share geometry, especially patterned garments. This audit addresses missing surfaces, conflicting layers, wrong material dependencies and several mismatched silhouettes; it does not give every catalog item a uniquely modeled/textured design.
