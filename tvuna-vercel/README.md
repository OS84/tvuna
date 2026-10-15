# Tvuna AI — launch update

Prepared for `OS84/tvuna`, Vercel Root Directory `tvuna-vercel`, and `https://www.tvuna.app`.

## What works immediately after deploying this update

- Direct WhatsApp chat to **+972 50-338-8741**, with an editable Hebrew draft. The visitor presses Send inside WhatsApp.
- Direct email draft to **hello@tvuna.app**, with a Gmail web-compose alternative and a copy-address button.
- Clear Hebrew labels, keyboard focus, and responsive layout.
- No FormSubmit browser request, activation dependency, or false “message received” state.
- No new accounts, mailbox subscriptions, or DNS changes required for these direct buttons.

The on-site callback form is shown only when its verified sender and anti-spam service credentials are configured. Until then the page uses direct contact. Direct buttons open the visitor's messaging application; the website itself does not send or store those messages.

## Upload the fix

1. Extract `tvuna-launch-update.zip`.
2. Open https://github.com/OS84/tvuna and choose **Add file → Upload files**.
3. Drag the extracted **tvuna-vercel folder** into the upload area. Keep this exact folder name so it updates the existing `tvuna-vercel/...` files. Commit the changes to `main`.
4. In Vercel keep **Root Directory = tvuna-vercel**, **Framework = Next.js**, and **Node.js = 24.x**. Deploy the latest commit. An existing Git connection may start this automatically.
5. Open https://www.tvuna.app/contact in a private browser window. Verify the WhatsApp recipient and email recipient before sending a test yourself.

No `node_modules`, `.next`, credentials, or customer data are included in the ZIP. Do not upload the ZIP itself.

## Business email — hello@tvuna.app

The website now defaults to **hello@tvuna.app**. This address is shared by the direct email link, Gmail composer, copy-address button, and optional callback form recipient. The Gmail link is for visitors who use Gmail; the business mailbox is accessed in [Zoho Mail](https://mail.zoho.com/).

The owner completed Zoho domain verification and supplied a setup screen showing all three MX records, SPF and DKIM verified on 15 October 2026. The owner also confirmed adding `CONTACT_EMAIL=hello@tvuna.app` to Vercel. No live test message has been sent by this release process.

For the production project [tvuna-q5d5](https://vercel.com/os84s-projects/tvuna-q5d5/settings/environment-variables), keep `CONTACT_EMAIL` set to `hello@tvuna.app`. The code uses this same address if the variable is absent. Any explicit environment override takes precedence, so check Preview separately if you use preview deployments.

### Final checks after deployment

1. Open https://www.tvuna.app/contact in a private browser window. Confirm the visible address is **hello@tvuna.app** and the WhatsApp number is **+972 50-338-8741**.
2. Open the email button and the Gmail alternative. Check the recipient and subject. Check the copy-address button.
3. Open WhatsApp and check the recipient and editable Hebrew draft before pressing Send yourself.
4. Send one email from a personal account to **hello@tvuna.app**, then reply from Zoho. Confirm arrival in both inboxes and check spam folders. DNS verification alone does not confirm message delivery.

Sources: [Zoho email delivery](https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html), [Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables).

## Optional: enable the on-site callback form

Direct contact already works without this. To send inquiries without opening the visitor's mail app, the package includes a server endpoint using Resend, plus Cloudflare Turnstile. Both offer free plans with their current plan limits; do not select paid upgrades for this launch.

1. Create a Resend account on its Free plan. Verify the sending subdomain **notify.tvuna.app** with the exact DNS records Resend supplies. Keep Zoho's root MX records intact. Create a sending-only API key restricted to the verified domain.
2. Create a Cloudflare Turnstile Managed widget. Allow both **tvuna.app** and **www.tvuna.app**. No nameserver migration to Cloudflare is needed. Add a specific preview hostname only if testing there.
3. Add these values in Vercel for the intended environment. Never paste secrets into GitHub or chat:

| Variable | Value |
| --- | --- |
| `CONTACT_EMAIL` | `hello@tvuna.app` |
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
