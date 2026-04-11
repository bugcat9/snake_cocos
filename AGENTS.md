# Repository Guidelines

## Project Structure & Module Organization
`assets/` contains all game content. Put gameplay scripts in `assets/script/`, scenes in `assets/scence/`, prefabs in `assets/prefab/`, animations in `assets/animation/`, and runtime data or media in `assets/resources/`. Keep each asset paired with its generated `.meta` file. Repository settings live in `settings/`, `profiles/`, and `.creator/`. Treat `build/`, `library/`, `temp/`, and `native/` as generated output unless a release workflow explicitly needs them.

## Build, Test, and Development Commands
This project is driven by Cocos Creator 3.8.3 rather than npm scripts.

- Open the project in `Cocos Creator 3.8.3` and use `Preview` to run locally.
- Use `Project -> Build` to generate Web output into `build/web-desktop` or `build/web-mobile`.
- Run `git status` before committing to avoid checking in unintended generated files.

The GitHub Actions workflow in `.github/workflows/deploy-web-to-pages.yml` deploys an existing Web build from `main` to `gh-pages`.

## Coding Style & Naming Conventions
Write gameplay code in TypeScript with 4-space indentation and the existing Cocos decorator pattern, for example `@ccclass('GameControl')`. Use `PascalCase` for component and manager classes (`GameControl`, `AudioMgr`), `camelCase` for fields and methods (`generateFood`, `scoreLabel`), and keep one main component per file. Prefer short, focused methods and explicit types for public fields and data structures.

## Testing Guidelines
There is no automated test suite in this repository today. Validate changes in Cocos Creator by previewing the affected scene and checking key flows: movement, collisions, scoring, scene transitions, and audio. For content changes in `assets/resources/word.json`, verify the game loads the updated word list without missing sprite or audio references.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commit prefixes such as `feat:` and `fix:`. Keep commits scoped and imperative, for example `feat: add new word pool` or `fix: correct food spawn overlap`. Pull requests should include a short summary, impacted scenes or assets, manual test notes, and screenshots or a short clip for visible gameplay/UI changes. Link the related issue when one exists.

## Asset & Configuration Notes
Do not hand-edit generated folders or delete `.meta` files. When moving assets, do it inside Cocos Creator so UUID references remain valid.
