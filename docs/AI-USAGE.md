# AI Usage and Human Review

AI tools assisted with planning, reconnaissance discussion and implementation. The project owner remained responsible for deciding scope, running commands, reviewing changes and checking the result.

## Tools used

| Tool | Role recorded in the project notes |
|---|---|
| Playwright | Browser-based reconnaissance and extraction scripts |
| ChatGPT | Planning, discussion, extraction guidance and documentation |
| Claude | AI-assisted implementation of components and files |
| Gemini | Minimal use; not a significant part of the workflow |

The exact division of work varied by phase. Do not attribute a specific code change to a particular tool unless the original conversation or commit evidence confirms it.

## Workflow

1. Inspect the reference and record observations before implementation.
2. Keep findings in `RECON.md` and phase status in `BUILD_PLAN.md` / `PROJECT_HANDOFF.md`.
3. Work on one feature area at a time.
4. Ask AI tools to inspect existing source and configuration before proposing edits.
5. Apply and review changes locally.
6. Run build and lint checks, then inspect the result in a browser.
7. Record the current state and next task before moving to a new session.

## Human responsibilities

The project owner made decisions about scope and priorities, ran local commands, reviewed diffs, compared the implementation with the reference, checked assets, and decided which changes to keep. AI-generated code was not treated as automatically correct.

For an interview, explain the actual parts you personally inspected, changed or verified. Avoid claiming that every line was independently written by hand if AI assistance was used.

## Examples of issues caught during review

- Incorrect font-file mapping was found through visual comparison.
- Missing original media was traced to an ignore rule in the submission copy.
- A TypeScript constructor issue was found by running the build.
- ESLint findings were addressed rather than ignored wholesale.

These examples demonstrate why generated code still needs build checks and visual review.

## Limitations and transparency

- The mascot rig is a TypeScript reconstruction informed by observed reference behaviour.
- The raw reconnaissance output bundle is not included in the supplied project archive.
- `PROMPTS.md` distinguishes actual historical prompt evidence from reusable prompt templates.
- The project does not claim that AI tools performed all testing or made final engineering decisions.

## What to improve in future AI-assisted work

- Preserve exact prompts and tool labels at the time they are used.
- Keep a small change log connecting prompts, patches and commits.
- Record which checks were run and their actual output.
- Review security, accessibility and performance independently rather than relying on AI-generated assurances.
