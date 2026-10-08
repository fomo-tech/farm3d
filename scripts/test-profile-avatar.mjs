import assert from 'node:assert/strict';
import { isValidProfileAvatar, PROFILE_AVATAR_MAX_LENGTH } from '../shared/profileAvatar.js';

assert.equal(isValidProfileAvatar(''), true, 'Allow reverting to the character avatar');
assert.equal(isValidProfileAvatar('data:image/jpeg;base64,/9j/2Q=='), true);
for (const invalid of [null, {}, 'https://example.com/avatar.jpg', 'data:image/svg+xml;base64,PHN2Zz4=', 'data:image/jpeg;base64,AAAA', 'data:image/jpeg;base64,/9j/!', 'data:image/jpeg;base64,/9j/AAA', `data:image/jpeg;base64,/9j/${'A'.repeat(PROFILE_AVATAR_MAX_LENGTH)}`]) {
  assert.equal(isValidProfileAvatar(invalid), false, 'Reject invalid or oversized avatar payloads');
}
const message = JSON.stringify({ type: 'game_action', action: 'profile_update', payload: { name: 'Người chơi', bio: 'Giới thiệu', avatar: `data:image/jpeg;base64,/9j/${'A'.repeat(11972)}` } });
assert.ok(message.length < 16384, 'Avatar updates fit the WebSocket message limit');
console.log('Profile avatar validation passed.');
