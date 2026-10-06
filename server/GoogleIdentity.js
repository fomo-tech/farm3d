import { createPublicKey, verify } from 'node:crypto';

const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
let cachedKeys = null;
let keysExpireAt = 0;

async function googleKeys() {
  if (cachedKeys && Date.now() < keysExpireAt) return cachedKeys;
  const response = await fetch(JWKS_URL, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('Không thể kiểm tra khóa đăng nhập Google.');
  const data = await response.json();
  if (!Array.isArray(data.keys)) throw new Error('Khóa Google không hợp lệ.');
  const maxAge = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] || 300);
  cachedKeys = data.keys;
  keysExpireAt = Date.now() + Math.max(60, Math.min(maxAge, 3600)) * 1000;
  return cachedKeys;
}

export async function verifyGoogleCredential(credential, clientId = process.env.GOOGLE_CLIENT_ID) {
  if (!clientId) throw new Error('Server chưa cấu hình GOOGLE_CLIENT_ID.');
  if (typeof credential !== 'string' || credential.length > 12000) throw new Error('Mã đăng nhập Google không hợp lệ.');
  const parts = credential.split('.');
  if (parts.length !== 3) throw new Error('Mã đăng nhập Google không hợp lệ.');
  let header, claims;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  } catch { throw new Error('Mã đăng nhập Google bị lỗi.'); }
  if (header.alg !== 'RS256' || !header.kid || !/^[A-Za-z0-9_-]{1,128}$/.test(header.kid)) throw new Error('Chữ ký Google không hợp lệ.');
  const keys = await googleKeys();
  const key = keys.find(entry => entry.kid === header.kid && entry.kty === 'RSA' && entry.use === 'sig');
  if (!key || !verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key, format: 'jwk' }), Buffer.from(parts[2], 'base64url')))
    throw new Error('Không xác minh được chữ ký Google.');
  const now = Math.floor(Date.now() / 1000);
  if (claims.aud !== clientId || !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)
    || !Number.isFinite(claims.exp) || claims.exp <= now || !Number.isFinite(claims.iat) || claims.iat > now + 60
    || typeof claims.sub !== 'string' || !/^\d{5,32}$/.test(claims.sub)) throw new Error('Mã Google hết hạn hoặc không dành cho game này.');
  return { sub: claims.sub };
}
