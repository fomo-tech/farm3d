# Gameplay animation v2

## Reference research

Reviewed 13 October 2026:

- [HAEGIN's game introduction](https://hub.playtogether.haegin.kr/ja/homegame-guide/whats-the-play-together) describes a social world with minigames, fishing, pets and character customization.
- [Official Steam announcement](https://notice.haegin.kr/article/6938/English) presents expressive outfits and social activities, including fishing and collection.
- [Official fishing guide](https://help-playtogether.haegin.kr/hc/en-us/articles/1500008500742-How-can-I-Fish) establishes equipped-rod use and excludes fishing while jumping.
- The official YouTube channel linked from [Play Together's community links](https://linktr.ee/PlayTogether_Game) could not be fetched. The Steam trailer page also refused the browser connection. No frame-level timing was measured or extracted from these videos.

Design interpretation: readable silhouettes, clear preparation/contact/recovery,
relaxed idle, expressive gestures, and visible catches fit the social gameplay.
All timing curves and poses here are authored for this game's rig. They are not
copied animation assets or a claim of exact matching to Play Together.

## Runtime coverage

| Area | Upgrade |
| --- | --- |
| Idle/walk/run | Time-based settling, continuous stride, turn weight and counterrotation |
| Jump | Airborne knee tuck, balancing arms, landing compression and recovery |
| Farm | Separate anticipation/contact/recovery timing for hoe/till, seed, water, harvest and celebration |
| Livestock interaction | Feed/collect timing; contact callbacks once even on slow frames |
| Social gestures | Wave, fashion pose, heart, cheer, shy, spin; holds and eased recovery |
| Fishing | Cast/reel/catch timing, continuous reel pump, completion chaining |
| Vehicles | Blended seated/standing poses and pedaling for every existing vehicle profile |
| Multiplayer | Stride cadence from actual interpolated speed; terrain-aware airborne pose |
| Owned animals | Smoothed orbit and turning, distance-based gait, feed blend and reduced floating |
| Preview | Existing avatar preview exposes all actions, walk/run and jumping |

Existing world machinery, crops, doors, water and UI keep their independent
animations. This change upgrades the character/gameplay animation layer; it
does not redesign every decorative animation or add new gameplay actions.

## Performance and verification

The same meshes and rig are reused. Timing curves and jump state do not create
mesh or material instances. New vehicle pose history is initialized once per
mount and stored weakly. Offscreen remote rigs continue skipping animation.
FPS achievement still requires measurement on the target machine.

`node scripts/test-animation-gameplay.mjs` checks all configured actions at
15/30/60/120 FPS, finite transforms, single contact/completion, reentrant fishing
callbacks, landing recovery and mesh-count stability. Existing locomotion,
wardrobe, clothing-fit, livestock and fishing checks cover their integration.

Preview: `/avatar-preview.html?motion=run` or select an action in the preview controls.
