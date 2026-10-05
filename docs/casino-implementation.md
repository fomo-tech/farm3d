# Casino — implementation and verification

## Full-screen redesign (2026-10-04)

Casino now renders separately from the map's popup/backdrop. Flow: game-selection lobby → selected game's room list → full-screen table → casino lobby. Shared farm wallet remains server-owned. The world renderer is paused while this screen is open and resumes on exit; networking stays connected.

Four distinct board layouts include felt tables, CSS 3D six-face dice, animated bowl/lid, illustrated SVG Bau Cua symbols, chip selection/drop targets, real card faces/backs, opponent seats/counts, private own-hand selection, countdowns, ready/play/pass/reveal, history/chat/rules, optional synthesized phase sounds and reduced-motion support. No additional Babylon engine is created. The old in-world table view is not invoked by casino snapshots anymore.

Visual testing uses casino-playtest.html and scripts/serve-casino-playtest.mjs against an isolated real Mongo/WebSocket server. Seeded test accounts are only test fixtures in a random database; they never enter the live game database. Two automated WebSocket peers participate in card-game tests using valid server actions, not invented snapshots.

Observed UI tests: full Bai Cao round and settlement; Bau Cua bet and settlement (10 held, 20 returned in the observed round); full 3-client Tien Len round via hint/play/pass (17 manual UI actions in the final segment), ranking and unchanged farm coins. Responsive controls were inspected at 844×390 without horizontal overflow. A physical phone has not been tested. Desktop screenshots saved in /tmp/casino-bai-cao-desktop.jpg, /tmp/casino-bau-cua-desktop.jpg and /tmp/casino-tien-len-desktop.jpg.

The new full-screen board uses code-native SVG/CSS perspective assets, NOT a delivered GLB/WebP art pack. This supersedes the old popup UI but does not claim the original GLB asset requirement or physical mobile acceptance is complete.

Tai Xiu was also played through the UI: placing Tai held 10 xu; cancellation restored those 10; a subsequent Xiu bet held 10; the observed server result was 6+6+3=15 (Tai), returning 0 as expected. History and final wallet matched. All four games have now completed rounds in the UI playtest. The fresh test tab logged no JavaScript errors after the final source reload; transient development hot-reload errors encountered during editing were corrected.

## Agreed rules

- Shared farm coins; no separate casino balance, purchases, deposits, withdrawals or cash conversion.
- Bai Cao: system banker, three private cards/player, A=1, J/Q/K=0, modulo 10; three face cards rank highest. Win returns gross 2× stake; tie returns stake; loss returns zero.
- Tai Xiu: Xiu 4–10, Tai 11–17; all triples lose both sides. Winning gross return 2× stake.
- Bau Cua: matching n symbols returns stake + n× stake; no match returns zero.
- Tien Len: points only, no coin stakes. Full displayed rules are in shared/casino/casinoConfig.js.

## Implemented

Persistent public/private tables, password verification, bounded rooms/seats/spectators, ready, fixed quick-chat/emotes, reconnect reservations and snapshots; four server-driven games; cryptographic dealing/dice; private personalized hands; turn timeouts and ranking.

Farm coins, escrow and durable journal outbox commit atomically inside the same Mongo player document using revision CAS. The append-only casino_ledger is an idempotent projection; no replica-set multi-document transaction is assumed. Settlement plans persist before payout. Startup completes saved settlements and refunds unfinished/orphan holds. Legacy pending casino holds are still refunded on login.

Client lobby/table controls, countdown anchored to server time, cumulative/multi-choice bets, cancellation/repeat, own card selection/hints, banker result comparison, shared round history, navy/teal/champagne styling. Lazy bounded procedural Babylon table view uses the existing engine, 3 dice, 12 pooled chips and 13 private card planes.

## Tests actually run

- test-casino-rules: all 216 dice outcomes, six Bau Cua symbols, Bai Cao face/tie scoring and card validation.
- test-casino-mongo: isolated real Mongo database; duplicate/replayed requests, cancellation, idempotent payouts, hidden hands/spectators, complete four-player timeout-driven Tien Len round, restart/orphan refund, private-room password and concurrent wallet idempotency.
- test-casino-websocket: isolated real server/database with 3 WebSocket clients; two players + spectator, private cards, shared banker result, exact Mongo payout balances.
- Existing venue/culling tests and production build.

Generated test databases are removed by the test harness; the live game database is not reset or populated with test players.

## Not yet accepted as complete

The original GLB/WebP art-pack requirement is NOT complete. SVG symbols, CSS 3D dice/bowl animation, card deal/flip animation and simple phase tones are now implemented in the full-screen board. A production sound pack, full chip-collection effects, physical-phone visual/performance acceptance and main-world entry/exit performance measurements remain unverified. Automated WebSocket coverage completes Bai Cao; interactive isolated UI tests additionally completed the other three games, while injected-clock Mongo tests cover timeout-driven rounds and recovery.

Deployment currently requires one game server process per database. Room ownership/locks are in-process; horizontal multi-worker deployment is not supported. Financial ledger projection is durable/eventually consistent, not a separate authoritative balance. Do not report the whole casino plan done based on the build or these tests alone.

Commands:

```sh
npm run test:casino
node scripts/test-casino-websocket.mjs
npm run test:venues-casino
npm run build
```
