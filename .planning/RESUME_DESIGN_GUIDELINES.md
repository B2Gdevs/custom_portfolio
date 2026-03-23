# Resume design guidelines and references

Source of truth for future HTML resume work. The Capital Factory resume reset established the baseline: resumes should feel editorial and intentional on screen, but stay boringly reliable in print.

## Design references

Use these as atmosphere references, not copy targets.

- **Light VS Code themes:** calm neutrals, soft contrast, restrained accent use, and plenty of whitespace. Think `GitHub Light`, `Quiet Light`, or similar editor palettes instead of saturated corporate blues.
- **New York editorial / print style:** elegant serif headlines, clean sans-serif body copy, paper-toned backgrounds, understated rules, and structured hierarchy that still looks good when printed in grayscale.
- **Existing stable resumes in this repo:** `axiom_resume.html`, `bild_resume.html`, `autohdr_resume.html`, and `openweb_ui.html` already preserve structure well in browser print/PDF export and should be the implementation references for print behavior.

## Mandatory standards

Every standalone resume in `apps/portfolio/misc/html_resumes/` should meet these rules.

1. **Print first, then screen polish**
   - Browser print/PDF export is a release gate for resume pages.
   - If a layout looks better on screen but becomes fragile in print, prefer the print-safe solution.

2. **Letter-sized output**
   - Define `@page { size: letter; }`.
   - Use printable margins or an equivalent internal padding strategy that survives Chrome/Safari print-to-PDF.

3. **Stable print flow**
   - Multi-column screen layouts must either:
     - linearize into one column in `@media print`, or
     - switch to a print-stable table/fixed-column pattern already proven by the older resumes.
   - Do not rely on glassmorphism, blur, sticky positioning, or decorative overlap in print mode.

4. **Page-break controls**
   - Guard headers, experience blocks, cards, stat groups, and education blocks with `break-inside: avoid` / `page-break-inside: avoid` when practical.
   - Avoid orphaning a heading at the bottom of a page.

5. **ATS / copy-paste readability**
   - Keep semantic HTML and logical reading order.
   - Contact info, role titles, companies, and dates must remain actual text.
   - Links should print as readable text without depending on color alone.

6. **Visual palette**
   - Prefer neutral paper backgrounds, charcoal ink, and one restrained accent family.
   - Avoid highly saturated blue-heavy themes unless a role specifically demands it.
   - In grayscale, the hierarchy must still read clearly.

7. **Typography**
   - Editorial serif is encouraged for the name and section-emphasis moments.
   - Body text should remain a highly legible sans or serif with conservative sizing and spacing.
   - Keep line length and density appropriate for both screen reading and PDF export.

## Resume build checklist

Before considering a resume done:

- Review against the reference resumes for print behavior.
- Open the standalone `/resumes/<slug>` page.
- Use browser print preview / Save to PDF.
- Confirm there is no mangled overlap, clipped block, or broken column flow.
- Confirm the accent treatment still works in grayscale or with background graphics disabled.
- Confirm the page still feels aligned with the light-editor / New York editorial direction.

## Current direction

The Capital Factory resume now represents the preferred aesthetic baseline:

- warmer paper tones instead of blue chrome,
- serif-forward editorial hierarchy,
- restrained slate accenting,
- and a dedicated print fallback that linearizes the layout for stability.
