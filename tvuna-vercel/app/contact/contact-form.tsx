"use client";


import { LeadEmailError, sendLeadEmail } from "../../lib/lead-email";
import { prepareLeadAttempt, type LeadAttempt } from "../../lib/lead-attempt";
import { validateLead } from "../../lib/lead-validation";
import Turnstile from "./turnstile";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

type ContactMethod = "whatsapp" | "email" | "";
type FieldErrors = Partial<Record<"contactName" | "businessName" | "contactMethod" | "contactValue", string>>;

function validate(contactName: string, businessName: string, contactMethod: ContactMethod, contactValue: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!contactName.trim()) errors.contactName = "נא למלא שם מלא.";
  else if (contactName.trim().length < 2 || contactName.trim().length > 100 || /[\u0000-\u001f\u007f<>]/.test(contactName)) errors.contactName = "יש למלא שם מלא, בין 2 ל־100 תווים.";
  if (!businessName.trim()) errors.businessName = "נא למלא את שם העסק.";
  else if (businessName.trim().length < 2 || businessName.trim().length > 160 || /[\u0000-\u001f\u007f<>]/.test(businessName)) errors.businessName = "יש למלא שם עסק, בין 2 ל־160 תווים.";
  if (!contactMethod) errors.contactMethod = "נא לבחור איך נוח לכם שניצור קשר.";
  if (contactMethod === "email" && !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]{2,}$/.test(contactValue.trim())) {
    errors.contactValue = "נא להזין כתובת אימייל תקינה, למשל name@example.com.";
  }
  if (contactMethod === "whatsapp") {
    const phone = contactValue.trim();
    const digits = phone.replace(/\D/g, "");
    if (!/^\+?[0-9\s().-]+$/.test(phone) || phone.length > 30 || digits.length < 8 || digits.length > 15) {
      errors.contactValue = "נא להזין מספר טלפון תקין, כולל קידומת.";
    }
  }
  if (contactValue.trim().length > 254) errors.contactValue = "פרטי הקשר ארוכים מדי. נא לבדוק ולנסות שוב.";
  return errors;
}

export default function ContactForm({ siteKey }: { siteKey: string }) {
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [reference, setReference] = useState("");
  const verify = useCallback((value: string) => { setToken(value); setVerificationError(""); }, []);
  const expire = useCallback(() => { setToken(""); }, []);
  const verificationFailed = useCallback(() => { setToken(""); setVerificationError("בדיקת האבטחה לא נטענה. אפשר לפנות אלינו ישירות דרך הקישורים למעלה."); }, []);
  const [contactName, setContactName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("");
  const [contactValue, setContactValue] = useState("");
  const [website, setWebsite] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const attempt = useRef<LeadAttempt | null>(null);
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSuccess) statusRef.current?.focus();
  }, [isSuccess]);

  function changeMethod(method: "whatsapp" | "email") {
    setContactMethod(method);
    setContactValue("");
    setFieldErrors((current) => ({ ...current, contactMethod: undefined, contactValue: undefined }));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const errors = validate(contactName, businessName, contactMethod, contactValue);
    setFieldErrors(errors);
    setError("");
    const firstInvalidField = Object.keys(errors)[0];
    if (firstInvalidField) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus());
      return;
    }

    if (!token) {
      setError("השלימו את בדיקת האבטחה לפני השליחה.");
      return;
    }
    submitting.current = true;
    setIsPending(true);
    try {
      const fields = {
        contactName: contactName.trim(),
        businessName: businessName.trim(),
        contactMethod: contactMethod as "whatsapp" | "email",
        contactValue: contactValue.trim(),
        message: message.trim(),
      };
      attempt.current = prepareLeadAttempt(attempt.current, fields);
      const validated = validateLead({ ...fields, website, submissionId: attempt.current.submissionId });
      if ("error" in validated) {
        setError(validated.error);
        return;
      }
      setReference(await sendLeadEmail(validated.lead, token, website));
      setIsSuccess(true);
    } catch (error) {
      setError(error instanceof LeadEmailError ? error.message : "לא התקבל אישור לשליחה. הפרטים נשארו בטופס ואפשר לנסות שוב.");
    } finally {
      submitting.current = false;
      setIsPending(false);
      setToken("");
      setChallengeVersion(current => current + 1);
    }
  }

  function resetAfterSuccess() {
    setMessage("");
    setReference("");
    setContactName("");
    setBusinessName("");
    setContactMethod("");
    setContactValue("");
    setWebsite("");
    setFieldErrors({});
    setError("");
    attempt.current = null;
    setIsSuccess(false);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>("#contact-name")?.focus());
  }

  if (isSuccess) {
    return (
      <div className="form-success" role="status" aria-live="polite" tabIndex={-1} ref={statusRef}>
        <span className="success-mark" aria-hidden="true">✓</span>
        <h2>הפנייה התקבלה.</h2>
        <p>תודה! נחזור אליכם בדרך שבחרתם.</p>
        <p className="form-privacy">מספר הפנייה: <span dir="ltr">{reference.slice(0, 8)}</span></p>
        <a className="cta" href="/">בחזרה לתבונה AI <span aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6 6 18M6 7v11h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span></a>
        <button type="button" className="text-button" onClick={resetAfterSuccess}>שליחת פנייה נוספת</button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={isPending}>
      <h2 className="form-title">מעדיפים שנחזור אליכם?</h2>
      <p className="form-description">השאירו פרטים ונחזור אליכם לשיחת היכרות.</p>
      <p className="required-note">כל השדות נדרשים, מלבד ההודעה הנוספת</p>
      <fieldset className="form-fields" disabled={isPending}>
        <legend className="sr-only">פרטים ליצירת קשר</legend>
        <div className="field-row">
          <div className="form-field">
            <label htmlFor="contact-name">שם מלא</label>
            <input id="contact-name" name="contactName" type="text" autoComplete="name" required minLength={2} maxLength={100} placeholder="איך קוראים לכם?" value={contactName} onChange={(event) => setContactName(event.target.value)} aria-invalid={!!fieldErrors.contactName} aria-describedby={fieldErrors.contactName ? "contact-name-error" : undefined} />
            {fieldErrors.contactName && <p className="field-error" id="contact-name-error">{fieldErrors.contactName}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="business-name">שם העסק</label>
            <input id="business-name" name="businessName" type="text" autoComplete="organization" required minLength={2} maxLength={160} placeholder="העסק שלכם" value={businessName} onChange={(event) => setBusinessName(event.target.value)} aria-invalid={!!fieldErrors.businessName} aria-describedby={fieldErrors.businessName ? "business-name-error" : undefined} />
            {fieldErrors.businessName && <p className="field-error" id="business-name-error">{fieldErrors.businessName}</p>}
          </div>
        </div>
        <fieldset className="contact-method-field" aria-describedby={fieldErrors.contactMethod ? "contact-method-error" : undefined}>
          <legend>איך תרצו שנחזור אליכם?</legend>
          <div className="contact-method-options">
            <label className={`method-option${contactMethod === "whatsapp" ? " selected" : ""}`}>
              <input type="radio" name="contactMethod" value="whatsapp" required checked={contactMethod === "whatsapp"} onChange={() => changeMethod("whatsapp")} />
              <span>ב־WhatsApp</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M6.7 3.5H4.5a1 1 0 0 0-1 1C3.5 13.3 10.7 20.5 19.5 20.5a1 1 0 0 0 1-1v-2.2a1 1 0 0 0-.8-1l-3.2-.7a1 1 0 0 0-1 .4l-1.1 1.3a13 13 0 0 1-7.7-7.7L8 8.5a1 1 0 0 0 .4-1l-.7-3.2a1 1 0 0 0-1-.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            </label>
            <label className={`method-option${contactMethod === "email" ? " selected" : ""}`}>
              <input type="radio" name="contactMethod" value="email" required checked={contactMethod === "email"} onChange={() => changeMethod("email")} />
              <span>באימייל</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="m4 6 8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            </label>
          </div>
          {fieldErrors.contactMethod && <p className="field-error" id="contact-method-error">{fieldErrors.contactMethod}</p>}
        </fieldset>
        {contactMethod && (
          <div className="form-field contact-value-field">
            <label htmlFor="contact-value">{contactMethod === "whatsapp" ? "מספר ה־WhatsApp שלכם" : "כתובת האימייל שלכם"}</label>
            <input key={contactMethod} id="contact-value" name="contactValue" type={contactMethod === "whatsapp" ? "tel" : "email"} inputMode={contactMethod === "whatsapp" ? "tel" : "email"} autoComplete={contactMethod === "whatsapp" ? "tel" : "email"} autoCapitalize="none" spellCheck={false} dir="ltr" required maxLength={contactMethod === "whatsapp" ? 30 : 254} placeholder={contactMethod === "whatsapp" ? "050-1234567" : "name@example.com"} value={contactValue} onChange={(event) => setContactValue(event.target.value)} aria-invalid={!!fieldErrors.contactValue} aria-describedby={fieldErrors.contactValue ? "contact-value-error" : undefined} />
            {fieldErrors.contactValue && <p className="field-error" id="contact-value-error">{fieldErrors.contactValue}</p>}
          </div>
        )}
        <div className="form-field message-field">
          <label htmlFor="contact-message">במה נוכל לעזור? <span className="optional-label">(לא חובה)</span></label>
          <textarea id="contact-message" name="message" rows={3} maxLength={1200} value={message} onChange={event => setMessage(event.target.value)} placeholder="אפשר לספר בקצרה על העסק או על האתגר שמעסיק אתכם" />
        </div>
        <div className="verification-field">
          <Turnstile siteKey={siteKey} version={challengeVersion} onVerify={verify} onExpire={expire} onError={verificationFailed} />
          {verificationError && <p className="field-error" role="status">{verificationError}</p>}
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </div>
        {error && <p className="submit-error" role="alert">{error}</p>}
        <button className="cta submit-button" type="submit" disabled={isPending || !token}>
          {isPending ? "שולחים את הפנייה…" : "שליחת בקשה לחזרה"}
          <span aria-hidden="true" className={isPending ? "pending-indicator" : undefined}>{!isPending && (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6 6 18M6 7v11h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>)}</span>
        </button>
      </fieldset>
      {isPending && <p className="sending-note" role="status">שולחים את הפנייה. האישור יופיע כאן בעוד כמה רגעים.</p>}
      <p className="form-privacy">נשתמש בפרטים רק כדי לחזור אליכם בנוגע לפנייה.</p>
      <span className="sr-only" role="status" aria-live="polite">{isPending ? "הפנייה בשליחה. נא להמתין." : ""}</span>
    </form>
  );
}
