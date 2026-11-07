# Junk Removal Services — Website

Static, dependency-free landing page (HTML5 / CSS3 / vanilla JS) for a junk removal & hauling company in Glendale, AZ. Built for GitHub → Netlify deployment with Netlify Forms.

## Files

```
index.html           Landing page (all 9 sections)
thank-you.html       Redirect target after a successful quote request
404.html             Custom not-found page (Netlify serves it automatically)
style.css            All styles (responsive, animations, reduced-motion support)
script.js            Mobile nav, scroll-spy, reveal animations, form validation + Netlify submission
netlify.toml         Publish settings + security/caching headers
robots.txt
assets/images/       hero-truck.webp, garage-cleanout.webp, service-*.webp (one per service card), logo-mark.svg, og-image.jpg, apple-touch-icon.png
assets/icons/        sprite.svg (all UI icons)
```

## Deploy

1. Push this folder to a GitHub repository (files at the repo root).
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repo.
3. Build command: *(leave empty)* · Publish directory: `.` (already set in `netlify.toml`).
4. Deploy. In **Site configuration → Forms**, make sure form detection is enabled; the `quote-request` form will appear after the first deploy.
5. Submissions show under **Forms → quote-request**. Add email notifications under **Forms → Form notifications** so new quote requests go straight to the owner's inbox.

## Quote form

- Netlify detects the form via `data-netlify="true"` and the hidden `form-name` field.
- Spam protection: `netlify-honeypot="bot-field"` (hidden field) — Netlify also runs Akismet filtering.
- With JavaScript: client-side validation, AJAX POST to Netlify, then redirect to `/thank-you.html`; network/server errors show an inline error with the phone number.
- Without JavaScript: native browser validation, standard POST, Netlify redirects to `/thank-you.html`.
- Note: submissions only work on the deployed Netlify site, not on a local preview.

## After you have a domain

Update these to absolute URLs (e.g. `https://yourdomain.com/...`) in `index.html` for best social previews and SEO:
- `og:image` and `twitter:image` → `https://yourdomain.com/assets/images/og-image.jpg`
- Add `<link rel="canonical" href="https://yourdomain.com/">` and `<meta property="og:url" ...>`
- Add `"url"` to the JSON-LD block.

## Swapping in your own photos

The hero, about, and service-card photos are photorealistic stock-style images. Real photos of your own truck, crew, and before/after jobs build even more trust. To swap one, replace the matching file in `assets/images/` (for example `hero-truck.webp` or `service-garage.webp`) with an optimized `.webp`/`.jpg` of the same shape (about 1600px wide for the hero, 800px for service cards, under 250 KB), and update the `alt` text in `index.html`.
