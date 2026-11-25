# AI Session Workflow

## Problem
Long AI chats lose context, and each new chat starts blank. It cannot see my machine or earlier work.

## Protocol
1. Keep three living documents in `docs/`: `PROJECT_HANDOFF.md` (state), `BUILD_PLAN.md` (next steps), `RECON.md` (evidence).
2. Start each chat with the same opening prompt and the current source zip.
3. Do one phase per chat. Receive one patch containing only new or changed files.
4. Apply it on a git branch, run `npm run build` and `npm run lint`, check in the browser, then commit.
5. At the end, ask the AI for a handoff and update the docs.

## Handoff template
Current stage, work completed, current state (files, git, branch), safety rules, next steps in order, working style.

## Context pack
The Playwright reconnaissance output and notes, kept as a zip and attached to new chats.

## Safety rules I carried forward
Inspect before editing, never invent content, keep the original design, no new libraries without asking, never force-push, keep the original project untouched.

## Result
No repeated work and the same rules in every session.