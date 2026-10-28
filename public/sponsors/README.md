# Reco Labs Sponsor Assets

Place sponsor logos (SVG, PNG, WebP) in this folder.

To attach a logo to a sponsor slot on the Sponsors page:
1. Save the image file here, e.g. `public/sponsors/company-logo.png`
2. Open `src/pages/SponsorsPage.tsx`
3. In `INITIAL_SPONSORS`, set the `logo` attribute for that sponsor:
   ```ts
   {
     id: "founding-01",
     name: "Acme Corp",
     logo: "/sponsors/company-logo.png",
     url: "https://acme.example",
     tier: "founding",
     tierLabel: "TIER 01 · FOUNDING PARTNER",
     description: "Anchor supporter of Reco Labs hardware kits.",
     slotOpen: false,
   }
   ```
4. If `logo` is left empty or omitted, a clean placeholder slot is automatically rendered.
