import { useEffect } from 'react';
import { initAppearanceFromStorage } from '@/lib/appearance';

export default function AppearanceProvider({ children }) {
  useEffect(() => {
    initAppearanceFromStorage();
  }, []);

  return children;
}
