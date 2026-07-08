import { useState, useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000;
const WARNING_AT_MS = IDLE_TIMEOUT_MS - WARNING_BEFORE_MS;
const POLL_INTERVAL_MS = 1000;

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'click', 'scroll', 'touchstart', 'wheel'];

export default function useIdleTimer({ onTimeout, enabled }) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_BEFORE_MS / 1000);
  const lastActivity = useRef(null);
  const showWarningRef = useRef(false);

  const resetTimer = useCallback(() => {
    lastActivity.current = Date.now();
    showWarningRef.current = false;
    setShowWarning(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      showWarningRef.current = false;
      return;
    }

    const handleActivity = () => {
      lastActivity.current = Date.now();
      if (showWarningRef.current) {
        showWarningRef.current = false;
        setShowWarning(false);
      }
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleActivity);

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - lastActivity.current;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        showWarningRef.current = false;
        setShowWarning(false);
        clearInterval(intervalId);
        onTimeout();
        return;
      }

      if (elapsed >= WARNING_AT_MS && !showWarningRef.current) {
        showWarningRef.current = true;
        setShowWarning(true);
      }

      if (showWarningRef.current) {
        const remaining = Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000));
        setTimeLeft(remaining);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      document.removeEventListener('visibilitychange', handleActivity);
      clearInterval(intervalId);
    };
  }, [enabled, onTimeout]);

  return { showWarning, timeLeft, resetTimer };
}
