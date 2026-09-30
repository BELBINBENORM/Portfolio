# BELBIN BENO RM — Portfolio

Vite + React portfolio deployed at [belbin-beno-rm-portfolio.vercel.app](https://belbin-beno-rm-portfolio.vercel.app/).

The root route (`/`) is the Software Engineer persona. Additional persona routes:

- `/data-scientist`
- `/ai-ml-engineer`
- `/ai-engineer`
- `/python-developer`

## Content workflow

Edit the Google Sheet, then export it as `Portfolio CMS.xlsx` and drop the file in the repo root. `npm run dev` and `npm run build` both run `npm run normalize:data` first, which regenerates `src/data/portfolio.json` from the spreadsheet. Do not edit the JSON by hand.

Sheets consumed:

- `00_Hero` — persona copy, slugs, and meta tags
- `01_Skills` — skills grouped by category (`show = true` only)
- `02_Projects` — systems, notebooks, datasets, and coursework
- `03_Experience` / `04_Education` / `05_Certifications`
- `06_Profile_Links` — GitHub, Kaggle, LinkedIn, email

## Local development

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

Direct-refresh of persona routes works locally with Vite preview, and on Vercel via `vercel.json` SPA rewrites.
