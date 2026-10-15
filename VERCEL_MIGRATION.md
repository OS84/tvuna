# Vercel migration checklist

This is the original Sites/Vinext/Cloudflare application, not a completed
Vercel port. Importing it into Vercel without the changes below will not
provide a working production application. A custom domain alone does not
replace its backend dependencies.

## 1. Switch build/runtime to standard Next.js

- Keep the App Router UI under `app/`, the components, styles, public assets
  and form validation/attempt helpers.
- Replace the `dev`, `build`, and `start` scripts with `next dev`,
  `next build`, and `next start` respectively. Keep the checked-in dependency
  lockfile as the initial version reference; update and review it when removing
  Vinext/Cloudflare tooling. Do not blindly use `latest` versions.
- Vercel should use the Next.js preset and its normal output handling, not
  `dist/server/wrangler.json` or a manually selected static output directory.
- Remove/exclude the Vinext/Vite build pipeline (`vite.config.ts`, the Sites
  plugin, connector preview worker and wrapper, and Cloudflare-specific build
  scripts). Review `lib/connectors.ts` and connector-context helpers too; no
  connected-app features are required by the marketing/contact flow.
- Replace every reachable `cloudflare:workers` import and `env.DB` usage.
  Current primary locations: `app/api/leads/route.ts` and `db/index.ts`.
  Replace the worker `env.LEAD_EMAIL_ENABLED` access with server-side
  `process.env.LEAD_EMAIL_ENABLED`. The current ambient Cloudflare types and
  `.openai/hosting.json` do not provision resources on Vercel.

## 2. Choose persistence and rewrite the API

- Implement storage for leads and rate limits on a database accessible from
  Vercel. The SQLite schema is in `db/schema.ts`; blank schema-only migrations
  are in `drizzle/`. Convert SQL syntax, transactions, `RETURNING`, and conflict
  handling for the chosen database. The unused `lead_deliveries` table is a
  historical scaffold, not proof of email delivery.
- Replace D1's `prepare().bind().first()/all()/batch()` calls with the new
  database adapter. Do not use a process-local array or instance filesystem
  for production leads, idempotency or rate limits.
- Preserve server validation, the 4 KiB body limit, honeypot, same-origin
  enforcement, UUID-based idempotency and rate limiting. On another provider,
  use its trusted client-IP mechanism; `CF-Connecting-IP` is not authoritative
  on an arbitrary deployment.
- The form requires `POST /api/leads` to return `{ok:true,
  emailForwardingRequired:true}` only after successful persistence and when
  email is enabled. Its subsequent FormSubmit request is performed by the
  browser. A changed payload must use a new ID; an identical retry reuses it.

## 3. Replace private inbox authentication

- Replace `app/chatgpt-auth.ts` and the `/leads` authentication path with a
  verified session from the chosen identity provider, or disable both
  `/leads` and `GET /api/leads` until that is complete.
- Never trust public `oai-authenticated-user-*` request headers on Vercel.
  The original Sites dispatcher verifies/injects them; arbitrary visitors can
  forge such headers when that trusted dispatcher is absent.
- Keep authorization on the server for both the page and API. Do not expose
  leads by removing the existing auth checks to make the page load.

## 4. Configure email and the new domain

- Update `_url` and the recipient URL in `lib/lead-email.ts` for the intended
  production origin and mailbox. These are currently hard-coded; the suggested
  variables in `.env.example` are not automatically used by the existing code.
- Activate FormSubmit for the new website if it requests activation. The
  old site's activation does not guarantee the new domain is activated.
- Update Open Graph URL in `app/layout.tsx` and all origin-specific tests.
- Keep the timeout/uncertain-delivery handling: an email may be sent even if
  its acknowledgement does not reach the browser. Do not silently retry the
  email automatically, because that can create duplicate notifications.
- Configure real secret values in Vercel project settings, never in Git or
  `NEXT_PUBLIC_*` variables. Recipient/site URL can be public; database and auth
  credentials cannot.

## 5. Deploy and verify

After implementing the port, commit it to the intended GitHub repository,
import that repository into the correct Vercel project, add the runtime
configuration and database schema, and deploy a preview. The supplied source
must be adapted first; this ZIP does not create or deploy a Vercel project.

Before using the production domain, verify:

1. Hebrew RTL layout and no horizontal overflow at mobile widths.
2. Every main CTA reaches `/contact`.
3. Invalid values and spam submissions are rejected.
4. Email and WhatsApp contact choices both persist and reach the real mailbox.
5. A delayed provider reply does not show a premature failure.
6. Editing the contact details after a failed attempt does not reuse an old ID.
7. Identical persistence retries do not create another database row.
8. Anonymous/unauthorized inbox page/API access is denied, including forged
   identity headers.
9. Preview and production origins do not accidentally share an unsafe origin
   allowlist or publicly expose a preview database.

No end-to-end Vercel deployment or Safari test was performed for this export.

## Primary documentation

- Next.js on Vercel: https://vercel.com/docs/frameworks/full-stack/nextjs
- Import a Git project: https://vercel.com/docs/git
- Environment variables: https://vercel.com/docs/environment-variables
- Custom domains: https://vercel.com/docs/domains/working-with-domains
- Original D1 CLI: https://developers.cloudflare.com/d1/wrangler-commands/
