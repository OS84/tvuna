import type { Metadata } from "next";
import { getContactConfig } from "../../lib/contact-config";
import { emailLink } from "../../lib/contact-links";
import ContactForm from "./contact-form";
import EmailOptions from "./email-options";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "יצירת קשר — תבונה AI",
  description: "דברו איתנו ישירות ב־WhatsApp או באימייל, או השאירו פרטים ונחזור אליכם לשיחת היכרות.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const config = getContactConfig();
  return (
    <main id="main-content" className="contact-main">
      <a className="back-link" href="/"><span aria-hidden="true">→</span> חזרה לתבונה AI</a>
      <section className="contact-shell" aria-labelledby="contact-heading">
        <div className="contact-intro">
          <div className="eyebrow">AI ואוטומציה לעסקים</div>
          <h1 id="contact-heading" className="contact-heading">מתחילים<br /><span>בהיכרות.</span></h1>
          <p className="contact-lead">נבדוק יחד איפה אפשר<br className="desktop-break" /> לפנות מקום למה שחשוב.</p>
          <p className="contact-description">ספרו לנו קצת על העסק ועל מה שתרצו לשפר. נכיר את האתגרים ונבחן יחד מה אפשר לעשות.</p>
          <div className="contact-aside-note"><p>שיחה ישירה עם צוות תבונה AI.<br />הפרטים ישמשו ליצירת קשר בנוגע לפנייה.</p></div>
        </div>
        <div className="contact-panel">
          <div className="form-kicker" dir="ltr">01 / LET’S TALK</div>
          <section aria-labelledby="direct-contact-heading" className="direct-contact">
            <h2 id="direct-contact-heading" className="form-title">בואו נדבר</h2>
            <p className="form-description">בחרו את הדרך שנוחה לכם.</p>
            <div className="direct-contact-links">
              {config.whatsappUrl && <a className="direct-contact-link whatsapp-link" href={config.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <span><strong>פתיחת שיחה ב־WhatsApp</strong><small dir="ltr">{config.whatsappDisplay}</small></span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.8 7.3L3 20l1.2-4.7a8.5 8.5 0 1 1 16.3-3.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 7.5c.5 4 3 6.5 7 7l1-2-2-.8-1 .8c-1.5-.7-2.3-1.5-3-3l.8-1-1-2-1.8 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
              </a>}
              {config.email && <a className="direct-contact-link" href={emailLink(config.email)}>
                <span><strong>כתבו לנו באימייל</strong><small dir="ltr">{config.email}</small></span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="m4 6 8 6 8-6" stroke="currentColor" strokeWidth="1.5"/></svg>
              </a>}
            </div>
            {config.email && <EmailOptions email={config.email} />}
            {config.whatsappUrl && <p className="form-privacy">WhatsApp ייפתח עם הודעה מוכנה. תוכלו לערוך אותה וללחוץ על שליחה.</p>}
          </section>
          {config.ready && <div className="callback-form"><ContactForm siteKey={config.turnstileSiteKey} /></div>}
          <noscript><p className="form-privacy">אפשר ליצור קשר ישירות באמצעות הקישורים למעלה.</p></noscript>
        </div>
      </section>
    </main>
  );
}
