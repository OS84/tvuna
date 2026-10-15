import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.tvuna.app"),
  title: "תבונה AI — מפנים מקום למה שחשוב",
  description: "טובעים בשוטף? גלו איך AI יכול לעזור לכם בעסק. פגישת מיפוי להיכרות עם האפשרויות ולזיהוי הזדמנויות מעשיות.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "תבונה AI | לפעול בתבונה",
    description: "טובעים בשוטף? גלו איך AI יכול לעזור לכם בעסק. פגישת היכרות עם האפשרויות וזיהוי הזדמנויות לשיפור.",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.tvuna.app",
    locale: "he_IL",
  },
};

export const viewport: Viewport = { themeColor: "#111714" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <a className="skip-link" href="#main-content">דילוג לתוכן הראשי</a>
        <nav><a className="wordmark" href="/" aria-label="תבונה AI — לפעול בתבונה"><span className="logo-mark"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M10 34V20a10 10 0 0 1 20 0v14M18 34V14a10 10 0 0 1 20 0v20" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/><path d="M10 40h28" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/></svg></span><span><span className="logo-name">תבונה <small>AI</small></span><span className="logo-tagline">לפעול בתבונה.</span></span></a><span className="navlink">פתרונות שתפורים לעסק שלכם</span></nav>
        {children}
        <footer><span>תבונה AI · לפעול בתבונה.</span><a href="/contact">יצירת קשר ↗</a></footer>
      </body>
    </html>
  );
}
