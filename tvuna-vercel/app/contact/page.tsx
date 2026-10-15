import type { Metadata } from "next";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "יצירת קשר — תבונה AI",
  description: "מתחילים בהיכרות. השאירו את פרטי העסק ובחרו איך נוח לכם שניצור קשר.",
};

export default function ContactPage() {
  return (
    <main id="main-content" className="contact-main">
      <a className="back-link" href="/">
        <span aria-hidden="true">→</span> חזרה לתבונה AI
      </a>
      <section className="contact-shell" aria-labelledby="contact-heading">
        <div className="contact-intro">
          <div className="eyebrow">AI ואוטומציה לעסקים</div>
          <h1 id="contact-heading" className="contact-heading">מתחילים<br /><span>בהיכרות.</span></h1>
          <p className="contact-lead">נבדוק יחד איפה אפשר<br className="desktop-break" /> לפנות מקום למה שחשוב.</p>
          <p className="contact-description">השאירו את פרטי העסק ובחרו איך נוח לכם שניצור קשר. משם, נכיר את האתגרים ונבחן את האפשרויות יחד.</p>
          <div className="contact-aside-note">
            <span aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 18 12-12M7 6h11v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            <p>הפנייה מגיעה ישירות לדן.<br />הפרטים ישמשו ליצירת קשר בלבד.</p>
          </div>
        </div>
        <div className="contact-panel">
          <div className="form-kicker" dir="ltr">01 / LET’S TALK</div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
