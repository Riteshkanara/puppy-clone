# AI Usage

Blutec's policy allows AI tools. This file states what I used, for what, and what I did myself.

## Tools
| Tool | Used for | What I reviewed or changed |
|---|---|---|
| Playwright (Node scanner) | Reconnaissance of the reference site: page discovery, screenshots, links, fonts, styles, interactions, asset download | I chose what to extract and treated the output as measured evidence |
| ChatGPT | Planning, phased build instructions, and writing the project handoff documents | TODO: confirm (e.g. which phases) |
| Claude | TODO: confirm (e.g. mascot work, patches, Git organisation, docs) | Ran every command myself and checked results with `npm run lint` and `npm run build` |
| Gemini | Minor use only | TODO: confirm what for |

## Process
1. **Recon first.** Before writing React, I ran a Playwright scanner over the reference site. It found 40 pages and produced 120 screenshots (desktop, tablet, mobile), links, styles, 83 CSS variable names, fonts, interaction tests and 264 downloaded assets. I wanted to reproduce the site rather than guess.
2. **Notes as memory.** Findings went into `RECON.md`. Plans went into `BUILD_PLAN.md`. Status went into `PROJECT_HANDOFF.md`. These files were attached to each new AI chat.
3. **One phase per chat.** Foundation, puppies page, home page, families, mascot, and so on. Each phase ended with a patch, a build, lint, and a manual check in the browser against the reference screenshots.
4. **Rules in every prompt.** Inspect before editing, never invent content, no new libraries without asking, test against my own config, report what was and was not verified.
5. **Git history organised last.** The project was built locally first. In this repository I organised it into logical commits and pull requests for review. Commit dates are the dates I created them.

## Context pack
I kept the Playwright output and my notes together in a zip. I attached it to new AI chats so each started from measured data and the current state of the project. The raw bundle is kept local. The repository contains the extraction scripts and `docs/reference/*.json`.

## Session handoff
At the end of a chat I asked the AI to write a handoff: current state, completed work, rules, and the next step. I pasted it into a new chat. See [AI-WORKFLOW.md](AI-WORKFLOW.md).

## Where AI output needed fixing
| Problem | How I found it | Fix |
|---|---|---|
| Font files swapped: `figtree.woff2` and `shantell-sans.woff2` had each other's contents, so handwriting appeared everywhere | Visual check against the reference | Swapped the files. The build now shows Figtree at about 20 kB and Shantell Sans at about 171 kB |
| TypeScript build error in `src/lib/pupRig.ts` (constructor parameter property) | `npm run build` failed | `svg` is now a normal class field assigned in the constructor. TODO: confirm the tsconfig option behind the error |
| Five ESLint errors: unused ternary expressions and state updates inside effects | `npm run lint` | Rewrote the expressions. Marked the one intentional case in `PageCurtain.tsx` with a comment and a targeted `eslint-disable` |
| Original photos appearing as colour placeholders | Running the app from a clean copy | `public/media` was ignored in my submission copy. I removed the rule and committed the 137 originals |

## What I did myself
- Decided scope, phases and rules.
- Compared every page against the reference at three widths.
- Kept the original media instead of placeholders.
- Fixed build and lint errors and chose which warnings to accept.
- Organised the Git history, tested manually, and deployed.
- TODO: add two or three specific changes I made by hand.

## Honest limitations
- The mascot rig is a TypeScript port of behaviour I studied in the reference's client code.
- The reference is a template demo host, so its phone, email and WhatsApp number are not TeddyPups' real details. I did not use its WhatsApp number.