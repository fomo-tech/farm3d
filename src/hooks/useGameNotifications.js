import { useCallback, useEffect, useRef, useState } from 'react';
import { createNotificationGate } from './notificationPolicy.js';

export function useGameNotifications(enabled) {
  const [status, updateStatus] = useState('');
  const [toast, setToast] = useState(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const gate = useRef(null);
  if (!gate.current) gate.current = createNotificationGate();
  const dismissToast = useCallback(() => setToast(null), []);
  const setStatus = useCallback((message, options = {}) => {
    updateStatus(message);
    if (!enabledRef.current) return;
    const kind = gate.current(message, options);
    if (kind) setToast({ message, kind });
  }, []);
  useEffect(() => {
    if (!enabled) { setToast(null); return; }
    if (!toast) return;
    const timer = setTimeout(dismissToast, toast.kind === 'warning' ? 4000 : 2600);
    return () => clearTimeout(timer);
  }, [enabled, toast, dismissToast]);
  return { status, setStatus, toast, dismissToast };
}
