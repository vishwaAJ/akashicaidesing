# Akashic Insights (AI)

A working front end for the **Akashic Insights (AI) Screens** design: ask questions about a dataset, watch the agent work, explore the answer as a chart, table or narrative, pin it, and organise pins into dashboards.

The original design file is kept in [`design/Akashic_Insights_AI_Screens.html`](design/Akashic_Insights_AI_Screens.html) (open it in a browser).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview
```

The build uses relative paths and hash routing, so `dist/` can be served from any static host or sub-folder.

## Screens

Open **⋯ → All screens** (or `#/screens`) for an index that jumps to every board in the design.

| Design board | Route | What works |
| --- | --- | --- |
| 1 · Landing — no data source | `#/` | Composer disabled until data is chosen |
| 2 · Landing — choose data source | `#/` | Searchable data-source menu |
| 3 · Landing — suggested questions | `#/` | Three suggestions per dataset; click to ask |
| Data model — option 1: drawer | Composer → **Semantic model** | Columns / Calculations tabs, search, collapsible groups, **+** adds a term to the question |
| 4 · Ask AI — trace, follow-up, scrolling chat | `#/ask` | Live agent trace (6 steps, timings, SQL), chart switcher (table/column/line/area/bar), chart filters, Narrative / Pin / Agent trace toggles, Refresh, Export (PNG, SVG and CSV download; SQL copies), suggested follow-ups, feedback |
| 5 · Dashboard — All Pins | `#/dashboard` | Card menu (Discard, Copy to board, Add to a new board), Narrative, Expand, Data source / Board selects, filter dialog |
| 6 · Dashboard — Testing AI Sales | `#/dashboard/testing-ai-sales` | Large charts (treemap, donut, columns) with board-wide filters |
| 7 · Data model — option 2: explorer page | `#/data-model` | Model picker, Tables / Metrics / Glossary, search, “Ask about this data” |
| Question style · option 3: icon chip | Ask AI → ⋯ → *Question style* | Icon question with data chips, Replay trace |
| Narrative · option C | Every answer | AI insights container with copy and feedback |
| Answer actions · ⋯ menu | Ask AI → ⋯ → *Answer actions* | Refresh and Export in one menu |
| Narrative container · all shapes | `#/narrative` | Bullets, paragraph, KPIs, mixed |

Also: collapsible sidebar (rail ↔ full), Create Board, toasts, and layouts that work down to phone width.

## Data

There is no backend. Answers are canned and matched to the question by keywords (`src/data.ts`). Figures that appear in the design are reproduced exactly; other values (e.g. state quantities, video-game and world-health figures) are illustrative sample data. Filters approximate a filtered query so charts visibly respond. Pins and boards are saved in the browser's local storage.

## Code map

```
src/
  data.ts              datasets, semantic models, canned answers, filters
  store.tsx            app state: dataset, conversation, pins, boards, toasts
  format.ts            number formatting and axis scales
  components/
    Shell.tsx          header, sidebar, view tabs, ⋯ menus
    Composer.tsx       data picker + question box
    SemanticDrawer.tsx data model drawer (option 1)
    AnswerCard.tsx     answer card: toggles, chart, filters, export, follow-ups
    AgentTrace.tsx     streamed agent steps
    Narrative.tsx      AI insights container
    Charts.tsx         SVG line/area/column, bars, table, donut, treemap
    FilterPanel.tsx    filter dialog + applied-filter chips
  pages/               Landing, AskAI, Dashboard, DataModel, NarrativeGallery, Screens
```
