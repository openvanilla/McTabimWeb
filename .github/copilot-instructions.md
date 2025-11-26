# GitHub Copilot Instructions for McTabimWeb

## Project context

- This repository hosts McTabimWeb (小麥他命輸入法), a TypeScript engine for table-based Chinese input methods like Changjie (倉頡), Sucheng (速成), Dayi (大易), and Array (行列).
- It is designed to be embedded in web pages and also runs on Chrome OS and Windows (via the PIME framework).
- Distribution bundles live in `dist/`, while TypeScript sources are under `src/`.
- The public entry points are exported from `src/index.ts`. Treat this package like a reusable library—avoid leaking experimental APIs.

## Architecture hints for Copilot

- **Data layer (`src/data/`)**: `InputTableManager` lazily loads CIN tables plus emoji/symbol metadata. It is a singleton accessed through `InputTableManager.getInstance()`. Preserve that pattern and prefer readonly properties when exposing tables.
- **Input pipeline (`src/input_method/`)**: `InputController` orchestrates state transitions (`EmptyState`, `InputtingState`, `CommittingState`) and keeps UI + KeyHandler in sync. Any change to state creation usually needs companion updates in `InputUIStateBuilder` and the associated Jest specs in the same folder.
- **Key handling**: `Key`, `KeyHandler`, and `KeyMapping` work together; favor pure functions that accept the current `Settings` and `InputTableWrapper` so behavior stays testable. Never reference DOM APIs from these modules.
- **Platform-specific shims**: ChromeOS and PIME entrypoints (`src/chromeos_ime.ts`, `src/pime.ts`, `src/pime_keys.ts`) should stay thin and call into the shared `InputController`.
  - The ChromeOS extension (`src/chromeos_ime.ts`) also implements a context menu feature. When text is selected or an editable area is focused, a 'lookup' option appears. Activating this option performs a reverse radical lookup using the `InputTableManager` and sends the result to the content script.

## Coding conventions

- Use modern TypeScript (target TS 5.9). Prefer `const` + arrow functions, explicit return types on exported symbols, and named exports (no default exports in this repo).
- Keep data-structure types close to their usage (e.g., interfaces in the same file). Add brief inline comments only for non-obvious logic such as Unicode range calculations in `InputTableManager`.
- When mutating state, create new objects instead of altering inputs in place—most consumers rely on immutability for predictable UI rendering.

## Testing & tooling

- Always follow Kent Beck's TDD flow: write a failing test, make it pass, then refactor.
- Unit tests are required for all new or modified code. Place tests beside implementation files as `*.test.ts`.
- When code is modified, also update this copilot-instructions.md file if relevant.
- Jest with `ts-jest` is configured; high-signal tests already exist beside the implementation files (`*.test.ts`).
- **Webpack for JSON**: The project uses webpack to bundle CIN tables. To optimize the size, a custom `json-minifier-loader.js` is used to minify JSON files. The webpack configuration explicitly targets JSON files with a `?raw` resource query, like `import '../data/cin/array30.json?raw'`.
- Use `npm run ts-build` for type-checking and `npm run eslint` to enforce the TypeScript ESLint ruleset. Keep CI-friendly scripts free of watch flags.
- AI agents may call `test:coverage` (via agent) to find code not covered by tests and should address coverage gaps.

## Documentation expectations

- Update this file when introducing new subsystems so Copilot understands how to wire things together.
- Prefer concise prose and actionable bullet points that tell Copilot _what to favor or avoid_ rather than lengthy narratives.

## Commit expectations

- Follow Conventional Commits for every commit title (e.g., `feat: add reverse lookup cache`).
- Always include 3–4 short lines after the title that summarize the change, rationale, and any testing performed so history stays self-explanatory.
