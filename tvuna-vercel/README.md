# Tvuna AI — free contact update

Prepared for `OS84/tvuna`, Vercel Root Directory `tvuna-vercel`, and `https://www.tvuna.app`.

## What works immediately after deploying this update

- Direct WhatsApp chat to **+972 50-338-8741**, with an editable Hebrew draft. The visitor presses Send inside WhatsApp.
- Direct email draft to **sincai@gmail.com**, with a Gmail web-compose alternative and a copy-address button.
- Clear Hebrew labels, keyboard focus, and responsive layout.
- No FormSubmit browser request, activation dependency, or false “message received” state.
- No new accounts, mailbox subscriptions, or DNS changes required for these direct buttons.

The on-site callback form is shown only when its verified sender and anti-spam service credentials are configured. Until then the page uses direct contact. Direct buttons open the visitor's messaging application; the website itself does not send or store those messages.

## Upload the fix

1. Extract `tvuna-contact-fix.zip`.
2. Open https://github.com/OS84/tvuna and choose **Add file → Upload files**.
3. Drag the extracted **tvuna-vercel folder** into the upload area. Keep this exact folder name so it updates the existing `tvuna-vercel/...` files. Commit the changes to `main`.
4. In Vercel keep **Root Directory = tvuna-vercel**, **Framework = Next.js**, and **Node.js = 24.x**. Deploy the latest commit. An existing Git connection may start this automatically.
5. Open https://www.tvuna.app/contact in a private browser window. Verify the WhatsApp recipient and email recipient before sending a test yourself.

No `node_modules`, `.next`, credentials, or customer data are included in the ZIP. Do not upload the ZIP itself.

## Set up hello@tvuna.app with Zoho Free

The user selected Zoho's free custom-domain mailbox. This is a separate mailbox setup, not something Vercel creates. The current domain uses `ns1.vercel-dns.com` and `ns2.vercel-dns.com`. At inspection on 15 October 2026 there were no MX, root TXT, or DMARC records. Re-check before applying changes.

1. Open [Zoho's Forever Free signup](https://workplace.zoho.com/signup?plan=free&type=org). Confirm that the actual offered plan is **Forever Free**. It is available only in selected data centers and excludes IMAP/POP/ActiveSync. Use Zoho webmail or its mobile app. If only paid plans/trials are offered, keep Dan's current Gmail; no paid subscription is needed for the website.
2. Choose an existing domain and enter **tvuna.app**. The account owner completes signup, password, phone verification, and service terms privately.
3. Zoho gives you a unique domain-verification TXT record. In [Vercel's tvuna.app domain settings](https://vercel.com/os84s-projects/~/domains/tvuna.app), add that exact record under DNS. Use the root name (blank in Vercel) if Zoho specifies `@`. Return to Zoho and verify.
4. Create the **hello** mailbox. Use the MX hosts and priorities shown in **your Zoho account**, since they depend on the data center. Add those MX records at the root in Vercel. Preserve the website's A/ALIAS/CNAME records and the nameservers.
5. Add Zoho's SPF and DKIM TXT records from its setup screen. Use one SPF record per hostname; combine authorized senders if one already exists. Verify DKIM in Zoho. Do not copy region-specific records from an unrelated tutorial.
6. After SPF/DKIM are verified, add DMARC initially in monitoring mode following Zoho's guidance. Start with `v=DMARC1; p=none` at `_dmarc`. Reporting can be added after a report mailbox/alias is created. Tighten the policy only after checking authentication.
7. Send a message **to** hello@tvuna.app from an outside account, then reply **from** Zoho. Check both directions and spam folders before switching the website.
8. In the Vercel project → **Settings → Environment Variables**, set `CONTACT_EMAIL` to `hello@tvuna.app` for Production and redeploy. The direct email link, Gmail composer link, copied address, and optional form recipient update together. The Gmail button is for a visitor composing an email to you; your new business inbox is accessed in Zoho.

The default remains `sincai@gmail.com` until the custom mailbox is activated and this variable changes. This avoids advertising a non-working address.

Sources: [Zoho free plan](https://www.zoho.com/mail/zohomail-pricing.html), [domain verification](https://www.zoho.com/mail/help/adminconsole/domain-verification.html), [email delivery](https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html), [Vercel email DNS](https://vercel.com/docs/domains/managing-dns-records#setting-up-email-for-your-domain).

## Optional: enable the on-site callback form

Direct contact already works without this. To send inquiries without opening the visitor's mail app, the package includes a server endpoint using Resend, plus Cloudflare Turnstile. Both offer free plans with their current plan limits; do not select paid upgrades for this launch.

1. Create a Resend account on its Free plan. Verify the sending subdomain **notify.tvuna.app** with the exact DNS records Resend supplies. Keep Zoho's root MX records intact. Create a sending-only API key restricted to the verified domain.
2. Create a Cloudflare Turnstile Managed widget. Allow both **tvuna.app** and **www.tvuna.app**. No nameserver migration to Cloudflare is needed. Add a specific preview hostname only if testing there.
3. Add these values in Vercel for the intended environment. Never paste secrets into GitHub or chat:

| Variable | Value |
| --- | --- |
| `CONTACT_EMAIL` | `hello@tvuna.app` after activation, or `sincai@gmail.com` |
| `CONTACT_FROM` | `Tvuna AI <website@notify.tvuna.app>` |
| `RESEND_API_KEY` | The sending-only key from Resend |
| `TURNSTILE_SITE_KEY` | The widget's public site key |
| `TURNSTILE_SECRET_KEY` | The widget's secret key |

4. Redeploy. The callback form appears beneath the direct buttons. Email/WhatsApp inside this form specify the visitor's preferred callback method; the notification is emailed to your fixed contact inbox.
5. Submit one email-mode and one WhatsApp-mode test yourself. Confirm real arrival in the inbox and provider delivery status; provider acceptance alone is not proof of delivery. Reply-To is set to the visitor's email for email-mode inquiries.

The server verifies the request origin, body size, fields, honeypot and single-use Turnstile token (including hostname and action). It sends only to the configured business address. No provider secret reaches the browser. Resend idempotency keys deduplicate unchanged retries for 24 hours. A timeout is shown as uncertain, with details retained. There is no database or private lead inbox; successful delivery depends on the email provider. Turnstile is abuse protection, not an unlimited guarantee; monitor provider quotas and delivery errors in Resend.

Sources: [Resend pricing](https://resend.com/pricing), [domain verification](https://resend.com/docs/dashboard/domains/introduction), [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [Turnstile](https://developers.cloudflare.com/turnstile/get-started/).

## Development and verification

Node.js 24, `npm ci`, `npm test`, `npm run build`, `npm start`.
The tests use mocked delivery and verification services; they do not send mail. The release build checks the landing page, direct contact page, callback form, and server route. Live mailbox activation and end-to-end delivery must be verified after setup.

Based on the supplied version 16 design. Uses original SVG artwork, favicon, and Heebo stylesheet with Google Fonts. The original export remains outside this package.
