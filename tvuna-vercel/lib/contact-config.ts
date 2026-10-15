import { validEmail, whatsappLink } from "./contact-links.ts";

// Imported only by server modules. Never pass this entire object to a client component.
export function getContactConfig(env: NodeJS.ProcessEnv = process.env) {
  // Keep the existing reachable mailbox until the custom-domain inbox is active.
  const email = (env.CONTACT_EMAIL || "sincai@gmail.com").trim();
  const from = (env.CONTACT_FROM || "").trim();
  const fromAddress = from.match(/<([^<>]+)>$/)?.[1] || from;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL || "https://www.tvuna.app";
  const allowedOrigins = new Set([new URL(siteUrl).origin, "https://tvuna.app", "https://www.tvuna.app"]);
  if (env.VERCEL_ENV === "preview" && env.VERCEL_URL) allowedOrigins.add(`https://${env.VERCEL_URL}`);
  if (env.NODE_ENV === "development") allowedOrigins.add("http://localhost:3000");
  const apiKey = env.RESEND_API_KEY || "";
  const turnstileSecret = env.TURNSTILE_SECRET_KEY || "";
  const turnstileSiteKey = env.TURNSTILE_SITE_KEY || "";
  const ready = Boolean(validEmail(email) && validEmail(fromAddress) && !/[\r\n]/.test(from) && apiKey && turnstileSecret && turnstileSiteKey);
  return {
    email: validEmail(email) ? email : null,
    whatsappUrl: whatsappLink(env.WHATSAPP_NUMBER || "+972503388741"),
    whatsappDisplay: env.WHATSAPP_NUMBER || "+972 50-338-8741",
    from, apiKey, turnstileSecret, turnstileSiteKey, allowedOrigins, ready,
  };
}

export type ContactConfig = ReturnType<typeof getContactConfig>;
