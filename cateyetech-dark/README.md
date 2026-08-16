# cateyetech.com — dark

A dark-themed build of the CATEYE TECHNOLOGY website, with a working
server-side contact endpoint.

Sibling of `../cateyetech`, which is the same site in light theme with a
`mailto:` contact form. Content is identical and lives in the same place, so
copy edits can be moved between the two.

## Stack

- Next.js 15 (App Router) with React 19 and TypeScript
- Tailwind CSS 3 driven by semantic CSS-variable tokens
- Nodemailer for outbound SMTP
- Every page prerenders at build time; only `/api/contact` is dynamic

## Running it

```bash
npm install
cp .env.example .env.local   # optional — see "Contact endpoint" below
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

## The dark theme

Colors are declared once as CSS variables on `:root` in `src/app/globals.css`
and exposed to Tailwind as semantic names in `tailwind.config.ts`. A surface is
chosen by role, not by a number on a scale:

| Token | Role |
| --- | --- |
| `page` | default page background |
| `raised` | cards, header, form fields' container |
| `sunken` | hero, closing bands, alternating sections |
| `line` / `line-strong` | hairlines and control borders |
| `heading` / `body` / `muted` / `faint` | type, brightest to dimmest |
| `brand` / `brand-soft` / `brand-deep` / `brand-ink` | cyan accent; `brand-ink` is for text *on* the accent |

Retheming means editing the variables in `globals.css` — no component changes.
All type tokens clear WCAG AA (4.5:1) against all three surfaces; `faint` is the
tightest at 5.17:1 on `raised`.

## Contact endpoint

`POST /api/contact` accepts `multipart/form-data` from the contact form on
`/contact-us` and `/get-started`.

Pipeline, in order:

1. **Rate limit** — 5 submissions per IP per 15 minutes (`src/lib/rate-limit.ts`).
   In-memory and therefore per-instance; swap in Redis if you run replicas.
2. **Bot checks** — a hidden honeypot field that must stay empty, and a minimum
   2.5s fill time. Both return `200 {ok:true}` so a caught bot learns nothing.
3. **Validation** — `src/lib/enquiry.ts`. Returns `422` with per-field messages
   that the form renders inline. CR/LF is stripped from every single-line field
   so a submitted value cannot inject extra mail headers.
4. **Delivery** — `src/lib/mailer.ts` sends via SMTP with the visitor's address
   as `Reply-To` (never as `From`, which would break SPF/DKIM).
5. **Durable record** — `src/lib/enquiry-store.ts` appends every accepted
   enquiry to `ENQUIRY_LOG_PATH` as JSON Lines.

The request only fails (`503`) if the enquiry reached *neither* the inbox nor
disk, so a visitor is never asked to retype a message that was in fact captured.

### Configuration

See `.env.example`. With SMTP unset the site still runs: enquiries are
validated, accepted, and written to disk, and a warning is logged. That is
convenient locally and **not** what you want in production — set the SMTP
variables before launch, and point `ENQUIRY_LOG_PATH` at a persistent volume,
since an ephemeral filesystem takes the fallback record with it.

Verify a deployment by submitting once and checking the response body:
`{"ok":true,"delivered":true,"mailConfigured":true,"mailFailed":false}`.

## Structure

```
src/
  app/
    page.tsx                  home
    about-us/ services/ careers/ contact-us/ get-started/
    services/[slug]/          one page per service, generated from content
    privacy-policy/ terms-conditions/
    api/contact/route.ts      contact endpoint
    sitemap.ts robots.ts      SEO endpoints
  components/                 header, footer, contact form, shared UI, icons
  content/site.ts             all site copy
  lib/                        validation, rate limiting, mail, storage
```

Adding an object to the `services` array in `src/content/site.ts` creates its
page at `/services/<slug>` and adds it to the header dropdown, the footer, the
services index, the sitemap, and the contact form's subject list.

## Notes

- Legacy flat service URLs (`/va-pt-services`, `/cio-on-demand-as-a-service`, …)
  redirect permanently to `/services/<slug>` via `next.config.ts`.
- Content was reconstructed from the published pages of cateyetech.com. Service
  descriptions keep the original wording; supporting copy (careers detail, the
  four-step approach, some legal clauses) was written to fill the structure and
  should be reviewed before launch.
- `company.url` in `src/content/site.ts` drives canonical URLs, Open Graph tags
  and the sitemap. Update it if the site is deployed elsewhere.
