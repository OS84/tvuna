import type { LeadInput } from './lead-validation';

export const EMAIL_TIMEOUT_MS = 90_000;
export class LeadEmailError extends Error {
  code: 'timeout' | 'network' | 'busy' | 'rejected';
  constructor(code: 'timeout' | 'network' | 'busy' | 'rejected') {
    super(`Lead email: ${code}`);
    this.name = 'LeadEmailError';
    this.code = code;
  }
}

// FormSubmit is the email processor used by the original landing page.
export async function sendLeadEmail(lead: LeadInput, send: typeof fetch = fetch, timeoutMs = EMAIL_TIMEOUT_MS): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Form encoding is supported by FormSubmit and avoids a cross-origin JSON
    // preflight on mobile. Do not add non-safelisted request headers here.
    const fields: Record<string,string> = {
      name: lead.contactName,
      'שם העסק': lead.businessName,
      'אמצעי קשר מועדף': lead.contactMethod === 'whatsapp' ? 'WhatsApp' : 'אימייל',
      'פרטי קשר': lead.contactValue,
      'מספר פנייה': lead.submissionId,
      ...(lead.contactMethod === 'email' ? {email:lead.contactValue, _replyto:lead.contactValue} : {}),
      _subject: `תבונה AI — פנייה חדשה: ${lead.businessName}`,
      _template:'table', _captcha:'false', _url:typeof window !== 'undefined' ? `${window.location.origin}/` : `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://tvuna.app').replace(/\/$/, '')}/`,
    };
    const result = await send(`https://formsubmit.co/ajax/${process.env.NEXT_PUBLIC_FORMSUBMIT_RECIPIENT || 'sincai@gmail.com'}`, {
      method:'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8', Accept:'application/json'},
      body: new URLSearchParams(fields).toString(),
      signal:controller.signal,
      credentials:'omit',
      referrerPolicy:'origin',
    });
    if (result.status === 429) throw new LeadEmailError('busy');
    const body = await result.json().catch(() => null) as {success?:boolean|string}|null;
    if(!result.ok || (body?.success !== true && body?.success !== 'true')) throw new LeadEmailError('rejected');
  } catch (error) {
    if(error instanceof LeadEmailError) throw error;
    throw new LeadEmailError(controller.signal.aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(timeout);
  }
}
