# FOIA Annual Report Explorer (v4 content, Bekaiym's design)

This branch (`bekaiym-style`) keeps Tianqi's v4 dashboard as it is (same data, questions, charts, tables and storyline cards)
and only changes the look to match Bekaiym's prototype:
- `docs/theme.css` (new, loaded last): white header with a MuckRock-blue rule, Source Sans 3, light-blue page,
  rounded cards, blue pill buttons for the questions and tabs, KPI-style summary tiles.
- `docs/period.js` (new): the period bar at the top (timeline of FY2008–FY2025, click a start year then an end year,
  or All years / Last 10 / Last 5 / FY2025 only). It drives the dashboard's own Fiscal years input, which is now hidden in the sidebar.
- `docs/search.js` (new): search boxes above the Agency and Component lists (type part of a name, or initials like DHS).
- `docs/index.html`: new header (title, subtitle, "Prototype · for feedback" tag), Source Sans 3 font link, link to `theme.css`.
Nothing in the data (`docs/data/foia.json`) or the dashboard code changed.

---

# Federal FOIA Dashboard (v4: the prototype plus storyline cards)

Draft v4 of the BU Spark! DS 701 prototype FOIA dashboard for MuckRock's Data Liberation Project. Not an official MuckRock product.

Live page: https://crazythursv50.github.io/foia-dashboard-v4/

## What v4 adds
v4 is built on the public preview site (foia-dashboard-preview), not on v2 or v3. The page code is unchanged; two files are added at the end of `index.html`: `stories.css` and `stories.js`.
- Start page (no agency or component chosen): four storyline cards, each with one finding and a small chart, in place of the watermark.
- After choosing an agency or component, or adding one under "Compare with": a "The four findings" section below the six summary tiles. Each unit's own numbers are drawn as a line, and the group each government-wide finding is about is a grey dashed line. Years with fewer than 20 cases are hollow points.

The storyline cards are a draft from 2026-11-08. They will be updated to match the current storyline analysis.

## Data
`docs/data/foia.json`: built 2026-11-02 from the component-level table of foia.gov's annual FOIA reports (FY2008–FY2025). Same file as the preview site.

## Preview locally
```
cd docs
python3 -m http.server 8772 --bind 127.0.0.1
```
Then open http://127.0.0.1:8772/
