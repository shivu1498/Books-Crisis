# Crisis Terminal

A static, terminal-styled browser for a year-by-year register of financial crises, bubbles, defaults and scandals from 800 to July 2026 (1,227 years, 289 event years, rated 0–5 for severity).

Each event carries research links (YouTube, X, Google, Substack, Google Scholar) built as searches from the episode name and year; years that bundle several episodes get one set of links per episode.

Open `index.html` directly in a browser, or serve the folder with any static host (for example GitHub Pages). There is no build step.

## Layout

- `index.html`, `assets/styles.css`, `assets/app.js`: the site.
- `data/events.js`: every row of the register, generated from the workbook.
- `data/source/`: the source workbook.
- `scripts/import_events.py`: regenerates `data/events.js` from the workbook (`pip install openpyxl`, then `python3 scripts/import_events.py`).
- `scripts/check_data.js`: validates the generated data; run by CI.
