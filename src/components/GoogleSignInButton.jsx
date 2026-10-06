import React, { useEffect, useRef, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
let scriptPromise;

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => window.google?.accounts?.id ? resolve(window.google) : reject(new Error('Google Sign-In chưa sẵn sàng.'));
    script.onerror = () => reject(new Error('Không tải được Google Sign-In.'));
    document.head.appendChild(script);
  }).catch(error => { scriptPromise = null; throw error; });
  return scriptPromise;
}

export function GoogleSignInButton({ onCredential, onError, text = 'signin_with', fallbackLabel = 'Đăng nhập Google' }) {
  const host = useRef(null);
  const callback = useRef(onCredential);
  callback.current = onCredential;
  const [error, setError] = useState('');
  useEffect(() => {
    if (!CLIENT_ID) return;
    let active = true;
    loadGoogleIdentity().then(google => {
      if (!active || !host.current) return;
      google.accounts.id.initialize({ client_id: CLIENT_ID, callback: response => {
        if (response?.credential) callback.current?.(response.credential);
        else onError?.('Google không trả về mã đăng nhập.');
      } });
      host.current.replaceChildren();
      google.accounts.id.renderButton(host.current, { type: 'standard', theme: 'outline', size: 'large',
        shape: 'pill', text, width: Math.min(320, host.current.clientWidth || 280) });
    }).catch(cause => { if (active) { setError(cause.message); onError?.(cause.message); } });
    return () => { active = false; };
  }, [text]);
  if (!CLIENT_ID) return <span className="game-auth-google-unavailable">
    <button type="button" className="game-auth-google-disabled" disabled><span className="google-g" aria-hidden="true">G</span>{fallbackLabel}</button>
    <small>Chưa cấu hình Google cho game</small>
  </span>;
  return <span className="pt-google-signin-host" ref={host} aria-label="Đăng nhập bằng Google">{error && <small>{error}</small>}</span>;
}
