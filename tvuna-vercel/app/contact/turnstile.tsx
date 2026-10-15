"use client";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type WidgetApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: WidgetApi } }

export default function Turnstile({ siteKey, version, onVerify, onExpire, onError }: {
  siteKey: string; version: number; onVerify: (token: string) => void; onExpire: () => void; onError: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const fail = useCallback(() => { setFailed(true); onError(); }, [onError]);
  useEffect(() => {
    if (ready) return;
    const timeout = setTimeout(fail, 12000);
    return () => clearTimeout(timeout);
  }, [ready, fail]);
  useEffect(() => {
    if (!ready || !container.current || !window.turnstile) return;
    const api = window.turnstile;
    let id: string;
    try {
      id = api.render(container.current, {
        sitekey: siteKey, action: "contact", theme: "light", size: "flexible", language: "auto",
        callback: (token: string) => { setFailed(false); onVerify(token); }, "expired-callback": onExpire, "error-callback": fail, "timeout-callback": onExpire,
      });
    } catch { fail(); return; }
    return () => { api.remove(id); };
  }, [ready, siteKey, version, onVerify, onExpire, fail]);
  return <>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => { setFailed(false); setReady(true); }} onError={fail} />
    <div ref={container} aria-label="בדיקת אבטחה לפני שליחה" />
    {!ready && !failed && <p className="form-privacy" role="status">טוענים בדיקת אבטחה קצרה…</p>}
  </>;
}
