# Sebastian Grab – CV

[![CI](https://github.com/sebastian-grab-smiit/sebastian-grab-smiit.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastian-grab-smiit/sebastian-grab-smiit.github.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/sebastian-grab-smiit/sebastian-grab-smiit.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/sebastian-grab-smiit/sebastian-grab-smiit.github.io/actions/workflows/deploy.yml)

Bilingual (DE/EN) CV website at **[grab.smiit.de](https://grab.smiit.de)**, with a
one-click download of the CV and project list as PDF.

The content is maintained in a Google Sheet, so updating the CV never requires a code change:
after editing the sheet, a manual deploy rebuilds the site as static HTML on GitHub Pages.

## Architecture

```mermaid
flowchart LR
  Dev([Push / Run workflow]) --> GH[GitHub Actions]
  GH -- "CSV export at build time" --> Sheet[(Google Sheet)]
  GH -- "validate → test → build" --> Out[Static export]
  Out -- deploy --> Pages[GitHub Pages]
  Pages --> Browser
  Browser -- "pdf-lib, in the browser" --> PDF[CV + project list as ZIP]
```

- **Static by design.** Next.js renders both locales at build time (`output: "export"`). There
  is no server and no runtime API; the sheet is only read during the build.
- **Validated content.** Every sheet tab has a schema ([`lib/sheet/schema.ts`](lib/sheet/schema.ts)).
  The build checks the header row and every cell, and fails with the exact row and column of
  each problem. A broken sheet therefore never reaches production; the last good version stays
  online.
- **No hotlinked images.** Logos referenced in the sheet are downloaded before each build,
  resized and served as WebP from the site itself ([`scripts/fetch-images.ts`](scripts/fetch-images.ts)).
  Unreachable logos are reported and keep their original URL.
- **PDFs generated client-side** with `pdf-lib`. The generators are loaded only when the
  download is requested, so they add nothing to the initial page weight.

| Area      | Choice                                                                   |
| --------- | ------------------------------------------------------------------------ |
| Framework | Next.js 16 (App Router, static export), React 19, TypeScript             |
| Styling   | Tailwind CSS 4 with brand tokens in `app/globals.css`                    |
| Data      | Google Sheets CSV export, parsed with PapaParse, validated with Zod      |
| Motion    | Framer Motion, Lenis (both respect `prefers-reduced-motion`)             |
| Testing   | Vitest (unit), Playwright + axe-core (E2E, accessibility), Lighthouse CI |

## Getting started

Requires Node.js 24 (see `.nvmrc`).

```bash
npm install
cp .env.example .env   # fill in the sheet ID and tab GIDs
npm run check:sheet    # verify the sheet is reachable and valid
npm run dev            # http://localhost:3000/de/
```

### Scripts

| Command               | Purpose                                                   |
| --------------------- | --------------------------------------------------------- |
| `npm run dev`         | Development server                                        |
| `npm run build`       | Static export to `out/`                                   |
| `npm start`           | Serve `out/` locally, like GitHub Pages does              |
| `npm run check`       | Typecheck, lint, format check and unit tests (as in CI)   |
| `npm test`            | Unit tests                                                |
| `npm run test:e2e`    | E2E and accessibility tests against `out/` (build first)  |
| `npm run check:sheet` | Validate the Google Sheet without building                |
| `npm run images`      | Download and optimize the sheet logos (runs before build) |
| `npm run format`      | Format all files with Prettier                            |

## Configuration

| Variable                             | Description                                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GOOGLE_SHEET_ID`        | ID of the Google Sheet (from its URL)                                                                   |
| `NEXT_PUBLIC_GOOGLE_SHEET_<TAB>_GID` | `gid` of each tab: `PERSONAL`, `CERTIFICATES`, `LANGUAGES`, `ACADEMICS`, `SKILLS`, `RESUME`, `PROJECTS` |
| `NEXT_PUBLIC_CALENDLY_URL`           | Booking link used by "Talk to me" and `/meet`                                                           |

Locally these live in `.env`; in GitHub they are repository secrets
(**Settings → Secrets and variables → Actions**).

The sheet must be shared as "Anyone with the link can view". The expected columns of each tab
are defined in [`lib/sheet/schema.ts`](lib/sheet/schema.ts); dates use `YYYY-MM-DD`, lists
are separated by `;` and bullet points by `•`.

Static identity (name, domain, contact links, portrait) is configured in
[`site.config.ts`](site.config.ts).

## Deployment

| Trigger                           | Result                             |
| --------------------------------- | ---------------------------------- |
| Pull request                      | CI: checks, build, E2E, Lighthouse |
| Push to `main`                    | CI, then deploy to GitHub Pages    |
| Actions → Deploy → "Run workflow" | Same, e.g. after editing the sheet |

The deploy job only runs after all CI jobs passed, and it deploys exactly the artifact that was
tested. If the sheet contains invalid data, the run fails with the affected rows and the current
site stays online; fix the sheet and run the workflow again.

## Project structure

```
app/                  Routes: /[lang] (CV), / and /meet (redirects), sitemap, robots
components/page/      Page sections (hero, focus, skills, experience, projects, …)
components/ui/        Shared UI primitives
lib/sheet/            Sheet schema, parser and loader
lib/pdf/              Client-side PDF generation
lib/                  Formatting, SEO/JSON-LD, dictionary, brand palette
e2e/                  Playwright tests
scripts/              Sheet check, logo download, static server
site.config.ts        Name, domain and contact details
```

## Conventions

- Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`,
  `chore:` …), enforced by a commit-msg hook.
- A pre-commit hook lints and formats staged files.
