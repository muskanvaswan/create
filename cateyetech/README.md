# cateyetech.com

A Next.js rebuild of the CATEYE TECHNOLOGY website — IT strategy, IT security and
digital transformation services.

## Stack

- Next.js 15 (App Router) with React 19 and TypeScript
- Tailwind CSS 3 with a custom `ink` / `brand` palette
- Fully static: every route is prerendered at build time
- No third-party UI or icon dependencies — the icon set is hand-rolled SVG

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

## Structure

```
src/
  app/
    page.tsx                  home
    about-us/                 about us
    services/                 services index
    services/[slug]/          one page per service, generated from content
    careers/                  careers
    contact-us/               contact
    get-started/              enquiry / onboarding
    privacy-policy/           legal
    terms-conditions/         legal
    sitemap.ts robots.ts      SEO endpoints
  components/                 header, footer, contact form, shared UI, icons
  content/site.ts             all site copy lives here
```

### Editing content

`src/content/site.ts` is the single source of truth for copy — company details,
office addresses, the six service spectrums, industries, the approach steps and
every service page. Adding an object to the `services` array creates a new page
at `/services/<slug>`, adds it to the header dropdown, the footer, the services
index and the sitemap. No other file needs to change.

### Legacy URLs

The previous site published services at the site root (`/va-pt-services`,
`/cyber-security-services`, `/cio-on-demand-as-a-service`, …). Those paths are
kept alive as permanent redirects to `/services/<slug>` in `next.config.ts`.

## Notes

- The contact form has no backend. It composes a pre-filled message to
  `info@cateyetech.com` via `mailto:` rather than pretending to submit. Wire it
  to a real endpoint (a route handler, Formspree, HubSpot, etc.) when one exists.
- Content was reconstructed from the published pages of cateyetech.com. Service
  descriptions keep the original wording where it existed; supporting copy
  (careers detail, the four-step approach, some legal clauses) was written to
  fill the structure and should be reviewed before launch.
- `company.url` in `src/content/site.ts` drives canonical URLs, Open Graph tags
  and the sitemap. Update it if the site is deployed elsewhere.
