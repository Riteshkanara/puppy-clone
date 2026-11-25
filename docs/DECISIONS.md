# Decisions

## 1. Reproduce, don't redesign
- **Decision:** follow the reference's layout, typography and colours exactly.
- **Why:** the task is a clone. Extracted values (colour tokens, easing curves, gutters) came from the reference CSS.

## 2. React + TypeScript + Vite
- **Alternatives:** Next.js (the reference is Next.js), plain HTML/CSS/JS.
- **Why:** no backend or server rendering is needed. Vite builds quickly and deploys as static files. TypeScript checks the shape of the puppy and family data at build time.
- **Consequence:** refreshing a non-home route needs a host rewrite (`vercel.json`).

## 3. React Router 7
- Nine routes, nested under one layout. Filters on `/puppies` live in the URL query so filtered views can be linked.

## 4. No UI or animation library
- **Alternatives:** Framer Motion, GSAP, Tailwind.
- **Why:** working rule from the start: no new library without a reason. The animation is hand-written with `requestAnimationFrame`, `IntersectionObserver` and CSS variables. The runtime has only three dependencies.
- **Trade-off:** more code to maintain. The reference's filter animation used framer-motion. I used a CSS pop-in.
- **Next time:** TODO: add your own view.

## 5. Self-hosted fonts
- Fraunces, Figtree and Shantell Sans as woff2. No third-party font request, and they match the reference.

## 6. Original media committed to the repo
- 137 files, about 68 MB, plus 24 gone-home photos.
- **Why:** placeholders would break visual fidelity, and a fresh clone must run without extra steps.
- **Trade-off:** a larger repo. Image optimisation is a next step.

## 7. Content in typed data files
- `src/data` holds puppies, families, FAQ and contact details, with interfaces in `src/types`.

## 8. Extraction scripts instead of manual copying
- Node scripts read the reference's Next.js payload and download media. I did not copy the reference's compiled JavaScript into the app.

## 9. Placeholder contact details
- The reference is a template demo host. Its WhatsApp number belongs to the template builder, so every WhatsApp button links to `/contact`.

## 10. Bundle size left as is
- One 536.76 kB chunk (147.70 kB gzip) triggers Vite's 500 kB warning. I chose correctness before the deadline. The fix is `React.lazy` per route.