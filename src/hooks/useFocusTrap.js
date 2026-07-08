import { useEffect, useRef } from 'react';

export default function useFocusTrap(active) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    const focusableSelector = [
      'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
      'input:not([disabled])', 'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const getFocusable = () => {
      const elements = container.querySelectorAll(focusableSelector);
      return Array.from(elements).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
    };

    const trapFocus = (e) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && container.closest('[data-esc-close]')) {
        const closeTrigger = container.closest('[data-esc-close]');
        const event = new CustomEvent('close-esc', { bubbles: true });
        closeTrigger.dispatchEvent(event);
      }
      trapFocus(e);
    };

    requestAnimationFrame(() => {
      const focusable = getFocusable();
      if (focusable.length > 0 && !container.contains(document.activeElement)) {
        focusable[0].focus();
      }
    });

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [active]);

  return containerRef;
}
