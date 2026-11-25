# Challenges and Engineering Lessons

This document records implementation problems, their causes, fixes and the lessons learned. It separates confirmed issues from items that still need additional evidence.

## 1. Original media missing from a clean copy

**Symptom:** Some image areas showed placeholders or did not display the intended photos.

**Cause:** The `public/media/` directory was excluded by an ignore rule in the submission copy, so the required original assets were not included.

**Fix:** The ignore rule was removed and the original media files were included in the project archive.

**Lesson:** Test a clean checkout or archive, not only the working directory. A project that works locally may still be missing ignored assets.

## 2. TypeScript constructor error in the mascot rig

**Symptom:** The TypeScript build rejected a constructor parameter property in `src/lib/pupRig.ts`.

**Cause:** The project enables `erasableSyntaxOnly` in `tsconfig.app.json`. Parameter properties are not compatible with that setting.

**Fix:** Declare `svg` as a normal class field and assign it inside the constructor.

**Lesson:** Read the project's TypeScript configuration before copying syntax from examples. A build error can come from compiler settings rather than the business logic.

## 3. Font files were mapped incorrectly

**Symptom:** The handwriting style appeared in places where the regular sans-serif font was expected.

**Cause:** The contents of `figtree.woff2` and `shantell-sans.woff2` had been swapped.

**Fix:** The font files were corrected and the result was checked visually against the reference.

**Lesson:** Asset filenames are not proof of asset contents. Check the rendered result and, where possible, inspect font metadata.

## 4. ESLint caught implementation issues

**Symptom:** Lint reported unused expressions and state updates inside effects.

**Fix:** The expressions were rewritten and the intentional exception in `PageCurtain.tsx` was documented with a targeted suppression.

**Lesson:** Avoid broad lint suppression. Keep exceptions narrow and explain why they are necessary.

## 5. Reference contact information was misleading

**Problem:** The reference payload contained a WhatsApp destination and contact details associated with the template provider, not necessarily the TeddyPups business.

**Decision:** Do not reuse those details as if they were verified business contact information. Contact actions route to the local contact page instead.

**Lesson:** Extracted data is not automatically trustworthy business data. Verify ownership and context before reproducing contact destinations.

## 6. Visual fidelity and implementation complexity

**Challenge:** Reproducing custom character movement and scroll-linked scenes is more involved than rendering static sections.

**Approach:** The project separates reusable animation hooks, mascot rig logic, journey planning and page components.

**Lesson:** Complex visual behaviour becomes easier to reason about when calculations and rendering responsibilities are separated.

## Remaining items to verify

- Re-run the current build and lint commands on the final working tree.
- Confirm every image path works from a clean checkout.
- Check page transitions with direct navigation and browser history.
- Re-test responsive layouts at documented viewport widths.
- Measure the current production bundle rather than relying on old output.

Do not add a challenge to this file unless the symptom, cause and resolution can be explained accurately.
