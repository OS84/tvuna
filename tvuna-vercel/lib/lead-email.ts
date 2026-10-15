import type { LeadInput } from './lead-validation';

export const EMAIL_TIMEOUT_MS = 25_000;
export class LeadEmailError extends Error {
  code: 'timeout' | 'network' | 'busy' | 'rejected';
  constructor(code: 'timeout' | 'network' | 'busy' | 'rejected', message?: string) {
    super(message || 'לא התקבל אישור לשליחת הפנייה. אפשר לנסות שוב או לפנות אלינו ישירות.');
    this.name = 'LeadEmailError';
    this.code = code;
  }
}

// The browser calls only our same-origin endpoint. Provider keys stay on the server.
export async function sendLeadEmail(lead: LeadInput, turnstileToken: string, website = '', send: typeof fetch = fetch, timeoutMs = EMAIL_TIMEOUT_MS): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const result = await send('/api/contact', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({...lead, turnstileToken, website}),
      signal: controller.signal, credentials: 'same-origin',
    });
    const body = await result.json().catch(() => null) as {ok?:boolean;reference?:string;error?:string;code?:string}|null;
    if (!result.ok || body?.ok !== true || typeof body.reference !== 'string') {
      const message = typeof body?.error === 'string' && body.error.length <= 500 ? body.error : undefined;
      throw new LeadEmailError(result.status === 429 ? 'busy' : result.status === 504 ? 'timeout' : 'rejected', message);
    }
    return body.reference;
  } catch (error) {
    if (error instanceof LeadEmailError) throw error;
    throw new LeadEmailError(controller.signal.aborted ? 'timeout' : 'network', 'אישור השליחה מתעכב. ייתכן שהפנייה כבר נשלחה. הפרטים נשארו כאן, ואפשר לנסות שוב.');
  } finally { clearTimeout(timeout); }
}
