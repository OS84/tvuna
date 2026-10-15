# Asset inventory

All repository assets are included under `public/`:

- `favicon.svg`: Tvuna AI mark.
- `file.svg`, `globe.svg`, `window.svg`: retained starter icons.

The main logo, decorative mark, form icons and arrows are inline SVG in the TSX
source, especially `app/layout.tsx`, `app/page.tsx` and
`app/contact/contact-form.tsx`. The company names are styled text, not bitmap
logo files. There are no JPG/PNG photographs referenced by the current site.

`app/globals.css` loads Heebo via Google Fonts. Font binaries are not in this
repository. Internet access is needed for that font; Arial/sans-serif are the
fallbacks. To self-host fonts, obtain Heebo and its license, put the font files
in `public/fonts/`, and replace the CSS import with `@font-face` declarations.

Third-party UI licenses retained in `vendor/` and `build/` must remain with
the relevant code. No visitor screenshots, form uploads or lead records are
included in this package.
