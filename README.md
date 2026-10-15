# תבונה AI / Tvuna AI — source handoff

ייצוא של גרסה 16, הגרסה האחרונה שנשמרה ופורסמה נכון ל־15.10.2026.
החבילה כוללת את כל קוד המקור שבמאגר, נכסי SVG, קוד טופס הפניות ובדיקות.
אין כאן נתוני פונים, בסיס נתונים, סיסמאות או מפתחות גישה.
זהו פרויקט React/TypeScript עם שרת, לא קובץ HTML יחיד. לפני העלאה ל־Vercel
נדרשת התאמה כמפורט ב־`VERCEL_MIGRATION.md`. האתר הקיים לא שונה עקב הייצוא.

## Snapshot and scope

- Published version: **16**.
- Source commit: `800edf89a971eb1631bd156d3abb61cadedc6ae9`.
- Current site: https://tvuna-ai.sincai.chatgpt.site/
- Runtime: Vinext (Next.js-compatible App Router UI), React, TypeScript,
  Cloudflare Workers, D1 and Drizzle schema/migrations.
- All tracked application files are preserved byte-for-byte. This export
  replaces the outdated original README and adds handoff documentation,
  configuration examples, ignore rules and integrity metadata.
- No production deployment, database export or account transfer is performed.

## Contents

| Path | Purpose |
| --- | --- |
| `app/page.tsx`, `app/layout.tsx`, `app/globals.css` | Hebrew RTL landing page, branding, eight example use cases, team and CTAs |
| `app/contact/` | Public contact page/form, email or WhatsApp choice, validation and success/error UI |
| `app/api/leads/route.ts` | Persistence API, same-origin enforcement, validation, rate limiting and private list API |
| `lib/lead-attempt.ts` | New ID for edited data, same ID for an unchanged retry |
| `lib/lead-email.ts` | Browser-side FormSubmit request and 90-second acknowledgement timeout |
| `lib/lead-validation.ts` | Server-side validation and owner authorization helper |
| `app/leads/`, `app/chatgpt-auth.ts` | Private inbox and original Sites authentication integration |
| `db/`, `drizzle/` | Database schema and schema-only migrations; no rows or database files |
| `public/`, inline SVG, `vendor/` | All local graphics and relevant retained licenses; see `ASSETS.md` |
| `components/`, `hooks/`, `examples/`, `build/`, `scripts/` | Full tracked component library, starter utilities and original build/runtime code |
| `package.json`, `package-lock.json` | Dependencies and exact installation lockfile |
| `.env.example`, `.dev.vars.example` | Example configuration only, with no credentials |
| `VERCEL_MIGRATION.md` | Required Vercel changes, deployment and verification checklist |
| `EXPORT_MANIFEST.json`, `SHA256SUMS.txt` | Export provenance and file-integrity checks |

## Local run: original Cloudflare runtime

Use Node.js **24** for the included native TypeScript unit-test commands
(the package's runtime engine minimum is 22.13). Use npm with the supplied
lockfile. Cloudflare's local worker tooling requires a supported macOS,
Linux or Windows environment. Package downloads need internet access.

From this directory:

```bash
npm ci
npm run build
```

A clean checkout has no `.sites-runtime` directory, so the included execution
profile helper selects its portable build path. The build generates
`dist/client` and `dist/server/wrangler.json`; these generated files are not
part of the source ZIP.

Initialize a **new local** database using the generated binding configuration:

```bash
npx wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_familiar_mephistopheles.sql
npx wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_aberrant_joshua_kane.sql
```

Run each schema file only once per fresh local database. Re-running plain
`CREATE TABLE` files against an initialized database causes an existing-table
error. Nothing above reads or modifies the original production database.

Copy the non-secret worker configuration example next to the generated
Wrangler configuration, then start the built worker:

```bash
cp .dev.vars.example dist/server/.dev.vars
npm start -- --port 4173
```

Open http://127.0.0.1:4173/ and `/contact`. `LEAD_EMAIL_ENABLED=false` is the safe
local example default: it permits inspection/persistence but the form will
not show an email success. To test real mail, deliberately set it to `true`
in the local `dist/server/.dev.vars` file and restart. Submissions then go to
**sincai@gmail.com**, which is currently hard-coded in `lib/lead-email.ts`.
Do not send real customer data from an unreviewed development setup.

For UI development, `npm run dev` uses port 5173 in the portable profile.
Production-style validation is better done with the built worker above.
The original private inbox depends on trusted Sites identity and is not a
portable login system; missing identity locally is expected. Never simulate
its headers on an internet-facing server.

Rebuilding can replace generated files, so re-create local worker
configuration as needed. `.env.example` also lists suggested names for a
future Vercel port; those names are explicitly not all connected to the
current source code.

## How the form works

1. Client and server validate full name, business name, preferred contact
   method (`email`/`whatsapp`) and the corresponding contact value.
2. The browser posts to `/api/leads` on the same origin. D1 stores the lead
   before returning an acknowledgement and the email-forwarding flag.
3. If enabled, the browser sends an URL-encoded request to FormSubmit. This
   avoids the extra JSON cross-origin preflight. No browser API key is used.
4. The success UI appears only after FormSubmit accepts the request. The
   acknowledgement timeout is 90 seconds; delays/uncertain acknowledgement
   are not presented as a definite failure to save the lead.
5. A retry with unchanged data reuses the submission ID. Edited data gets a
   new ID. This deduplicates stored rows, not email notifications when an
   earlier provider response was lost. There is no durable email job queue
   or automatic retry after the browser closes.

The form has a honeypot, bounded body size, same-origin request checks,
server validation and an atomic per-IP/time-window limiter. The limiter
stores a time-windowed digest, not raw IP addresses. It is basic spam
protection, not a CAPTCHA or a guarantee against abuse. `lead_deliveries` is
retained historical schema and is not populated by the current browser-mail
flow. Provider acceptance is not proof that an email reached the inbox;
verify the real mailbox after changing domain or delivery settings.

## Other hosting providers

The full frontend can be reused, but the current source is tied to
Cloudflare D1 and Sites identity/build integrations. For Cloudflare outside
Sites, create your own D1 database and worker deployment configuration,
apply the schema to that new database, wire the database ID and email flag,
replace/remove private inbox authentication and remove Sites-only build
metadata. Do not deploy the existing `.openai/hosting.json` project identity
as a new project. Do not treat its placeholder database ID as a real database.

For **Vercel**, read `VERCEL_MIGRATION.md` first. In particular, replace the
Cloudflare APIs/database adapter, the build scripts and the trusted-platform
login. Do not merely change the output folder or delete authorization checks.
This archive is a source export with migration instructions, not a validated
Vercel-ready distribution. If the private inbox is unnecessary, disable it
and its list endpoint deliberately; preserving only marketing plus email is
a different feature scope and must still include a tested submission path.

Update the hard-coded production origin in `lib/lead-email.ts` and Open Graph
metadata in `app/layout.tsx`, review the recipient and owner email, activate
FormSubmit for the new website if requested, and test email + WhatsApp
contact modes. Local examples and new domains have not been activated for you.

## Checks

No credentials or real customer data are required by these unit tests:

```bash
node --test tests/lead-attempt.test.mjs tests/lead-email.test.mjs tests/lead-validation.test.mjs
npx tsc --noEmit
```

There are 25 unit tests, including edited/unchanged retries, delayed provider
acknowledgements, explicit timeouts and rate-limit errors. `tests/http-smoke.mjs`
creates synthetic rows in whichever `TEST_ORIGIN` is supplied, so use only a
local or designated staging instance:

```bash
TEST_ORIGIN=http://127.0.0.1:4173 node tests/http-smoke.mjs
```

`tests/browser-smoke.mjs` is retained original authoring-environment QA, not a
portable test runner: it has absolute browser/dependency paths and older UI
labels. Adapt those before running it. Its injected local identity headers
must never become a production authentication bypass.

The published original build and unit checks passed when version 16 was
created. Email and WhatsApp synthetic notifications reached the intended
mailbox on 14 October. This does not certify another provider, a new domain,
or every browser. No new production submissions were created for this export.

## Data, credentials and licenses

The ZIP contains only source/schema/docs, not `.git`, `node_modules`, build
output, `.wrangler`, `.sites-runtime`, databases, leads, screenshots, logs,
actual environment files, account tokens or passwords. Owner/recipient email
and the existing public Site ID/URL are configuration references, not secrets.
All test contacts are synthetic examples. This export does not transfer
ownership of the hosting account or existing stored leads. Keep supplied
third-party license notices. See `ASSETS.md` for graphics and the external font.
