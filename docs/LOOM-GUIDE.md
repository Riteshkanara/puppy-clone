# Loom Walkthrough Guide

**Suggested length:** approximately 6–8 minutes.  
**Goal:** Explain the project clearly while showing the implementation. Do not read the Markdown files aloud.

## 1. Introduction — 30 seconds

Explain that this is a frontend reconstruction of the TeddyPups website. Mention the focus: page fidelity, reusable React components, original media, interactions and custom mascot animation.

## 2. Technology and routes — 45 seconds

Show `package.json` and `src/App.tsx`.

Explain:
- React and TypeScript organise the interface.
- Vite handles development and production builds.
- React Router handles the nine routes.
- A shared layout avoids repeating global elements.

## 3. Content and assets — 45 seconds

Show `src/data/`, `src/types/`, `public/` and `scripts/`.

Explain that content is separated from presentation, types describe the data shape, and local assets make the reconstruction self-contained. Mention that the project has no backend.

## 4. Animation approach — 60 seconds

Show `src/hooks/` and a relevant scene component.

Explain why custom CSS and browser APIs were used instead of adding an animation library. Give one concrete example, such as scroll progress updating a CSS variable or reveal effects using `IntersectionObserver`.

## 5. Mascot system — 90 seconds

Show `src/lib/pupRig.ts`, `src/lib/pupJourney.ts` and `src/components/PupJourney.tsx`.

Explain the responsibilities:
- The rig calculates character poses and movement.
- Actions represent reusable behaviours.
- The journey helper calculates movement between page stops.
- The component coordinates the character with scroll position.

Show the result in the browser if possible.

## 6. Page transitions and accessibility — 45 seconds

Show `PageCurtain.tsx` and one reduced-motion branch.

Explain how the shared transition is coordinated and why reduced-motion behaviour matters.

## 7. Challenges and verification — 60 seconds

Choose two real examples:
- Missing original media caused by an ignore rule.
- The TypeScript constructor issue caused by `erasableSyntaxOnly`.

Explain how you found the problem and verified the fix. Show the actual command output if you have rerun the checks.

## 8. Improvements — 45 seconds

Be honest about what remains:
- Add automated browser tests.
- Re-measure and optimise the production bundle.
- Optimise large images.
- Complete a documented accessibility and responsive QA pass.

## Presentation rules

- Show source files while explaining technical decisions.
- Demonstrate the running website for visual features.
- Do not claim that a test passed unless you ran it on the final version.
- Do not describe the project as full-stack.
- Do not read every decision or every document aloud.
- If asked about AI usage, explain what tools assisted with and what you personally reviewed, changed and verified.
