import { useEffect, useState } from 'react';
import { getAttendanceStatus } from '../../shared/dailyAttendance.js';

// Refresh only when the UTC reward day changes, or the tab resumes.
export function useDailyAttendance(dates = [], serverOffset = 0) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const refresh = () => {
      const current = Date.now();
      setNow(previous => getAttendanceStatus([], previous + serverOffset).today === getAttendanceStatus([], current + serverOffset).today ? previous : current);
    };
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [serverOffset]);
  return getAttendanceStatus(dates, now + serverOffset);
}
