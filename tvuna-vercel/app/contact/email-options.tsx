"use client";
import { useEffect, useState } from "react";

export default function EmailOptions({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(timer);
  }, [copied]);
  const gmailUrl = `https://mail.google.com/mail/?${new URLSearchParams({ view: "cm", fs: "1", to: email, su: "פגישת היכרות — תבונה AI" })}`;
  async function copy() {
    try { await navigator.clipboard.writeText(email); setCopied(true); setError(false); }
    catch { setError(true); }
  }
  return <div className="email-options">
    <a href={gmailUrl} target="_blank" rel="noopener noreferrer">פתיחה ב־Gmail</a>
    <button type="button" onClick={copy}>{copied ? "הכתובת הועתקה" : "העתקת כתובת"}</button>
    <span className="sr-only" role="status">{copied ? "כתובת האימייל הועתקה" : ""}</span>
    {error && <p role="status">אפשר לסמן ולהעתיק את הכתובת המוצגת למעלה.</p>}
  </div>;
}
