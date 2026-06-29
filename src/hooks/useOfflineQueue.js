import { useState, useEffect, useCallback } from 'react';
import { offlineQueue } from '../lib/offlineQueue';

export default function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);

  const updateCount = useCallback(async () => {
    const count = await offlineQueue.getPendingCount();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    updateCount();
    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, [updateCount]);

  return {
    pendingCount,
    refresh: updateCount,
  };
}