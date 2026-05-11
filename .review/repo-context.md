# Meckano Autofill — Repo Context

## What this is

A one-file bookmarklet (`index.js`) that, when injected into the Meckano (`app.meckano.co.il`) monthly report page, fills every missing non-rest workday with 09:00–18:00 hours. Distributed as a static page via GitHub Pages — users drag a `javascript:` bookmarklet from the README, or paste the snippet manually, then click it while viewing their report.

## Runtime & distribution

- **No build step.** `index.js` is shipped as-is and loaded from `https://gorendaniel.github.io/meckano-autofill/index.js`.
- **No package manager, no tests, no CI.** The repo is plain HTML/JS plus a Jekyll layout (`_config.yml`, `_layouts/`, `_includes/`) for the GitHub Pages site.
- **Prettier** is the only tooling (`.prettierrc.json`). Formatting runs locally; do not flag style nits the formatter handles.
- Target environment is the **user's browser**, executing inside the logged-in Meckano page. There is no server, no backend, no secrets, no auth code — the bookmarklet runs as the user, against the user's own session.

## Code structure

A single module-less script with five functions:

- `sleep(ms)` — promise-based delay.
- `waitFor(selector, parent)` — polls (10 × 50 ms) for a DOM node, throws if it never appears.
- `getNonRestDays()` — queries `tr[data-report_data_id]` rows that are not flagged `highlightingRestDays`.
- `getMissingDays(nonRestDays)` — filters those rows down to days with a `+` in `.missing`, no `.specialDayDescription` text, and a `<p>` label that does not end in `ה ` (Hebrew suffix indicating a special/holiday-like day).
- `submitHours(day)` — clicks "insert row", writes `09:00`/`18:00`, clicks confirm, waits 1 s.
- `fillMonth()` — top-level entry point; loops until no missing days remain.

DOM selectors are tightly coupled to Meckano's HTML — that coupling is intentional and unavoidable; do not propose abstracting it behind a config layer.

## Review priorities

When reviewing changes here, focus on:

1. **Selector robustness** — Meckano's DOM is the contract. Changes to selectors or filter predicates (especially the Hebrew regex `/ ה$/` and the rest-day / special-day detection) are the highest-risk areas. Flag any change that could mis-classify a day and submit hours on a holiday or rest day.
2. **Idempotency / termination** — `fillMonth` re-queries after each insert. Anything that breaks the re-query loop, or that could enter an infinite loop if a click silently fails, is worth calling out.
3. **Race conditions** — `waitFor` is short (500 ms total) and `submitHours` uses a fixed 1 s sleep after confirm. Changes that tighten those windows risk flake on slow connections.
4. **Bookmarklet payload** — if `index.js` changes shape (e.g. top-level `await`, ES modules, classes that aren't transpiled), confirm it still loads + executes via `<script src=>` injection inside a third-party page. No bundler will rescue it.

## Non-priorities — do not flag

- Lack of tests, lint config, type checking, or CI — out of scope for a single-file bookmarklet.
- Lack of error UI / user feedback — failures surface in devtools; the tool is for the author and people who read the source.
- Hardcoded `09:00`/`18:00` — that's the entire feature.
- Use of `var`, lack of strict mode, global function declarations — this script runs in a third-party page and intentionally avoids module scope.
- Prettier-handled formatting.

## Out-of-band facts

- README is also the GitHub Pages landing page (`_layouts/default.html` wraps it). The bookmarklet `href` appears twice — once as a draggable link, once as a manual copy-paste block. Keep them in sync if either changes.
- Hebrew text in filter logic is load-bearing; do not "clean it up" to ASCII.
- The repo is a personal fork-friendly utility, not a product. Treat backwards-compat concerns accordingly.
