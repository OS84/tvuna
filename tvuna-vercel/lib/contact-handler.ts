import { validateLead, type LeadInput } from "./lead-validation.ts";
import type { ContactConfig } from "./contact-config.ts";

const MAX_BYTES = 8192;
const json = (body: object, status = 200, headers: Record<string, string> = {}) => Response.json(body, {
  status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", ...headers },
});
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);

export function leadEmail(lead: LeadInput, config: ContactConfig) {
  const method = lead.contactMethod === "email" ? "אימייל" : "WhatsApp";
  const details = [
    ["שם מלא", lead.contactName], ["שם העסק", lead.businessName],
    ["דרך חזרה מועדפת", method], ["פרטי קשר", lead.contactValue],
    ["במה נוכל לעזור", lead.message || "לא צוין"], ["מספר פנייה", lead.submissionId],
  ];
  return {
    from: config.from, to: [config.email!],
    subject: `תבונה AI — פנייה חדשה: ${lead.businessName}`,
    ...(lead.contactMethod === "email" ? { reply_to: lead.contactValue } : {}),
    text: details.map(([label, value]) => `${label}: ${value}`).join("\n\n"),
    html: `<div lang="he" dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h1>פנייה חדשה לתבונה AI</h1>${details.map(([label, value]) => `<p><strong>${label}</strong><br>${escapeHtml(value).replace(/\n/g, "<br>")}</p>`).join("")}</div>`,
  };
}

export async function handleContact(request: Request, config: ContactConfig, send: typeof fetch = fetch) {
  const origin = request.headers.get("origin") || "";
  if (!config.allowedOrigins.has(origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return json({ error: "פתחו את הטופס באתר ושלחו משם.", code: "origin" }, 403);
  }
  if ((request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase() !== "application/json") return json({ error: "לא ניתן לקרוא את הפנייה. רעננו את העמוד ונסו שוב." }, 415);
  if (Number(request.headers.get("content-length") || "0") > MAX_BYTES) return json({ error: "הפנייה ארוכה מדי. קצרו את ההודעה ונסו שוב." }, 413);
  let input: Record<string, unknown>;
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "יש למלא את פרטי הפנייה." }, 400);
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); return json({ error: "הפנייה ארוכה מדי. קצרו את ההודעה ונסו שוב." }, 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return json({ error: "יש למלא את פרטי הפנייה." }, 400);
    input = parsed as Record<string, unknown>;
  } catch { return json({ error: "לא ניתן לקרוא את הפנייה. רעננו את העמוד ונסו שוב." }, 400); }
  const validated = validateLead(input);
  if ("error" in validated) return json({ error: validated.error }, 400);
  if (!config.ready) return json({ error: "הטופס אינו זמין כרגע. אפשר לפנות אלינו ישירות ב־WhatsApp.", code: "unavailable" }, 503);
  if (typeof input.turnstileToken !== "string" || !input.turnstileToken || input.turnstileToken.length > 2048) return json({ error: "השלימו את בדיקת האבטחה ונסו שוב.", code: "verification" }, 400);

  try {
    const check = await send("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: new URLSearchParams({ secret: config.turnstileSecret, response: input.turnstileToken }),
      signal: AbortSignal.timeout(7000),
    });
    const result = await check.json() as { success?: boolean; hostname?: string; action?: string };
    if (!check.ok || !result.success || result.hostname !== new URL(origin).hostname || result.action !== "contact") {
      return json({ error: "בדיקת האבטחה פגה או לא הושלמה. נסו שוב.", code: "verification" }, 400);
    }
  } catch { return json({ error: "לא הצלחנו להשלים את בדיקת האבטחה. נסו שוב או פנו אלינו ישירות.", code: "verification" }, 503); }

  const lead = validated.lead;
  try {
    const result = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `tvuna-contact/${lead.submissionId}` },
      body: JSON.stringify(leadEmail(lead, config)), signal: AbortSignal.timeout(12000),
    });
    const body = await result.json().catch(() => null) as { id?: string } | null;
    if (result.ok && typeof body?.id === "string" && body.id) return json({ ok: true, reference: lead.submissionId });
    if (result.status === 429) return json({ error: "יש כרגע עומס. המתינו כחצי דקה ונסו שוב, או פנו אלינו ב־WhatsApp.", code: "busy" }, 429, { "Retry-After": "30" });
    // Log status only. Do not log the provider body, credentials, or visitor details.
    console.error("Contact email provider response", result.status);
    return json({ error: "לא התקבל אישור לשליחת הפנייה. הפרטים נשארו בטופס. אפשר לנסות שוב או לפנות אלינו ישירות.", code: "delivery" }, 502);
  } catch {
    return json({ error: "אישור השליחה מתעכב. ייתכן שהפנייה כבר נשלחה. הפרטים נשארו בטופס ואפשר לנסות שוב.", code: "uncertain" }, 504);
  }
}
