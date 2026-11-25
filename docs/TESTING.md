# Testing and Verification

This document records the available checks and the manual scenarios used to review the reconstruction. It distinguishes project notes from fresh verification.

## Automated checks

The `package.json` scripts include:

```bash
npm run lint
npm run build
```

- `npm run lint` runs ESLint.
- `npm run build` runs `tsc -b` followed by `vite build`.

The supplied project notes report that both commands passed at an earlier point, with a Vite warning about a JavaScript chunk above 500 kB. Re-run both commands on the final working tree before treating that status as current.

There is no dedicated `test` script in the supplied `package.json`, and no automated end-to-end test suite is documented.

## Manual test checklist

Use this checklist after meaningful UI or routing changes.

| Area | What to verify |
|---|---|
| Home | Scene order, text, images, scrolling and CTA behaviour |
| Puppies | Listing, filters, empty state and URL query synchronisation |
| Puppy detail | Correct slug data, media and unknown-slug handling |
| Gone Home | Gallery content and image loading |
| Happy Families | Image wall, viewer, previous/next and close behaviour |
| How It Works | Section layout, anchor navigation and responsive behaviour |
| FAQ | Expand/collapse behaviour and content |
| Contact | Form and contact actions; do not assume a backend submission exists |
| Navigation | Internal links, browser back/forward and direct route refresh |
| Transitions | Curtain entry, route changes and reduced-motion behaviour |
| Mascot | Scroll journey, pointer/focus interactions and smaller viewports |
| Responsive layout | Desktop, tablet and mobile widths |
| Assets | Images, fonts and icons load from a clean checkout |

## Reported earlier results

The previous `TESTING.md` reported manual passes for several pages, transitions, browser history, puppy detail, 404 behaviour and mobile responsiveness. It did not list exact viewport widths or attach a complete test log.

Treat those results as historical until rechecked against the final working tree and deployed URL.

## Live deployment checks

After deployment, verify:
- Home page loads.
- `/puppies` loads directly and survives refresh.
- An unknown puppy slug shows the not-found state.
- `/how-it-works#imported` resolves to the intended section.
- Images and fonts load without local development paths.
- Browser back and forward work after navigation.

## Performance and accessibility

No current Lighthouse scores are included in the supplied evidence. Run Lighthouse on the deployed site before reporting performance, accessibility, best-practices or SEO scores.

Also test keyboard navigation, visible focus, semantic headings, image alternatives, reduced-motion behaviour and form labels.

## Known gaps

- No automated browser test suite.
- Current production bundle size needs a fresh measurement.
- Image optimisation is a known improvement area.
- Live route refresh and responsive checks should be repeated on the final deployment.
