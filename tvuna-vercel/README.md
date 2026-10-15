# Tvuna AI — Vercel upload package

Prepared for GitHub `OS84/tvuna` and the domain `tvuna.app`.
The landing page and contact page preserve the version 16 design and Hebrew RTL layout.

## Publish without using a terminal

1. Extract `tvuna-vercel.zip` and open the extracted `tvuna-vercel` folder.
2. Open https://github.com/OS84/tvuna. For an empty repository, choose **uploading an existing file**; otherwise choose **Add file → Upload files**.
3. Drag the contents of this folder into GitHub, including the `app`, `lib`, `public`, and `tests` folders. Upload the contents, not the ZIP or its outer folder. `package.json` must appear at the repository root.
4. Commit the files to `main`.
5. Open https://vercel.com/new, select the **os84s-projects** team, and import **OS84/tvuna**. If needed, allow the Vercel GitHub integration to see this repository.
6. Set the project name to **tvuna**, Framework Preset to **Next.js**, Root Directory to **./**, and Node.js to **24.x** if shown. Keep the normal Next.js output settings. No environment variables or database are required for these defaults.
7. Click **Deploy**. Wait for **Ready** and open the provided `vercel.app` address.
8. In this deployed project's **Settings → Domains**, add **tvuna.app**. Add **www.tvuna.app** and redirect it to **tvuna.app** if desired. Follow the exact DNS instructions Vercel shows; a team-level domain entry alone does not attach it to this project.
9. Open https://tvuna.app and its contact page. Send a test inquiry yourself, check `sincai@gmail.com` for a FormSubmit activation message, and activate if requested. Then submit again and confirm the actual inquiry arrives before sharing widely.

## Contact behavior

The browser sends inquiries directly to FormSubmit, the processor used by the original site, for delivery to **sincai@gmail.com**. Email and WhatsApp are choices for how Dan should reply; choosing WhatsApp still sends the inquiry by email.

The form validates the fields and honeypot in the browser, retains the 90-second provider timeout, and shows success only after FormSubmit reports acceptance. Acceptance does not prove inbox delivery. An uncertain response leaves the entered details intact. Repeating a request may send another email even if its reference is unchanged.

This landing-page edition has no database, no stored-lead backup, no private inbox, and no local `/api/leads` endpoint. Validation and the honeypot run in the browser; they do not replace a server-side abuse control. FormSubmit handles its own service limits. The original Cloudflare source and private inbox are preserved outside this package.

The direct email link remains available if the form service is unavailable. FormSubmit may require activation for a new domain. No real test email was sent while preparing this package.

## Optional configuration

These public build-time values have working defaults:

- `NEXT_PUBLIC_SITE_URL`: `https://tvuna.app` (sharing metadata).
- `NEXT_PUBLIC_FORMSUBMIT_RECIPIENT`: `sincai@gmail.com`.

Set changes in Vercel's environment variables and redeploy. Do not put credentials in public variables. The form identifies its actual browser origin automatically for both preview and production URLs.

## Local development

Use Node.js 24:

```sh
npm ci
npm test
npm run build
npm start
```

For development, run `npm run dev`. Open http://localhost:3000.

## Assets and provenance

Based on the supplied Tvuna AI version 16 export (source commit `800edf89a971eb1631bd156d3abb61cadedc6ae9`). Uses the original inline SVG artwork, favicon, and stylesheet. Heebo loads from Google Fonts with Arial/sans-serif fallbacks. Unused starter UI components and their dependencies are not included. No credentials, lead records, platform identity headers, or original hosting IDs are included.
