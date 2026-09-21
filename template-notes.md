# Template Notes

`template.html` is copied from the current `artsbuilding.html` and can be reused as a starting point for other building pages.

The text, images, table entries, and external link inside the template are now placeholder content and should be replaced when creating a new building page.

`css/base.css`
- Shared site styling.
- Controls the common header, footer, favicon-related visual consistency, brand fonts, and shared spacing.

`css/styleSub.css`
- Subpage-specific styling.
- Controls the intro section, content cards, gallery, table layout, accessibility button position, and the footer layout used by the template page.

`css/accessibility.css` and `js/accessibility.js`
- Shared accessibility settings (text size in 5 steps up to 200%, high contrast, text spacing, underlined links, reduced motion), used by every page including `index.html`, `map.html` and `catalogue.html`.
- The script builds the settings dialog itself, so a page only needs the header button (`id="accessibilityBtn"`), the stylesheet link in `<head>`, and the script tag at the end of `<body>`. If a page has no button, one is added automatically.
- All text sizes in the CSS must be in `rem` (not `px`) so the text-size setting can scale them.
- Settings are saved in `localStorage`, so they carry over to every page.

If another building page uses the same structure, it can keep these files and only replace the page content, images, and text.
