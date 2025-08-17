import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie_consent";

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      setConsent(existing);
      if (!existing) setVisible(true);
    } catch (e) {
      // ignore storage errors
      setVisible(true);
    }
  }, []);

  const accept = (persist = true) => {
    if (persist) localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setVisible(false);
    // optional: enable analytics or other scripts here
    try {
      const api = (window as any).dataLayer;
      if (api && Array.isArray(api)) api.push({ event: "cookie_accept" });
    } catch {}
  };

  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "declined");
    } catch {}
    setConsent("declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
  <div className="max-w-4xl w-full bg-card border border-border rounded-lg shadow-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 text-sm text-foreground">
          <div className="font-pixel font-medium text-base">🍪 We use cookies</div>
          <div className="text-muted-foreground">We use cookies to personalise content. By clicking Accept you consent to our cookies.</div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={decline} className="px-4">Decline</Button>
          <Button variant="retro" onClick={() => accept(true)} className="px-4">Accept</Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
