# Engineering Decisions

This document records the main technical decisions behind the reconstruction. The goal is to explain why the current approach was chosen, what trade-offs it creates, and where the implementation can be found.

## 1. Reconstruct the reference instead of redesigning it

**Decision:** Prioritise the reference site's visual identity, page structure, media and interactions.

**Why:** The task is a reconstruction. A redesign could look polished but would not demonstrate fidelity to the supplied reference.

**Trade-off:** Detailed visual and motion matching takes more time than using a generic template.

**Evidence:** Page components, local styles, extracted reference notes in `RECON.md`.

## 2. Use React, TypeScript and Vite

**Decision:** Build a client-rendered React application with TypeScript and Vite.

**Why:** The pages share reusable UI, need interactive state, and do not require a custom server-rendering or backend layer for this reconstruction.

**Trade-off:** Nested routes require a hosting rewrite, and server-side rendering is not reproduced.

**Evidence:** `package.json`, `vite.config.ts`, `tsconfig.app.json`, `src/App.tsx`.

## 3. Use React Router for navigation

**Decision:** Use React Router 7 with a shared layout and route-level pages.

**Why:** The site has multiple routes, puppy detail paths, and a not-found route. A shared layout avoids duplicating common page elements.

**Trade-off:** Direct refreshes on nested URLs depend on the hosting configuration.

**Evidence:** `src/App.tsx`, `src/layouts/`, `vercel.json`.

## 4. Keep the runtime dependency set small

**Decision:** Avoid adding a UI or animation library unless it solves a clear problem.

**Why:** The reconstruction needs distinctive custom interactions. CSS and browser APIs provide control without adding another runtime dependency.

**Trade-off:** More custom code must be maintained and tested.

**Evidence:** `package.json`, `src/hooks/`, `src/lib/`, component CSS.

## 5. Build custom animation behaviour

**Decision:** Use `requestAnimationFrame`, `IntersectionObserver`, CSS variables and custom TypeScript for key motion.

**Why:** Scroll-linked scenes, reveals and mascot movement need behaviour that can be tuned to the reference.

**Trade-off:** Animation lifecycle, cleanup, reduced-motion behaviour and performance require deliberate engineering.

**Evidence:** `useScrollScrub`, `useReveal`, `PupJourney`, `pupJourney.ts`.

## 6. Separate content from presentation

**Decision:** Keep structured content in `src/data/` and shared contracts in `src/types/`.

**Why:** It reduces duplicated content and makes data shapes easier to validate.

**Trade-off:** Content is not editable through a CMS; changes require source updates.

**Evidence:** `src/data/`, `src/types/`, puppy and family page components.

## 7. Keep the project frontend-only

**Decision:** Do not add a custom backend or database for this reconstruction.

**Why:** The current scope can be represented with local data and static assets.

**Trade-off:** There is no server-side content management, authentication, payment processing or persistent user data.

**Evidence:** `package.json`, `src/data/`, application source. Do not describe this as a full-stack product.

## 8. Store the required media locally

**Decision:** Include reference media and fonts in the repository.

**Why:** A clean checkout should contain the assets needed to render the experience rather than relying on placeholders or manual downloads.

**Trade-off:** The repository is larger, and image optimisation remains an improvement.

**Evidence:** `public/`, `scripts/`, `docs/reference/`.

## 9. Build a reusable mascot system

**Decision:** Use a TypeScript rig and shared actions rather than using a single static image for every character interaction.

**Why:** The character needs multiple poses and movement states, and the same rig logic can be reused in different experiences.

**Trade-off:** SVG structure, pivots and transforms need maintenance.

**Evidence:** `src/lib/pupRig.ts`, `src/lib/pupActions.ts`, `src/components/TeddyRig.tsx`, `src/components/PupJourney.tsx`.

## 10. Include accessibility and practical quality checks

**Decision:** Respect reduced-motion preferences and use TypeScript build and ESLint checks.

**Why:** Motion should not be required to access content, and build/lint checks catch common implementation issues.

**Trade-off:** These checks do not prove visual correctness or full accessibility. Manual browser testing is still required.

**Evidence:** reduced-motion branches in animation components/hooks; `package.json` scripts.

## Decisions to revisit

| Area | Improvement |
|---|---|
| Bundle size | Re-measure and consider route-level lazy loading |
| Images | Add responsive variants and optimise large assets |
| Testing | Add focused automated component and browser tests |
| Accessibility | Perform keyboard, focus and screen-reader review |
| Content | Consider a CMS only if regular non-developer updates become necessary |

The previously reported bundle figures are historical notes, not a fresh measurement from this documentation pass. Re-run `npm run build` before quoting current output.

## Decision principles

1. Prefer evidence from the reference over assumptions.
2. Keep the implementation understandable and reusable.
3. Add dependencies only when their benefit is clear.
4. Treat accessibility and responsive behaviour as part of implementation.
5. Distinguish completed features from future improvements.
