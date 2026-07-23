import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to hash targets after route changes (e.g. /terms → /#partners).
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
      return;
    }

    const id = decodeURIComponent(hash.replace('#', ''));

    const scrollToTarget = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    };

    if (scrollToTarget()) return undefined;

    const timers = [50, 150, 400, 800].map((ms) => setTimeout(scrollToTarget, ms));
    return () => timers.forEach(clearTimeout);
  }, [pathname, hash]);

  return null;
}
