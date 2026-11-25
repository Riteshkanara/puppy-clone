# Prompt Record and Reusable Prompt Patterns

This file documents how prompts were organised during the project. It deliberately does not invent exact historical messages.

## Historical prompt evidence

The supplied project notes contain descriptions of several prompt types, but not a complete verbatim export of every ChatGPT and Claude conversation. Therefore, entries below are labelled according to the evidence available.

| Prompt category | Tool | Evidence status |
|---|---|---|
| Initial project/context instructions | ChatGPT / Claude | Exact wording not fully preserved in this archive |
| Playwright reconnaissance and extraction | ChatGPT-assisted planning / Playwright execution | Task is described; exact original prompt needs chat export |
| Feature implementation prompts | Claude | Individual verbatim prompts need original conversation export |
| Bug reports and review prompts | ChatGPT / Claude | Exact messages need original conversation export |
| End-of-session handoff | ChatGPT | Process is documented; exact wording not preserved |

**Important:** If the assignment requires real prompts, export the original chats and paste the exact text with the correct tool label. Do not present the templates below as historical prompts.

## Reusable prompt pattern: inspect before editing

```text
Inspect the existing implementation and configuration before changing anything.
Identify the relevant files, current behaviour, dependencies and constraints.
Do not invent routes, content, assets or functionality.
Explain the proposed changes and wait for approval if the scope is unclear.
```

## Reusable prompt pattern: implement one feature

```text
Implement the specified feature using the existing project structure.
Reuse current components, types, styles and helpers where appropriate.
Do not add a dependency without explaining why it is needed.
List every file changed and explain the purpose of each change.
Run the available build and lint checks, and report their actual results.
Clearly identify anything that could not be verified.
```

## Reusable prompt pattern: review a patch

```text
Review this patch against the requested behaviour and the existing source.
Look for regressions, missing states, responsive issues, accessibility problems,
unused code and incorrect assumptions.
Do not modify unrelated files.
Report findings by severity and reference the affected files.
```

## Reusable prompt pattern: handoff

```text
Prepare a factual handoff for the next session.
Include completed work, changed files, current git state, checks actually run,
known issues, constraints and the next task.
Separate verified facts from assumptions and unfinished work.
```

## Rules used across prompts

- Inspect before editing.
- Preserve the reference design.
- Do not invent data or claim unverified work.
- Use the project's actual `package.json`, TypeScript and ESLint configuration.
- Keep patches focused.
- Report what changed and what was tested.

## How to complete the historical record

1. Export the relevant ChatGPT and Claude conversations.
2. Select representative prompts: initial instruction, Playwright extraction, feature task, bug report, and handoff.
3. Paste each message verbatim under a dated heading.
4. Label the tool correctly.
5. Keep reusable templates in a separate section.

This makes the prompt log honest and useful as evidence of the AI-assisted workflow.
