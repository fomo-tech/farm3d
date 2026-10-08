export const PROFILE_AVATAR_MAX_LENGTH = 12000;

export function isValidProfileAvatar(value) {
  if (value === '') return true;
  if (typeof value !== 'string' || value.length > PROFILE_AVATAR_MAX_LENGTH) return false;
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) return false;
  const body = value.slice('data:image/jpeg;base64,'.length);
  return body.length % 4 === 0 && body.startsWith('/9j/');
}
