# Architecture

The project is a React single-page application built with TypeScript and Vite. React Router handles client-side navigation. Content is held in typed local data files, while images, fonts, and other static assets are served from `public/`. There is no custom backend.

## At a glance

| Area | Current implementation |
|---|---|
| UI | React 19 + TypeScript |
| Build tool | Vite 8 |
| Routing | React Router 7 |
| Runtime dependencies | React, React DOM, React Router DOM |
| Styling | Component/page CSS, shared tokens and typography |
| Animation | Custom TypeScript and CSS; browser animation APIs |
| Content | Local typed data and JSON reference payloads |
| Hosting | Static deployment with an SPA rewrite |

The archive contains roughly 7,900 lines of TS/TSX and 6,600 lines of CSS. These are approximate source counts, not a measure of runtime complexity.

## Routes

`src/App.tsx` defines the application routes under the shared layout.

| Route | Page |
|---|---|
| `/` | Home |
| `/puppies` | Puppy listing and filters |
| `/puppies/:slug` | Puppy detail |
| `/gone-home` | Gone-home gallery |
| `/happy-families` | Family gallery and viewer |
| `/how-it-works` | Process explanation |
| `/faq` | Frequently asked questions |
| `/contact` | Contact page |
| `*` | Not-found page |

The shared layout is in `src/layouts/`. It provides common page elements such as navigation, footer, and global experience components. Because navigation is client-side, the host must serve `index.html` for application routes; see `DEPLOYMENT.md`.

## Source structure

| Directory | Responsibility |
|---|---|
| `src/pages/` | Route-level page components |
| `src/layouts/` | Shared application shell |
| `src/components/` | Reusable interface and experience components |
| `src/components/home/` | Home-page building blocks and scenes |
| `src/hooks/` | Reusable browser and UI behaviour |
| `src/lib/` | Framework-independent helpers and animation logic |
| `src/data/` | Local content |
| `src/types/` | Shared TypeScript interfaces |
| `src/styles/` | Design tokens, typography and shared styles |
| `public/` | Images, fonts, icons and other static assets |
| `scripts/` | Reference-data and media extraction utilities |
| `docs/reference/` | Extracted JSON reference data |

## Data flow

Page components read structured content from `src/data/`. Shared interfaces in `src/types/` describe the expected data shapes. This keeps content separate from presentation and lets TypeScript catch many data-shape mistakes during compilation.

The puppy listing synchronises filter state with URL search parameters. This makes filtered views linkable and allows the browser URL to represent the selected filters.

## Animation architecture

The project uses browser APIs and custom code rather than a dedicated animation library.

- `useScrollScrub` maps scroll progress to a CSS custom property.
- `useReveal` uses intersection observation to reveal content.
- Home-specific hooks coordinate individual scene interactions.
- `PageCurtain` manages route-entry transitions.
- `PawTrail` draws a pointer trail on suitable devices.
- `PupJourney` coordinates the page-level mascot movement.

This separation keeps low-level effects in hooks and helpers while page components describe the experience.

## Mascot architecture

The mascot system is split into reusable pieces:

- `src/lib/pupRig.ts` contains the rig and pose calculations.
- `src/lib/pupActions.ts` defines named character actions.
- `src/lib/pupJourney.ts` contains journey planning and path-solving logic.
- `src/components/PupJourney.tsx` coordinates the scroll-driven character.
- `src/components/TeddyRig.tsx` renders a rig-driven character in its supported modes.

The rig is a reconstruction based on observed reference behaviour; it is not the original site's source code.

## Styling and assets

Shared colours and motion tokens live in `src/styles/tokens.css`. Typography is defined in `src/styles/typography.css`, and shared button styles are in `src/styles/buttons.css`. Page- and component-specific CSS remains close to the component.

Original media is stored locally under `public/`. The supplied archive includes around 137 files in `public/media` and 24 gone-home photos, plus other brand and character assets. These counts describe the supplied archive and should be rechecked if assets change.

## Known architecture limitations

- No backend or database.
- No CMS; content changes are made in source data.
- Images are not yet served through a dedicated image optimisation pipeline.
- The earlier project notes report a large JavaScript chunk; re-run a production build before quoting current bundle measurements.
- The repository does not define a dedicated automated test script.

See `DECISIONS.md`, `TESTING.md`, and `BUILD_PLAN.md` for the reasoning and next steps.
