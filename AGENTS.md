# ARG_1304 repository guide

This file is the default handoff context for Codex or any other coding agent working in this repository.

## Project

`ARG_1304` is a Chinese browser ARG presented as an ordinary property-management system. The player is the property administrator identified as `CJ-0713`. Search, work orders, monitoring records, callbacks, account recovery, and internal compliance tools gradually reveal four connected cases.

The game is not a collection of independent documents. Every page belongs to a gated investigation flow, and later facts must not leak into earlier screens.

Read these documents before changing narrative or progression:

- `docs/story-bible.md`: canonical people, incidents, institutions, chronology, passwords, and reveal boundaries. Contains full spoilers.
- `docs/game-flow.md`: current progression gates, puzzle solutions, endings, horror beats, and regression checklist. Contains full spoilers.

When documentation and code disagree, verify the current behavior in `app/page.tsx` and the assertions in `tests/rendered-html.test.mjs`, then update the documentation in the same change. The author-level canon in `docs/story-bible.md` should not be changed merely to explain an implementation accident.

## Runtime

- Node.js: `>=22.13.0`
- Framework: Next.js 16 + React 19
- Local development: vinext/Vite
- Public deployment: static Next.js export through GitHub Pages
- Main game: `app/page.tsx`
- Full-spoiler truth page: `app/truth/page.tsx`
- Shared styling: `app/globals.css`
- Truth-page styling: `app/truth/truth.module.css`
- Generated and curated media: `public/`
- Audio generator: `scripts/generate-field-audio.mjs`
- Behavioral regression tests: `tests/rendered-html.test.mjs`

Use these commands:

```bash
npm ci
npm run dev
npm run lint
npm test
npm run build:pages
```

`npm test` runs the vinext build and the rendered-source regression suite. `npm run build:pages` verifies the static export used by GitHub Pages. Run both when changing routing, assets, or deployment behavior.

## State And Routing

- Progress is stored in `localStorage` under `chengjiang-search-arg-v1`.
- The login-page `遗忘` action is the intentional full reset.
- The game uses static-safe hash routes, including `#/wake`, `#/login`, `#/system/home`, search, article, callback, legacy-account, denied, and ending routes.
- Refresh and browser back/forward must restore the current reachable screen. Do not replace the hash router with server-only routes unless GitHub Pages deep-link behavior is solved at the same time.
- The independent truth page is a real static route at `/truth/`; respect `NEXT_PUBLIC_BASE_PATH` for GitHub Pages.
- When adding assets or links, use the existing `assetPath`/`BASE_PATH` pattern. Never hard-code the repository subpath into components.
- Old saves should be migrated defensively in `readSavedGame`; new state fields need defaults in `initialGame`.

## Narrative Rules

### The system surface

- The application title presented to the employee is `物业管理系统`.
- The protagonist's apparent job is property administrator. Early UI must look like plausible property software, not a horror-game menu.
- The hidden instruction is `不要按顺序读。按你怀疑的内容去找。` It must remain hidden or peripheral rather than becoming a visible tutorial banner.
- Do not add overt hints, a conspicuous quest guide, or a generic "今日待办" list to the login experience.
- Login may briefly flash red before the dashboard, but it should first read as a normal authentication flow.

### Evidence before conclusions

- The player discovers identities through records and cross-checking. Do not expose "报事人及身份核验" answers as prefilled conclusions.
- In-game files should use objective administrative language: dates, document sources, measurements, access events, and audit fields.
- Never turn a puzzle into choosing a polished interpretation that already states the answer. Ask the player to reconstruct times, routes, source fields, or document relationships.
- Evidence is awarded only after attachment inspection, explicit verification, or a completed puzzle. Opening a document alone should not grant a critical fact.
- Search results may include irrelevant but realistic records. Do not make every result a clue.
- First-time access to an article should come through search. The archive drawer lists only records the player has already opened.
- Locked records use fractured titles and restricted search terms. Do not expose their raw protected fields in search snippets.
- Important evidence should concentrate in later records and cross-system attachments, not the first article in a chain.

### Information discipline

- In the playable system, distinguish what the records prove from the supernatural story truth.
- Do not explicitly state that a ghost performed an action when the system can only prove a route, a token write, a voice, or an identity conflict.
- Keep CS-046 as an optional shadow line. The playable system may establish repeated terminal fields, missing recordings, and sequence gaps; it must not plainly announce that CS-046 and CJ-0713 are the same consciousness.
- Do not turn Gu Xiaoman's rescue of Xu Zhiyao into forgiveness for Gu Changhe. Rescue, guilt, responsibility, and forgiveness stay separate.
- Do not invent a legal relationship between the Xu family and owner Chen Daguo. The records establish occupation, old service credentials, and the owner's absence, not tenancy or kinship.
- The property company and Hengmu know more than they admit. Show this through pre-generated policies, field suppression, account changes, funding, and warnings rather than villain monologues.
- The full truth may be stated directly only on `app/truth/page.tsx` and in spoiler documentation.

## Progression Invariants

- 1204 is the opening investigation and emergency-rescue chapter.
- The missing-child event requires both the actual-occupancy conflict and the monitoring anomaly. Merely opening a relevant article must not trigger it.
- Every rescue-route location, including excluded locations, needs an image. Do not replace an excluded location with "no footage" text.
- The field-audio puzzle must keep four audible stems with human descriptions. The correct operation removes pipe resonance and television audio while preserving bath drips and child humming.
- 1304 becomes a chapter performance only after the player reconstructs the factual audit sequence. The answer must not be written as a multiple-choice moral conclusion.
- Zhou Mingchuan's body discovery unlocks the derivation of his local account password. His four private evidence files themselves do not each have an extra password.
- Reading all four Zhou files triggers the identity breach: optional camera preview/fallback, `你是谁？`, `我发现你了`, then blinking red eyes. The `快逃` action returns to login.
- The 1404 complaint is the final chapter. It begins only after Zhou's case and the Hengmu compliance cross-check are complete.
- The four 1404 protected articles use separate ARG-style derived passwords. A wrong password adds one blinking red eye to the background and must not reveal extra answer text.
- After the 1404 source-field check, the property middleware attempts to overwrite the protagonist's memory. Resistance requires external original records in chronological order.
- The complete-evidence ending requires both the Zhou evidence chain and the optional CS-046 callback audit. The loop ending remains available and emphasizes Lin Ruolan's repeated loss.

## UX And Media

- Preserve the restrained enterprise-software look until the narrative earns visual corruption.
- Horror should escalate through small state changes: red login flash, anomalous timestamps, broken titles, surveillance eyes, account messages, camera recognition, and memory rewrite.
- Use the existing generated daily-life memories, rescue-route scenes, resident image, CCTV footage, WAV stems, and ending images. Do not silently replace them with generic placeholders.
- Generated visual assets should depict the actual location or event state and remain readable on desktop and mobile.
- Avoid nested decorative cards, oversized marketing copy, or explanatory text that tells the player how the interface was designed.
- Controls need stable dimensions and accessible labels. Text and controls must not overlap at narrow widths.
- Camera denial or absence must have a deterministic fallback so the Zhou breach can still complete.
- Audio/video failure needs a usable fallback or manual review path; media playback must never permanently block progression.

## Change Workflow

1. Read the affected story section in `docs/story-bible.md` and the gate in `docs/game-flow.md`.
2. Inspect the relevant state transitions and article availability in `app/page.tsx`.
3. Keep edits focused; this project intentionally keeps most game logic in one client component.
4. Add or update a focused assertion in `tests/rendered-html.test.mjs` for progression or copy invariants.
5. Run `npm run lint`, `npm test`, and `npm run build:pages` when applicable.
6. Test from a clean save and from an existing save. Verify refresh, back/forward, login switching, and `遗忘`.
7. Update the spoiler docs whenever canon, a password, a gate, or an ending changes.

## Deployment

The GitHub Pages workflow is `.github/workflows/pages.yml` and deploys pushes to `main`. The intended public root is:

`https://starwave0225.github.io/ARG_1304/`

The full-spoiler archive is:

`https://starwave0225.github.io/ARG_1304/truth/`

Do not publish feature-branch URLs as if they were production. Confirm the PR is merged and the Pages workflow succeeds first.
