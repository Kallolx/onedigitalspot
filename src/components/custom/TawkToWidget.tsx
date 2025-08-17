import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
  }
}

const tawkId = import.meta.env.VITE_TAWKTO_ID;

export default function TawkToWidget() {
  useEffect(() => {
    if (window.Tawk_API) return; // Prevent duplicate script
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = `https://embed.tawk.to/${tawkId}`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.body.appendChild(s1);
  }, []);
  return null; // Tawk.to handles its own UI
}
