import { useState, useEffect, useCallback } from 'react';
import { offlineQueue } from '../lib/offlineQueue';

export default function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);

  const updateCount = useCallback(async () => {
    const count = await offlineQueue.getPendingCount();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    const initCount = async () => {
      const count = await offlineQueue.getPendingCount();
      setPendingCount(count);
    };
    initCount();
    const interval = setInterval(async () => {
      const count = await offlineQueue.getPendingCount();
      setPendingCount(count);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    pendingCount,
    refresh: updateCount,
  };
}