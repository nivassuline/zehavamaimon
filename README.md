# zehavamaimon.com

Website for **Zehava Maimon (זהבה מימון)** — senior life-coach & ADHD specialist, lecturer and author.

Static site (Hebrew, RTL). Homepage is a redesigned single-page layout ("Clinical Calm"); inner
pages (about, lectures, store, contact, gallery, accessibility, terms) are content pages. The
contact form opens a pre-filled WhatsApp message — no backend required.

Served via GitHub Pages. All internal links are relative, so the site works both under a Pages
project subpath and at the `zehavamaimon.com` domain root.

## Accessibility (נגישות)

Every page carries the Hebrew accessibility toolbar (תפריט נגישות) declared in the
accessibility statement (`accessibility/`): text resize, grayscale, high/negative contrast,
light background, link underlining, readable font, and reset.

- **Inner pages** use the original pojo-accessibility toolbar recovered from the WordPress
  site (`wp-content/plugins/pojo-accessibility/`), with settings persistence enabled
  (`enable_save:"1"` in each page's inline `PojoA11yOptions`).
- **The homepage** uses the same toolbar markup/CSS, driven by `assets/a11y-home.js`
  (vanilla JS, no jQuery). Text resize is implemented as page zoom (`zma-resize-*` classes)
  because the homepage's px-based styles ignore pojo's %-font rules, and grayscale is a
  `backdrop-filter` overlay so fixed buttons keep working.
- Both write the same `pojo-a11y` localStorage entry, so settings follow visitors across
  the whole site (12-hour expiry).
