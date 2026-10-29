# Women's Care OB/GYN of NJ

Production website for Women's Care OB/GYN of New Jersey. Two locations in Paterson and Totowa, NJ.

## Stack

Static HTML, CSS, and vanilla JavaScript. No build step. Deploy as-is.

## Structure

- `index.html` — homepage (EN), `index.es.html` (ES)
- `style.css` — all shared styles
- `main.js` — nav, mobile menu, FAQ, reveal animations
- `chat.js` — AI Care Assistant logic
- `web images/` — photos and logos
- Service pages, provider pages, blog articles, location pages
- Legal: `privacy.html`, `terms.html`, `hipaa.html`, `accessibility.html`
- `sitemap.xml`, `robots.txt`, `404.html`

## Deploy

Designed for Vercel. `vercel.json` includes basic security headers and cache rules.

## Before going live

1. Analytics: the placeholder Google tag was removed (it loaded a third-party tracker on a health site while measuring nothing). If you add analytics, use a privacy-first tool that sets no cookies and never sees page content, and add its origin to the CSP in `vercel.json`
2. Wire the contact form to a real handler (Formspree, Netlify Forms, or a custom endpoint)
3. Update `og:url` and `og:image` if changing the production domain
