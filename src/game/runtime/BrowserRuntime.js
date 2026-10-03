function fallbackRandomToken() {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2);
  return `${time}${random}`;
}

export function createRuntimeId(prefix = 'id', cryptoApi = globalThis.crypto) {
  let token = '';

  try {
    if (typeof cryptoApi?.randomUUID === 'function') {
      token = cryptoApi.randomUUID().replaceAll('-', '');
    } else if (typeof cryptoApi?.getRandomValues === 'function') {
      const bytes = new Uint8Array(12);
      cryptoApi.getRandomValues(bytes);
      token = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // Some iOS browsers expose crypto on an insecure LAN origin but reject calls.
  }

  return `${prefix}_${(token || fallbackRandomToken()).slice(0, 24)}`;
}

export function getBrowserStorage(type = 'localStorage') {
  try {
    return globalThis[type] || null;
  } catch {
    return null;
  }
}

export function safeStorageGet(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function safeStorageSet(storage, key, value) {
  try {
    storage?.setItem(key, value);
    return Boolean(storage);
  } catch {
    return false;
  }
}
