import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    Tawk_API?: any;
  }
}

const tawkId = import.meta.env.VITE_TAWKTO_ID;

export default function TawkToWidget() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || '/';
    // Only allow the widget on the site root. Hide/remove it on all other routes.
    const shouldLoad = path === '/';

    // Helper to remove any existing tawk script tags and iframes
    const removeTawkElements = () => {
      // remove script tags that reference tawk
      const scripts = Array.from(document.querySelectorAll('script')) as HTMLScriptElement[];
      scripts.forEach((s) => {
        if (s.src && s.src.includes('embed.tawk.to')) s.remove();
      });

      // remove tawk iframes
      const iframes = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];
      iframes.forEach((f) => {
        if (f.src && f.src.includes('tawk.to')) f.remove();
      });

      // attempt to hide Tawk widget if API is present
      try {
        if ((window as any).Tawk_API && typeof (window as any).Tawk_API.hideWidget === 'function') {
          (window as any).Tawk_API.hideWidget();
        }
      } catch (e) {
        // ignore
      }
    };

    if (!shouldLoad) {
      removeTawkElements();
      return;
    }

    // otherwise ensure tawk script is present on root
    if ((window as any).Tawk_API) {
      // already loaded; try show
      try {
        if (typeof (window as any).Tawk_API.showWidget === 'function') {
          (window as any).Tawk_API.showWidget();
        }
      } catch (e) {
        // ignore
      }
      return;
    }

    // inject script
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = `https://embed.tawk.to/${tawkId}`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s1.id = 'tawk-script';
    document.body.appendChild(s1);

    // cleanup will not remove widget automatically because we want route-based control
    return () => {
      // no-op: we remove/hide on subsequent route changes explicitly
    };
  }, [location.pathname]);

  return null;
}
