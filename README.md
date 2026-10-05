# Crisis Terminal

A static, terminal-styled browser for a year-by-year register of financial crises, bubbles, defaults and scandals from 811 to July 2026 (1,164 years, 287 event years, rated 0–5 for severity).

Each event lists curated sources (YouTube videos, X posts, articles, Substack posts and papers) from `data/links.js`, found by web search, plus search links (YouTube, X, Google, Substack, Google Scholar) built from the episode name and year as a fallback.

Open `index.html` directly in a browser, or serve the folder with any static host (for example GitHub Pages). There is no build step.

## Layout

- `index.html`, `assets/styles.css`, `assets/app.js`: the site.
- `data/events.js`: every row of the register, generated from the workbook.
- `data/links.js`: curated research links keyed by year.
- `data/source/`: the source workbook.
- `scripts/import_events.py`: regenerates `data/events.js` from the workbook (`pip install openpyxl`, then `python3 scripts/import_events.py`).
- `scripts/check_data.js`: validates the generated data; run by CI.
