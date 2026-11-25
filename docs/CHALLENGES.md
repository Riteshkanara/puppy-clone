# Challenges

## 1. Swapped font files
- **Symptom:** handwriting font appeared on body text everywhere.
- **Cause:** `figtree.woff2` and `shantell-sans.woff2` contained each other's data.
- **Fix:** swapped the files. Built sizes now match the fonts (Figtree about 20 kB, Shantell Sans about 171 kB).
- **Lesson:** check files, not just names. Compare against the reference visually.

## 2. Photos not showing on a clean copy
- **Symptom:** cards showed colour placeholders.
- **Cause:** photos come from `public/media`, which is filled by `fetch-media.mjs`. In my submission copy, `.gitignore` excluded that folder.
- **Fix:** removed the ignore rule and committed the original files.
- **Lesson:** test from a fresh clone, not only the working folder.

## 3. TypeScript error in `pupRig.ts`
- **Symptom:** `npm run build` failed on the `PupRig` constructor.
- **Cause:** TODO: confirm. Likely a constructor parameter property rejected by the TypeScript configuration.
- **Fix:** declared `svg` as a field and assigned it in the constructor.
- **Lesson:** run the build often, not just the dev server.

## 4. Five ESLint errors
- Unused ternary expressions, and state set inside effects (`react-hooks/set-state-in-effect`).
- **Fix:** rewrote the expressions. Where behaviour was intentional, as in `PageCurtain`, I documented why in a comment.
- **Lesson:** TODO: one sentence on why setting state in an effect can cause extra renders.

## 5. Page curtain timing
- **Problem:** the curtain must cover a new route before its first paint on back or forward navigation.
- **Solution:** a `useLayoutEffect` that runs before paint. It also pauses reveal animations via `data-curtain` until a `tp:curtain-open` event fires.
- **Lesson:** `useLayoutEffect` is for work that must happen before the browser paints.

## 5b. Scroll animation without re-renders
- `useScrollScrub` writes a CSS variable (`--p`) from a `requestAnimationFrame` loop, so React doesn't re-render on scroll.

## 6. Large bundle warning
- One JS chunk of 536.76 kB. Accepted for now. Next step: `React.lazy` per route.