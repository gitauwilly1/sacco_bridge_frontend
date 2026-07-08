import { useEffect, useRef } from 'react';

export default function SkipToContent() {
  const linkRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Tab') {
        linkRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <a
      ref={linkRef}
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:bg-terracotta focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:outline-none focus:ring-2 focus:ring-white/50"
    >
      Skip to content
    </a>
  );
}
