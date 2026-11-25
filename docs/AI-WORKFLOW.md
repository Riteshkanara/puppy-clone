# AI-Assisted Development Workflow

This document explains how work was organised across AI-assisted sessions.

## Why a workflow was needed

Long conversations can lose context, and a new session does not automatically know the current state of the local repository. The project therefore uses documentation as a handoff mechanism.

## Working protocol

1. **Start from current source.** Provide the latest project archive or relevant files.
2. **Read the context documents.** Review `PROJECT_HANDOFF.md`, `BUILD_PLAN.md` and `RECON.md`.
3. **Choose one phase.** Keep the requested change focused and identify the files likely to be affected.
4. **Inspect before editing.** Check current components, styles, types and configuration.
5. **Make a reviewable patch.** Prefer a small set of related changes over unrelated rewrites.
6. **Verify locally.** Run `npm run build` and `npm run lint`, then test the changed flow in a browser.
7. **Update the handoff.** Record what changed, what passed, what remains and the next task.

## Handoff format

A useful handoff contains:
- Current branch and repository state.
- Work completed in the current phase.
- Files added, changed or removed.
- Commands run and their actual results.
- Known bugs or unverified behaviour.
- Constraints that must not be broken.
- The next task in priority order.

## Safety and quality rules

- Inspect existing code before proposing replacements.
- Do not invent content, routes, assets or test results.
- Do not add dependencies without a clear reason.
- Preserve the reference design unless a deliberate change is agreed.
- Review diffs before committing.
- Keep the original working project safe.
- Do not force-push or overwrite unrelated work.

## Result

The process makes AI-assisted work easier to review and continue. The documentation is a context aid, not a substitute for checking the actual source and running the project.
